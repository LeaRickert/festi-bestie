-- The username rule of the profiles (auth.spec.md FR-10). Run with
-- `npx supabase test db`.
begin;
create extension if not exists pgtap with schema extensions;
select plan(8);

-- Sign in as a user for the next statements, or sign out with reset role.
create function pg_temp.login(uid uuid) returns void language sql as $$
  select set_config('role', 'authenticated', true),
    set_config('request.jwt.claims', json_build_object('sub', uid, 'role', 'authenticated')::text, true);
$$;

-- The auth trigger makes the profiles.
insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-00000000000a', 'a@test.local', '{"username": "DJ Lea 2"}'),
  ('00000000-0000-0000-0000-00000000000b', 'b@test.local', '{"username": "  bob  "}'),
  ('00000000-0000-0000-0000-00000000000c', 'c@test.local', '{"username": "carol"}');

select is(
  (select username from public.user_profiles where id = '00000000-0000-0000-0000-00000000000a'),
  'DJ Lea 2',
  '[TC-B9AV] a username of letters, numbers and single spaces is accepted'
);

select is(
  (select username from public.user_profiles where id = '00000000-0000-0000-0000-00000000000b'),
  'bob',
  '[TC-CTI2] the spaces at the start and end are trimmed'
);

select throws_ok(
  $$ insert into auth.users (id, email, raw_user_meta_data)
     values ('00000000-0000-0000-0000-0000000000d1', 'd1@test.local', '{"username": "lea_b"}') $$,
  '23514',
  'Use up to 20 letters (A-Z), numbers and single spaces',
  '[TC-YKGF] a sign-up with an invalid username fails'
);

select throws_ok(
  $$ insert into auth.users (id, email, raw_user_meta_data)
     values ('00000000-0000-0000-0000-0000000000d2', 'd2@test.local', '{}') $$,
  '23514',
  'Choose a username',
  '[TC-11E0] a sign-up with no username fails'
);

select throws_ok(
  $$ insert into auth.users (id, email, raw_user_meta_data)
     values ('00000000-0000-0000-0000-0000000000d3', 'd3@test.local', '{"username": "abcdefghijklmnopqrstu"}') $$,
  '23514',
  null,
  '[TC-U52K] a sign-up with a username of 21 characters fails'
);

-- A user renames themself.
select pg_temp.login('00000000-0000-0000-0000-00000000000c');
select throws_ok(
  $$ update public.user_profiles set username = 'DJ  Carol' where id = '00000000-0000-0000-0000-00000000000c' $$,
  '23514',
  null,
  '[TC-0TGS] a user cannot rename themself to an invalid username'
);
reset role;

-- An older username that breaks the rule stays, and the rest of the row can change.
set local session_replication_role = replica;
update public.user_profiles set username = 'old_name@test.local' where id = '00000000-0000-0000-0000-00000000000c';
set local session_replication_role = origin;

update public.user_profiles set role = 'editor' where id = '00000000-0000-0000-0000-00000000000c';
select is(
  (select role::text from public.user_profiles where id = '00000000-0000-0000-0000-00000000000c'),
  'editor',
  '[TC-1OU6] the role of a user with an older invalid username can change'
);

select pg_temp.login('00000000-0000-0000-0000-00000000000c');
select lives_ok(
  $$ update public.user_profiles set username = 'old_name@test.local' where id = '00000000-0000-0000-0000-00000000000c' $$,
  '[TC-1OU6] saving an older invalid username unchanged is accepted'
);
reset role;

select * from finish();
rollback;
