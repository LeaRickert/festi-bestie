create table public.user_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  role public.user_role default 'viewer',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.user_profiles enable row level security;

create policy "Users can view their own profile" on public.user_profiles
  for select using (auth.uid() = id);

-- A user can edit their own profile but not their role (auth FR-8).
create policy "Users can update their own profile" on public.user_profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role = public.get_user_role(auth.uid()));

create policy "Admins can view all profiles" on public.user_profiles
  for select using (public.get_user_role(auth.uid()) = 'admin');

create policy "Admins can update any profile" on public.user_profiles
  for update
  using (public.get_user_role(auth.uid()) = 'admin')
  with check (public.get_user_role(auth.uid()) = 'admin');

create trigger update_user_profiles_updated_at
  before update on public.user_profiles
  for each row execute function public.update_updated_at_column();

create or replace function public.get_user_role(user_id uuid)
returns public.user_role
language plpgsql
security definer
set search_path = public
as $$
begin
  return (select role from public.user_profiles where id = user_id);
end;
$$;

create or replace function public.can_edit_acts(user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  return public.get_user_role(user_id) in ('admin', 'editor');
end;
$$;

-- Creates a profile for each new account. The username comes from the sign-up
-- metadata and falls back to the email. A duplicate username fails the sign-up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (id, username, role)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'username'), ''), new.email),
    'viewer'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Lets the sign-up form check a username before it creates the account.
create or replace function public.is_username_available(name text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select not exists (select 1 from public.user_profiles where username = trim(name));
$$;

grant execute on function public.is_username_available(text) to anon, authenticated;
