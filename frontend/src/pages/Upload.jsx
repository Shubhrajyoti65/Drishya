export default function Upload() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoFile: null,
    thumbnail: null
  })
  const [uploading, setUploading] = useState(false)

  const handleChange = (e) => {
    const { name, value, files } = e.target
    if (files) {
      setFormData(prev => ({ ...prev, [name]: files[0] }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Upload logic will be implemented
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Upload Video</h2>

      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Video File</label>
          <input
            type="file"
            name="videoFile"
            accept="video/*"
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Thumbnail</label>
          <input
            type="file"
            name="thumbnail"
            accept="image/*"
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            maxLength="100"
            className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            maxLength="500"
            rows="4"
            className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600"
            required
          />
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-2 rounded transition"
        >
          {uploading ? 'Uploading...' : 'Upload Video'}
        </button>
      </form>
    </div>
  )
}

import { useState } from 'react'
