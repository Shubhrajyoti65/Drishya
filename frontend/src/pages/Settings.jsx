import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../context/ThemeContext'
import { authAPI, videoAPI, membershipTierAPI } from '../services/api'
import { 
  User, 
  Image, 
  Key, 
  Video, 
  Shield, 
  Upload, 
  Lock, 
  Globe, 
  Crown, 
  Edit2, 
  Trash2, 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Camera,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react'

export default function Settings() {
  const { user, setUser } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const [activeTab, setActiveTab] = useState('account') // 'account', 'security', 'videos', 'privacy'

  // Account / Profile State
  const [profileForm, setProfileForm] = useState({
    fullname: user?.fullname || '',
    username: user?.username || '',
    email: user?.email || '',
  })
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' })

  // Avatar State
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '')
  const [avatarLoading, setAvatarLoading] = useState(false)

  // Cover Image State
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState(user?.coverImage || '')
  const [coverLoading, setCoverLoading] = useState(false)

  // Password State
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' })

  // Videos State
  const [userVideos, setUserVideos] = useState([])
  const [creatorTiers, setCreatorTiers] = useState([])
  const [videosLoading, setVideosLoading] = useState(false)

  // Video Edit Modal State
  const [editingVideo, setEditingVideo] = useState(null)
  const [videoForm, setVideoForm] = useState({
    title: '',
    description: '',
    visibility: 'PUBLIC',
    minimumTier: '',
    thumbnailFile: null,
    thumbnailPreview: '',
  })
  const [videoSaveLoading, setVideoSaveLoading] = useState(false)
  const [videoEditMsg, setVideoEditMsg] = useState({ type: '', text: '' })

  // Privacy State
  const [privacySettings, setPrivacySettings] = useState({
    isPrivate: false,
    allowComments: true,
  })

  // Sync user state on load
  useEffect(() => {
    if (user) {
      setProfileForm({
        fullname: user.fullname || '',
        username: user.username || '',
        email: user.email || '',
      })
      setAvatarPreview(user.avatar || '')
      setCoverPreview(user.coverImage || '')
    }
  }, [user])

  // Fetch Videos & Creator Tiers when videos tab active
  useEffect(() => {
    if (activeTab === 'videos' && user?._id) {
      fetchUserVideos()
      fetchCreatorTiers()
    }
  }, [activeTab, user])

  const fetchUserVideos = async () => {
    try {
      setVideosLoading(true)
      const res = await videoAPI.getVideos(1, 50, 'createdAt', 'desc', user._id)
      setUserVideos(res.data.data?.docs || res.data.data?.videos || [])
    } catch (err) {
      console.error('Failed to fetch user videos:', err)
    } finally {
      setVideosLoading(false)
    }
  }

  const fetchCreatorTiers = async () => {
    try {
      const res = await membershipTierAPI.getCreatorTiers(user._id)
      setCreatorTiers(res.data.data || [])
    } catch (err) {
      console.error('Failed to fetch creator tiers:', err)
    }
  }

  // Handle Profile Update
  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setProfileMsg({ type: '', text: '' })

    try {
      setProfileLoading(true)
      const res = await authAPI.updateProfile(profileForm)
      const updatedUser = res.data.data
      
      // Update local storage and auth context
      const stored = localStorage.getItem('user')
      if (stored) {
        const parsed = JSON.parse(stored)
        localStorage.setItem('user', JSON.stringify({ ...parsed, ...updatedUser }))
      }
      if (setUser) setUser((prev) => ({ ...prev, ...updatedUser }))

      setProfileMsg({ type: 'success', text: 'Account details updated successfully!' })
    } catch (err) {
      console.error('Profile update failed:', err)
      setProfileMsg({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to update account details.' 
      })
    } finally {
      setProfileLoading(false)
    }
  }

  // Handle Avatar Update
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleSaveAvatar = async () => {
    if (!avatarFile) return
    try {
      setAvatarLoading(true)
      const formData = new FormData()
      formData.append('avatar', avatarFile)

      const res = await authAPI.updateAvatar(formData)
      const updatedAvatar = res.data.data?.avatar

      // Update auth state
      const stored = localStorage.getItem('user')
      if (stored) {
        const parsed = JSON.parse(stored)
        localStorage.setItem('user', JSON.stringify({ ...parsed, avatar: updatedAvatar }))
      }
      if (setUser) setUser((prev) => ({ ...prev, avatar: updatedAvatar }))

      setAvatarFile(null)
      setProfileMsg({ type: 'success', text: 'Avatar photo updated successfully!' })
    } catch (err) {
      console.error('Avatar update failed:', err)
      setProfileMsg({ type: 'error', text: 'Failed to update avatar photo.' })
    } finally {
      setAvatarLoading(false)
    }
  }

  // Handle Cover Image Update
  const handleCoverChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverFile(file)
      setCoverPreview(URL.createObjectURL(file))
    }
  }

  const handleSaveCover = async () => {
    if (!coverFile) return
    try {
      setCoverLoading(true)
      const formData = new FormData()
      formData.append('coverImage', coverFile)

      const res = await authAPI.updateCoverImage(formData)
      const updatedCover = res.data.data?.coverImage

      // Update auth state
      const stored = localStorage.getItem('user')
      if (stored) {
        const parsed = JSON.parse(stored)
        localStorage.setItem('user', JSON.stringify({ ...parsed, coverImage: updatedCover }))
      }
      if (setUser) setUser((prev) => ({ ...prev, coverImage: updatedCover }))

      setCoverFile(null)
      setProfileMsg({ type: 'success', text: 'Channel cover banner updated successfully!' })
    } catch (err) {
      console.error('Cover update failed:', err)
      setProfileMsg({ type: 'error', text: 'Failed to update cover banner.' })
    } finally {
      setCoverLoading(false)
    }
  }

  // Handle Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPasswordMsg({ type: '', text: '' })

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match' })
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters' })
      return
    }

    try {
      setPasswordLoading(true)
      await authAPI.changePassword(passwordForm.oldPassword, passwordForm.newPassword)
      setPasswordMsg({ type: 'success', text: 'Password updated successfully!' })
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      console.error('Password change failed:', err)
      setPasswordMsg({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to update password. Check old password.' 
      })
    } finally {
      setPasswordLoading(false)
    }
  }

  // Video Edit Modal Handlers
  const handleOpenEditVideo = (video) => {
    setEditingVideo(video)
    setVideoForm({
      title: video.title || '',
      description: video.description || '',
      visibility: video.visibility || 'PUBLIC',
      minimumTier: video.minimumTier?._id || video.minimumTier || '',
      thumbnailFile: null,
      thumbnailPreview: video.thumbnail || '',
    })
    setVideoEditMsg({ type: '', text: '' })
  }

  const handleVideoThumbnailChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setVideoForm(prev => ({
        ...prev,
        thumbnailFile: file,
        thumbnailPreview: URL.createObjectURL(file)
      }))
    }
  }

  const handleSaveVideoChanges = async (e) => {
    e.preventDefault()
    if (!editingVideo) return

    setVideoEditMsg({ type: '', text: '' })

    try {
      setVideoSaveLoading(true)

      let payload
      if (videoForm.thumbnailFile) {
        payload = new FormData()
        payload.append('title', videoForm.title)
        payload.append('description', videoForm.description)
        payload.append('visibility', videoForm.visibility)
        if (videoForm.visibility === 'TIER_ONLY' && videoForm.minimumTier) {
          payload.append('minimumTier', videoForm.minimumTier)
        }
        payload.append('thumbnail', videoForm.thumbnailFile)
      } else {
        payload = {
          title: videoForm.title,
          description: videoForm.description,
          visibility: videoForm.visibility,
          minimumTier: videoForm.visibility === 'TIER_ONLY' ? videoForm.minimumTier : null,
        }
      }

      await videoAPI.updateVideo(editingVideo._id, payload)
      setEditingVideo(null)
      fetchUserVideos()
      setProfileMsg({ type: 'success', text: `Video "${videoForm.title}" updated successfully!` })
    } catch (err) {
      console.error('Failed to update video:', err)
      setVideoEditMsg({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to update video details.' 
      })
    } finally {
      setVideoSaveLoading(false)
    }
  }

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this video? This action cannot be undone.')) return

    try {
      await videoAPI.deleteVideo(videoId)
      fetchUserVideos()
      setProfileMsg({ type: 'success', text: 'Video deleted successfully!' })
    } catch (err) {
      console.error('Failed to delete video:', err)
      alert(err.response?.data?.message || 'Failed to delete video')
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      
      {/* Settings Header Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#141417] border border-gray-200 dark:border-gray-800 shadow-xl space-y-2">
        <h1 className="text-2xl sm:text-3xl font-sora font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
          <User className="w-7 h-7 text-crimson" />
          <span>Settings & Account Management</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-sora">
          Manage your account profile, channel branding, security credentials, video content, and platform preferences.
        </p>
      </div>

      {/* Global Status Message Alert */}
      {profileMsg.text && (
        <div className={`p-4 rounded-2xl border text-xs font-sora flex items-center justify-between shadow-md ${
          profileMsg.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/50 text-emerald-600 dark:text-emerald-300'
            : 'bg-red-50 dark:bg-red-950/40 border-red-500/50 text-red-600 dark:text-red-300'
        }`}>
          <div className="flex items-center gap-2">
            {profileMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{profileMsg.text}</span>
          </div>
          <button onClick={() => setProfileMsg({ type: '', text: '' })} className="hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Tabs Bar */}
      <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-800 gap-2">
        <button
          onClick={() => setActiveTab('account')}
          className={`px-5 py-3 font-sora font-bold text-xs sm:text-sm border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'account'
              ? 'border-crimson text-crimson'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Account & Branding</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-5 py-3 font-sora font-bold text-xs sm:text-sm border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'security'
              ? 'border-crimson text-crimson'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Security & Password</span>
        </button>

        <button
          onClick={() => setActiveTab('videos')}
          className={`px-5 py-3 font-sora font-bold text-xs sm:text-sm border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'videos'
              ? 'border-crimson text-crimson'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Video Content Manager</span>
        </button>

        <button
          onClick={() => setActiveTab('privacy')}
          className={`px-5 py-3 font-sora font-bold text-xs sm:text-sm border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'privacy'
              ? 'border-crimson text-crimson'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Preferences & Privacy</span>
        </button>
      </div>

      {/* TAB 1: ACCOUNT & BRANDING */}
      {activeTab === 'account' && (
        <div className="space-y-8">
          
          {/* Avatar & Cover Banner Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Avatar Image Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#141417] border border-gray-200 dark:border-gray-800 shadow-md space-y-4">
              <h3 className="font-sora font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-crimson" />
                <span>Profile Avatar Photo</span>
              </h3>
              
              <div className="flex items-center gap-4">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar Preview"
                    className="w-20 h-20 rounded-full object-cover ring-4 ring-crimson/20 shadow-lg"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-crimson text-white font-extrabold text-2xl flex items-center justify-center shadow-lg">
                    {user?.username?.[0]?.toUpperCase()}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-sora font-semibold text-xs cursor-pointer inline-flex items-center gap-1.5 transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choose Photo</span>
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  </label>

                  {avatarFile && (
                    <button
                      onClick={handleSaveAvatar}
                      disabled={avatarLoading}
                      className="w-full px-4 py-2 rounded-xl bg-crimson hover:bg-redAccent text-white font-sora font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                    >
                      {avatarLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      <span>Save Avatar</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Cover Banner Image Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#141417] border border-gray-200 dark:border-gray-800 shadow-md space-y-4">
              <h3 className="font-sora font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                <Image className="w-4 h-4 text-purple-500" />
                <span>Channel Cover Banner</span>
              </h3>

              <div className="space-y-3">
                <div className="h-20 w-full rounded-2xl bg-gradient-to-r from-crimson to-purple-600 overflow-hidden relative shadow-inner">
                  {coverPreview && (
                    <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover object-top" />
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <label className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-sora font-semibold text-xs cursor-pointer inline-flex items-center gap-1.5 transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choose Banner</span>
                    <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                  </label>

                  {coverFile && (
                    <button
                      onClick={handleSaveCover}
                      disabled={coverLoading}
                      className="px-4 py-2 rounded-xl bg-crimson hover:bg-redAccent text-white font-sora font-bold text-xs shadow-md flex items-center gap-1.5 transition disabled:opacity-50"
                    >
                      {coverLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      <span>Save Banner</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Personal Account Information Form */}
          <form onSubmit={handleUpdateProfile} className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#141417] border border-gray-200 dark:border-gray-800 shadow-xl space-y-5 text-xs">
            <h3 className="font-sora font-bold text-lg text-gray-900 dark:text-white">Account Details</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-sora font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.fullname}
                  onChange={(e) => setProfileForm({ ...profileForm, fullname: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#1D1D21] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-sora focus:ring-2 focus:ring-crimson/50"
                />
              </div>

              <div>
                <label className="block font-sora font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Username (@handle)
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.username}
                  onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#1D1D21] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-sora focus:ring-2 focus:ring-crimson/50"
                />
              </div>
            </div>

            <div>
              <label className="block font-sora font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#1D1D21] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-sora focus:ring-2 focus:ring-crimson/50"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={profileLoading}
                className="px-6 py-3 rounded-2xl bg-crimson hover:bg-redAccent text-white font-sora font-bold text-xs shadow-md shadow-crimson/20 flex items-center gap-2 transition disabled:opacity-50"
              >
                {profileLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>

        </div>
      )}

      {/* TAB 2: SECURITY & PASSWORD */}
      {activeTab === 'security' && (
        <div className="space-y-8">
          
          <form onSubmit={handleChangePassword} className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#141417] border border-gray-200 dark:border-gray-800 shadow-xl space-y-5 text-xs max-w-2xl">
            <h3 className="font-sora font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-crimson" />
              <span>Change Password</span>
            </h3>

            {passwordMsg.text && (
              <div className={`p-3.5 rounded-xl border text-xs font-sora flex items-center gap-2 ${
                passwordMsg.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/50 text-emerald-600 dark:text-emerald-300'
                  : 'bg-red-50 dark:bg-red-950/40 border-red-500/50 text-red-600 dark:text-red-300'
              }`}>
                {passwordMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{passwordMsg.text}</span>
              </div>
            )}

            <div>
              <label className="block font-sora font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                required
                value={passwordForm.oldPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#1D1D21] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-sora focus:ring-2 focus:ring-crimson/50"
              />
            </div>

            <div>
              <label className="block font-sora font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                New Password
              </label>
              <input
                type="password"
                required
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#1D1D21] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-sora focus:ring-2 focus:ring-crimson/50"
              />
            </div>

            <div>
              <label className="block font-sora font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#1D1D21] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-sora focus:ring-2 focus:ring-crimson/50"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={passwordLoading}
                className="px-6 py-3 rounded-2xl bg-crimson hover:bg-redAccent text-white font-sora font-bold text-xs shadow-md shadow-crimson/20 flex items-center gap-2 transition disabled:opacity-50"
              >
                {passwordLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Update Password</span>
              </button>
            </div>
          </form>

          {/* Danger Zone */}
          <div className="p-6 sm:p-8 rounded-3xl bg-red-500/5 border border-red-500/20 max-w-2xl space-y-3">
            <h4 className="font-sora font-bold text-sm text-red-500 uppercase tracking-wider">Danger Zone</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Permanently remove your channel account, videos, comments, and creator memberships.
            </p>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete your account? This action is permanent.')) {
                  alert('Account deletion request submitted.')
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-sora font-bold text-xs transition shadow-md"
            >
              Delete Account
            </button>
          </div>

        </div>
      )}

      {/* TAB 3: VIDEO CONTENT MANAGER */}
      {activeTab === 'videos' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-sora font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
              <Video className="w-5 h-5 text-crimson" />
              <span>Uploaded Videos ({userVideos.length})</span>
            </h3>
          </div>

          {videosLoading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="w-8 h-8 text-crimson animate-spin" />
            </div>
          ) : userVideos.length === 0 ? (
            <div className="p-12 text-center text-gray-400 rounded-3xl bg-white dark:bg-[#141417] border border-gray-200 dark:border-gray-800">
              No uploaded videos found for your channel.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userVideos.map((video) => (
                <div
                  key={video._id}
                  className="p-4 rounded-3xl bg-white dark:bg-[#141417] border border-gray-200 dark:border-gray-800 shadow-md flex gap-4 items-start"
                >
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-32 h-20 rounded-2xl object-cover bg-black flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="font-sora font-bold text-sm text-gray-900 dark:text-white truncate">
                      {video.title}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                      {video.description || 'No description'}
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                        {video.visibility || 'PUBLIC'}
                      </span>
                      <span className="text-[11px] text-gray-400">{video.views || 0} views</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleOpenEditVideo(video)}
                      className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-crimson hover:text-white text-gray-600 dark:text-gray-300 transition"
                      title="Edit Video Metadata & Thumbnail"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteVideo(video._id)}
                      className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-red-600 hover:text-white text-gray-600 dark:text-gray-300 transition"
                      title="Delete Video"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PREFERENCES & PRIVACY */}
      {activeTab === 'privacy' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#141417] border border-gray-200 dark:border-gray-800 shadow-xl space-y-6 text-xs max-w-2xl">
          <h3 className="font-sora font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-crimson" />
            <span>Channel Privacy & Platform Preferences</span>
          </h3>

          <div className="space-y-4">
            <label className="p-4 rounded-2xl bg-gray-50 dark:bg-[#1D1D21] border border-gray-200 dark:border-gray-800 flex items-center justify-between cursor-pointer">
              <div>
                <span className="font-sora font-bold text-gray-900 dark:text-white text-sm block">
                  Private Channel Mode
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-xs">
                  Only approved subscribers can access your channel profile and videos
                </span>
              </div>
              <input
                type="checkbox"
                checked={privacySettings.isPrivate}
                onChange={(e) => setPrivacySettings({ ...privacySettings, isPrivate: e.target.checked })}
                className="w-5 h-5 accent-crimson rounded-md cursor-pointer"
              />
            </label>

            <label className="p-4 rounded-2xl bg-gray-50 dark:bg-[#1D1D21] border border-gray-200 dark:border-gray-800 flex items-center justify-between cursor-pointer">
              <div>
                <span className="font-sora font-bold text-gray-900 dark:text-white text-sm block">
                  Allow Video Comments
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-xs">
                  Permit viewers and channel members to post comments on your videos
                </span>
              </div>
              <input
                type="checkbox"
                checked={privacySettings.allowComments}
                onChange={(e) => setPrivacySettings({ ...privacySettings, allowComments: e.target.checked })}
                className="w-5 h-5 accent-crimson rounded-md cursor-pointer"
              />
            </label>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#1D1D21] border border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div>
                <span className="font-sora font-bold text-gray-900 dark:text-white text-sm block">
                  Appearance Theme
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-xs">
                  Switch between Light Mode and Dark Mode
                </span>
              </div>
              <button
                onClick={toggleTheme}
                className="px-4 py-2 rounded-xl bg-crimson hover:bg-redAccent text-white font-sora font-bold text-xs flex items-center gap-2 shadow-md"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
                <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT VIDEO MODAL */}
      {editingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#141417] border border-gray-200 dark:border-gray-800 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
              <h3 className="font-sora font-bold text-base text-gray-900 dark:text-white">
                Edit Video Details
              </h3>
              <button onClick={() => setEditingVideo(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {videoEditMsg.text && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{videoEditMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveVideoChanges} className="space-y-4 text-xs">
              <div>
                <label className="block font-sora font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={videoForm.title}
                  onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#202024] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-crimson/50"
                />
              </div>

              <div>
                <label className="block font-sora font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  value={videoForm.description}
                  onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#202024] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-crimson/50"
                />
              </div>

              <div>
                <label className="block font-sora font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Thumbnail Image
                </label>
                <div className="flex items-center gap-3">
                  {videoForm.thumbnailPreview && (
                    <img src={videoForm.thumbnailPreview} alt="" className="w-20 h-12 object-cover rounded-lg bg-black" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleVideoThumbnailChange}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#202024] text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-sora font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Audience Visibility
                </label>
                <select
                  value={videoForm.visibility}
                  onChange={(e) => setVideoForm({ ...videoForm, visibility: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#202024] text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-700"
                >
                  <option value="PUBLIC">Public</option>
                  <option value="MEMBERS_ONLY">Members Only</option>
                  <option value="TIER_ONLY">Specific Tier Only</option>
                </select>
              </div>

              {videoForm.visibility === 'TIER_ONLY' && (
                <div>
                  <label className="block font-sora font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Minimum Required Tier
                  </label>
                  <select
                    value={videoForm.minimumTier}
                    onChange={(e) => setVideoForm({ ...videoForm, minimumTier: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#202024] text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-700"
                  >
                    <option value="">Select Tier</option>
                    {creatorTiers.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name} (₹{t.price}/mo)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-3 flex justify-end gap-2 border-t border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setEditingVideo(null)}
                  className="px-4 py-2 rounded-xl text-gray-400 hover:text-white font-sora font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={videoSaveLoading}
                  className="px-5 py-2 rounded-xl bg-crimson hover:bg-redAccent text-white font-sora font-bold shadow-md flex items-center gap-1.5"
                >
                  {videoSaveLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save Video</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
