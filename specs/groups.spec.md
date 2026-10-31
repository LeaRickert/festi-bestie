---
type: Spec
title: "Spec: Friend Groups"
sources: [../supabase/schemas]
tests: [../supabase/tests/database/groups.test.sql]
description: DRAFT. Groups of friends who see each other's ratings for one festival.
tags: [groups, ratings, privacy, draft]
timestamp: 2026-10-30T00:00:00Z
---

# Friend Groups

DRAFT. This feature does not exist yet. A user makes a group for one festival
and invites friends with a link. Members of a group see each other's ratings
for the acts of that festival, and nothing more. This changes
`ratings.spec.md` FR-6.

A group is private. Nobody can find it, and the only way in is the invite
link. The database enforces every rule here with RLS and `security definer`
functions. The frontend only hides controls.

### Definitions

- Group: A named set of users for one festival.
- Member: A user in a group. A member has a join time (`group_members.joined_at`).
- Owner: The member who made the group, or the member who took it over (FR-15).
- Invite link: A link with the secret invite token of a group. Each group has one link at a time, with no expiry. Only members can read the token.
- Join screen: The page that an invite link opens. It shows the group name, the festival, the usernames of the members, a "Join" button and the warning "Your ratings for this festival will be visible to members".
- Past group: A group whose festival end date has passed, by the same rule as the "Past festivals" section of `festivals.spec.md`.
- Shared rating: A rating of a member for an act of the festival of the group.
- Groups page: `/festival/:id/groups`. The groups of the user for one festival.
- Group page: The members, the invite link, Leave and the owner actions of one group.
- Ratings slider: The rating section of the act sheet as pages: "My rating", then one page for each group of the user for the festival.

## In Scope

- Make, rename and delete a group.
- The invite link, the join screen, join and leave.
- Read the ratings and usernames of the other members.
- The groups page and the group page.
- The ratings slider in the act sheet.

## Out of Scope

- Chat or messages.
- A public group list or a search for groups.
- Invite by username.
- Removing a member. A leaked link is fixed by a reset (FR-4).
- Real-time updates. Group data loads with the page and on a pull to refresh.
- Groups across festivals, and a "My groups" page for all festivals.

### Functional Requirements

| ID   | Requirement |
|------|-------------|
| FR-1 | Let a signed-in user make a group with a name for a festival that has not ended. The user becomes its owner and a member |
| FR-2 | Trim the group name and accept 1 to 40 characters. A name does not have to be unique |
| FR-3 | Give each group one invite link with no expiry. Let any member copy and share it |
| FR-4 | Let the owner reset the invite link. The old link stops working |
| FR-5 | Show the join screen when a user opens a valid invite link. Add the user to the group only when they tap "Join" |
| FR-6 | Send a visitor who is not signed in to sign in or sign up, then back to the same join screen |
| FR-7 | Reject a join when the group has 20 members |
| FR-8 | Reject a join or a new group when the user is already in 2 groups for the same festival |
| FR-9 | Make a past group read-only: no join, no rename, no reset of the link. Members can still read the shared ratings and leave |
| FR-10 | Let a member read the shared ratings of the other members, also ratings given before the member joined |
| FR-11 | Do not let a user read a rating of a user they share no group with, or a rating for an act of another festival than the shared group |
| FR-12 | Let a member read the usernames of the other members, and no other profile data |
| FR-13 | Let a member leave a group |
| FR-14 | Stop sharing the ratings of a member when they leave. Their own ratings stay as they are |
| FR-15 | Make the member who joined earliest the owner when the owner leaves |
| FR-16 | Delete the group when the last member leaves |
| FR-17 | Let only the owner rename the group |
| FR-18 | Let only the owner delete the group, after a confirmation |
| FR-19 | Show a "Groups" entry on the festival page that opens the groups page. The groups page lists the groups of the user for the festival and has "Make a group" |
| FR-20 | Show the group page with the usernames of the members, the invite link and "Leave". Show "Rename", "Reset link" and "Delete" only to the owner |
| FR-21 | Show the rating section of the act sheet as the ratings slider when the user is in a group for the festival: "My rating" first, then the groups in the order the user joined them, each named after the group. The slider is the same in every mode of the act views |
| FR-22 | Show a small chevron to the right of the rating block with the name of the next page. Move to the next page on a tap of the chevron or a swipe. Go from the last group back to "My rating". Show dots for the current page |
| FR-23 | Open the act sheet on "My rating" every time |
| FR-24 | Show no slider, chevron, label or dots to a visitor or to a user in no group for the festival |
| FR-25 | On a group page of the slider, show in each star the number of members, the user included, who gave that rating. Show a star that no member chose empty, with no number. The stars there cannot be edited and use the rating color of `ratings.spec.md` |
| FR-26 | On a group page of the slider, show "Tap a star to see who" until the user taps a star. On a tap, show the rating, its label and the members with that rating, the user first as "You", for example "4/5 Hyped: You, Alice, Bob". A second tap on the same star hides the line |

### QA Test Cases

| Test ID | Requirement | Scenario | Expected Outcome |
|---------|-------------|----------|------------------|
| TC-W6EZ | FR-1 | A signed-in user makes the group "Camp A" | The group exists and the user is its owner and a member |
| TC-94CE | FR-1 | A visitor who is not signed in makes a group | The app asks the visitor to sign in |
| TC-TDLG | FR-1 | A user makes a group for a festival whose end date has passed | The database rejects the group |
| TC-7VVH | FR-2 | A user makes a group with the name of only spaces | The database rejects the group |
| TC-JXYX | FR-2 | A user makes a group with a name of 41 characters | The database rejects the group |
| TC-B3VI | FR-3 | A member who is not the owner copies the invite link and sends it to a friend | The friend opens the link and sees the join screen |
| TC-W8M1 | FR-4 | A user opens an invite link after the owner reset it | The app shows that the link is not valid, and the user is not a member |
| TC-3S93 | FR-5 | A signed-in user opens a valid invite link | The join screen shows the group, the festival, the members and the warning, and the user is not a member yet |
| TC-8N7P | FR-5 | A signed-in user opens a valid invite link and taps "Join" | The user is a member of the group |
| TC-46LV | FR-6 | A visitor who is not signed in opens a valid invite link | The app asks the visitor to sign in, then shows the same join screen |
| TC-EDFG | FR-7 | A user taps "Join" for a group with 20 members | The app shows that the group is full, and the user is not a member |
| TC-5HHA | FR-8 | A user in 2 groups for EDC Orlando 2026 makes a third group for it | The database rejects the group |
| TC-1EAU | FR-8 | A user in 2 groups for EDC Orlando 2025 joins a group for EDC Orlando 2026 | The user is a member of the group |
| TC-8P5H | FR-9 | A member opens a group the day after the end date of its festival | The member reads the shared ratings, and the database rejects a join, a rename and a reset of the link |
| TC-GAD0 | FR-10 | Members A and B are in one group, and B rated "Fisher" 5 | A can read the rating 5 of B for "Fisher" |
| TC-3ZQE | FR-10 | B rated "Fisher" 5 before A joined the group | A can read the rating 5 of B for "Fisher" |
| TC-OD2H | FR-11 | User C is in no group with B | C cannot read any rating of B |
| TC-H6XQ | FR-11 | A and B are in a group for EDC Orlando 2026 and B rated an act at EDC Orlando 2025 | A cannot read the rating of B for the 2025 act |
| TC-DC2C | FR-12 | Member A requests the profile of member B | A gets only the id and username of B, and no role or email |
| TC-M695 | FR-13 | Member B leaves the group | B is not a member any more |
| TC-VKS4 | FR-14 | Member B leaves the group | A cannot read the ratings of B, and B still has their own ratings |
| TC-5MBF | FR-15 | The owner leaves a group with members B and C, and B joined first | B is the owner |
| TC-LNHJ | FR-16 | The last member leaves the group | The group does not exist any more |
| TC-OSAD | FR-17 | A member who is not the owner renames the group | The database rejects the rename |
| TC-MXJC | FR-18 | A member who is not the owner deletes the group | The database rejects the delete |
| TC-6KU0 | FR-18 | The owner deletes the group and confirms | The group does not exist any more |
| TC-K7VH | FR-19 | A user in the groups "Camp A" and "Work" for a festival opens the groups page | The page lists "Camp A" and "Work" and shows "Make a group" |
| TC-SZ8G | FR-20 | A member who is not the owner opens the page of a group | The page shows the members, the invite link and "Leave", and no "Rename", "Reset link" or "Delete" |
| TC-A0GT | FR-21 | A user joined "Camp A" and then "Work" for the festival and opens an act | The slider pages are "My rating", "Camp A" and "Work", in that order |
| TC-W8LO | FR-21 | The user switches the mode control to "Heatmap" and opens an act | The act sheet shows the same slider as in "My picks" |
| TC-NXVN | FR-22 | The act sheet shows the last group page and the user taps the chevron | The slider shows "My rating" |
| TC-7HGL | FR-23 | The user viewed the "Camp A" page, closes the sheet and opens another act | The sheet opens on "My rating" |
| TC-6ELZ | FR-24 | A user in no group for the festival opens an act | The rating section shows only the stars, with no chevron, label or dots |
| TC-2TE6 | FR-25 | In "Camp A" the user rated an act 4, B rated it 4 and C rated it 5 | The 4th star shows 2, the 5th star shows 1, and stars 1 to 3 are empty with no number |
| TC-1781 | FR-26 | The user opens the "Camp A" page of an act | The line under the stars reads "Tap a star to see who" |
| TC-E9X7 | FR-26 | A and B are in one group and both rated "Fisher" 4, and A taps the 4th star on the group page | The line reads "4/5 Hyped: You, B" |
| TC-TQ51 | FR-26 | The user taps the selected star again | The line reads "Tap a star to see who" again |

### Known Issues

- A member reads ratings through RLS. The policy must not let a member read other data of a user. The usernames come from a narrow function that returns only id and username.
- A leaked invite link lets anyone join until the owner resets it. A member who joined that way stays until they leave.
