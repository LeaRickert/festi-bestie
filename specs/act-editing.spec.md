---
type: Spec
title: "Spec: Act Editing"
sources: [../src/hooks/useAuth.jsx, ../supabase-setup.sql]
tests: []
description: DRAFT. How an editor or an admin adds and changes acts.
tags: [acts, roles, draft]
timestamp: 2026-10-30T00:00:00Z
---

# Act Editing

DRAFT. This feature does not exist yet. An editor or an admin changes the
data of an act in the app. Today they must use the Supabase dashboard. The
database enforces the role (see `auth.spec.md`). The frontend only hides the
controls.

### Definitions

- Editor: A user with the role `editor` or `admin`.
- Editable field: `artist`, `day`, `stage`, `start_time`, `length_minutes`, `genre`, `category`, `special_notes`, `youtube_url`, `youtube_title`.

## In Scope

- An edit form for one act.
- Add an act to a festival.
- Delete an act (admin only).

## Out of Scope

- Edit of festival data (name, dates, status). ??
- Bulk edit. Use the CSV import.
- Edit history. ??

### Functional Requirements

| ID   | Requirement |
|------|-------------|
| FR-1 | Show the edit controls only to an editor or an admin |
| FR-2 | Let an editor change each editable field of an act |
| FR-3 | Let an editor add an act to a festival |
| FR-4 | Let only an admin delete an act |
| FR-5 | Reject a start time that is not a valid time of day |
| FR-6 | Reject a YouTube URL that is not an http or https URL |
| FR-7 | Reject a length of zero minutes or less |
| FR-8 | Show the saved values in all views after a save, with no page reload |

### QA Test Cases

| Test ID | Requirement | Scenario | Expected Outcome |
|---------|-------------|----------|------------------|
| TC-MU47 | FR-1 | A `viewer` opens the act popup | The popup has no edit button |
| TC-8JAI | FR-1 | An `editor` opens the act popup | The popup has an edit button |
| TC-5LAH | FR-2 | An editor sets the start time of an act to 21:30 | The act shows 9:30 PM |
| TC-FZHL | FR-3 | An editor adds the act "Fisher" on Friday at the stage "Kinetic Field" | The lineup lists "Fisher" |
| TC-X82J | FR-4 | An editor opens the act popup | The popup has no delete button |
| TC-02UL | FR-4 | An admin deletes an act | The act is not in the lineup, and its ratings are removed |
| TC-3KUG | FR-5 | An editor enters the start time "25:00" | The form shows an error and does not save |
| TC-I637 | FR-6 | An editor enters the URL "javascript:alert(1)" | The form shows an error and does not save |
| TC-2I30 | FR-7 | An editor enters a length of 0 | The form shows an error and does not save |
| TC-FB26 | FR-8 | An editor changes the genre and saves | The popup and the list show the new genre |

### Known Issues

- Blocked by the `useAuth` bypass and the role policy in `auth.spec.md`. FR-1 cannot work until the bypass is gone.
- Two editors can overwrite each other. Do we need a version check? ??
