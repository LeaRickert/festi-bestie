---
type: Spec
title: "Spec: Authentication and Roles"
sources: [../src/hooks/useAuth.jsx, ../src/components/LoginModal.jsx, ../supabase/schemas]
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
| FR-8 | Let only an admin change the role of a user |
| FR-9 | Load the role of the signed-in user and expose `canEditActs`, `isAdmin` and `isEditor` |

### QA Test Cases

| Test ID | Requirement | Scenario | Expected Outcome |
|---------|-------------|----------|------------------|
| TC-5BNU | FR-1 | The user enters a correct email and password | The session starts and the modal closes |
| TC-125V | FR-2 | The user signs up with username "lea" | A profile exists with username "lea" |
| TC-5R53 | FR-3 | A new account is created | The profile role is `viewer` |
| TC-YF4Q | FR-4 | Two users choose the username "lea" | The second sign-up fails |
| TC-8AK8 | FR-5 | A visitor who is not signed in requests the acts | The database returns the acts |
| TC-6FKK | FR-6 | A `viewer` updates an act | The database rejects the update |
| TC-ED7F | FR-6 | An `editor` updates an act | The database accepts the update |
| TC-LIGW | FR-7 | An `editor` deletes an act | The database rejects the delete |
| TC-Y6AC | FR-8 | A `viewer` sets their own role to `admin` | The role stays `viewer` |
| TC-S4V9 | FR-9 | An `editor` signs in | `canEditActs` is true and `isAdmin` is false |

### Known Issues

- `useAuth` skips the profile fetch and returns `{ username: 'temp_user', role: 'viewer' }` for every user. FR-9 fails today.
- The RLS policy "Users can update their own profile" lets a user change their own `role`. FR-8 fails today. The admin policy does not exist in `supabase/schemas`.
- The sign-up trigger sets the username to the email. `signUp` then updates it. A duplicate username leaves an account with the email as username.
- `RoleBasedExample.jsx` is demo code and no page uses it.
