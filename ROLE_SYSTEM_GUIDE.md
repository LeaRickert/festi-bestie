# Role-Based Access Control System

This guide explains how to use the role-based access control system implemented in your Festi Besti application.

## Overview

The system implements three user roles with different permissions:

- **Viewer**: Can view festivals and acts, rate acts
- **Editor**: Can view, rate, and edit act information  
- **Admin**: Can view, rate, edit, and delete acts, manage user roles

## Database Schema

### User Profiles Table
```sql
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  role user_role DEFAULT 'viewer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### User Role Enum
```sql
CREATE TYPE user_role AS ENUM ('admin', 'editor', 'viewer');
```

## Authentication Hook Usage

The `useAuth` hook now provides role-based functionality:

```jsx
import { useAuth } from '../hooks/useAuth'

const MyComponent = () => {
  const { 
    user,           // Supabase user object
    username,       // User's username
    userRole,       // Current user's role ('admin', 'editor', 'viewer')
    canEditActs,    // Boolean: true if user can edit acts
    isAdmin,        // Boolean: true if user is admin
    isEditor,       // Boolean: true if user is editor
    updateUsername, // Function to update username
    updateUserRole  // Function to update user role (admin only)
  } = useAuth()

  // Use role-based permissions
  if (canEditActs) {
    // Show edit buttons
  }

  if (isAdmin) {
    // Show admin-only features
  }
}
```

## Row Level Security (RLS) Policies

The database enforces permissions through RLS policies:

### Acts Table Policies
- **SELECT**: Everyone can view acts
- **INSERT**: Only admins and editors can create acts
- **UPDATE**: Only admins and editors can update acts
- **DELETE**: Only admins can delete acts

### User Profiles Policies
- Users can view and update their own profile
- Only admins can update other users' roles

## Signup Process

The signup process now includes username:

```jsx
// In LoginModal component
const { signUp } = useAuth()

const handleSignup = async (email, password, username) => {
  const { error } = await signUp(email, password, username)
  if (error) {
    console.error('Signup error:', error)
  }
}
```

## Role Management Functions

### Update Username
```jsx
const { updateUsername } = useAuth()

const handleUpdateUsername = async (newUsername) => {
  const { error } = await updateUsername(newUsername)
  if (error) {
    console.error('Error updating username:', error)
  }
}
```

### Update User Role (Admin Only)
```jsx
const { updateUserRole } = useAuth()

const handleUpdateUserRole = async (userId, newRole) => {
  const { error } = await updateUserRole(userId, newRole)
  if (error) {
    console.error('Error updating user role:', error)
  }
}
```

## Example Implementation

See `src/components/RoleBasedExample.jsx` for a complete example of how to use the role-based system in your components.

## Database Functions

### Helper Functions
- `get_user_role(user_id)`: Returns the role of a specific user
- `can_edit_acts(user_id)`: Returns true if user can edit acts
- `handle_new_user()`: Automatically creates user profile on signup

## Security Notes

1. **Database-Level Security**: RLS policies enforce permissions at the database level, preventing unauthorized access even if frontend checks are bypassed.

2. **Role Assignment**: Only admins can change user roles through the `updateUserRole` function.

3. **Username Uniqueness**: Usernames must be unique across all users.

4. **Default Role**: New users are automatically assigned the 'viewer' role.

## Migration Instructions

To apply these changes to your Supabase database:

1. Run the updated SQL commands from `supabase-setup.sql` in your Supabase SQL editor
2. The new tables and policies will be created
3. Existing users will need to have profiles created (you can do this manually or through the admin interface)

## Testing the System

1. Create test users with different roles
2. Verify that permissions work correctly in the UI
3. Test that database policies prevent unauthorized access
4. Ensure username uniqueness is enforced

## Troubleshooting

### Common Issues

1. **User profile not created**: Check that the `handle_new_user()` trigger is working
2. **Permission denied**: Verify RLS policies are correctly applied
3. **Username conflicts**: Ensure username uniqueness constraint is working

### Debugging

Use the Supabase dashboard to:
- Check user profiles table
- Verify RLS policies are enabled
- Test database functions
- Monitor authentication logs
