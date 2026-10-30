# Roadmap

Order of work for Festi Besti. The specs in [specs/](specs/) say what the app
must do. This file says what to do first. Each item points to a spec or a
Known Issue instead of repeating it. Tick an item when it is merged.

New features get a spec (FR and TC rows) before code.

There is no production database yet. Phase 2 ends with the first deploy, so
Phases 1 and 2 are the gate for real users.

## Phase 0: Foundation

- [x] Move the schema to `supabase/schemas/` (declarative) with a generated migration, and the sample data to `supabase/seed.sql`
- [x] Move the master data to `data/` (CSV and YAML for each festival)
- [x] Fix the env var name: use `VITE_SUPABASE_PUBLISHABLE_KEY` in code, README and `.env.example`
- [x] Add TypeScript with `allowJs`. Write all new files as `.ts` or `.tsx`. Convert old files only when you change them.
- [x] Add Vitest. Start with `scheduleUtils` (festivals FR-7). Put the `[TC-XXXX]` tag in each test name.
- [x] Add a CI job: `lint`, `build`, `test`, `spec-md lint specs`

## Phase 1: Fix correctness and security

- [ ] Remove the profile bypass in `useAuth` (auth FR-9)
- [ ] Stop users from changing their own role in RLS (auth FR-8)
- [ ] Add the admin policy to change roles (auth FR-8)
- [ ] Remove the mock-data fallbacks. Show an error state instead. (festivals Known Issues)
- [ ] Revert the displayed rating when a save fails (ratings Known Issues)
- [ ] Stop building the act key from `day-stage`. Use the fields directly. (festivals Known Issues)
- [ ] Use the stored start time. Do not make up times. (festivals Known Issues)
- [ ] Handle a duplicate username at sign-up (auth Known Issues)
- [ ] Hide the debug panel in production builds

## Phase 2: Data and first deploy

Needs Phase 0 (TypeScript and tests). Needs Phase 1 before the deploy.

- [ ] Add `festivals.slug` (unique) and a unique key on `acts (festival_id, artist, day)`. Generate the migration. (data-import)
- [ ] Write `data:import` and `data:export` in TypeScript, with tests (data-import FR-1 to FR-11)
- [ ] Trim `supabase/seed.sql` to a small set for dev
- [ ] Create the production Supabase project and push the migrations
- [ ] Import `data/edc-orlando-2024` and `data/edc-orlando-2025` into production
- [ ] Make the first admin user
- [ ] Deploy the frontend

## Phase 3: Refactor

- [ ] Remove the copied time helpers from `ExportPage.jsx`. Import `scheduleUtils`.
- [ ] Split `ExportPage.jsx` into a preview, a filter panel and an export function
- [ ] Move the act popup out of `FestivalDetailPage.jsx`
- [ ] Delete `RoleBasedExample.jsx`, the legacy `exportSchedule.js` and `csvImport.js`. The data scripts replace the CSV code. (export Known Issues)
- [ ] Remove the router-state hand-off to the export page. Load data by festival id. (export Known Issues)

## Phase 4: Schedule UI and mobile

- [ ] Design the time grid for a 375 px wide screen (festivals FR-4)
- [ ] Make the day and stage filters easy to use with a thumb
- [ ] Make the act popup a bottom sheet on a phone
- [ ] Check every page at 375 px and 768 px
- [ ] Support a festival that runs past midnight and does not start at 1 PM
- [ ] Add the times for each festival to `data/` when the organizers publish them

## Phase 5: Edit acts

Needs Phase 1. Write `act-editing.spec.md` first (draft exists).

- [ ] Let an editor or admin set the start time, length, genre and YouTube URL of an act
- [ ] Let an editor or admin add an act
- [ ] Let an admin delete an act
- [ ] Show the edit controls only when `canEditActs` is true (the database still enforces the role)
- [ ] Decide how edits in the app and the files in `data/` stay in step. Export from the database to `data/` is the way back. ??

## Phase 6: Friend groups

Needs Phase 1. Write `groups.spec.md` first (draft exists). This changes the
rule "a user reads only their own ratings" in `ratings.spec.md` (FR-6).

- [ ] Add the tables `groups` and `group_members`, with RLS
- [ ] Let a user create a group and invite friends ?? (invite link or username)
- [ ] Let a group member read the ratings of the other members, and nobody else
- [ ] Let a user leave a group, and stop sharing when they leave
- [ ] Show who rated an act in the act popup

## Phase 7: Group heatmap

Needs Phases 4 and 6. Write `group-heatmap.spec.md` first (draft exists).

- [ ] Add a schedule view that colors each act by the ratings of the group
- [ ] Show the overlap: acts that many members rate 4 or 5
- [ ] Let the user pick the group and the day

## Open questions

- Is a group private by invite only, or can anyone find it?
- Does a member share all ratings, or one festival at a time?
- Does the heatmap use the average rating or the count of high ratings?
