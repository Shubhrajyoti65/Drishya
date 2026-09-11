import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { videoAPI } from '../services/api'
import VideoCard from '../components/VideoCard'
import { 
  Sparkles, 
  Flame, 
  TrendingUp, 
  Users, 
  Video as VideoIcon, 
  ArrowRight, 
  Wand2, 
  Play, 
  Compass
} from 'lucide-react'

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

  const featuredVideo = videos.length > 0 ? videos[0] : null
  const trendingVideos = videos.slice(1, 5)
  const recommendedVideos = videos.slice(5)

  return (
    <div className="min-h-screen pb-16">
      
      {/* SECTION 1: HERO BANNER (Diagonal Red Section with Floating Hero Card) */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#900C17] via-crimson to-redAccent text-white pt-12 pb-24 px-4 sm:px-6 lg:px-8 mb-12">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Hero Text Content */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-sora font-semibold tracking-wide text-white">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>NEXT-GEN CREATOR PLATFORM 2026</span>
              </div>

              <h1 className="font-sora font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.1]">
                Stream, Connect & Create Smarter.
              </h1>

              <p className="text-lg text-white/90 font-sans max-w-xl leading-relaxed">
                Experience high-performance video streaming, creator-first communities, and flagship AI generation tools—all in one unified platform.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  to="/generator"
                  className="px-6 py-3.5 rounded-2xl bg-white text-crimson font-sora font-bold text-sm hover:bg-gray-100 transition shadow-xl hover:scale-[1.02] flex items-center gap-2"
                >
                  <Wand2 className="w-4 h-4 text-crimson" />
                  <span>Launch AI Studio</span>
                </Link>

                <a
                  href="#trending"
                  className="px-6 py-3.5 rounded-2xl bg-black/20 hover:bg-black/30 backdrop-blur-md border border-white/20 text-white font-sora font-semibold text-sm transition flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Explore Videos</span>
                </a>
              </div>
            </div>

            {/* Hero Featured Video Card */}
            <div className="lg:col-span-6">
              {featuredVideo ? (
                <VideoCard video={featuredVideo} isFeatured={true} />
              ) : (
                <div className="aspect-video rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center text-center p-8">
                  <VideoIcon className="w-12 h-12 text-white/60 mb-3" />
                  <h3 className="font-sora font-bold text-xl">Welcome to Drishya</h3>
                  <p className="text-sm text-white/80 mt-1 max-w-md">
                    Upload your first video or generate thumbnails to feature your content here.
                  </p>
                  <Link to="/upload" className="mt-4 px-5 py-2.5 rounded-xl bg-white text-crimson font-sora font-bold text-xs">
                    Upload Content
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* SECTION 2: TRENDING VIDEOS (Asymmetrical Editorial Grid) */}
        {trendingVideos.length > 0 && (
          <section id="trending" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-crimson/10 dark:bg-crimson/20 text-crimson flex items-center justify-center">
                  <Flame className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h2 className="font-sora font-bold text-2xl text-gray-900 dark:text-white">
                    Trending Right Now
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Hand-picked popular videos across all categories
                  </p>
                </div>
              </div>

              <span className="text-xs font-sora font-semibold text-crimson flex items-center gap-1">
                <span>Top Charts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingVideos.map((video) => (
                <VideoCard key={video._id} video={video} />
              ))}
            </div>
          </section>
        )}

        {/* SECTION 3: CREATOR COMMUNITY BANNER (Royal Blue Editorial Accent) */}
        <section id="community" className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-royalBlue to-blueAccent text-white p-8 sm:p-12 shadow-premium">
          <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-sora font-semibold">
                <Users className="w-3.5 h-3.5" />
                <span>CREATOR NETWORK & DISCUSSIONS</span>
              </div>

              <h2 className="font-sora font-bold text-3xl sm:text-4xl leading-tight">
                Not Twitter. A Dedicated Platform for Content Creators.
              </h2>

              <p className="text-sm sm:text-base text-white/90 max-w-2xl leading-relaxed">
                Connect directly with viewers, share video updates, launch interactive polls, and hold high-level creator discussions without algorithm noise.
              </p>

              <div className="pt-2">
                <Link
                  to="/generator"
                  className="px-6 py-3 rounded-2xl bg-white text-royalBlue font-sora font-bold text-xs sm:text-sm hover:bg-gray-100 transition shadow-lg inline-flex items-center gap-2"
                >
                  <span>Explore Creator Network</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Overlapping Mock Discussion Cards */}
            <div className="lg:col-span-4 space-y-3">
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-xs space-y-2 transform hover:-translate-y-1 transition duration-200">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-amber-400 text-black font-bold flex items-center justify-center text-[10px]">
                    SD
                  </div>
                  <span className="font-semibold">Subhrajyoti • 2h ago</span>
                </div>
                <p className="text-white/90 font-medium">"Which video title concept performs better for a tech review channel?"</p>
                <div className="flex gap-2 text-[10px] text-white/70">
                  <span>🔥 42 Votes</span>
                  <span>💬 18 Replies</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-xs space-y-2 transform translate-x-4 hover:-translate-y-1 transition duration-200">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-400 text-black font-bold flex items-center justify-center text-[10px]">
                    DR
                  </div>
                  <span className="font-semibold">Drishya AI • Official</span>
                </div>
                <p className="text-white/90 font-medium">"FLUX Dev thumbnail generation is now live in AI Studio!"</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: RECOMMENDED & LATEST VIDEOS */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white flex items-center justify-center">
                <Compass className="w-5 h-5 text-crimson" />
              </div>
              <div>
                <h2 className="font-sora font-bold text-2xl text-gray-900 dark:text-white">
                  Discover All Videos
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Browse through community uploads and verified channels
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className="aspect-video rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
              ))}
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-gray-200 dark:border-gray-800">
              <VideoIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <h3 className="font-sora font-bold text-lg text-gray-900 dark:text-white">No Videos Found</h3>
              <p className="text-xs text-gray-500 mt-1">Be the first creator to upload a video to Drishya.</p>
              <Link to="/upload" className="mt-4 inline-block px-5 py-2.5 rounded-xl bg-crimson text-white font-sora font-semibold text-xs">
                Upload Video
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {(recommendedVideos.length > 0 ? recommendedVideos : videos).map((video) => (
                  <VideoCard key={video._id} video={video} />
                ))}
              </div>

              {/* Editorial Pagination */}
              <div className="flex items-center justify-center gap-3 pt-8">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1E1E1E] text-xs font-sora font-semibold text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
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
        </section>

      </div>
    </div>
  )
}
