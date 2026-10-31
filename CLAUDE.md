# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Festi Bestie is a festival planning app (React 18, Vite, Tailwind, Supabase). Behavior is defined in `specs/*.spec.md`; read the relevant spec before changing a feature and update it (and run `npx @rosenjcb/spec-md lint specs`) when behavior changes. Setup and commands are in `README.md`.

## Conventions

- Test IDs (`TC-XXXX`) are stable. Generate new ones with `npx @rosenjcb/spec-md id`; never renumber. FR ids stay contiguous.
- Ratings: whole stars 1-5, always saved with an upsert on `user_id,act_id`.
- Time: DB `start_time` is TIME; the UI uses 12-hour text. Use `timeToMinutes()` from `src/utils/scheduleUtils.ts`; the schedule grid starts at the hour of the first act of the day and uses 90 px per hour (schedule-grid FR-5).
- Roles: the database enforces access with RLS (`can_edit_acts()`, `get_user_role()`). Frontend checks (`canEditActs`, `isAdmin`) only hide UI.
- TypeScript is on with `allowJs`. Write new files as `.ts` or `.tsx`; convert old files only when you change them. Check with `npm run typecheck`.
- Lint is Biome (`npm run lint`, config in `biome.json`). The formatter is off, so keep the existing style: 2 spaces, single quotes, no semicolons. Old a11y and hooks findings are warnings, not errors; do not add new ones.
- Tests use Vitest (`npm test`), next to the code as `*.test.ts`. Put the `[TC-XXXX]` tag in each test name.
- Schema changes go in `supabase/schemas/*.sql` (declarative, with their RLS policies and indexes), then generate a migration with `npx supabase db schema declarative sync -f <name> --no-apply`. Never use `db diff`. Seed data lives in `supabase/seed.sql`. Until the first production push the migrations are one squashed `initial_schema`; after that, never edit or squash them.
- Database tests use pgTAP in `supabase/tests/database/*.test.sql` and run with `npx supabase test db` (local stack running). Cover each RLS policy, limit and `security definer` function with them, and put the `[TC-XXXX]` tag in each test description.
- Automated tests cover the pure helpers in `src/utils` and `src/export`, the data scripts (`scripts/data`), and the database rules (pgTAP). Verify the rest manually: auth, rating, export.

## Known issues

See the "Known Issues" section of each spec. Phase 1 closed the auth and mock-data issues; check each spec for what remains.
