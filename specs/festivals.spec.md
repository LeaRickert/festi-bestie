---
type: Spec
title: "Spec: Festivals and App Flow"
sources: [../src/pages/WelcomePage.tsx, ../src/pages/FestivalListPage.tsx, ../src/utils/festivalUtils.ts, ../src/utils/dateUtils.ts, ../src/pages/FestivalDetailPage.jsx, ../src/hooks/useFestivalData.ts, ../src/components, ../supabase/schemas]
description: The welcome view, the festival list and the festival page by status.
tests: [../src/utils/festivalUtils.test.ts, ../src/utils/dateUtils.test.ts]
tags: [festivals]
timestamp: 2026-10-30T00:00:00Z
---

# Festivals and App Flow

The app lists festivals and shows the lineup of one festival. A festival has a
status. The status decides which view the app shows. Festival and act data are
public to read. The app is for planning before the festival: the user rates
acts, watches sets and compares stages.

### Definitions

- Festival: A row in `festivals` with name, dates, location and `status`.
- Act: One artist performance in `acts`. It has day, stage, `start_time`, `length_minutes`, genre and notes.
- Status: One of `announced`, `lineup`, `stages`, `schedule`, `times`, `complete`, in that order.
- Status badge: A small colored label for a status. `announced` "Announced" (gray), `lineup` "Lineup" (purple), `stages` "Stages" (orange), `schedule` "Schedule" (yellow), `times` "Times" (blue), `complete` "Complete" (green).
- Welcome view: The page on `/` with the app logo, the name, Log in, Sign up and a smaller "View festivals as guest" link.
- Festival list: The page on `/festivals`.
- Phone: A screen 375 px wide. Tablet: a screen 768 px wide.
- Theme: Page `#051721` (dark teal). Surface `#072230` (a teal slightly lighter than the page). Rating accent `#9e1fb3` (magenta), used only for the rating style in `ratings.spec.md`. Link color `#d2e359` (neon), used only for text links. Buttons and selected controls are white or neutral. Status badges keep their own colors. The font is the system font.

## In Scope

- The welcome view on `/` and the festival list on `/festivals`.
- The festival page on `/festival/:id` and the choice of view by status.
- The lineup, stages and schedule views.
- The theme.

## Out of Scope

- The time grid of the times view (see `schedule-grid.spec.md`).
- The act sheet (see `act-sheet.spec.md`).
- Heatmap mode of the act views (see `heatmap.spec.md`).
- The rating scale, save and style (see `ratings.spec.md`).
- Image export (see `export.spec.md`).
- Role checks (see `auth.spec.md`).
- Festival logos. Deferred.
- A light theme.

### Functional Requirements

| ID   | Requirement |
|------|-------------|
| FR-1 | Show every festival on the festival list, sorted by start date. Show the festivals that have ended in a collapsed "Past festivals" section |
| FR-2 | Show the festival page with the view that matches the festival status |
| FR-3 | Show acts in alphabetical order in the lineup, stages and schedule views |
| FR-4 | Show a "Festival not found" message when the festival id does not exist |
| FR-5 | Show an error message with a retry button when loading fails. Never show sample data |
| FR-6 | Show the debug panel in development builds only |
| FR-7 | Show the welcome view on `/` to every visitor who is not signed in, on every visit. Send a signed-in user from `/` to `/festivals`. Open a festival page link directly, with no welcome view. Keep the user on the same page after they sign in |
| FR-8 | Show the status badge of each upcoming festival in the festival list. Show no badge for a past festival |
| FR-9 | Show no festival or act images. Show the festival name, dates and location as text |
| FR-10 | Show the festival dates the same way in the festival list and on the festival page, as "November 7-9, 2025". Name both months or both years only when the festival crosses them |

### QA Test Cases

| Test ID | Requirement | Scenario | Expected Outcome |
|---------|-------------|----------|------------------|
| TC-FT3E | FR-1 | The database has festivals that start on 2024-11-15 and 2024-03-22 | The page lists the 2024-03-22 festival first |
| TC-HHKR | FR-1 | Today is 2026-10-30 and one festival ended on 2025-11-09 | That festival is in the collapsed "Past festivals" section |
| TC-S47D | FR-2 | The status is `announced` | The page shows the announcement card |
| TC-JIHU | FR-2 | The status is `lineup` | The page shows the alphabetical artist list |
| TC-RL2Z | FR-2 | The status is `stages` | The page shows the acts grouped by stage |
| TC-KACT | FR-2 | The status is `schedule` | The page shows the day control and the acts grouped by stage |
| TC-YWST | FR-2 | The status is `times` or `complete` | The page shows the time grid |
| TC-KU74 | FR-3 | The acts are "Hedex" and "Avision" | "Avision" appears before "Hedex" |
| TC-UIU6 | FR-4 | The festival id matches no festival | The page shows "Festival not found" |
| TC-I17V | FR-5 | Supabase returns an error for the festival list | The page shows the error and a retry button, and no festival rows |
| TC-61J9 | FR-6 | A production build opens a festival page | The DEBUG button does not show and Ctrl/Cmd + D does nothing |
| TC-WW8Q | FR-7 | A visitor who is not signed in opens `/` | The page shows the welcome view with Log in, Sign up and "View festivals as guest" |
| TC-EZVS | FR-7 | A signed-in user opens `/` | The app opens `/festivals` |
| TC-084O | FR-7 | A visitor who chose guest before opens `/` again | The page shows the welcome view again |
| TC-VEU7 | FR-7 | A visitor opens a link to `/festival/:id` | The festival page opens with no welcome view |
| TC-PYK4 | FR-7 | A visitor signs in from the sheet on a festival page | The festival page stays open |
| TC-2CXG | FR-8 | An upcoming festival has the status `times` | The festival list shows a blue "Times" badge |
| TC-TM6M | FR-8 | A past festival has the status `complete` | Its row in "Past festivals" shows no badge |
| TC-QIDT | FR-9 | The user opens the festival list and a festival page | No image loads. The festival page shows the name, dates and location as text |
| TC-M0G6 | FR-10 | A festival runs from 2025-11-07 to 2025-11-09 | The festival list and the festival page show "November 7-9, 2025" |
| TC-E5ZJ | FR-10 | A festival runs from 2025-10-31 to 2025-11-02 | The dates read "October 31 - November 2, 2025" |
| TC-TKTP | FR-10 | A festival runs from 2025-12-30 to 2026-01-01 | The dates read "December 30, 2025 - January 1, 2026" |

### Known Issues

- The festivals have no logos. Logos are deferred.
- The column `festivals.image_url` is no longer read or written by the app or the data scripts (FR-9). It stays in the schema for now.
