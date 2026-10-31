SET local check_function_bodies = off;

CREATE TABLE "public"."group_members" (
  "group_id"  uuid                     NOT NULL,
  "user_id"   uuid                     NOT NULL,
  "is_owner"  boolean                  NOT NULL DEFAULT false,
  "joined_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "group_members_pkey" PRIMARY KEY (group_id, user_id)
);

ALTER TABLE "public"."group_members"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."groups" (
  "id"           uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "festival_id"  uuid                     NOT NULL,
  "name"         text                     NOT NULL,
  "invite_token" uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "created_at"   timestamp with time zone DEFAULT now(),
  "updated_at"   timestamp with time zone DEFAULT now(),
  CONSTRAINT "groups_invite_token_key" UNIQUE (invite_token),
  CONSTRAINT "groups_name_check" CHECK (((char_length(name) >= 1) AND (char_length(name) <= 40))),
  CONSTRAINT "groups_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."groups"
  ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.check_group_member_limits()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
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
$function$;

REVOKE ALL ON FUNCTION "public"."check_group_member_limits"() FROM PUBLIC, "anon", "authenticated";

CREATE OR REPLACE FUNCTION public.create_group (
  festival_id uuid,
  name        text
)
  RETURNS uuid
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
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
$function$;

REVOKE ALL ON FUNCTION "public"."create_group"(uuid, text) FROM PUBLIC, "anon";

CREATE OR REPLACE FUNCTION public.get_group_invite (
  token uuid
)
  RETURNS TABLE (
    group_id         uuid,
    group_name       text,
    festival_id      uuid,
    festival_name    text,
    member_usernames text[],
    is_member        boolean,
    is_full          boolean,
    is_past          boolean
  )
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
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
$function$;

REVOKE ALL ON FUNCTION "public"."get_group_invite"(uuid) FROM PUBLIC, "anon";

CREATE OR REPLACE FUNCTION public.get_group_members (
  group_id uuid
)
  RETURNS TABLE (
    user_id   uuid,
    username  text,
    is_owner  boolean,
    joined_at timestamp with time zone
  )
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
  select m.user_id, p.username, m.is_owner, m.joined_at
  from public.group_members m
  join public.user_profiles p on p.id = m.user_id
  where m.group_id = get_group_members.group_id
    and public.is_group_member(get_group_members.group_id)
  order by m.joined_at, m.user_id;
$function$;

REVOKE ALL ON FUNCTION "public"."get_group_members"(uuid) FROM PUBLIC, "anon";

CREATE OR REPLACE FUNCTION public.handle_group_member_left()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
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
$function$;

REVOKE ALL ON FUNCTION "public"."handle_group_member_left"() FROM PUBLIC, "anon", "authenticated";

CREATE OR REPLACE FUNCTION public.is_group_member (
  group_id uuid
)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
  select exists (
    select 1 from public.group_members m
    where m.group_id = is_group_member.group_id and m.user_id = (select auth.uid())
  );
$function$;

REVOKE ALL ON FUNCTION "public"."is_group_member"(uuid) FROM PUBLIC, "anon";

CREATE OR REPLACE FUNCTION public.is_group_owner (
  group_id uuid
)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
  select exists (
    select 1 from public.group_members m
    where m.group_id = is_group_owner.group_id and m.user_id = (select auth.uid()) and m.is_owner
  );
$function$;

REVOKE ALL ON FUNCTION "public"."is_group_owner"(uuid) FROM PUBLIC, "anon";

CREATE OR REPLACE FUNCTION public.is_group_past (
  group_id uuid
)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
  select exists (
    select 1
    from public.groups g
    join public.festivals f on f.id = g.festival_id
    where g.id = is_group_past.group_id and f.end_date < current_date
  );
$function$;

REVOKE ALL ON FUNCTION "public"."is_group_past"(uuid) FROM PUBLIC, "anon";

CREATE OR REPLACE FUNCTION public.join_group (
  token uuid
)
  RETURNS uuid
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
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
$function$;

REVOKE ALL ON FUNCTION "public"."join_group"(uuid) FROM PUBLIC, "anon";

CREATE OR REPLACE FUNCTION public.reset_invite_token (
  group_id uuid
)
  RETURNS uuid
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
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
$function$;

REVOKE ALL ON FUNCTION "public"."reset_invite_token"(uuid) FROM PUBLIC, "anon";

CREATE OR REPLACE FUNCTION public.shares_group_for_act (
  rater_id uuid,
  act_id   uuid
)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
  select exists (
    select 1
    from public.acts a
    join public.groups g on g.festival_id = a.festival_id
    join public.group_members me on me.group_id = g.id and me.user_id = (select auth.uid())
    join public.group_members them on them.group_id = g.id and them.user_id = shares_group_for_act.rater_id
    where a.id = shares_group_for_act.act_id
  );
$function$;

REVOKE ALL ON FUNCTION "public"."shares_group_for_act"(uuid, uuid) FROM PUBLIC, "anon";

CREATE OR REPLACE FUNCTION public.trim_group_name()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
begin
  new.name = btrim(new.name);
  return new;
end;
$function$;

ALTER TABLE "public"."group_members"
  ADD CONSTRAINT "group_members_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."groups"
  ADD CONSTRAINT "groups_festival_id_fkey" FOREIGN KEY (festival_id) REFERENCES public.festivals(id) ON DELETE CASCADE;

ALTER TABLE "public"."group_members"
  ADD CONSTRAINT "group_members_group_id_fkey" FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;

CREATE UNIQUE INDEX idx_group_members_one_owner ON public.group_members USING btree (group_id)
  WHERE is_owner;

CREATE INDEX idx_group_members_user_id ON public.group_members USING btree (user_id);

CREATE INDEX idx_groups_festival_id ON public.groups USING btree (festival_id);

CREATE TRIGGER check_group_members_limits
  BEFORE INSERT ON public.group_members
  FOR EACH ROW
  EXECUTE FUNCTION public.check_group_member_limits();

CREATE TRIGGER on_group_member_left
  AFTER DELETE ON public.group_members
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_group_member_left();

CREATE TRIGGER trim_groups_name
  BEFORE INSERT OR UPDATE OF name ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION public.trim_group_name();

CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Members can leave groups" ON "public"."group_members"
  FOR DELETE
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "Members can view the members of their groups" ON "public"."group_members"
  FOR SELECT
  TO "authenticated"
  USING (public.is_group_member(group_id));

CREATE POLICY "Members can view their groups" ON "public"."groups"
  FOR SELECT
  TO "authenticated"
  USING (public.is_group_member(id));

CREATE POLICY "Owners can delete their groups" ON "public"."groups"
  FOR DELETE
  TO "authenticated"
  USING (public.is_group_owner(id));

CREATE POLICY "Owners can rename groups that are not past" ON "public"."groups"
  FOR UPDATE
  TO "authenticated"
  USING ((public.is_group_owner(id) AND (NOT public.is_group_past(id))))
  WITH CHECK ((public.is_group_owner(id) AND (NOT public.is_group_past(id))));

CREATE POLICY "Members can view the shared ratings of their groups" ON "public"."user_ratings"
  FOR SELECT
  TO "authenticated"
  USING (public.shares_group_for_act(user_id, act_id));

REVOKE ALL ON FUNCTION "public"."check_group_member_limits"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."check_group_member_limits"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."check_group_member_limits"() TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."create_group"(uuid, text) TO "authenticated";

REVOKE ALL ON FUNCTION "public"."create_group"(uuid, text) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."create_group"(uuid, text) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."create_group"(uuid, text) TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."get_group_invite"(uuid) TO "authenticated";

REVOKE ALL ON FUNCTION "public"."get_group_invite"(uuid) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."get_group_invite"(uuid) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."get_group_invite"(uuid) TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."get_group_members"(uuid) TO "authenticated";

REVOKE ALL ON FUNCTION "public"."get_group_members"(uuid) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."get_group_members"(uuid) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."get_group_members"(uuid) TO "service_role";

REVOKE ALL ON FUNCTION "public"."handle_group_member_left"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."handle_group_member_left"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."handle_group_member_left"() TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."is_group_member"(uuid) TO "authenticated";

REVOKE ALL ON FUNCTION "public"."is_group_member"(uuid) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."is_group_member"(uuid) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."is_group_member"(uuid) TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."is_group_owner"(uuid) TO "authenticated";

REVOKE ALL ON FUNCTION "public"."is_group_owner"(uuid) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."is_group_owner"(uuid) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."is_group_owner"(uuid) TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."is_group_past"(uuid) TO "authenticated";

REVOKE ALL ON FUNCTION "public"."is_group_past"(uuid) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."is_group_past"(uuid) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."is_group_past"(uuid) TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."join_group"(uuid) TO "authenticated";

REVOKE ALL ON FUNCTION "public"."join_group"(uuid) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."join_group"(uuid) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."join_group"(uuid) TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."reset_invite_token"(uuid) TO "authenticated";

REVOKE ALL ON FUNCTION "public"."reset_invite_token"(uuid) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."reset_invite_token"(uuid) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."reset_invite_token"(uuid) TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."shares_group_for_act"(uuid, uuid) TO "authenticated";

REVOKE ALL ON FUNCTION "public"."shares_group_for_act"(uuid, uuid) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."shares_group_for_act"(uuid, uuid) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."shares_group_for_act"(uuid, uuid) TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."trim_group_name"() TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."trim_group_name"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."trim_group_name"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."trim_group_name"() TO "service_role";

REVOKE ALL ON TABLE "public"."group_members" FROM "anon";

GRANT MAINTAIN, REFERENCES, TRIGGER ON TABLE "public"."group_members" TO "anon";

REVOKE ALL ON TABLE "public"."group_members" FROM "authenticated";

GRANT DELETE, MAINTAIN, REFERENCES, SELECT, TRIGGER ON TABLE "public"."group_members" TO "authenticated";

REVOKE ALL ON TABLE "public"."group_members" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."group_members" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."group_members" TO "service_role";

REVOKE ALL ON TABLE "public"."groups" FROM "anon";

GRANT MAINTAIN, REFERENCES, TRIGGER ON TABLE "public"."groups" TO "anon";

REVOKE ALL ON TABLE "public"."groups" FROM "authenticated";

REVOKE ALL ("name") ON TABLE "public"."groups" FROM "authenticated";

GRANT UPDATE ("name") ON TABLE "public"."groups" TO "authenticated";

GRANT DELETE, MAINTAIN, REFERENCES, SELECT, TRIGGER ON TABLE "public"."groups" TO "authenticated";

REVOKE ALL ON TABLE "public"."groups" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."groups" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."groups" TO "service_role";
