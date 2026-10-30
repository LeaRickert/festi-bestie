SET local check_function_bodies = off;

DROP POLICY "Users can update their own profile" ON "public"."user_profiles";

CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
begin
  insert into public.user_profiles (id, username, role)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'username'), ''), new.email),
    'viewer'
  );
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.is_username_available (
  name text
)
  RETURNS boolean
  LANGUAGE sql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
  select not exists (select 1 from public.user_profiles where username = trim(name));
$function$;

CREATE POLICY "Admins can update any profile" ON "public"."user_profiles"
  FOR UPDATE
  TO PUBLIC
  USING ((public.get_user_role(auth.uid()) = 'admin'::public.user_role))
  WITH CHECK ((public.get_user_role(auth.uid()) = 'admin'::public.user_role));

CREATE POLICY "Admins can view all profiles" ON "public"."user_profiles"
  FOR SELECT
  TO PUBLIC
  USING ((public.get_user_role(auth.uid()) = 'admin'::public.user_role));

CREATE POLICY "Users can update their own profile" ON "public"."user_profiles"
  FOR UPDATE
  TO PUBLIC
  USING ((auth.uid() = id))
  WITH CHECK (((auth.uid() = id) AND (role = public.get_user_role(auth.uid()))));

GRANT EXECUTE ON FUNCTION "public"."is_username_available"(text) TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."is_username_available"(text) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."is_username_available"(text) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."is_username_available"(text) TO "service_role";
