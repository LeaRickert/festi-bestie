---
type: Spec
title: "Spec: Find Your Bestie"
sources: [../src/utils]
tests: []
description: DRAFT. A match score that compares the ratings of a user with each friend in a group.
tags: [groups, ratings, bestie, draft]
timestamp: 2026-10-30T00:00:00Z
---

# Find Your Bestie

DRAFT. This feature does not exist yet. It needs `groups.spec.md`. A user
sees how well their ratings match the ratings of each other member of a
group. A group belongs to one festival, so the match is for that festival. The member with the highest score is the bestie of
the user. The list of shared acts is a plan to see them together.

A user compares only with members of a group they are in. A match with other
users is out of scope. The app calculates the score from the ratings that the
user can already read, so the score adds no new access.

### Definitions

- Weight: The value of one rating, the same as in `heatmap.spec.md`. 1 and 2 are 0, 3 is 0.5, 4 is 1, 5 is 2. No rating is 0.
- Clash: One user rated an act 1 and the other user rated it 4 or 5.
- Match score: For the acts of one festival that one user or both rated: `Σ min(weight A, weight B) / (Σ max(weight A, weight B) + number of clashes)`. Shown as a whole percent.
- Shared act: An act that both users rated 3 or more.
- Bestie: The member with the highest match score for the user.

## In Scope

- The match score of the user with each other member of one group, for one festival.
- The list of matches of the user, the bestie mark, and the shared acts and clashes.

## Out of Scope

- A match with users who are not in a group with the user.
- A score across all festivals.
- The scores of pairs that do not include the user.

### Functional Requirements

| ID   | Requirement |
|------|-------------|
| FR-1 | Calculate the match score from the ratings of the festival of the group only |
| FR-2 | Use the weights of `heatmap.spec.md` for each rating |
| FR-3 | Calculate the match score of two users from their weights, as in the definition |
| FR-4 | Add 1 to the denominator for each clash. A rating of 2 against a 4 or 5 is not a clash |
| FR-5 | Show no score until both users rated 5 acts or more with 3 or more in the festival |
| FR-6 | Show the matches of the user, from the highest score to the lowest, with the percent and the number of shared acts |
| FR-7 | Mark the member with the highest score as the bestie |
| FR-8 | Show the shared acts and the clashes when the user selects a member |
| FR-9 | Show only the matches of the user, and no score of two other members |
| FR-10 | Use only the ratings of the current members of the group |

### QA Test Cases

| Test ID | Requirement | Scenario | Expected Outcome |
|---------|-------------|----------|------------------|
| TC-FU68 | FR-1 | A and B are in a group for EDC Orlando 2026 and rated acts at EDC Orlando 2025 and 2026 | The score uses only the 2026 ratings |
| TC-FZAB | FR-2 | A rated X 4 and B rated X 3 | X adds 0.5 to the numerator and 1 to the denominator |
| TC-X9MI | FR-3 | A rated X 5 and Y 4. B rated X 5 and Y 5 | The score is 3 / 4 = 75% |
| TC-Y4ME | FR-3 | A and B gave the same rating to every act | The score is 100% |
| TC-LU8T | FR-3 | A rated X 5 and B did not rate X | X adds 0 to the numerator and 2 to the denominator |
| TC-G8VF | FR-4 | A rated X 5 and B rated X 1 | X adds 0 to the numerator and 3 to the denominator |
| TC-8Q4A | FR-4 | A rated X 5 and B rated X 2 | X adds 0 to the numerator and 2 to the denominator |
| TC-9DHL | FR-4 | A rated X 3 and B rated X 1 | X adds 0 to the numerator and 0.5 to the denominator |
| TC-DJ01 | FR-5 | B rated 4 acts with 3 or more in the festival | The list shows B with no score and the text "Not enough ratings yet" ?? |
| TC-VJZY | FR-6 | A has matches of 40%, 75% and 60% | The list shows 75%, 60% and 40%, each with its number of shared acts |
| TC-DZZE | FR-7 | B has the highest score for A | The list marks B as the bestie |
| TC-IIK7 | FR-8 | A selects B | The view lists the shared acts of A and B and their clashes |
| TC-YQI0 | FR-9 | A opens the list in a group with B and C | The list shows A with B and A with C, and not B with C |
| TC-QJNT | FR-10 | B leaves the group | The list of A does not show B |

### Known Issues

- Open: where the list of matches is in the app. ??
- Open: the bestie mark when two members have the same highest score. ??
