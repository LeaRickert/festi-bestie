SET local check_function_bodies = off;

CREATE TABLE "public"."acts" (
  "id"             uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "festival_id"    uuid,
  "artist"         text                     NOT NULL,
  "day"            text,
  "start_time"     time without time zone,
  "length_minutes" integer                  DEFAULT 60,
  "stage"          text,
  "special_notes"  text,
  "genre"          text,
  "category"       text,
  "youtube_url"    text,
  "youtube_title"  text,
  "avg_rating"     numeric(3,1),
  "created_at"     timestamp with time zone DEFAULT now(),
  "updated_at"     timestamp with time zone DEFAULT now(),
  CONSTRAINT "acts_festival_artist_day_key" UNIQUE (festival_id, artist, day),
  CONSTRAINT "acts_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."acts"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."festivals" (
  "id"          uuid NOT NULL DEFAULT gen_random_uuid(),
  "slug"        text NOT NULL,
  "name"        text NOT NULL,
  "start_date"  date NOT NULL,
  "end_date"    date NOT NULL,
  "location"    text NOT NULL,
  "image_url"   text,
  "description" text,
  CONSTRAINT "festivals_pkey" PRIMARY KEY (id),
  CONSTRAINT "festivals_slug_check" CHECK ((slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'::text)),
  CONSTRAINT "festivals_slug_key" UNIQUE (slug)
);

ALTER TABLE "public"."festivals"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."user_profiles" (
  "id"       uuid NOT NULL,
  "username" text NOT NULL,
  CONSTRAINT "user_profiles_pkey" PRIMARY KEY (id),
  CONSTRAINT "user_profiles_username_key" UNIQUE (username)
);

ALTER TABLE "public"."user_profiles"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."user_ratings" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"    uuid,
  "act_id"     uuid,
  "rating"     integer,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "user_ratings_pkey" PRIMARY KEY (id),
  CONSTRAINT "user_ratings_rating_check" CHECK (((rating >= 1) AND (rating <= 5))),
  CONSTRAINT "user_ratings_user_id_act_id_key" UNIQUE (user_id, act_id)
);

ALTER TABLE "public"."user_ratings"
  ENABLE ROW LEVEL SECURITY;

CREATE TYPE "public"."festival_status" AS ENUM (
  'announced',
  'lineup',
  'stages',
  'schedule',
  'times',
  'complete'
);

ALTER TABLE "public"."festivals"
  ADD COLUMN "status" public.festival_status DEFAULT 'announced'::public.festival_status;

ALTER TABLE "public"."festivals"
  ADD COLUMN "created_at" timestamp WITH time zone DEFAULT now();

ALTER TABLE "public"."festivals"
  ADD COLUMN "updated_at" timestamp WITH time zone DEFAULT now();

CREATE TYPE "public"."user_role" AS ENUM (
  'admin',
  'editor',
  'viewer'
);

ALTER TABLE "public"."user_profiles"
  ADD COLUMN "role" public.user_role DEFAULT 'viewer'::public.user_role;

ALTER TABLE "public"."user_profiles"
  ADD COLUMN "created_at" timestamp WITH time zone DEFAULT now();

ALTER TABLE "public"."user_profiles"
  ADD COLUMN "updated_at" timestamp WITH time zone DEFAULT now();

CREATE OR REPLACE FUNCTION public.can_edit_acts (
  user_id uuid
)
  RETURNS boolean
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
begin
  return public.get_user_role(user_id) in ('admin', 'editor');
end;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_role (
  user_id uuid
)
  RETURNS public.user_role
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
begin
  return (select role from public.user_profiles where id = user_id);
end;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
begin
  insert into public.user_profiles (id, username, role)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'username'), ''), new.email),
    'viewer'
  );
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.is_username_available (
  name text
)
  RETURNS boolean
  LANGUAGE sql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
  select not exists (select 1 from public.user_profiles where username = trim(name));
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

ALTER TABLE "public"."acts"
  ADD CONSTRAINT "acts_festival_id_fkey" FOREIGN KEY (festival_id) REFERENCES public.festivals(id) ON DELETE CASCADE;

ALTER TABLE "public"."user_profiles"
  ADD CONSTRAINT "user_profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."user_ratings"
  ADD CONSTRAINT "user_ratings_act_id_fkey" FOREIGN KEY (act_id) REFERENCES public.acts(id) ON DELETE CASCADE;

ALTER TABLE "public"."user_ratings"
  ADD CONSTRAINT "user_ratings_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX idx_acts_day ON public.acts USING btree (day);

CREATE INDEX idx_acts_festival_id ON public.acts USING btree (festival_id);

CREATE INDEX idx_acts_genre ON public.acts USING btree (genre);

CREATE INDEX idx_acts_stage ON public.acts USING btree (stage);

CREATE INDEX idx_user_ratings_act_id ON public.user_ratings USING btree (act_id);

CREATE INDEX idx_user_ratings_user_id ON public.user_ratings USING btree (user_id);

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER update_acts_updated_at
  BEFORE UPDATE ON public.acts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_festivals_updated_at
  BEFORE UPDATE ON public.festivals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_ratings_updated_at
  BEFORE UPDATE ON public.user_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Acts are viewable by everyone" ON "public"."acts"
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Only admins and editors can insert acts" ON "public"."acts"
  FOR INSERT
  TO PUBLIC
  WITH CHECK (public.can_edit_acts(auth.uid()));

CREATE POLICY "Only admins and editors can update acts" ON "public"."acts"
  FOR UPDATE
  TO PUBLIC
  USING (public.can_edit_acts(auth.uid()));

CREATE POLICY "Only admins can delete acts" ON "public"."acts"
  FOR DELETE
  TO PUBLIC
  USING ((public.get_user_role(auth.uid()) = 'admin'::public.user_role));

CREATE POLICY "Festivals are viewable by everyone" ON "public"."festivals"
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Admins can update any profile" ON "public"."user_profiles"
  FOR UPDATE
  TO PUBLIC
  USING ((public.get_user_role(auth.uid()) = 'admin'::public.user_role))
  WITH CHECK ((public.get_user_role(auth.uid()) = 'admin'::public.user_role));

CREATE POLICY "Admins can view all profiles" ON "public"."user_profiles"
  FOR SELECT
  TO PUBLIC
  USING ((public.get_user_role(auth.uid()) = 'admin'::public.user_role));

CREATE POLICY "Users can update their own profile" ON "public"."user_profiles"
  FOR UPDATE
  TO PUBLIC
  USING ((auth.uid() = id))
  WITH CHECK (((auth.uid() = id) AND (role = public.get_user_role(auth.uid()))));

CREATE POLICY "Users can view their own profile" ON "public"."user_profiles"
  FOR SELECT
  TO PUBLIC
  USING ((auth.uid() = id));

CREATE POLICY "Users can create their own ratings" ON "public"."user_ratings"
  FOR INSERT
  TO PUBLIC
  WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Users can delete their own ratings" ON "public"."user_ratings"
  FOR DELETE
  TO PUBLIC
  USING ((auth.uid() = user_id));

CREATE POLICY "Users can update their own ratings" ON "public"."user_ratings"
  FOR UPDATE
  TO PUBLIC
  USING ((auth.uid() = user_id));

CREATE POLICY "Users can view their own ratings" ON "public"."user_ratings"
  FOR SELECT
  TO PUBLIC
  USING ((auth.uid() = user_id));

GRANT EXECUTE ON FUNCTION "public"."can_edit_acts"(uuid) TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."can_edit_acts"(uuid) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."can_edit_acts"(uuid) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."can_edit_acts"(uuid) TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."get_user_role"(uuid) TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."get_user_role"(uuid) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."get_user_role"(uuid) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."get_user_role"(uuid) TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."handle_new_user"() TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."handle_new_user"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."handle_new_user"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."handle_new_user"() TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."is_username_available"(text) TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."is_username_available"(text) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."is_username_available"(text) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."is_username_available"(text) TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."update_updated_at_column"() TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."update_updated_at_column"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."update_updated_at_column"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."update_updated_at_column"() TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."acts" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."acts" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."acts" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."acts" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."festivals" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."festivals" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."festivals" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."festivals" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."user_profiles" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."user_profiles" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."user_profiles" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."user_profiles" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."user_ratings" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."user_ratings" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."user_ratings" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."user_ratings" TO "service_role";
