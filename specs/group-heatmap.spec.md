---
type: Spec
title: "Spec: Group Heatmap"
sources: [../src/components/ScheduleView.tsx, ../src/utils/scheduleUtils.ts]
tests: []
description: DRAFT. A schedule view that shows where the ratings of a group overlap.
tags: [groups, schedule, draft]
timestamp: 2026-10-30T00:00:00Z
---

# Group Heatmap

DRAFT. This feature does not exist yet. It needs `groups.spec.md` and the
mobile time grid. The heatmap is the time grid of one day. Each act has a
color that shows how much the members of a group want to see it. The group
sees at a glance where they all want to go.

### Definitions

- High rating: A rating of 4 or 5. ??
- Interest score: The number of members who gave a high rating to an act. ??
- Overlap: Two acts or more on different stages that have an interest score of 2 or more at the same time.

## In Scope

- The heatmap view for one group and one day.
- A list of the members who rated an act.

## Out of Scope

- A suggested plan for the group.
- Real-time updates when a member rates. ??

### Functional Requirements

| ID   | Requirement |
|------|-------------|
| FR-1 | Let a member choose one of their groups and one day |
| FR-2 | Show the time grid of the day with the same positions as the schedule view |
| FR-3 | Color each act by its interest score, from none to all members |
| FR-4 | Show a legend that maps each color to a score |
| FR-5 | Show the members who rated an act high when the user selects the act |
| FR-6 | Mark an act that no member rated as "not rated" and not as "not wanted" |
| FR-7 | Use the same view on a phone with no horizontal page scroll |
| FR-8 | Show a message when the user is in no group |

### QA Test Cases

| Test ID | Requirement | Scenario | Expected Outcome |
|---------|-------------|----------|------------------|
| TC-6UU7 | FR-1 | A user is in the groups "Camp A" and "Work" | The user can choose one of the two groups |
| TC-LHX8 | FR-2 | An act starts at 8:00 PM and lasts 60 minutes | The block is at the same position as in the schedule view |
| TC-8VLB | FR-3 | Three of four members rated an act 5 | The act has the second-highest color |
| TC-N2A8 | FR-3 | All four members rated an act 5 | The act has the highest color |
| TC-UM64 | FR-3 | Two members rated an act 5 and 2 | Only the member with 5 counts. The score is 1. |
| TC-JW28 | FR-4 | The view is open | The legend lists each score from 0 to the number of members |
| TC-KSGK | FR-5 | The user selects an act that members A and B rated 5 | The popup lists A and B |
| TC-SMBZ | FR-6 | No member rated an act | The act shows "not rated" |
| TC-83P4 | FR-7 | The screen is 375 px wide | The page has no horizontal scroll |
| TC-ZYH9 | FR-8 | A user who is in no group opens the view | The page shows "Join or make a group to see the heatmap" |

### Known Issues

- Open: the score rule. Use the count of high ratings, or the average rating? ??
- Open: does a rating below 4 lower the score of an act? ??
- A group of one member gives a heatmap of one color. Is that useful? ??
