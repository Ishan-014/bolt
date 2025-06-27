import React, { useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, User, Mail, Lock, Eye, EyeOff, AlertCircle, Shield, TrendingUp, DollarSign, Sparkles, BarChart3, Target } from 'lucide-react'
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Left Side - Enhanced Branding & Features */}
      <div className="hidden lg:flex lg:w-3/5 relative z-10">
        <div className="flex flex-col justify-center px-16 py-20 w-full">
          {/* Logo Section */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="size-7 text-white" />
              </div>
              <h1 className="text-6xl font-bold bg-gradient-to-r from-primary via-blue-400 to-purple-400 bg-clip-text text-transparent">
                FinIQ.ai
              </h1>
            </div>
            <p className="text-2xl text-white/90 leading-relaxed font-light">
              Transform your financial future with AI-powered insights and personalized guidance
            </p>
            <div className="mt-6 flex items-center gap-2 text-primary/80">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-sm font-medium">Trusted by 10,000+ users worldwide</span>
            </div>
          </div>

          {/* Enhanced Feature Cards */}
          <div className="space-y-8">
            <div className="group flex items-start gap-6 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="size-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-xl mb-2">Smart Financial Analysis</h3>
                <p className="text-white/70 leading-relaxed">Advanced AI algorithms analyze your financial documents to provide actionable insights and recommendations tailored to your unique situation.</p>
              </div>
            </div>

            <div className="group flex items-start gap-6 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Target className="size-8 text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-xl mb-2">Goal-Oriented Planning</h3>
                <p className="text-white/70 leading-relaxed">Set and track your financial goals with personalized roadmaps, milestone tracking, and adaptive strategies that evolve with your progress.</p>
              </div>
            </div>

            <div className="group flex items-start gap-6 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-purple-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Shield className="size-8 text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-xl mb-2">Enterprise Security</h3>
                <p className="text-white/70 leading-relaxed">Bank-grade encryption, zero-knowledge architecture, and compliance with financial industry standards ensure your data stays private and secure.</p>
              </div>
            </div>
          </div>

          {/* Enhanced Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                10K+
              </div>
              <div className="text-white/60 text-sm font-medium">Documents Analyzed</div>
            </div>
            <div className="text-center group">
              <div className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                95%
              </div>
              <div className="text-white/60 text-sm font-medium">User Satisfaction</div>
            </div>
            <div className="text-center group">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                24/7
              </div>
              <div className="text-white/60 text-sm font-medium">AI Availability</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Enhanced Auth Form */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-lg">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-500 rounded-xl flex items-center justify-center">
                <Sparkles className="size-6 text-white" />
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                FinIQ.ai
              </h1>
            </div>
            <p className="text-white/70 text-lg">Your AI Financial Mentor</p>
          </div>

          {/* Enhanced Auth Card */}
          <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-10 shadow-2xl relative overflow-hidden">
            {/* Card Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5 rounded-3xl" />
            
            <div className="relative z-10">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-white mb-3">
                  {isSignUp ? 'Create Your Account' : 'Welcome Back'}
                </h2>
                <p className="text-white/70 text-lg">
                  {isSignUp 
                    ? 'Join thousands of users transforming their finances' 
                    : 'Continue your journey to financial freedom'
                  }
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {isSignUp && (
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-white/90 flex items-center gap-2">
                      <User className="size-4" />
                      Full Name
                    </label>
                    <div className="relative group">
                      <Input
                        ref={fullNameRef}
                        type="text"
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, 'fullName')}
                        className="h-14 bg-white/10 border-white/30 text-white placeholder-white/50 rounded-2xl focus:border-primary/60 focus:ring-primary/30 transition-all duration-300 group-hover:bg-white/15"
                        required
                      />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 to-blue-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-white/90 flex items-center gap-2">
                    <Mail className="size-4" />
                    Email Address
                  </label>
                  <div className="relative group">
                    <Input
                      ref={emailRef}
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, 'email')}
                      className="h-14 bg-white/10 border-white/30 text-white placeholder-white/50 rounded-2xl focus:border-primary/60 focus:ring-primary/30 transition-all duration-300 group-hover:bg-white/15"
                      required
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 to-blue-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-white/90 flex items-center gap-2">
                    <Lock className="size-4" />
                    Password
                  </label>
                  <div className="relative group">
                    <Input
                      ref={passwordRef}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, 'password')}
                      className="h-14 pr-14 bg-white/10 border-white/30 text-white placeholder-white/50 rounded-2xl focus:border-primary/60 focus:ring-primary/30 transition-all duration-300 group-hover:bg-white/15"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors duration-200"
                    >
                      {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                    </button>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 to-blue-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
                  </div>
                  {isSignUp && (
                    <p className="text-xs text-white/60 flex items-center gap-2">
                      <Shield className="size-3" />
                      Minimum 6 characters required
                    </p>
                  )}
                </div>

                {error && (
                  <div className="flex items-start gap-3 p-5 bg-red-500/20 border border-red-500/30 rounded-2xl backdrop-blur-sm">
                    <AlertCircle className="size-5 flex-shrink-0 mt-0.5 text-red-300" />
                    <span className="text-red-200 text-sm leading-relaxed">{error}</span>
                  </div>
                )}

                {success && (
                  <div className="flex items-start gap-3 p-5 bg-green-500/20 border border-green-500/30 rounded-2xl backdrop-blur-sm">
                    <AlertCircle className="size-5 flex-shrink-0 mt-0.5 text-green-300" />
                    <span className="text-green-200 text-sm leading-relaxed">{success}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 bg-gradient-to-r from-primary via-blue-500 to-purple-500 hover:from-primary/90 hover:via-blue-500/90 hover:to-purple-500/90 text-white font-bold text-lg rounded-2xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {isLoading ? (
                    <Loader2 className="size-6 animate-spin mr-3" />
                  ) : null}
                  <span className="relative z-10">
                    {isSignUp ? 'Create Account' : 'Sign In'}
                  </span>
                </Button>
              </form>

              <div className="mt-10 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp)
                    setError(null)
                    setSuccess(null)
                    setPassword('')
                  }}
                  className="text-primary hover:text-primary/80 text-sm font-semibold transition-colors duration-200 relative group"
                >
                  <span className="relative z-10">
                    {isSignUp 
                      ? 'Already have an account? Sign in' 
                      : "Don't have an account? Sign up"
                    }
                  </span>
                  <div className="absolute inset-0 bg-primary/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10" />
                </button>
              </div>

              {/* Enhanced Keyboard Navigation Hint */}
              <div className="mt-8 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                  <div className="flex gap-1">
                    <kbd className="px-2 py-1 bg-white/10 rounded text-xs text-white/70">↑</kbd>
                    <kbd className="px-2 py-1 bg-white/10 rounded text-xs text-white/70">↓</kbd>
                  </div>
                  <span className="text-white/50 text-xs">Navigate between fields</span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Security Notice */}
          <div className="mt-10 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
              <Shield className="size-5 text-primary" />
              <div className="text-left">
                <div className="text-white/80 text-sm font-medium">Bank-Grade Security</div>
                <div className="text-white/50 text-xs">End-to-end encryption • Zero data sharing</div>
              </div>
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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center relative overflow-hidden">
        {/* Loading Background Animation */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        
        <div className="text-center relative z-10">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-blue-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
            <Loader2 className="size-8 animate-spin text-white" />
          </div>
          <h3 className="text-white text-xl font-semibold mb-2">Loading FinIQ.ai</h3>
          <p className="text-white/60">Preparing your financial dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  return <>{children}</>
}