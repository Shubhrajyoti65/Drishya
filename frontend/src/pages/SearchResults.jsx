import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { videoAPI } from '../services/api'
import { formatViewCount } from '../utils/helpers'

export default function SearchResults() {
  const [searchParams] = useSearchParams()
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)

  const query = searchParams.get('q')

  useEffect(() => {
    const searchVideos = async () => {
      try {
        setLoading(true)
        // Since backend matches page query constraints, 
        // we fetch videos and filter by title locally
        const response = await videoAPI.getVideos(1, 100)
        const allVideos = response.data.data.docs || response.data.data.videos || []
        const filteredVideos = allVideos.filter(video =>
          video.title.toLowerCase().includes(query?.toLowerCase())
        )
        setVideos(filteredVideos)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    if (query) {
      searchVideos()
    }
  }, [query])

  if (loading) return <div className="p-6 text-center text-gray-400">Loading search results...</div>

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">
        Search Results for "{query}"
      </h2>

      {videos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No videos found for "{query}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((video) => (
            <Link
              key={video._id}
              to={`/watch/${video._id}`}
              className="bg-gray-800 rounded-lg overflow-hidden hover:shadow-lg transition group cursor-pointer block"
            >
              <div className="relative">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full aspect-video object-cover group-hover:opacity-75 transition"
                />
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-white truncate group-hover:text-blue-400 transition">{video.title}</h3>
                <p className="text-sm text-gray-400">{video.owner?.username}</p>
                <p className="text-sm text-gray-500">{formatViewCount(video.views)} views</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
