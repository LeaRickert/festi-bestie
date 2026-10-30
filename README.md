# Festi Besti

Plan a music festival: browse festivals, see the lineup and schedule, rate
artists, and export a personal schedule as an image.

Stack: React 18, Vite, Tailwind CSS, Supabase (Postgres, Auth, RLS), html2canvas.

## Setup

1. Install packages: `npm install`
2. Create a Supabase project. Run `supabase-setup.sql` in the SQL editor.
3. Create `.env.local`:
   ```env
   VITE_SUPABASE_URL=https://<project>.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=<publishable key>
   ```
4. Start the app: `npm run dev` (http://localhost:3000)

Other commands: `npm run build`, `npm run preview`, `npm run lint`.

## Roadmap

See [ROADMAP.md](ROADMAP.md) for the planned work.

## Specs

The specs in [specs/](specs/) describe what the app must do. They are the
source of truth.

- [festivals.spec.md](specs/festivals.spec.md): festival list, status views, schedule grid
- [ratings.spec.md](specs/ratings.spec.md): 1 to 5 star ratings
- [auth.spec.md](specs/auth.spec.md): sign-in, roles, database access rules
- [export.spec.md](specs/export.spec.md): PNG export, CSV import and export
- Drafts, not built yet: [act-editing](specs/act-editing.spec.md), [groups](specs/groups.spec.md), [group-heatmap](specs/group-heatmap.spec.md)

Check the specs with `npx @rosenjcb/spec-md lint specs`.

## Layout

```
src/pages/       LandingPage, FestivalDetailPage, ExportPage
src/components/  one view per festival status, StarRating, LoginModal
src/hooks/       useAuth, useFestivalData
src/utils/       scheduleUtils, csvImport, exportSchedule, supabase
supabase-setup.sql   schema, RLS policies, sample data
```

## Festival status

`announced` → `lineup` → `stages` → `schedule` → `times` → `complete`.
The status of a festival decides which view the festival page shows.
