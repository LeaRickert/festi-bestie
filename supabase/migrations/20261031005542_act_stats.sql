SET local check_function_bodies = off;

CREATE SCHEMA "private";

CREATE EXTENSION "pg_cron";

CREATE TABLE "public"."act_stats" (
  "act_id"      uuid                     NOT NULL,
  "heat"        real,
  "computed_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "act_stats_heat_check" CHECK (((heat >= (0)::double precision) AND (heat <= (1)::double precision))),
  CONSTRAINT "act_stats_pkey" PRIMARY KEY (act_id)
);

ALTER TABLE "public"."act_stats"
  ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION private.refresh_act_stats()
  RETURNS void
  LANGUAGE sql
  SET search_path TO ''
  AS $function$
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
$function$;

ALTER TABLE "public"."act_stats"
  ADD CONSTRAINT "act_stats_act_id_fkey" FOREIGN KEY (act_id) REFERENCES public.acts(id) ON DELETE CASCADE;

CREATE POLICY "Act stats are viewable by everyone" ON "public"."act_stats"
  FOR SELECT
  TO "anon", "authenticated"
  USING (true);

COMMENT ON EXTENSION "pg_cron" IS 'Job scheduler for PostgreSQL';

REVOKE ALL ON FUNCTION "private"."refresh_act_stats"() FROM PUBLIC;

REVOKE ALL ON TABLE "public"."act_stats" FROM "anon";

GRANT MAINTAIN, REFERENCES, SELECT, TRIGGER ON TABLE "public"."act_stats" TO "anon";

REVOKE ALL ON TABLE "public"."act_stats" FROM "authenticated";

GRANT MAINTAIN, REFERENCES, SELECT, TRIGGER ON TABLE "public"."act_stats" TO "authenticated";

REVOKE ALL ON TABLE "public"."act_stats" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."act_stats" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."act_stats" TO "service_role";

SELECT cron.schedule('refresh-act-stats', '*/15 * * * *', 'select private.refresh_act_stats()');
