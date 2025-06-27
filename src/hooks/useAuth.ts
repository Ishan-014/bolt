import { useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error)
      }
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session?.user?.email)
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      console.log('Attempting to sign up with email:', email)
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) {
        console.error('Supabase Auth Error (Sign Up):', error)
        throw error
      }

      console.log('Sign up successful:', data.user?.email)

      // Create user profile - only if user was created successfully
      if (data.user && !data.user.email_confirmed_at) {
        console.log('User created but email not confirmed yet')
        // For development, we'll still create the profile
        try {
          const { error: profileError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: data.user.email!,
              full_name: fullName || null,
            })

          if (profileError) {
            console.error('Profile creation error:', profileError)
            // Don't throw here as the user was created successfully
          } else {
            console.log('User profile created successfully')
          }
        } catch (profileErr) {
          console.error('Profile creation failed:', profileErr)
        }
      }

      return data
    } catch (error) {
      console.error('Sign up failed:', error)
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in with email:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Supabase Auth Error (Sign In):', error)
        throw error
      }

      console.log('Sign in successful:', data.user?.email)
      return data
    } catch (error) {
      console.error('Sign in failed:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      console.log('Attempting to sign out')
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
        throw error
      }
      console.log('Sign out successful')
    } catch (error) {
      console.error('Sign out failed:', error)
      throw error
    }
  }

  const resetPassword = async (email: string) => {
    try {
      console.log('Attempting password reset for email:', email)
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) {
        console.error('Password reset error:', error)
        throw error
      }
      console.log('Password reset email sent')
    } catch (error) {
      console.error('Password reset failed:', error)
      throw error
    }
  }

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  }
}