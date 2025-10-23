import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../utils/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Function to fetch user profile including role and username
  const fetchUserProfile = async (userId) => {
    if (!userId) return null
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('username, role')
      .eq('id', userId)
      .single()
    
    if (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
    
    return data
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id)
        setUserProfile(profile)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id)
        setUserProfile(profile)
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signUp = async (email, password, username) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    
    // If signup successful, update the user profile with the provided username
    if (data?.user && !error) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ username })
        .eq('id', data.user.id)
      
      if (profileError) {
        console.error('Error updating user profile:', profileError)
        return { data, error: profileError }
      }
    }
    
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  // Function to update username
  const updateUsername = async (newUsername) => {
    if (!user) return { error: new Error('No user logged in') }
    
    const { error } = await supabase
      .from('user_profiles')
      .update({ username: newUsername })
      .eq('id', user.id)
    
    if (!error) {
      // Refresh user profile
      const profile = await fetchUserProfile(user.id)
      setUserProfile(profile)
    }
    
    return { error }
  }

  // Function to update user role (admin only)
  const updateUserRole = async (userId, newRole) => {
    const { error } = await supabase
      .from('user_profiles')
      .update({ role: newRole })
      .eq('id', userId)
    
    return { error }
  }

  // Computed values for role-based permissions
  const userRole = userProfile?.role || 'viewer'
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
