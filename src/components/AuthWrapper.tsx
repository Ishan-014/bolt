import React, { useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, User, Mail, Lock, Eye, EyeOff, AlertCircle, TrendingUp, Shield, Zap, Users } from 'lucide-react'
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

  // Refs for form inputs
  const fullNameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, currentField: 'fullName' | 'email' | 'password') => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (currentField === 'fullName' && emailRef.current) {
        emailRef.current.focus()
      } else if (currentField === 'email' && passwordRef.current) {
        passwordRef.current.focus()
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (currentField === 'password' && emailRef.current) {
        emailRef.current.focus()
      } else if (currentField === 'email' && isSignUp && fullNameRef.current) {
        fullNameRef.current.focus()
      }
    }
  }

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

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Left Side - Enhanced Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-32 h-32 bg-emerald-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-40 right-20 w-40 h-40 bg-emerald-400 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-emerald-600 rounded-full blur-2xl"></div>
        </div>
        
        <div className="flex flex-col justify-center px-16 py-20 w-full relative z-10">
          {/* Logo Section */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="size-7 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent">
                FinIQ.ai
              </h1>
            </div>
            <p className="text-xl text-gray-300 leading-relaxed max-w-md">
              Your AI financial mentor for smarter money decisions and long-term wealth building.
            </p>
          </div>

          {/* Enhanced Feature List */}
          <div className="space-y-6 mb-12">
            <div className="flex items-center gap-4 group">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
                <Zap className="size-5 text-emerald-400" />
              </div>
              <div>
                <span className="text-white font-medium">AI-powered financial analysis</span>
                <p className="text-gray-400 text-sm">Get instant insights from your financial data</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
                <TrendingUp className="size-5 text-emerald-400" />
              </div>
              <div>
                <span className="text-white font-medium">Personalized investment advice</span>
                <p className="text-gray-400 text-sm">Tailored strategies for your goals</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
                <Shield className="size-5 text-emerald-400" />
              </div>
              <div>
                <span className="text-white font-medium">Secure document analysis</span>
                <p className="text-gray-400 text-sm">Bank-level security for your data</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
                <Users className="size-5 text-emerald-400" />
              </div>
              <div>
                <span className="text-white font-medium">24/7 financial guidance</span>
                <p className="text-gray-400 text-sm">Always available when you need help</p>
              </div>
            </div>
          </div>

          {/* Enhanced Stats */}
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-400 mb-1">10K+</div>
              <div className="text-gray-400 text-sm">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-400 mb-1">95%</div>
              <div className="text-gray-400 text-sm">Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-400 mb-1">$2M+</div>
              <div className="text-gray-400 text-sm">Managed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Enhanced Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-900">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="size-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent">
                FinIQ.ai
              </h1>
            </div>
          </div>

          {/* Auth Card */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 shadow-2xl">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-2">
                {isSignUp ? 'Join FinIQ.ai' : 'Welcome back'}
              </h2>
              <p className="text-gray-400">
                {isSignUp 
                  ? 'Create your account to get started with AI financial guidance' 
                  : 'Sign in to access your financial dashboard'
                }
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {isSignUp && (
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
                    Full name
                  </label>
                  <Input
                    ref={fullNameRef}
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, 'fullName')}
                    className="h-12 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200"
                    required
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email address
                </label>
                <Input
                  ref={emailRef}
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, 'email')}
                  className="h-12 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Input
                    ref={passwordRef}
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, 'password')}
                    className="h-12 pr-12 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
                {isSignUp && (
                  <p className="text-xs text-gray-500 mt-1">
                    Must be at least 6 characters
                  </p>
                )}
              </div>

              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-900/50 border border-red-700/50 rounded-lg">
                  <AlertCircle className="size-5 flex-shrink-0 mt-0.5 text-red-400" />
                  <span className="text-red-300 text-sm">{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-start gap-3 p-4 bg-emerald-900/50 border border-emerald-700/50 rounded-lg">
                  <AlertCircle className="size-5 flex-shrink-0 mt-0.5 text-emerald-400" />
                  <span className="text-emerald-300 text-sm">{success}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-emerald-500/25"
              >
                {isLoading ? (
                  <Loader2 className="size-5 animate-spin mr-2" />
                ) : null}
                {isSignUp ? 'Create account' : 'Sign in'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError(null)
                  setSuccess(null)
                  setPassword('')
                }}
                className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors"
              >
                {isSignUp 
                  ? 'Already have an account? Sign in' 
                  : "New to FinIQ.ai? Join now"
                }
              </button>
            </div>

            {/* Keyboard Navigation Hint */}
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 text-xs text-gray-500">
                <kbd className="px-2 py-1 bg-gray-700 rounded text-gray-400 border border-gray-600">↑</kbd>
                <kbd className="px-2 py-1 bg-gray-700 rounded text-gray-400 border border-gray-600">↓</kbd>
                <span>Navigate fields</span>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 text-xs text-gray-500">
              <Shield className="size-3" />
              <span>Secured with bank-level encryption</span>
            </div>
          </div>
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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 mx-auto shadow-lg">
            <Loader2 className="size-6 animate-spin text-white" />
          </div>
          <h3 className="text-white text-lg font-medium mb-2">Loading FinIQ.ai</h3>
          <p className="text-gray-400">Preparing your financial dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  return <>{children}</>
}