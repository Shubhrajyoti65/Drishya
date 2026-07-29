import { useState } from 'react'
import { generatorAPI } from '../services/aiApi'
import { useUIStore } from '../stores/uiStore'

export default function ContentGenerator() {
  const showNotification = useUIStore((state) => state.showNotification)
  const [activeTab, setActiveTab] = useState('titles')
  const [loading, setLoading] = useState(false)

  // Video Titles State
  const [titleForm, setTitleForm] = useState({
    topic: '',
    niche: '',
    targetAudience: ''
  })
  const [titles, setTitles] = useState([])

  // Content Ideas State
  const [ideasForm, setIdeasForm] = useState({
    niche: '',
    targetAudience: '',
    previousContent: '',
    currentTrends: ''
  })
  const [ideas, setIdeas] = useState([])

  // Thumbnail State
  const [thumbnailForm, setThumbnailForm] = useState({
    topic: '',
    category: '',
    mood: ''
  })
  const [thumbnails, setThumbnails] = useState([])

  const generateTitles = async () => {
    if (!titleForm.topic || !titleForm.niche) {
      showNotification('Please fill all fields', 'error')
      return
    }

    setLoading(true)
    try {
      const response = await generatorAPI.generateVideoTitles(
        titleForm.topic,
        titleForm.niche,
        titleForm.targetAudience
      )
      const list = response.data?.titles || response.data?.data?.titles || []
      setTitles(list)
      showNotification('Titles generated successfully!', 'success')
    } catch (error) {
      showNotification('Failed to generate titles', 'error')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const generateIdeas = async () => {
    if (!ideasForm.niche) {
      showNotification('Please fill all fields', 'error')
      return
    }

    setLoading(true)
    try {
      const response = await generatorAPI.generateContentIdeas(
        ideasForm.niche,
        ideasForm.targetAudience,
        ideasForm.previousContent,
        ideasForm.currentTrends
      )
      const list = response.data?.ideas || response.data?.data?.ideas || []
      setIdeas(list)
      showNotification('Ideas generated successfully!', 'success')
    } catch (error) {
      showNotification('Failed to generate ideas', 'error')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const generateThumbnails = async () => {
    if (!thumbnailForm.topic) {
      showNotification('Please fill all fields', 'error')
      return
    }

    setLoading(true)
    try {
      const response = await generatorAPI.generateThumbnailSuggestions(
        thumbnailForm.topic,
        thumbnailForm.category,
        thumbnailForm.mood
      )
      const list = response.data?.suggestions || response.data?.data?.suggestions || []
      setThumbnails(list)
      showNotification('Thumbnail image generated!', 'success')
    } catch (error) {
      showNotification('Failed to generate suggestions', 'error')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-2">Content Generator</h2>
      <p className="text-gray-400 mb-6">Powered by AI - Generate titles, ideas, and design suggestions</p>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('titles')}
          className={`px-4 py-2 font-semibold transition ${activeTab === 'titles' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}
        >
          Video Titles
        </button>
        <button
          onClick={() => setActiveTab('ideas')}
          className={`px-4 py-2 font-semibold transition ${activeTab === 'ideas' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}
        >
          Content Ideas
        </button>
        <button
          onClick={() => setActiveTab('thumbnails')}
          className={`px-4 py-2 font-semibold transition ${activeTab === 'thumbnails' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}
        >
          Thumbnail Design
        </button>
      </div>

      {/* Video Titles Tab */}
      {activeTab === 'titles' && (
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-bold mb-4">Generate Video Titles</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Topic (e.g., Machine Learning)"
                  value={titleForm.topic}
                  onChange={(e) => setTitleForm({...titleForm, topic: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                />
                <input
                  type="text"
                  placeholder="Niche (e.g., Tech, Gaming)"
                  value={titleForm.niche}
                  onChange={(e) => setTitleForm({...titleForm, niche: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                />
                <input
                  type="text"
                  placeholder="Target Audience"
                  value={titleForm.targetAudience}
                  onChange={(e) => setTitleForm({...titleForm, targetAudience: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                />
                <button
                  onClick={generateTitles}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded font-semibold"
                >
                  {loading ? 'Generating...' : 'Generate Titles'}
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Generated Titles</h3>
              <div className="space-y-3">
                {titles.length > 0 ? (
                  titles.map((title, idx) => (
                    <div key={idx} className="bg-gray-700 p-3 rounded text-gray-100 hover:bg-gray-600 cursor-pointer transition">
                      {title}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">Generate titles to see suggestions</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Ideas Tab */}
      {activeTab === 'ideas' && (
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-bold mb-4">Generate Content Ideas</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Niche"
                  value={ideasForm.niche}
                  onChange={(e) => setIdeasForm({...ideasForm, niche: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                />
                <input
                  type="text"
                  placeholder="Target Audience"
                  value={ideasForm.targetAudience}
                  onChange={(e) => setIdeasForm({...ideasForm, targetAudience: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                />
                <textarea
                  placeholder="Previous Content (optional)"
                  value={ideasForm.previousContent}
                  onChange={(e) => setIdeasForm({...ideasForm, previousContent: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  rows="2"
                />
                <textarea
                  placeholder="Current Trends (optional)"
                  value={ideasForm.currentTrends}
                  onChange={(e) => setIdeasForm({...ideasForm, currentTrends: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  rows="2"
                />
                <button
                  onClick={generateIdeas}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded font-semibold"
                >
                  {loading ? 'Generating...' : 'Generate Ideas'}
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Generated Ideas</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {ideas.length > 0 ? (
                  ideas.map((idea, idx) => (
                    <div key={idx} className="bg-gray-700 p-3 rounded text-gray-100">
                      <p className="font-semibold">{idea.title || idea}</p>
                      {idea.description && <p className="text-sm text-gray-300 mt-1">{idea.description}</p>}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">Generate ideas to see suggestions</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Thumbnail Tab */}
      {activeTab === 'thumbnails' && (
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-bold mb-4">Generate Thumbnail Suggestions</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Topic"
                  value={thumbnailForm.topic}
                  onChange={(e) => setThumbnailForm({...thumbnailForm, topic: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                />
                <input
                  type="text"
                  placeholder="Category"
                  value={thumbnailForm.category}
                  onChange={(e) => setThumbnailForm({...thumbnailForm, category: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                />
                <input
                  type="text"
                  placeholder="Mood (e.g., energetic, calm)"
                  value={thumbnailForm.mood}
                  onChange={(e) => setThumbnailForm({...thumbnailForm, mood: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                />
                <button
                  onClick={generateThumbnails}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded font-semibold"
                >
                  {loading ? 'Generating...' : 'Generate Suggestions'}
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Design Suggestions</h3>
              <div className="space-y-3">
                {thumbnails.length > 0 ? (
                  thumbnails.map((thumb, idx) => (
                    <div key={idx} className="bg-gray-700 p-4 rounded-xl text-gray-100 shadow-md border border-gray-600/50">
                      {thumb.imageUrl ? (
                        <div className="space-y-3">
                          <p className="font-bold text-blue-400 text-sm">{thumb.text}</p>
                          <img
                            src={thumb.imageUrl}
                            alt="Generated Thumbnail"
                            className="w-full rounded-lg aspect-video object-cover border border-gray-600 shadow-lg hover:opacity-95 transition duration-200"
                          />
                          <div className="flex justify-between items-center text-xs text-gray-400 mt-2">
                            <span>{thumb.layout}</span>
                            <a
                              href={thumb.imageUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-400 hover:text-blue-300 font-semibold hover:underline"
                            >
                              Open Full Size
                            </a>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="font-semibold">{thumb.text || thumb}</p>
                          {thumb.colors && <p className="text-sm text-gray-300">Colors: {thumb.colors}</p>}
                          {thumb.layout && <p className="text-sm text-gray-300">Layout: {thumb.layout}</p>}
                        </>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">Generate suggestions to see designs</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
