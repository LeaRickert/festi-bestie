---
type: Spec
title: "Spec: Logging and Analytics"
sources: [../src/posthog.ts, ../src/posthogLogger.ts, ../src/hooks/useAuth.tsx, ../src/components/LoginModal.tsx, ../src/pages/ExportPage.tsx, ../src/pages/FestivalDetailPage.tsx, ../src/pages/GroupPage.tsx, ../src/pages/GroupsPage.tsx, ../src/pages/JoinPage.tsx]
description: The product events, logs and errors the web app sends to PostHog.
tags: [logging, analytics, posthog]
timestamp: 2026-11-01T00:00:00Z
---

# Logging and Analytics

The web app sends product events, logs and uncaught errors to PostHog. The
variables `VITE_POSTHOG_PROJECT_TOKEN` and `VITE_POSTHOG_HOST` configure it.
PostHog also autocaptures clicks and the first page view with its default
settings.

### Definitions

- Environment: The Vite mode, such as `development` or `production`.
- Product event: A named event that records one action a user completed.
- Group properties: `festival_id` and `group_id`.

| Product event | When it is sent | Properties |
|---------------|-----------------|------------|
| `user_signed_in` | Sign-in succeeds | None |
| `user_signed_up` | Sign-up succeeds | None |
| `act_rated` | A rating is saved | `act_id`, `festival_id`, `rating` |
| `schedule_exported` | A schedule image is downloaded | `festival_id`, `selected_day`, `selected_stage_count`, `act_count` |
| `group_created` | A group is created | Group properties |
| `group_joined` | A user joins a group from an invite | Group properties |
| `group_renamed` | A group is renamed | Group properties |
| `group_invite_reset` | An invite link is reset | Group properties |
| `group_invite_copied` | An invite link is copied | Group properties |
| `group_invite_shared` | An invite link is shared | Group properties |
| `group_deleted` | A group is deleted | Group properties |
| `group_left` | A user leaves a group | Group properties |

## In Scope

- The PostHog setup of the web app.
- User identity, product events, logs and uncaught errors.

## Out of Scope

- PostHog dashboards and alerts.
- Session replay settings, which are set in the PostHog project.
- Logs from the database and the data scripts.

### Functional Requirements

| ID    | Requirement |
|-------|-------------|
| FR-1  | Turn PostHog on only when both PostHog variables are set. Without them a production build runs and sends nothing |
| FR-2  | Stop the dev server app with an error that names the variable when a PostHog variable is missing |
| FR-3  | Add the environment to each event and log |
| FR-4  | Identify a signed-in user by their user id, with their email and username as person properties |
| FR-5  | Clear the PostHog identity when the user signs out or when a different user signs in |
| FR-6  | Send each product event in the Definitions table, only after the action succeeds |
| FR-7  | Send an info log with the service name `festi-bestie-web` when a schedule export completes and when a group is created |
| FR-8  | Capture uncaught errors and unhandled promise rejections, but not `console.error` calls |
| FR-9  | Remove the URL hash from what PostHog captures, because a hash can hold Supabase auth tokens |
| FR-10 | Capture page views on history change |

### QA Test Cases

| Test ID | Requirement | Scenario | Expected Outcome |
|---------|-------------|----------|------------------|
| TC-20KF | FR-1 | A production build runs with no PostHog variables | The app works and sends nothing to PostHog |
| TC-IMH8 | FR-1 | A build runs with both PostHog variables | The app works and PostHog receives a page view |
| TC-L6P7 | FR-2 | The dev server runs without `VITE_POSTHOG_HOST` | The app stops with an error that names `VITE_POSTHOG_HOST` |
| TC-91N2 | FR-3 | An event is sent from the dev server | The event has `environment` set to `development` |
| TC-VTAH | FR-4 | A user signs in | The next events belong to the person with that user id, who has their email and username |
| TC-8DM9 | FR-4 | A signed-in user reloads the page | The events still belong to the same person |
| TC-KZ2I | FR-5 | A user signs out | The next events do not belong to that person |
| TC-CF2P | FR-5 | A second user signs in on the same browser while the first user session is still known | The next events belong to the second user only |
| TC-6B73 | FR-6 | A user saves a rating | PostHog receives `act_rated` with the act, the festival and the rating |
| TC-O120 | FR-6 | A rating fails to save | PostHog receives no `act_rated` |
| TC-CDZL | FR-6 | A user joins a group from an invite | PostHog receives `group_joined` with the group properties |
| TC-332P | FR-7 | A user downloads a schedule | PostHog receives the log "schedule export completed" from `festi-bestie-web` |
| TC-MB2Q | FR-8 | Code throws an error that nothing catches | PostHog receives an exception |
| TC-WWJ6 | FR-8 | Code catches an error and calls `console.error` | PostHog receives no exception |
| TC-8LS2 | FR-9 | A page opens with a hash in the URL | The captured URL properties do not have the hash |

### Known Issues

- The PostHog username can go stale. `useAuth` reads it from the sign-up metadata, and `updateUsername` only writes to `user_profiles`. No screen calls `updateUsername` yet. When a screen does, send the username from `user_profiles` to PostHog after the profile loads and after each rename.
- PostHog only captures the page view of the first load, so moves between routes send no page view.
- Errors the app catches, such as a failed rating save or export, do not reach PostHog.
