import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { videoAPI, membershipTierAPI } from '../services/api'
import { Lock, Globe, Crown } from 'lucide-react'

export default function Upload() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoFile: null,
    thumbnail: null,
    visibility: 'PUBLIC',
    minimumTier: '',
  })
  const [creatorTiers, setCreatorTiers] = useState([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        const user = JSON.parse(storedUser)
        if (user?._id) {
          membershipTierAPI
            .getCreatorTiers(user._id)
            .then((res) => {
              setCreatorTiers(res.data.data || [])
            })
            .catch((err) => console.error('Failed to fetch creator tiers:', err))
        }
      }
    } catch (e) {
      // silent fallback
    }
  }, [])

  const handleChange = (e) => {
    const { name, value, files } = e.target
    if (files) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.videoFile) {
      setError('Video file is required')
      return
    }
    if (!formData.thumbnail) {
      setError('Thumbnail is required')
      return
    }

    try {
      setUploading(true)
      setError(null)

      const data = new FormData()
      data.append('title', formData.title)
      data.append('description', formData.description)
      data.append('videoFile', formData.videoFile)
      data.append('thumbnail', formData.thumbnail)
      data.append('visibility', formData.visibility)
      if (formData.visibility === 'TIER_ONLY' && formData.minimumTier) {
        data.append('minimumTier', formData.minimumTier)
      }

      await videoAPI.uploadVideo(data)
      navigate('/')
    } catch (err) {
      console.error('Video upload failed:', err)
      setError(err.response?.data?.message || 'Failed to upload video. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-sora font-extrabold text-gray-900 dark:text-white">Upload Video</h2>
        <p className="text-xs text-gray-500">Share your latest video or create exclusive members-only content</p>
      </div>

      {error && (
        <div className="p-4 bg-red-900/50 border border-red-500 text-red-200 rounded-2xl text-xs font-sora">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-[#18181B] rounded-3xl p-6 border border-gray-200 dark:border-gray-800 shadow-premium space-y-4 text-xs">
        <div>
          <label className="block font-sora font-semibold mb-1 text-gray-700 dark:text-gray-300">Video File</label>
          <input
            type="file"
            name="videoFile"
            accept="video/*"
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#202024] text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-700"
            required
          />
        </div>

        <div>
          <label className="block font-sora font-semibold mb-1 text-gray-700 dark:text-gray-300">Thumbnail</label>
          <input
            type="file"
            name="thumbnail"
            accept="image/*"
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#202024] text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-700"
            required
          />
        </div>

        <div>
          <label className="block font-sora font-semibold mb-1 text-gray-700 dark:text-gray-300">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            maxLength="100"
            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#202024] text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-crimson/50"
            required
          />
        </div>

        <div>
          <label className="block font-sora font-semibold mb-1 text-gray-700 dark:text-gray-300">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            maxLength="500"
            rows="3"
            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#202024] text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-crimson/50"
            required
          />
        </div>

        {/* Video Audience & Membership Visibility */}
        <div className="pt-2 space-y-3">
          <label className="block font-sora font-bold text-gray-900 dark:text-white uppercase tracking-wider text-[11px]">
            Audience Visibility & Membership Level
          </label>
          
          <div className="grid grid-cols-3 gap-3">
            <div
              onClick={() => setFormData({ ...formData, visibility: 'PUBLIC' })}
              className={`p-3 rounded-2xl border cursor-pointer flex flex-col items-center gap-1.5 transition ${
                formData.visibility === 'PUBLIC'
                  ? 'border-blue-500 bg-blue-50/20 dark:bg-blue-950/20 text-blue-500'
                  : 'border-gray-200 dark:border-gray-800 text-gray-500'
              }`}
            >
              <Globe className="w-5 h-5" />
              <span className="font-sora font-bold">Public</span>
            </div>

            <div
              onClick={() => setFormData({ ...formData, visibility: 'MEMBERS_ONLY' })}
              className={`p-3 rounded-2xl border cursor-pointer flex flex-col items-center gap-1.5 transition ${
                formData.visibility === 'MEMBERS_ONLY'
                  ? 'border-amber-500 bg-amber-50/20 dark:bg-amber-950/20 text-amber-500'
                  : 'border-gray-200 dark:border-gray-800 text-gray-500'
              }`}
            >
              <Lock className="w-5 h-5" />
              <span className="font-sora font-bold">Members Only</span>
            </div>

            <div
              onClick={() => setFormData({ ...formData, visibility: 'TIER_ONLY' })}
              className={`p-3 rounded-2xl border cursor-pointer flex flex-col items-center gap-1.5 transition ${
                formData.visibility === 'TIER_ONLY'
                  ? 'border-purple-500 bg-purple-50/20 dark:bg-purple-950/20 text-purple-500'
                  : 'border-gray-200 dark:border-gray-800 text-gray-500'
              }`}
            >
              <Crown className="w-5 h-5" />
              <span className="font-sora font-bold">Specific Tier</span>
            </div>
          </div>

          {formData.visibility === 'TIER_ONLY' && (
            <div className="mt-2">
              <label className="block font-sora font-semibold mb-1 text-gray-700 dark:text-gray-300">
                Minimum Required Tier
              </label>
              <select
                name="minimumTier"
                value={formData.minimumTier}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#202024] text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-700"
              >
                <option value="">Select minimum tier required</option>
                {creatorTiers.map((tier) => (
                  <option key={tier._id} value={tier._id}>
                    {tier.name} (₹{tier.price}/mo)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-crimson hover:bg-redAccent disabled:bg-gray-600 text-white font-sora font-bold py-3 rounded-2xl transition shadow-md shadow-crimson/20"
        >
          {uploading ? 'Uploading Video...' : 'Upload Video'}
        </button>
      </form>
    </div>
  )
}
