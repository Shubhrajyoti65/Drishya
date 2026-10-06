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
            <div key={n} className="aspect-video rounded-3xl bg-neu-surface shadow-neu-inset-xs border border-neu-border animate-pulse" />
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-20 bg-neu-surface rounded-3xl border border-neu-border shadow-neu-raised space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-neu-surface shadow-neu-inset-xs border border-neu-border flex items-center justify-center mx-auto text-neu-text-muted">
            <VideoIcon className="w-7 h-7" />
          </div>
          <h3 className="font-sora font-bold text-lg text-neu-text">No Videos Found</h3>
          <p className="text-xs text-neu-text-muted max-w-sm mx-auto font-sans">
            There are no videos uploaded yet. Go to your Profile page to upload your first video or generate AI ideas in the Studio.
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
              className="px-4 py-2.5 rounded-2xl border border-neu-border bg-neu-surface text-xs font-sora font-semibold text-neu-text shadow-neu-raised-xs hover:shadow-neu-raised-sm active:shadow-neu-inset-xs disabled:opacity-50 disabled:shadow-none transition-all duration-200"
            >
              Previous
            </button>
            <span className="px-3.5 py-2 text-xs font-sora font-bold text-neu-text bg-neu-surface shadow-neu-inset-xs border border-neu-border rounded-xl">
              Page {page}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-crimson to-redAccent text-white text-xs font-sora font-semibold shadow-neu-glow-crimson hover:brightness-105 active:shadow-neu-inset border border-red-500/30 transition-all duration-200"
            >
              Next Page
            </button>
          </div>
        </>
      )}

    </div>
  )
}
