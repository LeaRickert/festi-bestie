create type public.festival_status as enum ('announced', 'lineup', 'stages', 'schedule', 'times', 'complete');

create type public.user_role as enum ('admin', 'editor', 'viewer');
