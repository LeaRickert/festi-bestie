---
type: Spec
title: "Spec: Artist Ratings"
sources: [../src/components/StarRating.jsx, ../src/pages/FestivalDetailPage.jsx, ../src/hooks/useFestivalData.jsx, ../supabase-setup.sql]
description: How a signed-in user rates an act.
tags: [ratings]
timestamp: 2026-10-29T00:00:00Z
---

# Artist Ratings

A signed-in user rates an act with 1 to 5 stars. Each user has at most one
rating for each act. A user sees only their own ratings.

### Definitions

- Rating: An integer from 1 to 5 in `user_ratings`.
- Label: The text for a rating. 1 "Not for Me", 2 "Meh", 3 "Interested", 4 "Hyped", 5 "Must See!!".
- Average rating: The `acts.avg_rating` column. The app only reads it.

## In Scope

- The `StarRating` component.
- Save and load of the user rating.

## Out of Scope

- Calculation of the average rating.
- Half stars.

### Functional Requirements

| ID   | Requirement |
|------|-------------|
| FR-1 | Accept a whole rating from 1 to 5 only |
| FR-2 | Show the label for the rating that the user selects or points to |
| FR-3 | Save the rating with an upsert on `user_id` and `act_id` |
| FR-4 | Load the ratings of the signed-in user when the acts load |
| FR-5 | Ask a user who is not signed in to sign in before they rate |
| FR-6 | Let a user read and write only their own ratings |

### QA Test Cases

| Test ID | Requirement | Scenario | Expected Outcome |
|---------|-------------|----------|------------------|
| TC-DV1A | FR-1 | The user selects the 4th star | The component reports the rating 4 |
| TC-UZOP | FR-1 | The database receives a rating of 6 | The database rejects the row |
| TC-Q0OF | FR-2 | The user points at the 5th star | The label reads "Must See!!" |
| TC-5GN7 | FR-2 | The act has no rating | The label reads "Not rated" |
| TC-UE94 | FR-3 | The user rates the same act twice | One row exists and it holds the second rating |
| TC-TR50 | FR-4 | A user with ratings for two acts opens the festival | The two acts show the saved ratings |
| TC-XL9D | FR-5 | A visitor opens an act popup | The popup shows "Sign In to Rate" and the stars do nothing |
| TC-6Q8C | FR-6 | User A requests the ratings of user B | The database returns no rows |

### Known Issues

- On a save error, `handleRatingChange` does not revert the rating. The "revert" code sets the value to itself.
- `avg_rating` in the mock data has values above 5.
