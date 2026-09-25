import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogIn, Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react'
import { useClerk, SignInButton } from '@clerk/react'
import { useAuth } from '../../hooks/useAuth'
import { useUIStore } from '../../stores/uiStore'
import { isValidEmail } from '../../utils/helpers'

export default function Login() {
  const navigate = useNavigate()
  const clerk = useClerk()
  const { handleLogin } = useAuth()
  const showNotification = useUIStore((state) => state.showNotification)
  
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.email.trim()) {
      newErrors.email = 'Email or username is required'
    } else if (formData.email.includes('@') && !isValidEmail(formData.email)) {
      newErrors.email = 'Invalid email format'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    }
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    const result = await handleLogin(formData.email, formData.password)
    setLoading(false)

    if (result.success) {
      showNotification('Welcome back!', 'success')
      navigate('/')
    } else {
      showNotification(result.error || 'Login failed. Check your credentials.', 'error')
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-slate-900">
      {/* Background Image with Red-Blue Glassmorphic Glow */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700 scale-105"
        style={{ backgroundImage: `url(/auth-bg.png)` }}
      />
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/30 via-slate-900/10 to-red-900/20 backdrop-blur-[2px]" />

      {/* Glassmorphic Auth Card */}
      <div className="relative z-10 w-full max-w-md bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-2xl border border-white/80 dark:border-slate-800 rounded-[32px] shadow-[0_25px_60px_-15px_rgba(15,23,42,0.15)] p-8 sm:p-10 space-y-6">
        
        {/* Top Header Badge & Title */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-white shadow-md border border-gray-100 dark:border-slate-800 flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400">
            <LogIn className="w-6 h-6 text-blue-600" />
          </div>

          <div className="space-y-1">
            <h1 className="font-sora font-extrabold text-2xl sm:text-3xl text-gray-900 dark:text-white tracking-tight flex items-center justify-center gap-2">
              Sign in to <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-crimson bg-clip-text text-transparent">Drishya</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-sora">
              Supercharge your creative workflow with AI.
            </p>
          </div>
        </div>

        {/* OAuth Social Buttons (Clerk Service Integration) */}
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            {/* Google OAuth Button */}
            <SignInButton mode="modal">
              <button
                type="button"
                className="w-full flex items-center justify-center py-2.5 px-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700 rounded-2xl transition-all shadow-sm group"
                title="Sign in with Google"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
              </button>
            </SignInButton>

            {/* Apple OAuth Button */}
            <SignInButton mode="modal">
              <button
                type="button"
                className="w-full flex items-center justify-center py-2.5 px-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700 rounded-2xl transition-all shadow-sm group"
                title="Sign in with Apple"
              >
                <svg className="w-5 h-5 fill-current text-gray-900 dark:text-white group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.85c.66-.8 1.11-1.92.99-3.04-.96.04-2.12.64-2.8 1.44-.61.71-1.14 1.86-1 2.97 1.08.08 2.16-.57 2.81-1.37z"/>
                </svg>
              </button>
            </SignInButton>

            {/* GitHub OAuth Button */}
            <SignInButton mode="modal">
              <button
                type="button"
                className="w-full flex items-center justify-center py-2.5 px-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700 rounded-2xl transition-all shadow-sm group"
                title="Sign in with GitHub"
              >
                <svg className="w-5 h-5 fill-current text-gray-900 dark:text-white group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
              </button>
            </SignInButton>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center pt-1">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-white/90 dark:bg-[#0F172A]/90 px-3 text-[11px] font-sora font-semibold text-gray-400 uppercase tracking-wider absolute">
              Or sign in with email
            </span>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Email / Username Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 font-sora">
              Email or Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-slate-50/80 dark:bg-slate-800/80 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-700/80 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl text-sm font-sans text-gray-900 dark:text-white placeholder-gray-400 transition-all"
                placeholder="you@example.com or username"
              />
            </div>
            {errors.email && <p className="text-crimson text-xs mt-1 font-medium">{errors.email}</p>}
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 font-sora">
                Password
              </label>
              <a href="#" onClick={(e) => { e.preventDefault(); showNotification('Password reset link sent to your email if registered.', 'info'); }} className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-11 py-3 bg-slate-50/80 dark:bg-slate-800/80 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-700/80 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl text-sm font-sans text-gray-900 dark:text-white placeholder-gray-400 transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-crimson text-xs mt-1 font-medium">{errors.password}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-crimson hover:from-blue-700 hover:to-red-700 text-white font-sora font-semibold text-sm rounded-2xl shadow-lg shadow-blue-600/20 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin" />
                Signing in...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Sign In <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-sora">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
