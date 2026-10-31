---
type: Spec
title: "Spec: Act Sheet"
sources: [../src/components/ActSheet.tsx, ../src/components/RatingsSlider.tsx, ../src/utils/youtube.ts, ../src/pages/FestivalDetailPage.jsx]
description: The details of one act, its rating and its YouTube set.
tests: [../src/utils/youtube.test.ts]
tags: [acts]
timestamp: 2026-10-30T00:00:00Z
---

# Act Sheet

The user selects an act in any view to open its details. There they rate the
act and watch a set. Editors and recommendations add controls here (see
`act-editing.spec.md`). In the ratings slider a user in a group sees the
ratings of the group (see `groups.spec.md`).

### Definitions

- Act sheet: The act details. A bottom sheet on a screen below 640 px, a centered dialog on a wider screen. The rating is the last section, so on a phone the stars stay at the bottom of the screen whether or not the act has a video.
- YouTube search link: A link to a YouTube search for "[artist] live set".
- Video: The `youtube_video_id` of an act, opened on YouTube at `https://www.youtube.com/watch?v=<id>`. The app does not embed the player, because many official sets do not allow embedding.
- Caption: The optional `youtube_title` of an act (see `act-editing.spec.md`).
- Ratings slider: The rating section as pages, "My rating" and one page for each group of the user (see `groups.spec.md` FR-21 to FR-26). The sheet is the same in every mode of the act views.

## In Scope

- Open and close the act sheet.
- The act details and the YouTube video.

## Out of Scope

- The stars and the save (see `ratings.spec.md`).
- The ratings slider and the group pages (see `groups.spec.md`).
- Recommend and edit controls (see `act-editing.spec.md`).

### Functional Requirements

| ID   | Requirement |
|------|-------------|
| FR-1 | Show act details in the act sheet when the user selects an act |
| FR-2 | Close the act sheet when the user taps outside it, taps the close button, presses Escape, swipes it down or goes back in the browser. Going back closes only the sheet |
| FR-3 | When an act has a video, show a link to it on YouTube with the text "Recommended Set: [caption]", or "Recommended Set" when the act has no caption |
| FR-4 | Always show a link to a YouTube search for "[artist] live set" |

### QA Test Cases

| Test ID | Requirement | Scenario | Expected Outcome |
|---------|-------------|----------|------------------|
| TC-VQ4S | FR-1 | The user selects an act that has a video | The sheet shows the stage, time, genre and the "Recommended Set" link |
| TC-BX4L | FR-2 | The sheet is open and the user taps outside it | The sheet closes |
| TC-P2UG | FR-2 | The sheet is open and the user uses the browser back button | The sheet closes and the festival page stays open |
| TC-PCZP | FR-2 | The screen is 375 px wide and the user selects an act | The act details open as a bottom sheet |
| TC-FR7I | FR-3 | The act has the video id `dQw4w9WgXcQ` | The link opens `https://www.youtube.com/watch?v=dQw4w9WgXcQ` |
| TC-4O8O | FR-3 | The act has a video and the caption "Live at EDC Las Vegas 2025" | The link reads "Recommended Set: Live at EDC Las Vegas 2025" |
| TC-RBKH | FR-4 | The user opens the act "Sota", which has no video | The sheet links to a YouTube search for "Sota live set" |
| TC-0WII | FR-4 | The user opens an act that has a video | The sheet shows the "Recommended Set" link and the YouTube search link |

### Known Issues

- The prompt "Have a good example set for [artist]?" is hidden until users can suggest a set.
- The group pages of the ratings slider load the ratings when the sheet opens. A rating that a member gives while the sheet is open shows the next time it opens.
