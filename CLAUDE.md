# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Festi Besti is a React-based festival planning application that helps users discover festivals, plan schedules, rate artists, and export personalized schedules. Built with Vite, React 18, Tailwind CSS, and Supabase.

## Development Commands

```bash
# Start development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm preview

# Lint code
npm run lint
```

## Environment Setup

Required environment variables in `.env.local`:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

Database setup: Run `supabase-setup.sql` in Supabase SQL editor to initialize schema, RLS policies, and sample data.

## Architecture

### Core Data Flow

1. **Authentication**: `useAuth` hook (`src/hooks/useAuth.jsx`) provides auth context with role-based access control (admin/editor/viewer)
2. **Supabase Client**: Initialized in `src/utils/supabase.js` for database operations
3. **Page Components**: `LandingPage` (festival discovery) → `FestivalDetailPage` (schedule views) → `ExportPage` (PDF/image generation)
4. **View Components**: Multiple view modes (AnnouncedView, LineupView, ScheduleView, StagesView, ScheduleByDayView) render festival data differently

### Database Schema (Supabase/PostgreSQL)

Key tables:
- **festivals**: Tracks festival status (announced → lineup → stages → schedule → times → complete)
- **acts**: Artist performances with day, time, stage, genre, YouTube links
- **user_ratings**: User-specific ratings (1-5 stars)
- **user_profiles**: Username and role (admin/editor/viewer) with automatic creation via trigger

Row Level Security (RLS):
- Festivals/acts: Public read, role-restricted write
- User ratings: User-specific access only
- User profiles: Self-management with admin override

### Key Architectural Patterns

**Role-Based Access Control**: Three-tier system enforced at database level via `can_edit_acts()` and `get_user_role()` functions. Frontend checks use `canEditActs`, `isAdmin`, `isEditor` from useAuth hook.

**Rating System**: Whole star ratings (1-5) with descriptive labels. Ratings stored per user-act pair with UNIQUE constraint. Updates use upsert pattern to prevent duplicate key errors.

**Schedule Utilities** (`src/utils/scheduleUtils.js`):
- Time conversion functions handle both 12-hour and 24-hour formats
- Festival schedules default to 1 PM - 12 AM time range
- Position calculations for visual schedule rendering (time slots → pixel positions)

**View Modes**: Five distinct views for different user preferences:
- AnnouncedView: Festival announcement card (status = 'announced')
- LineupView: Alphabetical artist listing
- ScheduleView: Time-based grid with stage columns
- StagesView: Stage-grouped organization
- ScheduleByDayView: Day-filtered stage grouping

**CSV Import/Export** (`src/utils/csvImport.js`): Handles bulk act imports and exports for festival organizers.

### Authentication Flow

1. User signs up/logs in via LoginModal component
2. `handle_new_user()` trigger automatically creates user_profiles entry with 'viewer' role
3. useAuth hook fetches user profile and provides role-based permissions
4. Frontend adapts UI based on `canEditActs`, `isAdmin` flags
5. Database RLS policies enforce permissions server-side

### Festival Status Progression

Enum: announced → lineup → stages → schedule → times → complete

Each status determines which view components are available and what data is shown.

## Critical Implementation Details

### Rating System Implementation

- Use `rating INTEGER` to store whole star ratings (1, 2, 3, 4, 5)
- Always use upsert pattern to prevent duplicate key errors:
  ```javascript
  await supabase
    .from('user_ratings')
    .upsert({ user_id, act_id, rating })
    .eq('user_id', user_id)
    .eq('act_id', act_id)
  ```
- StarRating component handles click-to-rate interaction

### Time Handling

- Database stores `start_time` as TIME type (HH:MM:SS)
- Frontend displays 12-hour format with AM/PM
- `timeToMinutes()` converts various formats to minutes since midnight for calculations
- Schedule grid positions calculated relative to 1 PM (13:00) start time

### Vite Configuration

- Dev server runs on port 3000
- JSX files have `.jsx` extension but esbuild configured to handle `.js` files as JSX
- This allows mixing `.js` and `.jsx` files throughout the codebase

### Row Level Security Gotchas

- Acts require `can_edit_acts(auth.uid())` check for INSERT/UPDATE
- User ratings use `auth.uid() = user_id` for all operations
- Admin-only operations check `get_user_role(auth.uid()) = 'admin'`
- Always test RLS policies in Supabase dashboard before deploying

## Common Development Patterns

### Adding a New View Component

1. Create component in `src/components/` (e.g., `NewView.jsx`)
2. Import and use utility functions from `src/utils/scheduleUtils.js`
3. Add view option to FestivalDetailPage view switcher
4. Ensure component handles filtering by day/stage/genre as needed
5. Use StarRating component for user ratings

### Modifying Database Schema

1. Update `supabase-setup.sql` with new tables/columns
2. Add/update RLS policies for new tables
3. Create indexes for frequently queried columns
4. Test RLS policies thoroughly in Supabase dashboard
5. Update types in `src/types/index.js` if using TypeScript

### Working with User Roles

- Check `canEditActs` before showing edit UI elements
- Check `isAdmin` for admin-only features (user role management)
- Database enforces permissions via RLS, but frontend should hide unauthorized UI
- Use `updateUserRole()` from useAuth for role changes (admin only)

## Testing Notes

- No formal test suite currently implemented
- Manual testing workflow: dev server → test auth flow → test rating system → test export functionality
- Always test RLS policies in Supabase dashboard when modifying permissions
- Verify role-based access by testing with different user roles

## Known Issues

- `useAuth.jsx` currently bypasses profile fetching (lines 26-31) - returns hardcoded temp user
- Time handling assumes festival schedule runs 1 PM - 12 AM (may need adjustment for different timezones/schedules)
- CSV import uses random time generation - needs proper CSV parsing for actual time data
