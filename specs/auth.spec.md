---
type: Spec
title: "Spec: Authentication and Roles"
sources: [../src/hooks/useAuth.tsx, ../src/components/LoginModal.tsx, ../src/utils/username.ts, ../supabase/schemas]
tests: [../src/utils/username.test.ts, ../supabase/tests/database/user_profiles.test.sql]
description: Sign-in, profiles and the viewer, editor and admin roles.
tags: [auth, roles, rls]
timestamp: 2026-10-29T00:00:00Z
---

# Authentication and Roles

Supabase Auth signs users in with email and password. Each user has one
profile with a username and a role. The database enforces the role with Row
Level Security (RLS). The frontend only hides controls.

### Definitions

- Role: `viewer`, `editor` or `admin`. The default is `viewer`.
- `canEditActs`: True when the role is `editor` or `admin`.
- Username rule: After the spaces at the start and end are trimmed, 1 to 20 characters of the letters A-Z and a-z, the digits 0-9 and single spaces between them.

## In Scope

- Sign-up, sign-in, sign-out.
- The profile row and the role policies.

## Out of Scope

- Password reset and email change.
- A screen to manage roles.

### Functional Requirements

| ID   | Requirement |
|------|-------------|
| FR-1 | Sign a user in with an email and a password |
| FR-2 | Create an account from an email, a password and a username |
| FR-3 | Create a profile with the role `viewer` when an account is created |
| FR-4 | Keep each username unique |
| FR-5 | Let anyone read acts and festivals |
| FR-6 | Let only an editor or an admin create or change an act |
| FR-7 | Let only an admin delete an act |
| FR-8 | Let only an admin change the role of a user. A user can still edit their own username |
| FR-9 | Load the role of the signed-in user and expose `canEditActs`, `isAdmin` and `isEditor` |
| FR-10 | Accept a username only when it follows the username rule. The database checks it each time a username is set or changed, so a username saved before the rule stays until it changes |
| FR-11 | Limit the username field of the sign-up form to 20 characters. When the username breaks the rule, show "Use up to 20 letters (A-Z), numbers and single spaces" and create no account |

### QA Test Cases

| Test ID | Requirement | Scenario | Expected Outcome |
|---------|-------------|----------|------------------|
| TC-5BNU | FR-1 | The user enters a correct email and password | The session starts and the modal closes |
| TC-125V | FR-2 | The user signs up with username "lea" | A profile exists with username "lea" |
| TC-5R53 | FR-3 | A new account is created | The profile role is `viewer` |
| TC-YF4Q | FR-4 | Two users choose the username "lea" | The second sign-up fails |
| TC-RAM6 | FR-4 | A user signs up with the username "lea" and it is taken | The form shows "That username is already taken" and no account is created |
| TC-8AK8 | FR-5 | A visitor who is not signed in requests the acts | The database returns the acts |
| TC-6FKK | FR-6 | A `viewer` updates an act | The database rejects the update |
| TC-ED7F | FR-6 | An `editor` updates an act | The database accepts the update |
| TC-LIGW | FR-7 | An `editor` deletes an act | The database rejects the delete |
| TC-Y6AC | FR-8 | A `viewer` sets their own role to `admin` | The database rejects the update and the role stays `viewer` |
| TC-S419 | FR-8 | An `admin` sets the role of another user to `editor` | The role of that user is `editor` |
| TC-S4V9 | FR-9 | An `editor` signs in | `canEditActs` is true and `isAdmin` is false |
| TC-B9AV | FR-10 | A user signs up with the username "DJ Lea 2" | A profile exists with username "DJ Lea 2" |
| TC-U52K | FR-10 | A user signs up with a username of 21 characters | The sign-up fails |
| TC-DJ6G | FR-10 | A user signs up with the username "lea_b" | The sign-up fails |
| TC-K86H | FR-10 | A user signs up with the username "DJ  Lea", with two spaces | The sign-up fails |
| TC-DCCB | FR-10 | A user signs up with the username "Zoë" | The sign-up fails |
| TC-11E0 | FR-10 | A sign-up has no username | The sign-up fails with "Choose a username" |
| TC-CTI2 | FR-10 | A user signs up with the username " bob " | A profile exists with username "bob" |
| TC-YKGF | FR-10 | A sign-up reaches the database with the username "lea_b" | The database rejects it and no account is created |
| TC-0TGS | FR-10 | A user renames themself to "DJ  Carol" | The database rejects the update |
| TC-1OU6 | FR-10 | A user has the username "old_name@test.local" from before the rule, and an admin changes their role | The role changes and the username stays |
| TC-6E61 | FR-11 | A user types "lea_b" in the sign-up form and submits | The form shows "Use up to 20 letters (A-Z), numbers and single spaces" and no account is created |

### Known Issues

- `RoleBasedExample.jsx` is demo code and no page uses it.
- Usernames saved before FR-10 can break the username rule. They stay until the user changes them.
