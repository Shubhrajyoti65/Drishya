import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { videoAPI } from '../services/api'
import { formatViewCount } from '../utils/helpers'

export default function Home() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true)
        const response = await videoAPI.getVideos(page, 12, 'createdAt', 'desc')
        setVideos(response?.data?.data?.docs ?? response?.data?.data?.videos ?? [])
      } catch (error) {
        console.error('Error fetching videos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [page])

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Home</h2>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-400">Loading videos...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {(videos ?? []).map((video) => (
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
                  <span className="absolute bottom-2 right-2 bg-black bg-opacity-75 px-2 py-1 rounded text-sm text-white">
                    {video.duration}
                  </span>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-white truncate group-hover:text-blue-400 transition">{video.title}</h3>
                  <p className="text-sm text-gray-400">{video.owner?.username}</p>
                  <p className="text-sm text-gray-500">{formatViewCount(video.views)} views</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded"
            >
              Previous
            </button>
            <span className="py-2 text-gray-300">Page {page}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  )
}
