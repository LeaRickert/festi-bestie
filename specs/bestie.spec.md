---
type: Spec
title: "Spec: Find Your Bestie"
sources: [../src/utils]
tests: []
description: A match score that compares the ratings of a user with each friend in their groups for a festival.
tags: [groups, ratings, bestie]
timestamp: 2026-10-31T00:00:00Z
---

# Find Your Bestie

This feature needs `groups.spec.md`. A user sees how well their ratings match
the ratings of each other member of their groups for one festival. The member
with the highest score is the bestie of the user. The list of shared acts is a
plan to see them together.

A user compares only with members of the groups they are in for the festival.
A match with other users is out of scope. The app calculates the score from
the ratings that the user can already read, so the score adds no new access.

The app shows only the scores between the user and each other member. Members
can already read each other's ratings (groups FR-10), so this is a display
choice, not a privacy rule (FR-9).

### Definitions

- Weight: The value of one rating, the same as in `heatmap.spec.md`. 1 and 2 are 0, 3 is 0.5, 4 is 1, 5 is 2. No rating is 0.
- Clash: One user rated an act 1 and the other user rated it 4 or 5.
- Match score: For the acts of one festival that one user or both rated: `Σ min(weight A, weight B) / (Σ max(weight A, weight B) + number of clashes)`. Shown as a percent with up to 2 decimals.
- Shared act: An act that both users rated 3 or more.
- Shared group: A group for the festival that both users are current members of.
- Bestie: The member with the highest match score for the user.
- Bestie scores: The popup with the matches of the user for the festival.

## In Scope

- The match score of the user with each member of their groups for one festival.
- The "Bestie Scores" button and popup, the list of matches, the bestie mark, and the shared acts and clashes.

## Out of Scope

- A match with users who are not in a group with the user.
- A score across all festivals.
- The scores of pairs that do not include the user.
- Live updates while the popup is open.

### Functional Requirements

| ID   | Requirement |
|------|-------------|
| FR-1 | Calculate the match score from the ratings for the acts of the festival only |
| FR-2 | Use the weights of `heatmap.spec.md` for each rating |
| FR-3 | Calculate the match score of two users from their weights, as in the definition |
| FR-4 | Add 1 to the denominator for each clash. A rating of 2 against a 4 or 5 is not a clash |
| FR-5 | Show no score for a member until the user and the member each rated 5 acts or more with 3 or more in the festival. When the user is below this, show "Rate 5 acts with 3 stars or more to see your matches" once above the list. When only the member is below it, show "Not enough ratings yet" in their row |
| FR-6 | List the members with a score from the highest score to the lowest, then the members with no score from A to Z by username. Each row shows the username, the names of the shared groups (for example "Camp A · Work"), the score and the number of shared acts |
| FR-7 | Mark as the bestie each member with the highest shown score. Mark no member who has no score |
| FR-8 | When the user selects a member, with or without a score, show the detail view in the popup with a back arrow. It has "See together" with the shared acts and "Clashes" with the clashes, each act with its day, start time and both ratings, sorted by day and start time |
| FR-9 | Show only the matches of the user, and no score of two other members |
| FR-10 | List each user who is a current member of at least one shared group, once |
| FR-11 | Show the score as a percent rounded to 2 decimals, with no trailing zeros |
| FR-12 | Show a "Bestie Scores" button with the heart-handshake icon next to the "Groups" button on the festival page, only when the user is in at least one group for the festival |
| FR-13 | Open the bestie scores as a bottom sheet on a phone and a dialog on a wider screen, with the closing rules of the act sheet. Show above the list: "Your score is how closely your ratings match theirs. Acts you both love count most, and a 1 against their 4 or 5 counts against you." |
| FR-14 | When no other user is in the groups of the user for the festival, show "No one in your groups yet. Share an invite link from Groups." and no list |
| FR-15 | Load the ratings of the members and calculate the scores each time the popup opens |

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
| TC-DJ01 | FR-5 | A rated 6 acts with 3 or more and B rated 4 acts with 3 or more in the festival | The list shows B with no score and the text "Not enough ratings yet" |
| TC-ESNC | FR-5 | A rated 4 acts with 3 or more in the festival | The popup shows "Rate 5 acts with 3 stars or more to see your matches", no score and no bestie mark |
| TC-VJZY | FR-6 | A has matches of 40%, 75% and 60% | The list shows 75%, 60% and 40%, each with its number of shared acts |
| TC-QT10 | FR-6 | A has a match of 60% with B, and Zoe and Cam have no score | The list shows B, then Cam, then Zoe |
| TC-DZZE | FR-7 | B has the highest score for A | The list marks B as the bestie |
| TC-SNSP | FR-7 | B and C both have the highest shown score 75.12% for A | The list marks B and C as besties |
| TC-9L8D | FR-7 | No member has a score for A | The list marks no bestie |
| TC-IIK7 | FR-8 | A selects B | The detail view lists the shared acts of A and B under "See together" and their clashes under "Clashes", by day and start time, each with both ratings |
| TC-0LMM | FR-8 | A selects B, who has no score | The detail view shows the shared acts and clashes of A and B |
| TC-YQI0 | FR-9 | A opens the bestie scores and is in a group with B and C | The list shows A with B and A with C, and not B with C |
| TC-QJNT | FR-10 | B leaves the only group that A and B share | The list of A does not show B |
| TC-478I | FR-10 | A and B are both in "Camp A" and "Work" for the festival | The list shows B once, with "Camp A · Work" |
| TC-4HGL | FR-11 | The match score of A and B is 0.751234 | The list shows 75.12% |
| TC-8DMY | FR-11 | The match score of A and B is 0.75 | The list shows 75% |
| TC-KN0D | FR-12 | A user in a group for the festival opens the festival page | The page shows "Bestie Scores" next to "Groups" |
| TC-4PLT | FR-12 | A user in no group for the festival opens the festival page | The page shows no "Bestie Scores" button |
| TC-WD0A | FR-13 | A user taps "Bestie Scores" on a phone | A bottom sheet opens with the explanation above the list |
| TC-PAS7 | FR-14 | A user is the only member of their groups for the festival and opens the bestie scores | The popup shows "No one in your groups yet. Share an invite link from Groups." |
| TC-8XQY | FR-15 | B rates an act while the popup of A is closed, then A opens it | The score of A and B includes the new rating |
