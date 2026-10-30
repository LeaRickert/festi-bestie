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

-- Known issue (specs/auth.spec.md FR-8): this lets a user change their own role.
create policy "Users can update their own profile" on public.user_profiles
  for update using (auth.uid() = id);

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

-- Creates a profile for each new account. The username starts as the email.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (id, username, role)
  values (new.id, new.email, 'viewer');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
