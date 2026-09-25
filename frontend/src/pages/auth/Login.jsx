import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogIn, Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useUIStore } from '../../stores/uiStore'
import { isValidEmail } from '../../utils/helpers'

export default function Login() {
  const navigate = useNavigate()
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
        <div className="text-center space-y-3">
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

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
