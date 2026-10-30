# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Festi Besti is a festival planning app (React 18, Vite, Tailwind, Supabase). Behavior is defined in `specs/*.spec.md`; read the relevant spec before changing a feature and update it (and run `npx @rosenjcb/spec-md lint specs`) when behavior changes. Setup and commands are in `README.md`.

## Conventions

- Test IDs (`TC-XXXX`) are stable. Generate new ones with `npx @rosenjcb/spec-md id`; never renumber. FR ids stay contiguous.
- Ratings: whole stars 1-5, always saved with an upsert on `user_id,act_id`.
- Time: DB `start_time` is TIME; the UI uses 12-hour text. Use `timeToMinutes()` from `src/utils/scheduleUtils.js`; the schedule grid starts at 1 PM and uses 90 px per hour.
- Roles: the database enforces access with RLS (`can_edit_acts()`, `get_user_role()`). Frontend checks (`canEditActs`, `isAdmin`) only hide UI.
- Vite treats `.js` files as JSX (see `vite.config.js`).
- Schema changes go in `supabase-setup.sql` together with their RLS policies and indexes.
- No automated tests exist yet. Verify manually: auth, rating, export.

## Known issues

See the "Known Issues" section of each spec. Biggest: `useAuth.jsx` bypasses profile fetching, and profile policies let a user change their own role.
