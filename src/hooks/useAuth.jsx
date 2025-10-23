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
    
    console.log('fetchUserProfile START - userId:', userId);
    
    try {
      console.log('fetchUserProfile - bypassing for now');

      return {
        username: 'temp_user',
        role: 'viewer'
      };
    } catch (error) {
      console.error('fetchUserProfile - Exception caught:', error);
      return null
    }
  }

  useEffect(() => {
    let mounted = true;
    
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }
        
        console.log('Initial session:', session);
        setUser(session?.user ?? null);
        
        
        if (mounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    initializeAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session);
      console.log('Auth state change mounted', mounted);
      if (!mounted) return;
      
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        if (mounted) {
          setUserProfile(profile);
        }
      } else {
        setUserProfile(null);
      }
      
      if (mounted) {
        setLoading(false);
      }
    });
    
    return () => {
      console.log('useAuth useEffect return');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

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
