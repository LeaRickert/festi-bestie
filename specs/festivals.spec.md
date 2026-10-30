---
type: Spec
title: "Spec: Festivals and Schedule Views"
sources: [../src/pages/LandingPage.jsx, ../src/pages/FestivalDetailPage.jsx, ../src/hooks/useFestivalData.ts, ../src/components, ../src/utils/scheduleUtils.ts, ../supabase/schemas]
tests: [../src/utils/scheduleUtils.test.ts]
description: How the app lists festivals and shows a festival by status.
tags: [festivals, schedule]
timestamp: 2026-10-29T00:00:00Z
---

# Festivals and Schedule Views

The app lists festivals and shows the lineup of one festival. A festival has a
status. The status decides which view the app shows. Festival and act data are
public to read.

### Definitions

- Festival: A row in `festivals` with name, dates, location, image and `status`.
- Act: One artist performance in `acts`. It has day, stage, `start_time`, `length_minutes`, genre and notes.
- Status: One of `announced`, `lineup`, `stages`, `schedule`, `times`, `complete`, in that order.

## In Scope

- The festival list on `/`.
- The festival page on `/festival/:id`.
- The five views and the act detail popup.
- Time and position helpers in `scheduleUtils.ts`.

## Out of Scope

- Ratings (see `ratings.spec.md`).
- Image export (see `export.spec.md`).
- Role checks (see `auth.spec.md`).

### Functional Requirements

| ID   | Requirement |
|------|-------------|
| FR-1 | Show every festival on the landing page, sorted by start date |
| FR-2 | Show the festival page with the view that matches the festival status |
| FR-3 | Show acts in alphabetical order in the lineup, stages and schedule views |
| FR-4 | Show a time grid with one column for each stage in the times view |
| FR-5 | Let the user filter the schedule by day |
| FR-6 | Show act details in a popup when the user selects an act |
| FR-7 | Convert 12-hour and 24-hour time text to minutes since midnight, and calculate the end time of a set, also past midnight |
| FR-8 | Show a "Festival not found" message when the festival id does not exist |
| FR-9 | Show an error message with a retry button when loading fails. Never show sample data |
| FR-10 | Use the stored `day`, `stage`, `start_time` and `length_minutes` of an act. Leave an act without a start time out of the time grid |
| FR-11 | Show the debug panel in development builds only |

### QA Test Cases

| Test ID | Requirement | Scenario | Expected Outcome |
|---------|-------------|----------|------------------|
| TC-FT3E | FR-1 | The database has festivals that start on 2024-11-15 and 2024-03-22 | The page lists the 2024-03-22 festival first |
| TC-S47D | FR-2 | The status is `announced` | The page shows the announcement card |
| TC-JIHU | FR-2 | The status is `lineup` | The page shows the alphabetical artist list |
| TC-RL2Z | FR-2 | The status is `stages` | The page shows the acts grouped by stage |
| TC-KACT | FR-2 | The status is `schedule` | The page shows the day buttons and the acts grouped by stage |
| TC-YWST | FR-2 | The status is `times` or `complete` | The page shows the time grid |
| TC-KU74 | FR-3 | The acts are "Hedex" and "Avision" | "Avision" appears before "Hedex" |
| TC-PAOT | FR-4 | An act starts at 8:00 PM and lasts 60 minutes | The act block is 90 px high and 630 px below the 1 PM line |
| TC-I7QH | FR-5 | The user selects "Saturday" | The view shows only the acts with day "Saturday" |
| TC-VQ4S | FR-6 | The user selects an act that has a YouTube URL | The popup shows the stage, time, genre and a link to the URL |
| TC-RNP0 | FR-7 | The input is "8:00 PM" | `timeToMinutes` returns 1200 |
| TC-PIKX | FR-7 | The input is "12:30 AM" | `timeToMinutes` returns 30 |
| TC-0W65 | FR-7 | The input is "20:00" | `timeToMinutes` returns 1200 |
| TC-EK11 | FR-7 | A set starts at 11:00 PM and lasts 90 minutes | `calculateEndTime` returns "12:30 AM" |
| TC-UIU6 | FR-8 | The festival id matches no festival | The page shows "Festival not found" |
| TC-I17V | FR-9 | Supabase returns an error for the festival list | The page shows the error and a retry button, and no festival cards |
| TC-OUI8 | FR-10 | An act has the stage "Stage-1" and `start_time` 20:00:00 | The act shows under "Stage-1" at 8:00 PM |
| TC-WRQY | FR-10 | An act has no `start_time` | The act is missing from the time grid and no time is shown for it |
| TC-61J9 | FR-11 | A production build opens a festival page | The DEBUG button does not show and Ctrl/Cmd + D does nothing |

### Known Issues

- Time handling assumes a 1 PM to 12 AM festival.
- The act popup is in `FestivalDetailPage.jsx`.
- `LandingPage` text says "Filter by genre and time". No genre or time filter exists.
