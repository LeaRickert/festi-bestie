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
- [x] Add Vitest. Start with `scheduleUtils` (schedule-grid FR-3). Put the `[TC-XXXX]` tag in each test name.
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
- [x] Squash the migrations into one initial migration (done before the first push; never after)
- [x] Create the production Supabase project and push the migrations
- [x] Import `data/edc-orlando-2025` into production as the full past-festival test set (all set times, except the Bacardi stage which is left out). Use it to check the time grid and exports. `data/edc-orlando-2024` has no times, so it is not imported.
- [x] Import `data/edc-orlando-2026` into production. This is the festival that is used and rated, and it is next week.
- [x] Make the first admin user
- [x] Deploy the frontend

## Phase 3: Refactor

- [x] Remove the copied time helpers from `ExportPage.jsx`. Import `scheduleUtils`.
- [x] Split `ExportPage.jsx` into a preview, a filter panel and an export function
- [x] Move the act popup out of `FestivalDetailPage.jsx`
- [x] Delete `RoleBasedExample.jsx`, the legacy `exportSchedule.js` and `csvImport.js`. The data scripts replace the CSV code. (export Known Issues)
- [x] Remove the router-state hand-off to the export page. Load data by festival id. (export Known Issues)

## Phase 4: Schedule UI and mobile

The design decisions are in `festivals.spec.md` (theme, FR-1, FR-7 to FR-9), `schedule-grid.spec.md`, `act-sheet.spec.md`, `ratings.spec.md` (FR-2, FR-8 to FR-10) and `export.spec.md` (FR-1, FR-8 to FR-14).

- [x] Drop the act and festival images from the UI (landing, detail, export). Remove `image_url` from `festival.yaml`, Keep the column for now (festivals FR-9)
- [x] Apply the theme: teal page and surfaces, magenta only for ratings, neon only for links, white and neutral controls, system font (festivals theme)
- [x] Fix the old "Festi Besti" name and text in `public/manifest.json`
- [x] Add the welcome view on `/` and move the festival list to `/festivals`, as compact rows with status badges on upcoming festivals and a collapsed "Past festivals" section (festivals FR-1, FR-7, FR-8)
- [x] Change the rating labels and show the rating style on every act, through one style function shared with the export (ratings FR-2, FR-10, export FR-8)
- [x] Design the time grid for a 375 px wide screen: sideways scroll, pinned stage names and hours, 4 px column gap, short act times like "1-1:50" (schedule-grid FR-1, FR-7)
- [x] Fit the grid to the acts of each day, also past midnight, in the app and the export (schedule-grid FR-5, export FR-9)
- [x] Make the day control full width, sticky and kept in `?day=` (schedule-grid FR-2)
- [x] Rename `acts.youtube_url` to `youtube_video_id` with an id check, in a new migration, in `scripts/data` and in the `data/` CSV header. Check first that no act in production has a URL (act-editing FR-6, data-import FR-12)
- [x] Make the act popup a bottom sheet on a phone, with larger stars, the closing rules, the recommended set link and the YouTube search link (act-sheet FR-2 to FR-4, ratings FR-8, FR-9)
- [ ] Rebuild the export as a lock screen wallpaper: image size of the phone, empty clock zone, one-line header above the stages, theme colors. Remove the tablet layout (export FR-9 to FR-14)
- [ ] Rebuild the export page for a phone: shared day control, stage chips, full-width preview, sticky download button, no summary panel (export FR-1, FR-13)
- [ ] Check every page at 375 px and 768 px. At 768 px the grid should show 4 stages with no sideways scroll
- [ ] Add the times for each festival to `data/` when the organizers publish them

## Phase 5: Edit acts

Needs Phase 1. Write `act-editing.spec.md` first (draft exists).

- [ ] Let an editor or admin set the start time, length, genre, YouTube video and caption of an act
- [ ] Let an editor or admin add an act
- [ ] Let an admin delete an act
- [ ] Show the edit controls only when `canEditActs` is true (the database still enforces the role)
- [ ] Add the table `youtube_recommendations`, with RLS and a video id check, and the recommend action in the act sheet (act-editing FR-9 to FR-12)
- [ ] Add the review list on `/review` for editors (act-editing FR-13, FR-14)
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

## Phase 9: Dev Tools

- [ ] Rebuild `supabase/seed.sql` (or derive it from `data/edc-orlando-2025`) as a small but complete dev set: every day, every stage, and a spread of start times (early, late, past midnight), with a few acts with no time and a few with a special note

## Phase 10: Rate mode

Needs Phase 4. Write `rate-mode.spec.md` first.

- [ ] Add a rate mode that shows one act at a time, with its YouTube video and the stars, and moves to the next unrated act after a rating
- [ ] Let the user pick the day or stage to rate, and show how many acts are left

## Later

- [ ] Add the "My picks" toggle (schedule-grid FR-6)
- [ ] Show a festival logo as a small mark next to the name. Use one SVG for each festival with an initials fallback, and a sprite sheet only when there are many festivals

## Open questions

- Is a group private by invite only, or can anyone find it?
- Does a member share all ratings, or one festival at a time?
- Does offline need group ratings too, or only the user's own?
- Does the heatmap use the average rating or the count of high ratings?
