ALTER TABLE "public"."festivals"
  ADD COLUMN "slug" text NOT NULL;

ALTER TABLE "public"."acts"
  ADD CONSTRAINT "acts_festival_artist_day_key" UNIQUE (festival_id, artist, day);

ALTER TABLE "public"."festivals"
  ADD CONSTRAINT "festivals_slug_check" CHECK ((slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'::text));

ALTER TABLE "public"."festivals"
  ADD CONSTRAINT "festivals_slug_key" UNIQUE (slug);
