import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus, User, Mail, AtSign, Lock, Eye, EyeOff, UploadCloud, CheckCircle2, Sparkles, ArrowRight, Image as ImageIcon } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useUIStore } from '../../stores/uiStore'
import { isValidEmail, isValidUsername, isValidPassword } from '../../utils/helpers'

export default function Register() {
  const navigate = useNavigate()
  const { handleRegister } = useAuth()
  const showNotification = useUIStore((state) => state.showNotification)
  
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    username: '',
    password: ''
  })
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [coverImageFile, setCoverImageFile] = useState(null)
  const [coverPreviewName, setCoverPreviewName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
      setErrors(prev => ({ ...prev, avatar: '' }))
    }
  }

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverImageFile(file)
      setCoverPreviewName(file.name)
    }
  }

  const validate = () => {
    const newErrors = {}
    
    if (!formData.fullname.trim()) {
      newErrors.fullname = 'Full name is required'
    } else if (formData.fullname.trim().length < 2) {
      newErrors.fullname = 'Full name must be at least 2 characters'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Invalid email format'
    }
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
    } else if (!isValidUsername(formData.username)) {
      newErrors.username = 'Username must be 3+ chars, alphanumeric & underscore only'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (!isValidPassword(formData.password)) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (!avatarFile) {
      newErrors.avatar = 'Avatar image is required'
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
    const payload = new FormData()
    payload.append('fullname', formData.fullname)
    payload.append('email', formData.email)
    payload.append('username', formData.username)
    payload.append('password', formData.password)
    payload.append('avatar', avatarFile)
    if (coverImageFile) {
      payload.append('coverImage', coverImageFile)
    }

    const result = await handleRegister(payload)
    setLoading(false)

    if (result.success) {
      showNotification('Account created successfully!', 'success')
      navigate('/')
    } else {
      showNotification(result.error || 'Registration failed.', 'error')
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 overflow-x-hidden my-4 sm:my-8 bg-slate-900">
      {/* Background Image with Red-Blue Glassmorphic Glow */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700 scale-105"
        style={{ backgroundImage: `url(/auth-bg.png)` }}
      />
      <div className="fixed inset-0 bg-gradient-to-tr from-blue-900/30 via-slate-900/10 to-red-900/20 backdrop-blur-[2px]" />

      {/* Glassmorphic Auth Card */}
      <div className="relative z-10 w-full max-w-lg bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-2xl border border-white/80 dark:border-slate-800 rounded-[32px] shadow-[0_25px_60px_-15px_rgba(15,23,42,0.15)] p-6 sm:p-10 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-white shadow-md border border-gray-100 dark:border-slate-800 flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400">
            <UserPlus className="w-6 h-6 text-blue-600" />
          </div>

          <div className="space-y-1">
            <h1 className="font-sora font-extrabold text-2xl sm:text-3xl text-gray-900 dark:text-white tracking-tight flex items-center justify-center gap-2">
              Join <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-crimson bg-clip-text text-transparent">Drishya</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-sora">
              Create your account to start generating & sharing content.
            </p>
          </div>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 font-sora">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="fullname"
                value={formData.fullname}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/80 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-700/80 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl text-sm font-sans text-gray-900 dark:text-white placeholder-gray-400 transition-all"
                placeholder="John Doe"
              />
            </div>
            {errors.fullname && <p className="text-crimson text-xs mt-1 font-medium">{errors.fullname}</p>}
          </div>

          {/* Email Address */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 font-sora">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/80 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-700/80 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl text-sm font-sans text-gray-900 dark:text-white placeholder-gray-400 transition-all"
                placeholder="you@example.com"
              />
            </div>
            {errors.email && <p className="text-crimson text-xs mt-1 font-medium">{errors.email}</p>}
          </div>

          {/* Username */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 font-sora">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <AtSign className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/80 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-700/80 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl text-sm font-sans text-gray-900 dark:text-white placeholder-gray-400 transition-all"
                placeholder="chai_wala"
              />
            </div>
            {errors.username && <p className="text-crimson text-xs mt-1 font-medium">{errors.username}</p>}
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 font-sora">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-11 py-2.5 bg-slate-50/80 dark:bg-slate-800/80 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-700/80 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl text-sm font-sans text-gray-900 dark:text-white placeholder-gray-400 transition-all"
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

          {/* Avatar Upload Dropzone */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 font-sora">
              Avatar Image <span className="text-crimson">*</span>
            </label>
            <label className="relative flex items-center justify-between p-3 bg-slate-50/80 dark:bg-slate-800/80 hover:bg-blue-50/50 dark:hover:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl cursor-pointer transition-all">
              <div className="flex items-center gap-3">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar Preview" className="w-10 h-10 rounded-full object-cover border border-blue-500" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                )}
                <div className="text-left">
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                    {avatarFile ? avatarFile.name : 'Choose Avatar Image'}
                  </p>
                  <p className="text-[11px] text-gray-400">PNG, JPG, WEBP up to 5MB</p>
                </div>
              </div>
              {avatarFile ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              ) : (
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40 px-2.5 py-1 rounded-xl">Browse</span>
              )}
              <input type="file" name="avatar" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
            {errors.avatar && <p className="text-crimson text-xs mt-1 font-medium">{errors.avatar}</p>}
          </div>

          {/* Cover Image Upload (Optional) */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 font-sora">
              Cover Image <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <label className="relative flex items-center justify-between p-3 bg-slate-50/80 dark:bg-slate-800/80 hover:bg-blue-50/50 dark:hover:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl cursor-pointer transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                    {coverPreviewName || 'Choose Banner/Cover Image'}
                  </p>
                  <p className="text-[11px] text-gray-400">Banner for your channel</p>
                </div>
              </div>
              {coverImageFile ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              ) : (
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 px-2.5 py-1 rounded-xl">Browse</span>
              )}
              <input type="file" name="coverImage" accept="image/*" onChange={handleCoverChange} className="hidden" />
            </label>
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
                Creating Account...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Create Account <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-sora">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
