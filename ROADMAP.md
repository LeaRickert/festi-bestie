# Roadmap

Order of work for Festi Bestie. The specs in [specs/](specs/) say what the app
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

- [x] Remove the profile bypass in `useAuth` (auth FR-9)
- [x] Stop users from changing their own role in RLS (auth FR-8)
- [x] Add the admin policy to change roles (auth FR-8)
- [x] Remove the mock-data fallbacks. Show an error state instead. (festivals Known Issues)
- [x] Revert the displayed rating when a save fails (ratings Known Issues)
- [x] Stop building the act key from `day-stage`. Use the fields directly. (festivals Known Issues)
- [x] Use the stored start time. Do not make up times. (festivals Known Issues)
- [x] Handle a duplicate username at sign-up (auth Known Issues)
- [x] Hide the debug panel in production builds

## Phase 2: Data and first deploy

Needs Phase 0 (TypeScript and tests). Needs Phase 1 before the deploy.

- [x] Add `festivals.slug` (unique) and a unique key on `acts (festival_id, artist, day)`. Generate the migration. (data-import)
- [x] Write `data:import` and `data:export` in TypeScript, with tests (data-import FR-1 to FR-11)
- [ ] Squash the migrations into one initial migration (done before the first push; never after)
- [ ] Create the production Supabase project and push the migrations
- [ ] Import `data/edc-orlando-2025` into production as the full past-festival test set (all set times, except the Bacardi stage which is left out). Use it to check the time grid and exports. `data/edc-orlando-2024` has no times, so it is not imported.
- [ ] Import `data/edc-orlando-2026` into production. This is the festival that is used and rated, and it is next week.
- [ ] Make the first admin user
- [ ] Deploy the frontend

## Phase 3: Refactor

- [ ] Rebuild `supabase/seed.sql` (or derive it from `data/edc-orlando-2025`) as a small but complete dev set: every day, every stage, and a spread of start times (early, late, past midnight), with a few acts with no time and a few with a special note
- [ ] Remove the copied time helpers from `ExportPage.jsx`. Import `scheduleUtils`.
- [ ] Split `ExportPage.jsx` into a preview, a filter panel and an export function
- [ ] Move the act popup out of `FestivalDetailPage.jsx`
- [ ] Delete `RoleBasedExample.jsx`, the legacy `exportSchedule.js` and `csvImport.js`. The data scripts replace the CSV code. (export Known Issues)
- [ ] Remove the router-state hand-off to the export page. Load data by festival id. (export Known Issues)

## Phase 4: Schedule UI and mobile

- [ ] Drop the act and festival images from the UI (landing, detail, export). They add nothing. Remove `data/edc-orlando-2026/_images` if nothing else uses it.
- [ ] Show a festival logo as a small extra mark next to the name, from one optimized sprite sheet (one file, one request)
- [ ] Clean up the overall design, starting with the schedule: spacing, type, color and contrast
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

## Phase 8: Offline

Needs Phase 4. A festival has weak signal, so the app must work without it. Write `offline.spec.md` first.

- [ ] Explore first, then decide: service worker with precached app shell, cached schedule data, local store (IndexedDB) for ratings
- [ ] Open the app and read the schedule with no connection after one online visit
- [ ] Save a rating offline and sync it when the connection returns (keep the upsert on `user_id,act_id`)
- [ ] Decide how to resolve a conflict when the same rating changed on two devices ??
- [ ] Show the user when they are offline and when a rating is waiting to sync
- [ ] Test on a throttled and a fully offline connection

## Open questions

- Is a group private by invite only, or can anyone find it?
- Does a member share all ratings, or one festival at a time?
- Does offline need group ratings too, or only the user's own?
- Does the heatmap use the average rating or the count of high ratings?
