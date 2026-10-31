---
type: Spec
title: "Spec: Heatmap"
sources: [../src/components/LineupView.jsx, ../src/components/StagesView.jsx, ../src/components/ScheduleByDayView.jsx, ../src/components/ScheduleView.tsx, ../supabase/schemas]
tests: []
description: DRAFT. A mode of each act view that colors each act by how much people want to see it.
tags: [heatmap, groups, schedule, draft]
timestamp: 2026-10-30T00:00:00Z
---

# Heatmap

DRAFT. This feature does not exist yet. The heatmap is a mode of each view
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
- Mode control: A control on each act view with two modes, "My picks" and "Heatmap". "My picks" shows the rating style of `ratings.spec.md`.
- Source: The ratings that the heatmap uses. "Global" or one group.
- Weight: The value of one rating. 1 and 2 are 0, 3 is 0.5, 4 is 1, 5 is 2. `bestie.spec.md` uses the same weights.
- Score: The sum of the weights of all ratings of one act, from the source.
- Rater: A user who rated an act.
- Heat: A number from 0 to 1 that sets the color of an act.
- Global heat: `ln(1 + score) / ln(1 + max score)`. The max score is the highest score of an act in the same festival that has 5 raters or more.
- Group heat: `score / (2 × number of members)`.
- Rated bucket: The rounded number of raters of an act: "5+", "20+" or "100+". ??
- `act_stats`: A table with one row for each act: `act_id`, `heat`, `rated_bucket`, `computed_at`. Everyone can read it. Only the scheduled job writes it.

## In Scope

- The mode control and the source choice on each act view.
- Global heat in `act_stats`, and the scheduled job that calculates it.
- Group heat, and the list of the members who rated an act.

## Out of Scope

- An average rating. The heatmap shows no average.
- A suggested plan for the group.
- The match score between two users (see `bestie.spec.md`).
- Real-time updates when a member rates. ??

### Functional Requirements

| ID   | Requirement |
|------|-------------|
| FR-1 | Show a mode control on each act view with "My picks" and "Heatmap". "My picks" is the default |
| FR-2 | In Heatmap mode, let the user choose the source: "Global" or one of their groups |
| FR-3 | Show only the "Global" source to a visitor and to a user in no group, with a hint to join a group |
| FR-4 | Keep the act order, the day control and the act positions of the act view in Heatmap mode |
| FR-5 | Calculate the score of an act from the weights of its ratings |
| FR-6 | Calculate global heat for each act of a festival from the scores of that festival |
| FR-7 | Store no heat for an act with fewer than 5 raters, and show the act with no green tint |
| FR-8 | Calculate global heat again every 15 minutes |
| FR-9 | Do not show the rating or the exact number of raters of an act to other users. Show the rated bucket |
| FR-10 | Calculate group heat from the ratings of the members of the chosen group |
| FR-11 | Color each act on one green scale from heat 0 to heat 1, and show a legend for the scale |
| FR-12 | Show an act that no member rated with no green tint. Show no label for it |
| FR-13 | Show the members who rated an act 3 or more, with their rating, when the user selects the act in a group source |
| FR-14 | Use the same view on a phone with no horizontal page scroll |

### QA Test Cases

| Test ID | Requirement | Scenario | Expected Outcome |
|---------|-------------|----------|------------------|
| TC-4UU0 | FR-1 | A user opens the time grid | The mode control shows "My picks" as selected and the acts have the rating style |
| TC-D119 | FR-1 | The user selects "Heatmap" | The same screen stays open and the acts change to the heat colors |
| TC-D6MQ | FR-1 | A festival with the status `lineup` shows the lineup view | The view shows the mode control |
| TC-HTFV | FR-1 | A festival has the status `announced` | The page shows no mode control |
| TC-6UU7 | FR-2 | A user is in the groups "Camp A" and "Work" | The source choice shows "Global", "Camp A" and "Work" |
| TC-ZYH9 | FR-3 | A user who is in no group selects "Heatmap" | The source choice shows only "Global" and the hint "Join or make a group to compare" |
| TC-LHX8 | FR-4 | An act in the time grid starts at 8:00 PM and lasts 60 minutes | The block is at the same position in both modes |
| TC-AWN8 | FR-4 | The user selects "Heatmap" in the lineup view | The acts stay in alphabetical order |
| TC-4HKC | FR-5 | Five users rated an act 1, 2, 3, 4 and 5 | The score is 3.5 |
| TC-416B | FR-6 | The max score of the festival is 40 and an act has the score 10 | The global heat of the act is 0.65 |
| TC-EJ37 | FR-6 | An act has the max score of the festival | The global heat of the act is 1 |
| TC-V948 | FR-6 | The act with the highest score has 4 raters | The max score comes from the acts with 5 raters or more |
| TC-I43Q | FR-7 | An act has 4 raters | `act_stats.heat` is null and the act has no green tint and no label |
| TC-7MJ0 | FR-7 | An act has no raters | The act has no green tint and no label |
| TC-TMYT | FR-8 | A user rates an act at 10:00 | The global heat includes the rating at 10:15 or before |
| TC-KLCA | FR-9 | A visitor reads `act_stats` for an act with 23 raters | The row shows the rated bucket "20+" and no user id or rating |
| TC-AGAM | FR-9 | A visitor requests the ratings of other users | The database returns no rows |
| TC-8VLB | FR-10 | Three of four members rated an act 5 | The group heat is 0.75 |
| TC-N2A8 | FR-10 | All four members rated an act 5 | The group heat is 1 |
| TC-UM64 | FR-10 | In a group of four, two members rated an act 5 and 2 | Only the 5 counts. The group heat is 0.25 |
| TC-FG7D | FR-10 | In a group of four, one member rated an act 3 | The group heat is 0.0625 |
| TC-2Q72 | FR-11 | Two acts have the heat 0.2 and 0.9 | The act with 0.9 has the brighter green |
| TC-JW28 | FR-11 | The user selects "Heatmap" | The legend shows the green scale from heat 0 to heat 1 |
| TC-SMBZ | FR-12 | No member of the group rated an act | The act has no green tint and no label |
| TC-KSGK | FR-13 | The user selects an act that members A and B rated 5 and 3 | The sheet lists A with 5 and B with 3 |
| TC-83P4 | FR-14 | The screen is 375 px wide | The page has no horizontal scroll |

### Known Issues

- Open: the green scale and the number of legend steps. The theme uses magenta for ratings and neon for links. ??
- Open: the bounds of the rated bucket. ??
- A user can compare two runs of the job to guess a new rating. The 5-rater floor and the 15-minute batch make this hard.
- A group of one member gives a heatmap of one color.
