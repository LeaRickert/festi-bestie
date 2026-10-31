-- RLS and limits of friend groups (groups.spec.md FR-1 to FR-18) and the
-- shared ratings (ratings.spec.md FR-6). Run with `npx supabase test db`.
begin;
create extension if not exists pgtap with schema extensions;
select plan(47);

-- Sign in as a user for the next statements, or sign out with reset role.
create function pg_temp.login(uid uuid) returns void language sql as $$
  select set_config('role', 'authenticated', true),
    set_config('request.jwt.claims', json_build_object('sub', uid, 'role', 'authenticated')::text, true);
$$;

create function pg_temp.id(name text) returns uuid language sql as $$
  select current_setting('test.' || name)::uuid;
$$;

-- Festivals: f1 and f2 are upcoming, f3 has ended, f4 ends later in the test.
insert into public.festivals (id, slug, name, start_date, end_date, location) values
  ('00000000-0000-0000-0000-0000000000f1', 'test-fest-one', 'Test Fest One', current_date + 10, current_date + 12, 'Here'),
  ('00000000-0000-0000-0000-0000000000f2', 'test-fest-two', 'Test Fest Two', current_date + 100, current_date + 102, 'There'),
  ('00000000-0000-0000-0000-0000000000f3', 'test-fest-past', 'Test Fest Past', current_date - 10, current_date - 8, 'Gone'),
  ('00000000-0000-0000-0000-0000000000f4', 'test-fest-four', 'Test Fest Four', current_date + 20, current_date + 22, 'Later');

insert into public.acts (id, festival_id, artist, day) values
  ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000f1', 'Fisher', 'Friday'),
  ('00000000-0000-0000-0000-0000000000a2', '00000000-0000-0000-0000-0000000000f2', 'Other Act', 'Friday'),
  ('00000000-0000-0000-0000-0000000000a4', '00000000-0000-0000-0000-0000000000f4', 'Late Act', 'Friday');

-- Users A to D, and 19 fillers for the member cap. The auth trigger makes the profiles.
insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-00000000000a', 'a@test.local', '{"username": "alice"}'),
  ('00000000-0000-0000-0000-00000000000b', 'b@test.local', '{"username": "bob"}'),
  ('00000000-0000-0000-0000-00000000000c', 'c@test.local', '{"username": "carol"}'),
  ('00000000-0000-0000-0000-00000000000d', 'd@test.local', '{"username": "dave"}');
insert into auth.users (id, email, raw_user_meta_data)
select ('00000000-0000-0000-0001-' || lpad(n::text, 12, '0'))::uuid, 'filler' || n || '@test.local',
  json_build_object('username', 'filler' || n)::jsonb
from generate_series(1, 19) n;

select set_config('test.a', '00000000-0000-0000-0000-00000000000a', true);
select set_config('test.b', '00000000-0000-0000-0000-00000000000b', true);
select set_config('test.c', '00000000-0000-0000-0000-00000000000c', true);
select set_config('test.d', '00000000-0000-0000-0000-00000000000d', true);

-- B rated before any group exists.
insert into public.user_ratings (user_id, act_id, rating) values
  (pg_temp.id('b'), '00000000-0000-0000-0000-0000000000a1', 5),
  (pg_temp.id('b'), '00000000-0000-0000-0000-0000000000a2', 3);

-- Make a group --------------------------------------------------------------

select pg_temp.login(pg_temp.id('a'));

select lives_ok(
  $$ select set_config('test.g1', public.create_group('00000000-0000-0000-0000-0000000000f1', '  Camp A  ')::text, true) $$,
  '[TC-W6EZ] a signed-in user makes a group'
);
select is((select name from public.groups where id = pg_temp.id('g1')), 'Camp A', '[TC-W6EZ] the name is trimmed');
select results_eq(
  $$ select user_id, is_owner from public.group_members where group_id = pg_temp.id('g1') $$,
  $$ values (pg_temp.id('a'), true) $$,
  '[TC-W6EZ] the maker is the owner and a member'
);
select throws_ok(
  $$ select public.create_group('00000000-0000-0000-0000-0000000000f3', 'Old') $$,
  'P0001', 'group_past', '[TC-TDLG] no group for a festival that has ended'
);
select throws_ok(
  $$ select public.create_group('00000000-0000-0000-0000-0000000000f1', '    ') $$,
  '23514', null, '[TC-7VVH] no group with a name of only spaces'
);
select throws_ok(
  $$ select public.create_group('00000000-0000-0000-0000-0000000000f1', repeat('x', 41)) $$,
  '23514', null, '[TC-JXYX] no group with a name of 41 characters'
);
select lives_ok(
  $$ select public.create_group('00000000-0000-0000-0000-0000000000f1', repeat('x', 40)) $$,
  'a name of 40 characters is accepted'
);
select throws_ok(
  $$ select public.create_group('00000000-0000-0000-0000-0000000000f1', 'Third') $$,
  'P0001', 'group_limit', '[TC-5HHA] no third group for the same festival'
);
select set_config('test.g2', (select id::text from public.groups where name = repeat('x', 40)), true);
select set_config('test.token1', (select invite_token::text from public.groups where id = pg_temp.id('g1')), true);

select throws_ok(
  $$ insert into public.groups (festival_id, name) values ('00000000-0000-0000-0000-0000000000f1', 'Direct') $$,
  '42501', null, 'a user cannot insert a group directly'
);
select throws_ok(
  $$ insert into public.group_members (group_id, user_id) values (pg_temp.id('g1'), pg_temp.id('d')) $$,
  '42501', null, 'a user cannot add a member directly'
);

reset role;
set local role anon;
select throws_ok(
  $$ select public.create_group('00000000-0000-0000-0000-0000000000f1', 'Anon') $$,
  '42501', null, '[TC-94CE] a visitor who is not signed in cannot make a group'
);
select throws_ok($$ select * from public.groups $$, '42501', null, 'a visitor cannot read groups');
reset role;

-- Invite and join -----------------------------------------------------------

select pg_temp.login(pg_temp.id('b'));

select is_empty($$ select 1 from public.groups where id = pg_temp.id('g1') $$, 'a non-member cannot read the group or its token');
select results_eq(
  $$ select group_name, member_usernames, is_member, is_full, is_past from public.get_group_invite(pg_temp.id('token1')) $$,
  $$ values ('Camp A'::text, array['alice']::text[], false, false, false) $$,
  '[TC-3S93] the join screen shows the group and the members, and the user is not a member yet'
);
select is(public.join_group(pg_temp.id('token1')), pg_temp.id('g1'), '[TC-8N7P] the user joins with the invite link');
select ok(public.is_group_member(pg_temp.id('g1')), '[TC-8N7P] the user is a member');
select is(
  (select invite_token from public.groups where id = pg_temp.id('g1')), pg_temp.id('token1'),
  '[TC-B3VI] a member who is not the owner reads the invite link'
);

-- Shared ratings and usernames ----------------------------------------------

select pg_temp.login(pg_temp.id('a'));

select results_eq(
  $$ select rating from public.user_ratings where user_id = pg_temp.id('b') $$,
  $$ values (5) $$,
  '[TC-GAD0] a member reads the rating of another member, [TC-H6XQ] and not the rating for an act of another festival'
);
select is_empty(
  $$ select 1 from public.user_profiles where id = pg_temp.id('b') $$,
  '[TC-DC2C] a member cannot read the profile of another member'
);
select results_eq(
  $$ select user_id, username from public.get_group_members(pg_temp.id('g1')) $$,
  $$ values (pg_temp.id('a'), 'alice'::text), (pg_temp.id('b'), 'bob'::text) $$,
  '[TC-DC2C] a member gets only the id and username of the members'
);
update public.user_ratings set rating = 1 where user_id = pg_temp.id('b');

select pg_temp.login(pg_temp.id('c'));

select is_empty(
  $$ select 1 from public.user_ratings where user_id = pg_temp.id('b') $$,
  '[TC-OD2H] [TC-6Q8C] a user in no group with B cannot read any rating of B'
);
select is_empty($$ select * from public.get_group_members(pg_temp.id('g1')) $$, 'a non-member gets no members');

reset role;
select is(
  (select rating from public.user_ratings where user_id = pg_temp.id('b') and act_id = '00000000-0000-0000-0000-0000000000a1'),
  5, 'a member cannot change the rating of another member'
);

-- Owner actions -------------------------------------------------------------

select pg_temp.login(pg_temp.id('b'));

select throws_ok(
  $$ select public.reset_invite_token(pg_temp.id('g1')) $$,
  '42501', 'not_owner', 'a member who is not the owner cannot reset the link'
);
update public.groups set name = 'Hijacked' where id = pg_temp.id('g1');
delete from public.groups where id = pg_temp.id('g1');

select pg_temp.login(pg_temp.id('a'));

select is((select name from public.groups where id = pg_temp.id('g1')), 'Camp A', '[TC-OSAD] a member who is not the owner cannot rename');
select ok(exists (select 1 from public.groups where id = pg_temp.id('g1')), '[TC-MXJC] a member who is not the owner cannot delete');
update public.groups set name = ' Camp B ' where id = pg_temp.id('g1');
select is((select name from public.groups where id = pg_temp.id('g1')), 'Camp B', '[TC-OSAD] the owner renames the group');
select throws_ok(
  $$ update public.groups set invite_token = gen_random_uuid() where id = pg_temp.id('g1') $$,
  '42501', null, 'the owner cannot set the token directly'
);
select isnt(public.reset_invite_token(pg_temp.id('g1')), pg_temp.id('token1'), 'the owner resets the link');
select set_config('test.token2', (select invite_token::text from public.groups where id = pg_temp.id('g1')), true);

select pg_temp.login(pg_temp.id('d'));

select is_empty($$ select * from public.get_group_invite(pg_temp.id('token1')) $$, '[TC-W8M1] the old link shows nothing');
select throws_ok(
  $$ select public.join_group(pg_temp.id('token1')) $$,
  'P0001', 'invalid_invite', '[TC-W8M1] the old link does not let the user join'
);

-- C joins after B rated.
select pg_temp.login(pg_temp.id('c'));
select lives_ok($$ select public.join_group(pg_temp.id('token2')) $$, 'C joins with the new link');
select results_eq(
  $$ select rating from public.user_ratings where user_id = pg_temp.id('b') $$,
  $$ values (5) $$,
  '[TC-3ZQE] a member reads a rating given before they joined'
);

-- Limits --------------------------------------------------------------------

select pg_temp.login(pg_temp.id('a'));
select set_config('test.g3', public.create_group('00000000-0000-0000-0000-0000000000f2', 'Full')::text, true);
select set_config('test.token3', (select invite_token::text from public.groups where id = pg_temp.id('g3')), true);
reset role;
insert into public.group_members (group_id, user_id)
select pg_temp.id('g3'), id from auth.users where email like 'filler%@test.local';

select pg_temp.login(pg_temp.id('d'));
select throws_ok(
  $$ select public.join_group(pg_temp.id('token3')) $$,
  'P0001', 'group_full', '[TC-EDFG] no join to a group with 20 members'
);
select pg_temp.login(pg_temp.id('d'));
select public.create_group('00000000-0000-0000-0000-0000000000f1', 'D one');
select public.create_group('00000000-0000-0000-0000-0000000000f1', 'D two');
select pg_temp.login(pg_temp.id('b'));
select set_config('test.g4', public.create_group('00000000-0000-0000-0000-0000000000f2', 'B two')::text, true);
select set_config('test.token4', (select invite_token::text from public.groups where id = pg_temp.id('g4')), true);
select pg_temp.login(pg_temp.id('d'));
select lives_ok(
  $$ select public.join_group(pg_temp.id('token4')) $$,
  '[TC-1EAU] a user in 2 groups for one festival joins a group for another festival'
);

-- Leave ---------------------------------------------------------------------

-- Members of g1 joined in the order A, B, C.
reset role;
update public.group_members set joined_at = now() - interval '3 hours' where group_id = pg_temp.id('g1') and user_id = pg_temp.id('a');
update public.group_members set joined_at = now() - interval '2 hours' where group_id = pg_temp.id('g1') and user_id = pg_temp.id('b');
update public.group_members set joined_at = now() - interval '1 hour' where group_id = pg_temp.id('g1') and user_id = pg_temp.id('c');

select pg_temp.login(pg_temp.id('a'));
delete from public.group_members where group_id = pg_temp.id('g1') and user_id = pg_temp.id('a');
select pg_temp.login(pg_temp.id('b'));
select ok(public.is_group_owner(pg_temp.id('g1')), '[TC-5MBF] the earliest member is the owner when the owner leaves');

delete from public.group_members where group_id = pg_temp.id('g1') and user_id = pg_temp.id('c');
select ok(public.is_group_member(pg_temp.id('g1')), 'a member cannot remove another member');

delete from public.group_members where group_id = pg_temp.id('g1') and user_id = pg_temp.id('b');
select ok(not public.is_group_member(pg_temp.id('g1')), '[TC-M695] the member who left is not a member');
select results_eq(
  $$ select rating from public.user_ratings where user_id = pg_temp.id('b') order by rating $$,
  $$ values (3), (5) $$,
  '[TC-VKS4] the member who left keeps their own ratings'
);

select pg_temp.login(pg_temp.id('c'));
select is_empty(
  $$ select 1 from public.user_ratings where user_id = pg_temp.id('b') $$,
  '[TC-VKS4] the others cannot read the ratings of the member who left'
);
delete from public.group_members where group_id = pg_temp.id('g1') and user_id = pg_temp.id('c');

reset role;
select ok(not exists (select 1 from public.groups where id = pg_temp.id('g1')), '[TC-LNHJ] the group is deleted when the last member leaves');

select pg_temp.login(pg_temp.id('a'));
delete from public.groups where id = pg_temp.id('g2');
reset role;
select ok(not exists (select 1 from public.groups where id = pg_temp.id('g2')), '[TC-6KU0] the owner deletes the group');

-- Past group ----------------------------------------------------------------

select pg_temp.login(pg_temp.id('a'));
select set_config('test.g5', public.create_group('00000000-0000-0000-0000-0000000000f4', 'Past Camp')::text, true);
select set_config('test.token5', (select invite_token::text from public.groups where id = pg_temp.id('g5')), true);
select pg_temp.login(pg_temp.id('c'));
select public.join_group(pg_temp.id('token5'));
insert into public.user_ratings (user_id, act_id, rating) values (pg_temp.id('c'), '00000000-0000-0000-0000-0000000000a4', 4);

reset role;
update public.festivals set end_date = current_date - 1, start_date = current_date - 3
where id = '00000000-0000-0000-0000-0000000000f4';

select pg_temp.login(pg_temp.id('a'));
select results_eq(
  $$ select rating from public.user_ratings where user_id = pg_temp.id('c') $$,
  $$ values (4) $$,
  '[TC-8P5H] a member reads the shared ratings of a past group'
);
update public.groups set name = 'Renamed' where id = pg_temp.id('g5');
select is((select name from public.groups where id = pg_temp.id('g5')), 'Past Camp', '[TC-8P5H] no rename of a past group');
select throws_ok(
  $$ select public.reset_invite_token(pg_temp.id('g5')) $$,
  'P0001', 'group_past', '[TC-8P5H] no reset of the link of a past group'
);
select pg_temp.login(pg_temp.id('d'));
select throws_ok(
  $$ select public.join_group(pg_temp.id('token5')) $$,
  'P0001', 'group_past', '[TC-8P5H] no join to a past group'
);
select pg_temp.login(pg_temp.id('c'));
delete from public.group_members where group_id = pg_temp.id('g5') and user_id = pg_temp.id('c');
select ok(not public.is_group_member(pg_temp.id('g5')), 'a member leaves a past group');

reset role;
select * from finish();
rollback;
