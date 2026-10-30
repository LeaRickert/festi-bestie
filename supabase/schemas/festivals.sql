create table public.festivals (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  start_date date not null,
  end_date date not null,
  location text not null,
  image_url text,
  description text,
  status public.festival_status default 'announced',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.festivals enable row level security;

create policy "Festivals are viewable by everyone" on public.festivals
  for select using (true);

create trigger update_festivals_updated_at
  before update on public.festivals
  for each row execute function public.update_updated_at_column();
