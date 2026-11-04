---
type: Spec
title: "Spec: Schedule Grid"
sources: [../src/components/ScheduleView.tsx, ../src/components/DayControl.tsx, ../src/components/ScheduleSettings.tsx, ../src/hooks/useLaterTimesOnTop.ts, ../src/utils/scheduleUtils.ts, ../src/utils/scheduleSettings.ts]
tests: [../src/utils/scheduleUtils.test.ts, ../src/utils/scheduleSettings.test.ts]
description: The time grid of the times view and its time helpers.
tags: [schedule]
timestamp: 2026-11-04T00:00:00Z
---

# Schedule Grid

A festival with the status `times` or `complete` shows a time grid: one
column for each stage and one row for each hour of the chosen day. The user
compares stages and sees the acts they rated. The heatmap is a mode of this view (see `heatmap.spec.md`). The export draws the same grid
(see `export.spec.md`).

### Definitions

- Phone: A screen 375 px wide. Tablet: a screen 768 px wide.
- Act block: The box of one act in the grid. Its top is the start time (the end time with "Later times on top") and its height is the length, at 90 px per hour.
- Grid range: The hours the grid shows for one day.

## In Scope

- The time grid and the day control.
- Time and position helpers in `scheduleUtils.ts`.
- The "Later times on top" setting.

## Out of Scope

- The rating style of an act block (see `ratings.spec.md`).
- The act sheet (see `act-sheet.spec.md`).
- Heatmap mode (see `heatmap.spec.md`).
- A stage filter. The grid scrolls sideways instead. The export has its own stage choice.

### Functional Requirements

| ID   | Requirement |
|------|-------------|
| FR-1 | Show a time grid with one column for each stage in the times view. On a phone each column has a fixed width and the grid scrolls sideways, with the stage names and the time column pinned. Put a 2 px gap between stage columns. The stage names and the time column have no background. The time column shows the hour number only, at its hour line |
| FR-2 | Let the user filter the schedule by day with a full-width day control that stays at the top while the page scrolls. Keep the chosen day in the URL as `?day=` |
| FR-3 | Convert 12-hour and 24-hour time text to minutes since midnight, and calculate the end time of a set, also past midnight |
| FR-4 | Use the stored `day`, `stage`, `start_time` and `length_minutes` of an act. Leave an act without a start time out of the time grid |
| FR-5 | Fit the time grid to the chosen day: start at the hour of the first start time, rounded down, and end at the hour of the last end time, rounded up, also past midnight |
| FR-6 | Show the time of an act block in the time grid as start and end with no AM or PM. Show a time on the hour as the hour only |
| FR-7 | Give the times view a gear icon button to the left of the export button. It opens a settings popup with the setting "Later times on top", which is off by default. When it is off, the first hour of the grid range is at the top. When it is on, the last hour is at the top and the first hour is at the bottom. Save the setting in `localStorage`, so it stays on this device |

### QA Test Cases

| Test ID | Requirement | Scenario | Expected Outcome |
|---------|-------------|----------|------------------|
| TC-PAOT | FR-1 | The first act of the day starts at 1:00 PM, and an act starts at 8:00 PM and lasts 60 minutes | The act block is 90 px high and 630 px below the top of the grid |
| TC-CILX | FR-1 | The screen is 375 px wide and the day has 4 stages | The grid scrolls sideways. The stage names and the time column stay in view |
| TC-V346 | FR-1 | The grid draws the 8 PM hour line | The time column shows "8" at that line, with no "PM" |
| TC-I7QH | FR-2 | The user selects "Saturday" | The view shows only the acts with day "Saturday" |
| TC-I3EO | FR-2 | The user selects Saturday and reloads the page | The URL has `?day=Saturday` and Saturday is still selected |
| TC-L5HW | FR-2 | The user scrolls down the schedule | The day control stays at the top of the screen |
| TC-RNP0 | FR-3 | The input is "8:00 PM" | `timeToMinutes` returns 1200 |
| TC-PIKX | FR-3 | The input is "12:30 AM" | `timeToMinutes` returns 30 |
| TC-0W65 | FR-3 | The input is "20:00" | `timeToMinutes` returns 1200 |
| TC-EK11 | FR-3 | A set starts at 11:00 PM and lasts 90 minutes | `calculateEndTime` returns "12:30 AM" |
| TC-OUI8 | FR-4 | An act has the stage "Stage-1" and `start_time` 20:00:00 | The act shows under "Stage-1" at 8:00 PM |
| TC-WRQY | FR-4 | An act has no `start_time` | The act is missing from the time grid and no time is shown for it |
| TC-5146 | FR-5 | The first Friday act starts at 2:30 PM and the last Friday act ends at 2:15 AM | The Friday grid runs from 2 PM to 3 AM |
| TC-6A6R | FR-6 | An act starts at 1:00 PM and ends at 1:50 PM | The block shows "1-1:50" |
| TC-WSC4 | FR-6 | An act starts at 11:30 PM and ends at 1:00 AM | The block shows "11:30-1" |
| TC-4K1L | FR-7 | No setting is saved on this device and the grid has acts at 2:00 PM and 10:00 PM | The setting is off and the 2:00 PM act is above the 10:00 PM act |
| TC-O0NF | FR-7 | The setting is on and an act starts at 2:00 PM and an act starts at 10:00 PM on the same stage | The 10:00 PM act is above the 2:00 PM act, and the bottom of each block is at its start time |
| TC-8KPV | FR-7 | The setting is on and the grid runs from 2 PM to 11 PM | The 11 PM line is at the top of the grid and the 2 PM line is at the bottom |
| TC-TTCE | FR-7 | The user turns the setting on and reloads the page | The setting is still on |
| TC-6O46 | FR-7 | The browser blocks localStorage | The setting reads as off, and changing it throws no error |
| TC-LH21 | FR-7 | The user selects the gear icon button | A popup opens with the setting "Later times on top". Changing it updates the grid at once |

### Known Issues

- TC-CILX, TC-I3EO, TC-L5HW and TC-LH21 are checked by hand. The tests do not run a browser.
