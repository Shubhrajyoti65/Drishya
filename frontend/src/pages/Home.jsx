import { useEffect, useState } from 'react'
import { videoAPI } from '../services/api'
import VideoCard from '../components/VideoCard'
import { Video as VideoIcon, Loader2 } from 'lucide-react'

export default function Home() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true)
        const response = await videoAPI.getVideos(page, 12, 'createdAt', 'desc')
        const fetchedData = response?.data?.data
        const videoList = fetchedData?.docs || fetchedData?.videos || (Array.isArray(fetchedData) ? fetchedData : [])
        setVideos(videoList)
      } catch (error) {
        console.error('Error fetching videos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [page])

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto space-y-6">
      

      {/* Videos Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="aspect-video rounded-2xl bg-gray-200 dark:bg-gray-800/60 animate-pulse" />
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-[#141417] rounded-3xl border border-gray-200 dark:border-gray-800 space-y-3">
          <VideoIcon className="w-12 h-12 mx-auto text-gray-400" />
          <h3 className="font-sora font-bold text-lg text-gray-900 dark:text-white">No Videos Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            There are no videos uploaded yet. Go to your Profile page to upload your first video.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-3 pt-6">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#18181B] text-xs font-sora font-semibold text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              Previous
            </button>
            <span className="px-3 py-1.5 text-xs font-sora font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 rounded-lg">
              Page {page}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 rounded-xl bg-crimson hover:bg-redAccent text-white text-xs font-sora font-semibold shadow-md shadow-crimson/20 transition"
            >
              Next Page
            </button>
          </div>
        </>
      )}

    </div>
  )
}
