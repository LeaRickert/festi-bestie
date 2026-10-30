---
type: Spec
title: "Spec: Act Editing"
sources: [../src/hooks/useAuth.tsx, ../supabase/schemas]
tests: []
description: DRAFT. How an editor or an admin adds and changes acts, and how users recommend YouTube sets.
tags: [acts, roles, draft]
timestamp: 2026-10-30T00:00:00Z
---

# Act Editing

DRAFT. This feature does not exist yet. An editor or an admin changes the
data of an act in the app. Today they must use the Supabase dashboard. The
database enforces the role (see `auth.spec.md`). The frontend only hides the
controls.

Any signed-in user can recommend a YouTube set for an act that has none. An
editor reviews the recommendations and picks one. Nothing a user recommends is
public until an editor uses it.

### Definitions

- Editor: A user with the role `editor` or `admin`.
- Editable field: `artist`, `day`, `stage`, `start_time`, `length_minutes`, `genre`, `category`, `special_notes`, `youtube_video_id`, `youtube_title`.
- Recommendation: A row in `youtube_recommendations` with `act_id`, `user_id`, `video_id` and `created_at`. A user has at most one for each act.
- YouTube video id: The 11-character id of a YouTube video, matching `^[A-Za-z0-9_-]{11}$`. The app stores only the id and builds every YouTube URL from it.
- Video link: A URL the user pastes. The form reads the id from it with the `get-video-id` package and accepts it only when the service is `youtube`.
- Caption: The optional `youtube_title` of an act, for example "Live at EDC Las Vegas 2025". Only an editor sets it.

## In Scope

- An edit form for one act.
- Add an act to a festival.
- Delete an act (admin only).
- YouTube recommendations and the review list on `/review`.

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
| FR-6 | Save a video link as its YouTube video id. Reject a link that is not a YouTube video in the form, and a value that is not a YouTube video id in the database |
| FR-7 | Reject a length of zero minutes or less |
| FR-8 | Show the saved values in all views after a save, with no page reload |
| FR-9 | Let a signed-in user recommend a video link for an act that has none, from the act sheet. Save it with an upsert on `user_id` and `act_id`. Ask a visitor to sign in first |
| FR-10 | Save a recommendation as its YouTube video id, with the same checks as FR-6 |
| FR-11 | Let a user read only their own recommendations. Let an editor read all of them |
| FR-12 | Show the submitter the thumbnail of their recommended video with "Pending review" in the act sheet, and let them change it |
| FR-13 | Show an editor all recommendations on `/review`, with the artist, a preview of the video and the user who sent it. Hide the page from other users |
| FR-14 | Let an editor use a recommendation, which sets `acts.youtube_video_id` and deletes all recommendations for that act, or dismiss it, which deletes it |

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
| TC-EQVD | FR-6 | An editor enters the URL `https://example.com/video` | The form shows an error, and the database rejects the change |
| TC-JJR6 | FR-6 | An editor enters the URL `https://youtu.be/dQw4w9WgXcQ?t=42` | The act stores `dQw4w9WgXcQ` |
| TC-2I30 | FR-7 | An editor enters a length of 0 | The form shows an error and does not save |
| TC-FB26 | FR-8 | An editor changes the genre and saves | The popup and the list show the new genre |
| TC-Y5N1 | FR-9 | A signed-in user recommends a URL for an act twice | One row exists and it holds the id of the second URL |
| TC-Y850 | FR-9 | A visitor who is not signed in opens an act with no video | The sheet shows "Sign in to recommend" in place of the recommend action |
| TC-YE3Y | FR-10 | A user recommends `https://example.com/video` | The form shows an error, and the database rejects the row |
| TC-UKW9 | FR-11 | User A requests the recommendations of user B | The database returns no rows |
| TC-24RH | FR-12 | The submitter opens the act again | The sheet shows the thumbnail of their video with "Pending review" and a way to change it |
| TC-FK24 | FR-13 | An editor opens `/review` | The page lists every recommendation with the artist, a video preview and the sender |
| TC-0UHW | FR-13 | A viewer opens `/review` | The page shows no recommendations, and the database returns none |
| TC-G1GR | FR-14 | An editor taps "Use this" on a recommendation | The act has the new YouTube video id and no recommendations are left for it |
| TC-OA05 | FR-14 | An editor taps "Dismiss" on a recommendation | The recommendation is deleted and the act is unchanged |

### Known Issues

- Two editors can overwrite each other. Do we need a version check? ??
