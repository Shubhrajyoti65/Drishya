import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { videoAPI, commentAPI, likeAPI } from '../services/api'
import VideoCard from '../components/VideoCard'
import { 
  ThumbsUp, 
  MessageSquare, 
  Share2, 
  Bookmark, 
  Sparkles, 
  UserCheck, 
  Tag, 
  HelpCircle, 
  Send,
  Eye,
  Clock,
  ChevronDown,
  CheckCircle2
} from 'lucide-react'

export default function Watch() {
  const { videoId } = useParams()
  const [video, setVideo] = useState(null)
  const [comments, setComments] = useState([])
  const [recommendedVideos, setRecommendedVideos] = useState([])
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [newComment, setNewComment] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showAiSummary, setShowAiSummary] = useState(true)

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        setLoading(true)
        const response = await videoAPI.getVideoById(videoId)
        const videoData = response?.data?.data?.[0] || response?.data?.data
        setVideo(videoData)
        setLikeCount(videoData?.views || 12)

        // Fetch comments
        try {
          const commentsResponse = await commentAPI.getComments(videoId)
          setComments(commentsResponse?.data?.data?.docs || [])
        } catch (e) {
          console.error("Comments error:", e)
        }

        // Fetch recommended videos
        try {
          const recResponse = await videoAPI.getVideos(1, 6, 'createdAt', 'desc')
          const docs = recResponse?.data?.data?.docs || recResponse?.data?.data?.videos || []
          setRecommendedVideos(docs.filter(v => v._id !== videoId))
        } catch (e) {
          console.error("Recommended videos error:", e)
        }

        // Check video like status
        try {
          const likeCheck = await likeAPI.checkVideoLike(videoId)
          setIsLiked(likeCheck?.data?.data?.isLiked || false)
        } catch (e) {
          // silent fallback
        }

      } catch (error) {
        console.error('Error fetching video:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchVideoData()
  }, [videoId])

  const handleToggleLike = async () => {
    try {
      const response = await likeAPI.toggleVideoLike(videoId)
      const likedState = response?.data?.data?.liked
      setIsLiked(likedState)
      setLikeCount(prev => (likedState ? prev + 1 : Math.max(0, prev - 1)))
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    try {
      const response = await commentAPI.addComment(videoId, newComment)
      const added = response?.data?.data
      if (added) {
        setComments(prev => [added, ...prev])
        setNewComment('')
      }
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-4">
          <div className="aspect-video w-full rounded-3xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
          <div className="h-8 w-3/4 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
        </div>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="font-sora font-bold text-2xl text-gray-900 dark:text-white">Video Not Found</h2>
        <p className="text-sm text-gray-500 mt-2">The video you are looking for does not exist or has been removed.</p>
        <Link to="/" className="mt-4 inline-block px-5 py-2.5 rounded-xl bg-crimson text-white font-sora font-semibold text-xs">
          Back to Home
        </Link>
      </div>
    )
  }

  const ownerName = video.owner?.fullname || video.owner?.username || 'Creator'
  const ownerAvatar = video.owner?.avatar
  const ownerUsername = video.owner?.username

  // AI Generated Tags & Discussion Questions mockup
  const aiTags = ['#DrishyaAI', `#${(video.title || 'Creator').split(' ')[0]}`, '#FLUXDev', '#TechReview', '#ViralContent']
  const aiQuestions = [
    `What was your favorite takeaway from ${ownerName}'s breakdown?`,
    `How would you apply the main technique discussed in this video to your own content?`,
    `Do you agree with the key points presented on ${video.title}?`
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Main Video Player & Details */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Cinematic Video Player */}
          <div className="relative aspect-video w-full rounded-3xl overflow-hidden bg-black border border-gray-200 dark:border-gray-800 shadow-premium">
            <video
              src={video.videoFile}
              controls
              autoPlay
              poster={video.thumbnail}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Title & Metadata */}
          <div>
            <h1 className="font-sora font-bold text-xl sm:text-2xl lg:text-3xl text-gray-900 dark:text-white leading-tight">
              {video.title}
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pb-4 border-b border-gray-200 dark:border-gray-800">
              
              {/* Creator Info & Subscribe */}
              <div className="flex items-center gap-3">
                <Link to={ownerUsername ? `/channel/${ownerUsername}` : '#'}>
                  {ownerAvatar ? (
                    <img src={ownerAvatar} alt={ownerName} className="w-11 h-11 rounded-2xl object-cover ring-2 ring-crimson/30" />
                  ) : (
                    <div className="w-11 h-11 rounded-2xl bg-crimson text-white font-bold flex items-center justify-center text-sm">
                      {ownerName[0]}
                    </div>
                  )}
                </Link>
                <div>
                  <div className="flex items-center gap-1.5">
                    <Link to={ownerUsername ? `/channel/${ownerUsername}` : '#'} className="font-sora font-bold text-sm text-gray-900 dark:text-white hover:text-crimson transition">
                      {ownerName}
                    </Link>
                    <CheckCircle2 className="w-4 h-4 text-royalBlue fill-current" />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">12.4K Subscribers</span>
                </div>

                <button
                  onClick={() => setIsSubscribed(!isSubscribed)}
                  className={`ml-3 px-4 py-2 rounded-xl font-sora font-semibold text-xs transition duration-200 shadow-sm ${
                    isSubscribed
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                      : 'bg-crimson hover:bg-redAccent text-white shadow-crimson/20'
                  }`}
                >
                  {isSubscribed ? 'Subscribed' : 'Subscribe'}
                </button>
              </div>

              {/* Action Buttons (Like, Share, Save) */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleLike}
                  className={`px-4 py-2 rounded-xl font-sora font-semibold text-xs flex items-center gap-1.5 transition ${
                    isLiked
                      ? 'bg-crimson text-white shadow-md shadow-crimson/30'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{likeCount}</span>
                </button>

                <button className="px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-sora font-semibold flex items-center gap-1.5 transition">
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Share</span>
                </button>

                <button className="px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-sora font-semibold flex items-center gap-1.5 transition">
                  <Bookmark className="w-4 h-4" />
                  <span className="hidden sm:inline">Save</span>
                </button>
              </div>

            </div>
          </div>

          {/* AI VIDEO INSIGHTS BLOCK (AI Summary, Tags, Questions) */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-50/50 via-white to-red-50/30 dark:from-gray-900 dark:via-[#171717] dark:to-gray-900/50 border border-blue-100 dark:border-gray-800 shadow-premium space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blueAccent to-crimson text-white flex items-center justify-center">
                  <Sparkles className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h3 className="font-sora font-bold text-sm text-gray-900 dark:text-white">
                    Drishya AI Video Insights
                  </h3>
                  <span className="text-[11px] text-gray-500">Automatically generated analysis & summary</span>
                </div>
              </div>

              <button
                onClick={() => setShowAiSummary(!showAiSummary)}
                className="text-xs text-blueAccent hover:underline flex items-center gap-1 font-semibold"
              >
                <span>{showAiSummary ? 'Hide' : 'Show'} Insights</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAiSummary ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {showAiSummary && (
              <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                {/* Summary */}
                <div>
                  <h4 className="text-xs font-sora font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    AI Summary
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {video.description || "In this video, creator explores essential strategies, creative insights, and production techniques tailored for modern viewers."}
                  </p>
                </div>

                {/* AI Tags */}
                <div>
                  <h4 className="text-xs font-sora font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-crimson" />
                    <span>AI Generated Tags</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {aiTags.map((tag, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-blueAccent dark:text-blue-400">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* AI Questions for Discussion */}
                <div>
                  <h4 className="text-xs font-sora font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                    <span>AI Creator Questions</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300">
                    {aiQuestions.map((q, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-white/70 dark:bg-gray-800/60 p-2 rounded-xl">
                        <span className="font-bold text-crimson">•</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* COMMENTS SECTION */}
          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="font-sora font-bold text-xl text-gray-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-crimson" />
                <span>Comments ({comments.length})</span>
              </h3>
            </div>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="flex gap-3">
              <input
                type="text"
                placeholder="Add a discussion response or comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-crimson/50 text-gray-900 dark:text-white"
              />
              <button
                type="submit"
                className="px-5 py-3 rounded-2xl bg-crimson hover:bg-redAccent text-white font-sora font-semibold text-xs shadow-md shadow-crimson/20 transition flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post</span>
              </button>
            </form>

            {/* Comments List */}
            <div className="space-y-3">
              {comments.length === 0 ? (
                <div className="text-center py-8 text-xs text-gray-400">
                  No comments yet. Be the first to start the discussion!
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment._id} className="p-4 rounded-2xl bg-white dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800/80 shadow-sm flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold flex items-center justify-center text-xs">
                      {(comment.owner?.username || 'U')[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-sora font-semibold text-xs text-gray-900 dark:text-white">
                          {comment.owner?.username || 'User'}
                        </span>
                        <span className="text-[10px] text-gray-400">Recently</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Recommended Videos Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="font-sora font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-crimson" />
            <span>Recommended Videos</span>
          </h3>

          <div className="space-y-4">
            {recommendedVideos.map((recVideo) => (
              <VideoCard key={recVideo._id} video={recVideo} />
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
