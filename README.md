# Festi Bestie

Plan a music festival: browse festivals, see the lineup and schedule, rate
artists, and export a personal schedule as an image.

Stack: React 18, Vite, TypeScript, Vitest, Biome, Tailwind CSS, Supabase (Postgres, Auth, RLS), html2canvas.

## Setup

1. Install packages: `npm install`
2. Start local Supabase (needs Docker): `npx supabase start`, then `npx supabase db reset`. This applies the migrations and `supabase/seed.sql`.
   For a hosted project: `npx supabase link`, then `npx supabase db push`.
3. Copy `.env.example` to `.env.local` and fill in the values:
   ```env
   VITE_SUPABASE_URL=https://<project>.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=<publishable key>
   ```
4. Start the app: `npm run dev` (http://localhost:3000)

Other commands: `npm run build`, `npm run preview`, `npm run lint` (Biome, lint only; the formatter is off), `npm run typecheck`, `npm test`.
CI runs lint, typecheck, build, test and the spec lint on every push and pull request.

## Roadmap

See [ROADMAP.md](ROADMAP.md) for the planned work.

## Specs

The specs in [specs/](specs/) describe what the app must do. They are the
source of truth.

- [festivals.spec.md](specs/festivals.spec.md): festival list, status views, schedule grid
- [ratings.spec.md](specs/ratings.spec.md): 1 to 5 star ratings
- [auth.spec.md](specs/auth.spec.md): sign-in, roles, database access rules
- [export.spec.md](specs/export.spec.md): PNG export, CSV import and export
- [data-import.spec.md](specs/data-import.spec.md): master data in `data/` (draft, scripts not built yet)
- Drafts, not built yet: [act-editing](specs/act-editing.spec.md), [groups](specs/groups.spec.md), [group-heatmap](specs/group-heatmap.spec.md)

Check the specs with `npx @rosenjcb/spec-md lint specs`.

## Layout

```
src/pages/       LandingPage, FestivalDetailPage, ExportPage
src/components/  one view per festival status, StarRating, LoginModal
src/hooks/       useAuth, useFestivalData
src/utils/       scheduleUtils, csvImport, exportSchedule, supabase
supabase/schemas/    schema source of truth (tables, RLS, functions)
supabase/migrations/ generated migrations
supabase/seed.sql    small sample data for dev
data/                master data for each festival (CSV and YAML)
```

## Database changes

The schema uses Supabase declarative schemas (`pg-delta`).

1. Edit a file in `supabase/schemas/`. Do not change the database in Studio.
2. Generate a migration: `npx supabase db schema declarative sync -f <name> --no-apply`
3. Read the migration. Remove `GRANT`/`REVOKE` lines you did not write.
4. Apply it: `npx supabase migration up`

Do not use `db diff`. It ignores the schema files.

## Festival status

`announced` → `lineup` → `stages` → `schedule` → `times` → `complete`.
The status of a festival decides which view the festival page shows.
