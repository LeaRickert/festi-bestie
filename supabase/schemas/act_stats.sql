-- Global heat of each act (heatmap FR-6, FR-7, FR-9). Everyone reads it. Only
-- the scheduled job writes it, so it holds no user id, rating or rater count.
create table public.act_stats (
  act_id uuid primary key references public.acts (id) on delete cascade,
  heat real check (heat >= 0 and heat <= 1),
  computed_at timestamptz not null default now()
);

alter table public.act_stats enable row level security;

create policy "Act stats are viewable by everyone" on public.act_stats
  for select to anon, authenticated using (true);

revoke insert, update, delete, truncate on public.act_stats from anon, authenticated;

-- The job runs as postgres and is not part of the API.
create schema if not exists private;

-- Global heat (heatmap FR-5 to FR-7). Weights: 1 and 2 are 0, 3 is 0.5, 4 is 1,
-- 5 is 2. Heat is ln(1 + score) / ln(1 + max score), where the max score comes
-- from the acts of the same festival with 5 raters or more. An act with fewer
-- than 5 raters gets no heat.
create or replace function private.refresh_act_stats()
returns void
language sql
set search_path = ''
as $$
  with scores as (
    select
      a.id as act_id,
      a.festival_id,
      count(r.rating) as raters,
      coalesce(sum(case r.rating when 3 then 0.5 when 4 then 1 when 5 then 2 else 0 end), 0) as score
    from public.acts a
    left join public.user_ratings r on r.act_id = a.id
    group by a.id
  ),
  festival_max as (
    select festival_id, max(score) as max_score
    from scores
    where raters >= 5
    group by festival_id
  )
  insert into public.act_stats (act_id, heat, computed_at)
  select
    s.act_id,
    case
      when s.raters < 5 then null
      when m.max_score = 0 then 0
      else ln(1 + s.score) / ln(1 + m.max_score)
    end,
    now()
  from scores s
  left join festival_max m on m.festival_id = s.festival_id
  on conflict (act_id) do update
    set heat = excluded.heat, computed_at = excluded.computed_at;
$$;

revoke all on function private.refresh_act_stats() from public, anon, authenticated;
