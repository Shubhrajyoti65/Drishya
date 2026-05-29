import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
  const [coverImageFile, setCoverImageFile] = useState(null)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleFileChange = (e) => {
    const { name, files } = e.target
    const file = files?.[0] || null
    if (name === 'avatar') {
      setAvatarFile(file)
      setErrors(prev => ({ ...prev, avatar: '' }))
    }
    if (name === 'coverImage') {
      setCoverImageFile(file)
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
      newErrors.username = 'Username must be 3+ chars, alphanumeric and underscore only'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (!isValidPassword(formData.password)) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (!avatarFile) {
      newErrors.avatar = 'Avatar is required'
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
      showNotification(result.error, 'error')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">Drishya</h1>
        <p className="text-center text-gray-600 mb-6">Create your account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="John Doe"
            />
            {errors.fullname && <p className="text-red-500 text-sm mt-1">{errors.fullname}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="you@example.com"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="johndoe"
            />
            {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Avatar (required)
            </label>
            <input
              type="file"
              name="avatar"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            {errors.avatar && <p className="text-red-500 text-sm mt-1">{errors.avatar}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cover Image (optional)
            </label>
            <input
              type="file"
              name="coverImage"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
