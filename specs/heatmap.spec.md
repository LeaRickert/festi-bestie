---
type: Spec
title: "Spec: Heatmap"
sources: [../src/components/LineupView.jsx, ../src/components/StagesView.jsx, ../src/components/ScheduleByDayView.tsx, ../src/components/ScheduleView.tsx, ../src/components/ViewOptions.tsx, ../src/utils/heatStyle.ts, ../src/hooks/useActHeat.ts, ../supabase/schemas]
tests: [../src/utils/heatStyle.test.ts]
description: A mode of each act view that colors each act by how much people want to see it.
tags: [heatmap, groups, schedule]
timestamp: 2026-11-04T00:00:00Z
---

# Heatmap

The Global source exists. The group sources wait for `groups.spec.md`. The heatmap is a mode of each view
that shows acts: the lineup, stages and schedule views (see
`festivals.spec.md`) and the time grid (see `schedule-grid.spec.md`). A user
can rate an act in each of these views, so each view has the heatmap. It looks
like the same screen. Each act has a green color that shows how much people want to see it. The source is
"Global" (all users) or one group of the user (see `groups.spec.md`).

Global heat measures demand only. It does not measure quality. The database
calculates global heat on a schedule and stores it in `act_stats`. The app
calculates group heat from the ratings of the members. The Global source
needs no groups, so it ships before them.

### Definitions

- Act view: A view of the festival page that shows acts: lineup, stages, schedule or time grid. The `announced` status has no act view.
- Color mode: The choice in the View sheet of `view-options.spec.md`, "My picks" or "Heatmap". "My picks" shows the rating style of `ratings.spec.md`.
- Source: The ratings that the heatmap uses. "Global" or one group.
- Weight: The value of one rating. 1 and 2 are 0, 3 is 0.5, 4 is 1, 5 is 2. `bestie.spec.md` uses the same weights.
- Score: The sum of the weights of all ratings of one act, from the source.
- Rater: A user who rated an act.
- Heat: A number from 0 to 1 that sets the color of an act.
- Global heat: `ln(1 + score) / ln(1 + max score)`. The max score is the highest score of an act in the same festival that has 1 rater or more.
- Group heat: `score / (2 × number of members)`.
- Heat step: Heat in 5 steps. Step 1 is heat below 0.2, step 5 is heat 0.8 or more.
- Heat green: `#107435`. Used only in Heatmap mode. Each step has its own fill alpha.
- `act_stats`: A table with one row for each act: `act_id`, `heat`, `computed_at`. Everyone can read it. Only the scheduled job writes it.

## In Scope

- The Heatmap color mode and the source choice on each act view.
- Global heat in `act_stats`, and the scheduled job that calculates it.
- Group heat.

The act sheet shows the ratings of the members in the ratings slider of
`groups.spec.md`, the same in both modes.

## Out of Scope

- An average rating. The heatmap shows no average.
- A suggested plan for the group.
- The match score between two users (see `bestie.spec.md`).
- Real-time updates when a member rates. Group heat loads with the page and on a pull to refresh.

### Functional Requirements

| ID   | Requirement |
|------|-------------|
| FR-1 | Offer "My picks" and "Heatmap" as the color mode of each act view, in the View sheet of `view-options.spec.md`. "My picks" is the default |
| FR-2 | In Heatmap mode, let the user choose the source: "Global" or one of their groups for the festival |
| FR-3 | Show no source choice and no hint to a visitor and to a user in no group for the festival. They see the "Global" source |
| FR-4 | Keep the act order, the day control and the act positions of the act view in Heatmap mode |
| FR-5 | Calculate the score of an act from the weights of its ratings |
| FR-6 | Calculate global heat for each act of a festival from the scores of that festival |
| FR-7 | Store no heat for an act with no raters, and show the act with no green tint |
| FR-8 | Calculate global heat again every 15 minutes |
| FR-9 | In the "Global" source, do not show the ratings, the raters or the number of raters of an act to other users |
| FR-10 | Calculate group heat from the ratings of the members of the chosen group |
| FR-11 | Color each act with the heat green in 5 heat steps. Show no legend |
| FR-12 | Show an act that no member rated with no green tint. Show no label for it |
| FR-13 | Use the same view on a phone with no horizontal page scroll |
| FR-14 | In Heatmap mode, show a one-line explanation of the heatmap in the View sheet |

### QA Test Cases

| Test ID | Requirement | Scenario | Expected Outcome |
|---------|-------------|----------|------------------|
| TC-4UU0 | FR-1 | A user opens the time grid | The View sheet shows "My picks" as selected and the acts have the rating style |
| TC-D119 | FR-1 | The user selects "Heatmap" | The same screen stays open and the acts change to the heat colors |
| TC-D6MQ | FR-1 | A festival with the status `lineup` shows the lineup view | The View sheet offers "My picks" and "Heatmap" |
| TC-HTFV | FR-1 | A festival has the status `announced` | The page offers no color mode |
| TC-6UU7 | FR-2 | A user is in the groups "Camp A" and "Work" for the festival | The source choice shows "Global", "Camp A" and "Work" |
| TC-ZYH9 | FR-3 | A user who is in no group for the festival selects "Heatmap" | The view shows the "Global" heat with no source choice and no hint |
| TC-LHX8 | FR-4 | An act in the time grid starts at 8:00 PM and lasts 60 minutes | The block is at the same position in both modes |
| TC-AWN8 | FR-4 | The user selects "Heatmap" in the lineup view | The acts stay in alphabetical order |
| TC-4HKC | FR-5 | Five users rated an act 1, 2, 3, 4 and 5 | The score is 3.5 |
| TC-416B | FR-6 | The max score of the festival is 40 and an act has the score 10 | The global heat of the act is 0.65 |
| TC-EJ37 | FR-6 | An act has the max score of the festival | The global heat of the act is 1 |
| TC-4VDF | FR-6 | The act with the highest score has 1 rater | The max score comes from that act |
| TC-L8RD | FR-7 | An act has 1 rater, who rated it 5 | `act_stats.heat` is greater than 0 and the act has a green tint |
| TC-7MJ0 | FR-7 | An act has no raters | The act has no green tint and no label |
| TC-TMYT | FR-8 | A user rates an act at 10:00 | The global heat includes the rating at 10:15 or before |
| TC-KLCA | FR-9 | A visitor reads `act_stats` for an act with 23 raters | The row shows only the act id, the heat and the time of the calculation. It shows no user id, rating or number of raters |
| TC-AGAM | FR-9 | A visitor requests the ratings of other users | The database returns no rows |
| TC-8VLB | FR-10 | Three of four members rated an act 5 | The group heat is 0.75 |
| TC-N2A8 | FR-10 | All four members rated an act 5 | The group heat is 1 |
| TC-UM64 | FR-10 | In a group of four, two members rated an act 5 and 2 | Only the 5 counts. The group heat is 0.25 |
| TC-FG7D | FR-10 | In a group of four, one member rated an act 3 | The group heat is 0.0625 |
| TC-2Q72 | FR-11 | Two acts have the heat 0.2 and 0.9 | The act with 0.9 has the brighter green |
| TC-JW28 | FR-11 | Acts have the heat 0.1, 0.3, 0.5, 0.7 and 0.9 | Each act has a different heat step, and the fill gets stronger from 0.1 to 0.9 |
| TC-SMBZ | FR-12 | No member of the group rated an act | The act has no green tint and no label |
| TC-83P4 | FR-13 | The screen is 375 px wide | The page has no horizontal scroll |
| TC-H8VP | FR-14 | The user selects "Heatmap" in the View sheet | The sheet shows that the heat is updated every 15 minutes |
| TC-J3NM | FR-14 | The user is in "My picks" mode | The View sheet shows no explanation of the heatmap |

### Known Issues

- Global heat has no rater floor, so the heat of an act with one rater shows how high that user rated it. A user can also compare two runs of the job to guess a new rating. Only the 15-minute batch makes this hard.
- A group of one member gives a heatmap of one color.
- Until group heat exists (Phase 8), Heatmap mode uses "Global" and hides the source choice (FR-2).
