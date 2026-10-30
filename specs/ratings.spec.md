---
type: Spec
title: "Spec: Artist Ratings"
sources: [../src/components/StarRating.jsx, ../src/pages/FestivalDetailPage.jsx, ../src/hooks/useFestivalData.ts, ../supabase/schemas]
description: How a signed-in user rates an act.
tags: [ratings]
timestamp: 2026-10-30T00:00:00Z
---

# Artist Ratings

A signed-in user rates an act with 1 to 5 stars. Each user has at most one
rating for each act. A user sees only their own ratings.

### Definitions

- Rating: An integer from 1 to 5 in `user_ratings`.
- Label: The text for a rating. 1 "Not for me", 2 "Meh", 3 "Interested", 4 "Hyped", 5 "Must See!". All users read a rating with the same meaning, so friends can compare them.
- Average rating: The `acts.avg_rating` column. The app only reads it.
- Rating style: How an act block or act card shows the rating of the signed-in user. The time grid, the lineup, stages and schedule views and the export all use one style function.

  | Rating | Border | Fill | Text |
  |---|---|---|---|
  | 1 | white 40% | none | white 80% |
  | none or 2 | white 70% | none | white |
  | 3 | magenta | none | white |
  | 4 | magenta | magenta 20% | white |
  | 5 | magenta | magenta 70% | white |

## In Scope

- The `StarRating` component.
- The rating style.
- Save and load of the user rating.

## Out of Scope

- Calculation of the average rating.
- Half stars.
- A separate "not for me" flag. A rating of 1 means "Not for me".

### Functional Requirements

| ID   | Requirement |
|------|-------------|
| FR-1 | Accept a whole rating from 1 to 5 only |
| FR-2 | Show the label for the rating that the user selects or points to |
| FR-3 | Save the rating with an upsert on `user_id` and `act_id` |
| FR-4 | Load the ratings of the signed-in user when the acts load |
| FR-5 | Ask a user who is not signed in to sign in before they rate |
| FR-6 | Let a user read and write only their own ratings |
| FR-7 | Show the previous rating again when a save fails |
| FR-8 | Keep the act sheet open after the user selects a rating, and show the label of the new rating |
| FR-9 | Make each star in the act sheet a tap target of at least 44 by 44 px |
| FR-10 | Show each act with the rating style in the time grid and in the lineup, stages and schedule views |

### QA Test Cases

| Test ID | Requirement | Scenario | Expected Outcome |
|---------|-------------|----------|------------------|
| TC-DV1A | FR-1 | The user selects the 4th star | The component reports the rating 4 |
| TC-UZOP | FR-1 | The database receives a rating of 6 | The database rejects the row |
| TC-Q0OF | FR-2 | The user points at the 5th star | The label reads "Must See!" |
| TC-UNIZ | FR-2 | The user points at the 1st star | The label reads "Not for me" |
| TC-5GN7 | FR-2 | The act has no rating | The label reads "Not rated" |
| TC-UE94 | FR-3 | The user rates the same act twice | One row exists and it holds the second rating |
| TC-TR50 | FR-4 | A user with ratings for two acts opens the festival | The two acts show the saved ratings |
| TC-XL9D | FR-5 | A visitor opens an act sheet | The popup shows "Sign In to Rate" and the stars do nothing |
| TC-6Q8C | FR-6 | User A requests the ratings of user B | The database returns no rows |
| TC-16K9 | FR-7 | A user changes a rating from 3 to 5 and the save fails | The act shows 3 stars again |
| TC-7FMH | FR-8 | A signed-in user selects the 4th star in the sheet | The rating is saved, the sheet stays open and shows "Hyped" |
| TC-3K8R | FR-9 | The screen is 375 px wide and the sheet shows the stars | Each star is at least 44 by 44 px |
| TC-YBFW | FR-10 | The user rated one act 2 and left one act unrated | Both acts have a white 70% border and no fill |
| TC-CC2Q | FR-10 | The user rated an act 1 | The act has a white 40% border, no fill and white 80% text |
| TC-FINQ | FR-10 | The user rated an act 3 | The act has a magenta border and no fill |
| TC-QZZJ | FR-10 | The user rated an act 4 | The act has a magenta border and a magenta 20% fill |
| TC-NECG | FR-10 | The user rated an act 5 | The act has a magenta border and a magenta 70% fill |

### Known Issues

- `StarRating.jsx` still uses "Not for Me" and "Must See!!". Phase 4 changes them to "Not for me" and "Must See!".
