-- Friend groups (groups.spec.md). A group belongs to one festival and is
-- private: only members read it, and the only way in is the invite token.
-- Members are added only by create_group() and join_group(). The trigger on
-- group_members enforces the limits for every path.
create table public.groups (
  id uuid primary key default gen_random_uuid(),
  festival_id uuid not null references public.festivals (id) on delete cascade,
  -- Trimmed by the trigger below, then 1 to 40 characters (FR-2).
  name text not null constraint groups_name_check check (char_length(name) between 1 and 40),
  -- The secret of the invite link (FR-3). Only members read it.
  invite_token uuid not null unique default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_groups_festival_id on public.groups (festival_id);

create table public.group_members (
  group_id uuid not null references public.groups (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  is_owner boolean not null default false,
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create index idx_group_members_user_id on public.group_members (user_id);
-- One owner per group (FR-15).
create unique index idx_group_members_one_owner on public.group_members (group_id) where is_owner;

alter table public.groups enable row level security;
alter table public.group_members enable row level security;

-- A past group is read-only (FR-9), by the "Past festivals" rule of
-- festivals.spec.md: the end date is before today.
create or replace function public.is_group_past(group_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.groups g
    join public.festivals f on f.id = g.festival_id
    where g.id = is_group_past.group_id and f.end_date < current_date
  );
$$;

create or replace function public.is_group_member(group_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.group_members m
    where m.group_id = is_group_member.group_id and m.user_id = (select auth.uid())
  );
$$;

create or replace function public.is_group_owner(group_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.group_members m
    where m.group_id = is_group_owner.group_id and m.user_id = (select auth.uid()) and m.is_owner
  );
$$;

-- True when the caller shares a group with the rater, for the festival of the
-- act (FR-10, FR-11). Used by the select policy on user_ratings.
create or replace function public.shares_group_for_act(rater_id uuid, act_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.acts a
    join public.groups g on g.festival_id = a.festival_id
    join public.group_members me on me.group_id = g.id and me.user_id = (select auth.uid())
    join public.group_members them on them.group_id = g.id and them.user_id = shares_group_for_act.rater_id
    where a.id = shares_group_for_act.act_id
  );
$$;

revoke execute on function public.is_group_past(uuid) from public, anon;
revoke execute on function public.is_group_member(uuid) from public, anon;
revoke execute on function public.is_group_owner(uuid) from public, anon;
revoke execute on function public.shares_group_for_act(uuid, uuid) from public, anon;
grant execute on function public.is_group_past(uuid) to authenticated;
grant execute on function public.is_group_member(uuid) to authenticated;
grant execute on function public.is_group_owner(uuid) to authenticated;
grant execute on function public.shares_group_for_act(uuid, uuid) to authenticated;

-- Groups: members read, the owner renames (FR-17) and deletes (FR-18). Only the
-- name can change directly; the token changes with reset_invite_token().
create policy "Members can view their groups" on public.groups
  for select to authenticated using (public.is_group_member(id));

create policy "Owners can rename groups that are not past" on public.groups
  for update to authenticated
  using (public.is_group_owner(id) and not public.is_group_past(id))
  with check (public.is_group_owner(id) and not public.is_group_past(id));

create policy "Owners can delete their groups" on public.groups
  for delete to authenticated using (public.is_group_owner(id));

revoke insert, update, truncate on public.groups from anon, authenticated;
revoke select, delete on public.groups from anon;
grant update (name) on public.groups to authenticated;

-- Members: a member reads the members of their groups and leaves (FR-13).
create policy "Members can view the members of their groups" on public.group_members
  for select to authenticated using (public.is_group_member(group_id));

create policy "Members can leave groups" on public.group_members
  for delete to authenticated using ((select auth.uid()) = user_id);

revoke insert, update, truncate on public.group_members from anon, authenticated;
revoke select, delete on public.group_members from anon;

create or replace function public.trim_group_name()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.name = btrim(new.name);
  return new;
end;
$$;

create trigger trim_groups_name
  before insert or update of name on public.groups
  for each row execute function public.trim_group_name();

create trigger update_groups_updated_at
  before update on public.groups
  for each row execute function public.update_updated_at_column();

-- The limits of a new member: no past group (FR-1, FR-9), 20 members at most
-- (FR-7), 2 groups per festival for each user (FR-8). The locks keep two
-- joins at the same time from both passing a check.
create or replace function public.check_group_member_limits()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  group_festival_id uuid;
begin
  select g.festival_id into group_festival_id
  from public.groups g
  where g.id = new.group_id
  for update;

  if public.is_group_past(new.group_id) then
    raise exception 'group_past' using errcode = 'P0001', hint = 'The festival of this group has ended';
  end if;

  if (select count(*) from public.group_members m where m.group_id = new.group_id) >= 20 then
    raise exception 'group_full' using errcode = 'P0001', hint = 'A group has at most 20 members';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(new.user_id::text || group_festival_id::text, 0));

  if (
    select count(*)
    from public.group_members m
    join public.groups g on g.id = m.group_id
    where m.user_id = new.user_id and g.festival_id = group_festival_id
  ) >= 2 then
    raise exception 'group_limit' using errcode = 'P0001', hint = 'A user is in at most 2 groups for a festival';
  end if;

  return new;
end;
$$;

create trigger check_group_members_limits
  before insert on public.group_members
  for each row execute function public.check_group_member_limits();

-- After a member leaves: delete the group when nobody is left (FR-16), or make
-- the earliest member the owner when the owner left (FR-15). Also runs when an
-- account is deleted. Does nothing when the whole group is being deleted.
create or replace function public.handle_group_member_left()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform 1 from public.groups g where g.id = old.group_id for update;
  if not found then
    return null;
  end if;

  if not exists (select 1 from public.group_members m where m.group_id = old.group_id) then
    delete from public.groups g where g.id = old.group_id;
  elsif old.is_owner then
    update public.group_members m
    set is_owner = true
    where m.group_id = old.group_id
      and m.user_id = (
        select m2.user_id
        from public.group_members m2
        where m2.group_id = old.group_id
        order by m2.joined_at, m2.user_id
        limit 1
      );
  end if;

  return null;
end;
$$;

create trigger on_group_member_left
  after delete on public.group_members
  for each row execute function public.handle_group_member_left();

-- Makes a group with the caller as owner and member (FR-1).
create or replace function public.create_group(festival_id uuid, name text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_group_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'not_signed_in' using errcode = '42501';
  end if;

  insert into public.groups (festival_id, name)
  values (create_group.festival_id, create_group.name)
  returning id into new_group_id;

  insert into public.group_members (group_id, user_id, is_owner)
  values (new_group_id, (select auth.uid()), true);

  return new_group_id;
end;
$$;

-- What the join screen shows for an invite token (FR-5). Returns no row for a
-- token that is not valid.
create or replace function public.get_group_invite(token uuid)
returns table (
  group_id uuid,
  group_name text,
  festival_id uuid,
  festival_name text,
  member_usernames text[],
  is_member boolean,
  is_full boolean,
  is_past boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    g.id,
    g.name,
    f.id,
    f.name,
    array(
      select p.username
      from public.group_members m
      join public.user_profiles p on p.id = m.user_id
      where m.group_id = g.id
      order by m.joined_at, m.user_id
    ),
    exists (select 1 from public.group_members m where m.group_id = g.id and m.user_id = (select auth.uid())),
    (select count(*) from public.group_members m where m.group_id = g.id) >= 20,
    f.end_date < current_date
  from public.groups g
  join public.festivals f on f.id = g.festival_id
  where g.invite_token = get_group_invite.token
    and (select auth.uid()) is not null;
$$;

-- Adds the caller to the group of the token (FR-5). Returns the group id, also
-- when the caller is already a member. Errors: invalid_invite, group_past,
-- group_full, group_limit.
create or replace function public.join_group(token uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_group_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'not_signed_in' using errcode = '42501';
  end if;

  select g.id into target_group_id from public.groups g where g.invite_token = join_group.token;
  if target_group_id is null then
    raise exception 'invalid_invite' using errcode = 'P0001', hint = 'The invite link is not valid';
  end if;

  insert into public.group_members (group_id, user_id)
  values (target_group_id, (select auth.uid()))
  on conflict (group_id, user_id) do nothing;

  return target_group_id;
end;
$$;

-- Gives the group a new invite token, so the old link stops working (FR-4).
create or replace function public.reset_invite_token(group_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_token uuid;
begin
  if not public.is_group_owner(reset_invite_token.group_id) then
    raise exception 'not_owner' using errcode = '42501', hint = 'Only the owner can reset the invite link';
  end if;
  if public.is_group_past(reset_invite_token.group_id) then
    raise exception 'group_past' using errcode = 'P0001', hint = 'The festival of this group has ended';
  end if;

  update public.groups g
  set invite_token = gen_random_uuid()
  where g.id = reset_invite_token.group_id
  returning g.invite_token into new_token;

  return new_token;
end;
$$;

-- The members of a group with their usernames and nothing else from the
-- profile (FR-12). Returns no rows to a user who is not a member.
create or replace function public.get_group_members(group_id uuid)
returns table (user_id uuid, username text, is_owner boolean, joined_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select m.user_id, p.username, m.is_owner, m.joined_at
  from public.group_members m
  join public.user_profiles p on p.id = m.user_id
  where m.group_id = get_group_members.group_id
    and public.is_group_member(get_group_members.group_id)
  order by m.joined_at, m.user_id;
$$;

revoke execute on function public.check_group_member_limits() from public, anon, authenticated;
revoke execute on function public.handle_group_member_left() from public, anon, authenticated;
revoke execute on function public.create_group(uuid, text) from public, anon;
revoke execute on function public.get_group_invite(uuid) from public, anon;
revoke execute on function public.join_group(uuid) from public, anon;
revoke execute on function public.reset_invite_token(uuid) from public, anon;
revoke execute on function public.get_group_members(uuid) from public, anon;
grant execute on function public.create_group(uuid, text) to authenticated;
grant execute on function public.get_group_invite(uuid) to authenticated;
grant execute on function public.join_group(uuid) to authenticated;
grant execute on function public.reset_invite_token(uuid) to authenticated;
grant execute on function public.get_group_members(uuid) to authenticated;
