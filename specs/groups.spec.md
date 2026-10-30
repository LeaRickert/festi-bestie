---
type: Spec
title: "Spec: Friend Groups"
sources: [../supabase/schemas]
tests: []
description: DRAFT. Groups of friends who can see each other's ratings.
tags: [groups, ratings, privacy, draft]
timestamp: 2026-10-30T00:00:00Z
---

# Friend Groups

DRAFT. This feature does not exist yet. A user makes a group and invites
friends. Members of a group see each other's ratings. This changes
`ratings.spec.md` FR-6 ("a user reads only their own ratings"). Update that
spec when this one is accepted.

### Definitions

- Group: A named set of users.
- Member: A user in a group. The user who makes a group is its owner.
- Shared rating: A rating that other members of a group can read.

## In Scope

- Make, rename and delete a group.
- Invite a user, join, and leave.
- Read the ratings of the other members.

## Out of Scope

- Chat or messages.
- A public group list.

### Functional Requirements

| ID   | Requirement |
|------|-------------|
| FR-1 | Let a signed-in user make a group with a name |
| FR-2 | Let the owner invite a user to the group ?? (invite link or username) |
| FR-3 | Let an invited user join the group |
| FR-4 | Let a member read the ratings of the other members of the same group |
| FR-5 | Do not let a user who is not a member read the ratings of the group |
| FR-6 | Let a member leave a group |
| FR-7 | Stop sharing the ratings of a member when they leave |
| FR-8 | Let only the owner delete the group |
| FR-9 | Show the username of each member who rated an act in the act popup |

### QA Test Cases

| Test ID | Requirement | Scenario | Expected Outcome |
|---------|-------------|----------|------------------|
| TC-W6EZ | FR-1 | A signed-in user makes the group "Camp A" | The group exists and the user is its owner and a member |
| TC-94CE | FR-1 | A visitor who is not signed in makes a group | The app asks the visitor to sign in |
| TC-B3VI | FR-2 | The owner sends an invite to a friend | The friend can open the invite ?? |
| TC-8N7P | FR-3 | A user opens a valid invite | The user is a member of the group |
| TC-W8M1 | FR-3 | A user opens an invite that was already revoked ?? | The user is not a member |
| TC-GAD0 | FR-4 | Members A and B are in one group, and B rated "Fisher" 5 | A can read the rating 5 of B for "Fisher" |
| TC-OD2H | FR-5 | User C is in no group with B | C cannot read any rating of B |
| TC-M695 | FR-6 | Member B leaves the group | B is not a member any more |
| TC-VKS4 | FR-7 | Member B leaves the group | A cannot read the ratings of B |
| TC-MXJC | FR-8 | A member who is not the owner deletes the group | The database rejects the delete |
| TC-E9X7 | FR-9 | A and B are in one group and both rated "Fisher" | The popup for "Fisher" lists both usernames with their ratings |

### Known Issues

- Open: is a group private by invite only? Can a user share one festival and not all ratings? ??
- Open: can a user be in many groups? We assume yes. ??
- A member reads ratings through RLS. The policy must not let a member read other data of a user.
