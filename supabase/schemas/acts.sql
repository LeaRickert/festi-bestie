create table public.acts (
  id uuid primary key default gen_random_uuid(),
  festival_id uuid references public.festivals (id) on delete cascade,
  artist text not null,
  day text,
  start_time time,
  length_minutes integer default 60,
  stage text,
  special_notes text,
  genre text,
  category text,
  youtube_url text,
  youtube_title text,
  avg_rating numeric(3, 1),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_acts_festival_id on public.acts (festival_id);
create index idx_acts_day on public.acts (day);
create index idx_acts_stage on public.acts (stage);
create index idx_acts_genre on public.acts (genre);

alter table public.acts enable row level security;

create policy "Acts are viewable by everyone" on public.acts
  for select using (true);

create policy "Only admins and editors can insert acts" on public.acts
  for insert with check (public.can_edit_acts(auth.uid()));

create policy "Only admins and editors can update acts" on public.acts
  for update using (public.can_edit_acts(auth.uid()));

create policy "Only admins can delete acts" on public.acts
  for delete using (public.get_user_role(auth.uid()) = 'admin');

create trigger update_acts_updated_at
  before update on public.acts
  for each row execute function public.update_updated_at_column();
