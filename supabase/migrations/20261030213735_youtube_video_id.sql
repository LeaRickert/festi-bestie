ALTER TABLE "public"."acts"
  DROP COLUMN "youtube_url";

ALTER TABLE "public"."acts"
  ADD COLUMN "youtube_video_id" text;

ALTER TABLE "public"."acts"
  ADD CONSTRAINT "acts_youtube_video_id_check" CHECK ((youtube_video_id ~ '^[A-Za-z0-9_-]{11}$'::text));
