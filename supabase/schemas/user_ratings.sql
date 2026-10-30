create table public.user_ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  act_id uuid references public.acts (id) on delete cascade,
  rating integer check (rating >= 1 and rating <= 5),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, act_id)
);

create index idx_user_ratings_user_id on public.user_ratings (user_id);
create index idx_user_ratings_act_id on public.user_ratings (act_id);

alter table public.user_ratings enable row level security;

create policy "Users can view their own ratings" on public.user_ratings
  for select using (auth.uid() = user_id);

create policy "Users can create their own ratings" on public.user_ratings
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own ratings" on public.user_ratings
  for update using (auth.uid() = user_id);

create policy "Users can delete their own ratings" on public.user_ratings
  for delete using (auth.uid() = user_id);

create trigger update_user_ratings_updated_at
  before update on public.user_ratings
  for each row execute function public.update_updated_at_column();
