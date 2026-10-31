SET local check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.check_username()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
begin
  new.username := trim(new.username);
  if tg_op = 'UPDATE' and new.username = old.username then
    return new;
  end if;
  if new.username = '' then
    raise exception 'Choose a username' using errcode = 'check_violation';
  end if;
  if char_length(new.username) > 20 or new.username !~ '^[A-Za-z0-9]+( [A-Za-z0-9]+)*$' then
    raise exception 'Use up to 20 letters (A-Z), numbers and single spaces' using errcode = 'check_violation';
  end if;
  return new;
end;
$function$;

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
    coalesce(new.raw_user_meta_data ->> 'username', ''),
    'viewer'
  );
  return new;
end;
$function$;

CREATE TRIGGER check_user_profiles_username
  BEFORE INSERT OR UPDATE OF username ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_username();

GRANT EXECUTE ON FUNCTION "public"."check_username"() TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."check_username"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."check_username"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."check_username"() TO "service_role";
