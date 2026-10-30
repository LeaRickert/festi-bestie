---
type: Spec
title: "Spec: Act Sheet"
sources: [../src/components/ActDetailModal.tsx, ../src/pages/FestivalDetailPage.jsx]
description: The details of one act, its rating and its YouTube set.
tags: [acts]
timestamp: 2026-10-30T00:00:00Z
---

# Act Sheet

The user selects an act in any view to open its details. There they rate the
act and watch a set. Editors and recommendations add controls here (see
`act-editing.spec.md`), and Phase 6 adds the ratings of friends.

### Definitions

- Act sheet: The act details. A bottom sheet on a screen below 640 px, a centered dialog on a wider screen.
- YouTube search link: A link to a YouTube search for "[artist] live set".
- Video: The `youtube_video_id` of an act. The thumbnail is `https://i.ytimg.com/vi/<id>/hqdefault.jpg` and the player is `https://www.youtube-nocookie.com/embed/<id>`.

## In Scope

- Open and close the act sheet.
- The act details and the YouTube video.

## Out of Scope

- The stars and the save (see `ratings.spec.md`).
- Recommend and edit controls (see `act-editing.spec.md`).

### Functional Requirements

| ID   | Requirement |
|------|-------------|
| FR-1 | Show act details in the act sheet when the user selects an act |
| FR-2 | Close the act sheet when the user taps outside it, taps the close button, presses Escape, swipes it down or goes back in the browser. Going back closes only the sheet |
| FR-3 | Show the video of an act in the act sheet as a thumbnail, with the caption under it when the act has one. Load the `youtube-nocookie.com` player only when the user taps the thumbnail |
| FR-4 | When an act has no video, show a link to a YouTube search for "[artist] live set" and the text "Have a good example set for [artist]?" |

### QA Test Cases

| Test ID | Requirement | Scenario | Expected Outcome |
|---------|-------------|----------|------------------|
| TC-VQ4S | FR-1 | The user selects an act that has a video | The sheet shows the stage, time, genre and the video thumbnail |
| TC-BX4L | FR-2 | The sheet is open and the user taps outside it | The sheet closes |
| TC-P2UG | FR-2 | The sheet is open and the user uses the browser back button | The sheet closes and the festival page stays open |
| TC-PCZP | FR-2 | The screen is 375 px wide and the user selects an act | The act details open as a bottom sheet |
| TC-Z408 | FR-3 | The user opens an act with a video and does not tap the thumbnail | The page makes no request to YouTube for the player |
| TC-4O8O | FR-3 | The act has a video and the caption "Live at EDC Las Vegas 2025" | The sheet shows the thumbnail and the caption under it |
| TC-RBKH | FR-4 | The user opens the act "Sota", which has no video | The sheet links to a YouTube search for "Sota live set" and shows "Have a good example set for Sota?" |

### Known Issues

- None.
