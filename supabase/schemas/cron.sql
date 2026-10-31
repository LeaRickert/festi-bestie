create extension if not exists pg_cron with schema pg_catalog;

-- Global heat every 15 minutes (heatmap FR-8).
select cron.schedule('refresh-act-stats', '*/15 * * * *', 'select private.refresh_act_stats()');
