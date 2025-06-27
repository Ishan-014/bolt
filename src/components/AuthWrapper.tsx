import React, { useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, User, Mail, Lock, Eye, EyeOff, AlertCircle, Shield, TrendingUp, DollarSign } from 'lucide-react'
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900 flex">
      {/* Left Side - Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-blue-500/20" />
        <div className="absolute inset-0 bg-[url('/images/dialogBlur.svg')] opacity-10" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 py-16">
          <div className="mb-12">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-white to-primary bg-clip-text text-transparent mb-4">
              FinIQ.ai
            </h1>
            <p className="text-xl text-white/80 leading-relaxed">
              Your AI-powered financial mentor. Get personalized advice, upload documents, 
              and take control of your financial future.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="size-6 text-primary" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">Smart Financial Analysis</h3>
                <p className="text-white/60">AI-powered insights from your financial documents</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <DollarSign className="size-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">Personalized Advice</h3>
                <p className="text-white/60">Tailored recommendations for your financial goals</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Shield className="size-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">Bank-Level Security</h3>
                <p className="text-white/60">Your financial data is encrypted and protected</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">10K+</div>
              <div className="text-white/60 text-sm">Documents Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-1">95%</div>
              <div className="text-white/60 text-sm">User Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-1">24/7</div>
              <div className="text-white/60 text-sm">AI Availability</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-white bg-clip-text text-transparent mb-2">
              FinIQ.ai
            </h1>
            <p className="text-white/70">Your AI Financial Mentor</p>
          </div>

          {/* Auth Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-white/60">
                {isSignUp 
                  ? 'Start your financial journey today' 
                  : 'Sign in to continue your financial journey'
                }
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {isSignUp && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 size-5" />
                    <Input
                      ref={fullNameRef}
                      type="text"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, 'fullName')}
                      className="pl-12 h-12 bg-white/5 border-white/20 text-white placeholder-white/40 rounded-xl focus:border-primary/50 focus:ring-primary/20"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 size-5" />
                  <Input
                    ref={emailRef}
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, 'email')}
                    className="pl-12 h-12 bg-white/5 border-white/20 text-white placeholder-white/40 rounded-xl focus:border-primary/50 focus:ring-primary/20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 size-5" />
                  <Input
                    ref={passwordRef}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, 'password')}
                    className="pl-12 pr-12 h-12 bg-white/5 border-white/20 text-white placeholder-white/40 rounded-xl focus:border-primary/50 focus:ring-primary/20"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
                {isSignUp && (
                  <p className="text-xs text-white/50">Password must be at least 6 characters long</p>
                )}
              </div>

              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <AlertCircle className="size-5 flex-shrink-0 mt-0.5 text-red-400" />
                  <span className="text-red-300 text-sm">{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <AlertCircle className="size-5 flex-shrink-0 mt-0.5 text-green-400" />
                  <span className="text-green-300 text-sm">{success}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-primary to-blue-500 hover:from-primary/80 hover:to-blue-500/80 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <Loader2 className="size-5 animate-spin mr-2" />
                ) : null}
                {isSignUp ? 'Create Account' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError(null)
                  setSuccess(null)
                  setPassword('')
                }}
                className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
              >
                {isSignUp 
                  ? 'Already have an account? Sign in' 
                  : "Don't have an account? Sign up"
                }
              </button>
            </div>

            {/* Keyboard Navigation Hint */}
            <div className="mt-6 text-center">
              <p className="text-white/30 text-xs">
                💡 Use ↑↓ arrow keys to navigate between fields
              </p>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center gap-2 text-white/40 text-xs mb-2">
              <Shield className="size-4" />
              <span>Your data is encrypted and secure</span>
            </div>
            <p className="text-white/30 text-xs">
              We never share your financial information with third parties
            </p>
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900 flex items-center justify-center">
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