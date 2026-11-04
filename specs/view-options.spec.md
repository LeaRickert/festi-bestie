---
type: Spec
title: "Spec: View Options"
sources: [../src/components/ViewOptions.tsx, ../src/components/DayControl.tsx, ../src/components/Sheet.tsx, ../src/utils/viewOptions.ts, ../src/pages/FestivalDetailPage.tsx]
tests: [../src/utils/viewOptions.test.ts]
description: The View button and sheet of each act view, with the color mode, the genre filter and the layout.
tags: [festivals, schedule, heatmap]
timestamp: 2026-11-04T00:00:00Z
---

# View Options

Each act view has one View button. It opens a sheet with the choices for the
current view: what the colors of the acts mean, which acts stand out, and the
layout. A short caption shows the choices that are not the default, because the
colors have no legend.

### Definitions

- Act view: A view of the festival page that shows acts: lineup, stages, schedule or time grid. The `announced` status has no act view.
- View sheet: The sheet that the View button opens.
- Color mode: What the color of an act means. "My picks" (the rating style of `ratings.spec.md`) or "Heatmap" (see `heatmap.spec.md`). Only one is on at a time.
- Genre: The `category` of an act, for example "House". The list comes from the acts of the festival, so it can differ for each festival.
- Dimmed act: An act at 22% opacity. It keeps its position and its color.
- Default view: The color mode "My picks" and no genre. "Later times on top" does not count, because the grid itself shows it.
- Caption: One line of text under the View button row, for example "Heatmap · Global · House only".

## In Scope

- The View button, the View sheet and the caption.
- The genre filter.

## Out of Scope

- The heat calculation and the source choice (see `heatmap.spec.md`).
- The "Later times on top" behavior (see `schedule-grid.spec.md`).
- Genre as a color mode, and a legend for it.
- More than one genre at a time.

### Functional Requirements

| ID   | Requirement |
|------|-------------|
| FR-1 | Show a View button on each act view. Show no View button on the `announced` status |
| FR-2 | In the time grid and the schedule view, show the View button to the right of the day control. In the lineup and stages views, show it at the right of its own row. Keep the row and the caption at the top while the page scrolls |
| FR-3 | Open the View sheet as a bottom sheet on a phone and a dialog on a wider screen, with the closing rules of the act sheet and a light backdrop. Apply each change at once and keep the sheet open |
| FR-4 | Let the user choose the color mode in the View sheet. "My picks" is the default. Keep "Heatmap" in the URL as `?mode=heatmap` |
| FR-5 | Let the user choose "All" or one genre of the festival in the View sheet. "All" is the default. Keep the genre in the URL as `?genre=`. Treat an unknown genre as "All" |
| FR-6 | When a genre is chosen, dim each act that does not have that genre, also an act with no genre. A dimmed act keeps its position and still opens its act sheet |
| FR-7 | Show the "Later times on top" setting in the View sheet only in the time grid |
| FR-8 | When the view is not the default view, show the caption and a dot on the View button. Selecting the caption opens the View sheet |
| FR-9 | When the view is not the default view, show a reset in the View sheet that goes back to the default view |

### QA Test Cases

| Test ID | Requirement | Scenario | Expected Outcome |
|---------|-------------|----------|------------------|
| TC-K5KF | FR-1 | A festival with the status `times` shows the time grid | The page shows the View button |
| TC-5DAO | FR-1 | A festival has the status `announced` | The page shows no View button |
| TC-SWB1 | FR-2 | The user scrolls down the time grid | The day control, the View button, the caption and the stage names stay at the top |
| TC-H5Z6 | FR-2 | A festival with the status `lineup` shows the lineup view | The View button is at the right of its own row, above the acts |
| TC-7ZT0 | FR-3 | The user changes a choice in the View sheet | The acts change at once and the sheet stays open |
| TC-DMEZ | FR-4 | The user selects "Heatmap" and reloads the page | The URL has `?mode=heatmap` and the acts still have the heat colors |
| TC-SAHI | FR-5 | The acts have the categories House, Bass and no category | The choices are "All", "Bass" and "House" |
| TC-D2AS | FR-5 | The URL has `?genre=Polka` and no act has that genre | The view is the same as with "All" |
| TC-J33P | FR-6 | The user selects "House" in the time grid | Each act that is not House is dimmed, and no act moves |
| TC-EPJ1 | FR-6 | An act has no category and the genre "House" is chosen | The act is dimmed |
| TC-7O3X | FR-6 | The user taps a dimmed act | The act sheet opens |
| TC-VMAT | FR-7 | A festival with the status `lineup` opens the View sheet | The sheet does not show "Later times on top" |
| TC-KPGZ | FR-8 | The color mode is "Heatmap" and the genre is "House" | The caption is "Heatmap · Global · House only" and the View button has a dot |
| TC-F2KU | FR-8 | The color mode is "My picks" and the genre is "House" | The caption is "House only" |
| TC-CCDC | FR-8 | "Later times on top" is on and the view is otherwise the default view | The page shows no caption and no dot |
| TC-I7PT | FR-8 | The user selects the caption | The View sheet opens |
| TC-CLHB | FR-9 | The user selects the reset with "Heatmap" and "House" on | The color mode is "My picks", the genre is "All", and the caption and dot are gone |

### Known Issues

- All test cases except TC-SAHI, TC-D2AS, TC-EPJ1, TC-KPGZ, TC-F2KU and TC-CCDC are checked by hand. The tests do not run a browser.
- Dimming does not make a long list shorter, so a user of the lineup view still scrolls past the dimmed acts.
