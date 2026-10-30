import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../utils/supabase'

type UserRole = 'viewer' | 'editor' | 'admin'

interface UserProfile {
  username: string
  role: UserRole
}

interface AuthContextValue {
  user: User | null
  userProfile: UserProfile | null
  userRole: UserRole
  username: string
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ data: unknown; error: Error | null }>
  signUp: (email: string, password: string, username: string) => Promise<{ data: unknown; error: Error | null }>
  signOut: () => Promise<{ error: Error | null }>
  updateUsername: (newUsername: string) => Promise<{ error: Error | null }>
  updateUserRole: (targetUserId: string, newRole: UserRole) => Promise<{ error: Error | null }>
  canEditActs: boolean
  isAdmin: boolean
  isEditor: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('username, role')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
  return data ? { username: data.username, role: data.role ?? 'viewer' } : null
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // The auth listener only tracks the session. It must not await Supabase
  // calls, which can deadlock the client. The profile loads in the effect below.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) {
        setUserProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const userId = user?.id
  useEffect(() => {
    if (!userId) return
    let cancelled = false
    fetchUserProfile(userId).then((profile) => {
      if (!cancelled) setUserProfile(profile)
    })
    return () => {
      cancelled = true
    }
  }, [userId])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  // The username goes in the sign-up metadata. The `handle_new_user` trigger
  // reads it, and the unique constraint rejects a duplicate.
  const signUp = async (email: string, password: string, username: string) => {
    const name = username.trim()
    const { data: available, error: checkError } = await supabase.rpc('is_username_available', {
      name,
    })
    if (checkError) return { data: null, error: checkError }
    if (!available) {
      return { data: null, error: new Error('That username is already taken') }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username: name } },
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const updateUsername = async (newUsername: string) => {
    if (!user) return { error: new Error('No user logged in') }

    const { error } = await supabase
      .from('user_profiles')
      .update({ username: newUsername })
      .eq('id', user.id)

    if (!error) {
      setUserProfile(await fetchUserProfile(user.id))
    }
    return { error }
  }

  // The database only accepts this from an admin.
  const updateUserRole = async (targetUserId: string, newRole: UserRole) => {
    const { error } = await supabase
      .from('user_profiles')
      .update({ role: newRole })
      .eq('id', targetUserId)

    return { error }
  }

  const userRole: UserRole = userProfile?.role || 'viewer'
  const username = userProfile?.username || ''
  const canEditActs = userRole === 'admin' || userRole === 'editor'
  const isAdmin = userRole === 'admin'
  const isEditor = userRole === 'editor'

  const value = {
    user,
    userProfile,
    userRole,
    username,
    loading,
    signIn,
    signUp,
    signOut,
    updateUsername,
    updateUserRole,
    canEditActs,
    isAdmin,
    isEditor,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
