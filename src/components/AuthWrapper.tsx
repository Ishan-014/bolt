import React, { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, User, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AuthWrapperProps {
  children: React.ReactNode
}

const AuthForm: React.FC = () => {
  const { signIn, signUp, loading } = useAuth()
  const [isSignUp, setIsSignUp] = React.useState(false)
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [fullName, setFullName] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    // Basic validation
    if (!email || !password) {
      setError('Please fill in all required fields')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setIsLoading(false)
      return
    }

    if (isSignUp && !fullName.trim()) {
      setError('Please enter your full name')
      setIsLoading(false)
      return
    }

    try {
      if (isSignUp) {
        console.log('Starting sign up process...')
        await signUp(email, password, fullName)
        setSuccess('Account created successfully! You can now sign in.')
        // Switch to sign in mode after successful signup
        setIsSignUp(false)
        setPassword('')
      } else {
        console.log('Starting sign in process...')
        await signIn(email, password)
        setSuccess('Signed in successfully!')
      }
    } catch (err: any) {
      console.error('Authentication error:', err)
      
      // Handle specific error messages
      let errorMessage = 'Authentication failed'
      
      if (err.message) {
        if (err.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.'
        } else if (err.message.includes('User already registered')) {
          errorMessage = 'An account with this email already exists. Please sign in instead.'
          setIsSignUp(false)
        } else if (err.message.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and click the confirmation link before signing in.'
        } else if (err.message.includes('Password should be at least 6 characters')) {
          errorMessage = 'Password must be at least 6 characters long.'
        } else if (err.message.includes('Unable to validate email address')) {
          errorMessage = 'Please enter a valid email address.'
        } else if (err.message.includes('signup is disabled')) {
          errorMessage = 'New user registration is currently disabled. Please contact support.'
        } else {
          errorMessage = err.message
        }
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGuestAccess = async () => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Create a temporary guest account with a simpler approach
      const timestamp = Date.now()
      const randomId = Math.random().toString(36).substring(7)
      const guestEmail = `guest_${timestamp}_${randomId}@finiq.ai`
      const guestPassword = `guest_${randomId}_${timestamp}`
      
      console.log('Creating guest account with email:', guestEmail)
      
      // First, try to sign up the guest user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: guestEmail,
        password: guestPassword,
        options: {
          data: {
            full_name: 'Guest User',
          },
        },
      })

      if (signUpError) {
        console.error('Guest signup error:', signUpError)
        throw new Error(`Failed to create guest account: ${signUpError.message}`)
      }

      console.log('Guest signup successful:', signUpData)
      
      // If signup was successful and user is immediately available (no email confirmation)
      if (signUpData.user && signUpData.session) {
        console.log('Guest user signed in immediately')
        setSuccess('Guest account created and signed in successfully!')
        
        // Create user profile
        try {
          const { error: profileError } = await supabase
            .from('users')
            .insert({
              id: signUpData.user.id,
              email: signUpData.user.email!,
              full_name: 'Guest User',
            })

          if (profileError) {
            console.error('Profile creation error:', profileError)
            // Don't throw here as the user is already signed in
          } else {
            console.log('Guest user profile created successfully')
          }
        } catch (profileErr) {
          console.error('Profile creation failed:', profileErr)
          // Don't throw here as the user is already signed in
        }
        
        return
      }

      // If email confirmation is required, try to sign in anyway
      if (signUpData.user && !signUpData.session) {
        console.log('Email confirmation required, attempting sign in...')
        
        // Wait a moment for the user to be fully created
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        try {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: guestEmail,
            password: guestPassword,
          })

          if (signInError) {
            console.error('Guest sign in error:', signInError)
            
            // If email not confirmed, show a helpful message
            if (signInError.message.includes('Email not confirmed')) {
              setError('Guest account created but email confirmation is required. Please disable email confirmation in your Supabase settings or try manual signup.')
            } else {
              throw new Error(`Failed to sign in: ${signInError.message}`)
            }
            return
          }

          if (signInData.user) {
            console.log('Guest sign in successful')
            setSuccess('Guest account created and signed in successfully!')
            
            // Create user profile
            try {
              const { error: profileError } = await supabase
                .from('users')
                .insert({
                  id: signInData.user.id,
                  email: signInData.user.email!,
                  full_name: 'Guest User',
                })

              if (profileError) {
                console.error('Profile creation error:', profileError)
                // Don't throw here as the user is already signed in
              } else {
                console.log('Guest user profile created successfully')
              }
            } catch (profileErr) {
              console.error('Profile creation failed:', profileErr)
              // Don't throw here as the user is already signed in
            }
          }
        } catch (signInErr) {
          console.error('Guest sign in failed:', signInErr)
          throw signInErr
        }
      }
      
    } catch (err: any) {
      console.error('Guest access error:', err)
      setError(`Failed to create guest account: ${err.message || 'Unknown error'}. Please try signing up manually.`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-black/40 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-white bg-clip-text text-transparent mb-2">
              FinIQ.ai
            </h1>
            <p className="text-white/70">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 size-4" />
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10 bg-black/20 border-white/10 text-white placeholder-white/40"
                  required
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 size-4" />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-black/20 border-white/10 text-white placeholder-white/40"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 size-4" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 bg-black/20 border-white/10 text-white placeholder-white/40"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                <AlertCircle className="size-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-start gap-2 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200 text-sm">
                <AlertCircle className="size-4 flex-shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/80 text-white font-semibold py-3"
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : null}
              {isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-black text-white/60">or</span>
              </div>
            </div>

            <Button
              onClick={handleGuestAccess}
              disabled={isLoading}
              variant="outline"
              className="w-full mt-4 border-white/20 text-white hover:bg-white/10"
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : null}
              Continue as Guest
            </Button>
          </div>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError(null)
                setSuccess(null)
              }}
              className="text-primary hover:text-primary/80 text-sm font-medium"
            >
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Sign up"
              }
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-white/40">
          <p>Your files are securely stored and encrypted.</p>
          <p>We never share your financial data with third parties.</p>
        </div>
      </div>
    </div>
  )
}

export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { user, loading } = useAuth()

  // Auto-create user profile if it doesn't exist
  useEffect(() => {
    const createUserProfile = async () => {
      if (user) {
        try {
          const { data: existingProfile } = await supabase
            .from('users')
            .select('id')
            .eq('id', user.id)
            .single()

          if (!existingProfile) {
            console.log('Creating user profile for:', user.email)
            const { error } = await supabase
              .from('users')
              .insert({
                id: user.id,
                email: user.email!,
                full_name: user.user_metadata?.full_name || null,
              })
            
            if (error) {
              console.error('Error creating user profile:', error)
            } else {
              console.log('User profile created successfully')
            }
          }
        } catch (error) {
          console.error('Error checking/creating user profile:', error)
        }
      }
    }

    createUserProfile()
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="size-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-white/70">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  return <>{children}</>
}