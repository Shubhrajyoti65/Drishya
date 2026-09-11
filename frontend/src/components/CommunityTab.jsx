import { useState, useEffect } from 'react'
import { tweetAPI, likeAPI } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import PollCard from './PollCard'
import CommunityCard from './CommunityCard'
import {
  MessageSquare,
  Heart,
  Repeat,
  Bookmark,
  Share2,
  Send,
  Image as ImageIcon,
  BarChart2,
  Sparkles,
  CheckCircle2,
  Edit3,
  Trash2,
  MoreHorizontal,
  Users
} from 'lucide-react'

export default function CommunityTab({ channelId, isOwner }) {
  const { user } = useAuth()
  const [tweets, setTweets] = useState([])
  const [newTweetContent, setNewTweetContent] = useState('')
  const [showPollEditor, setShowPollEditor] = useState(false)
  const [editingTweetId, setEditingTweetId] = useState(null)
  const [editingContent, setEditingContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const fetchTweets = async (pageNum = 1, append = false) => {
    try {
      setLoading(true)
      const response = await tweetAPI.getUserTweets(channelId, pageNum, 10)
      const fetchedTweets = response.data?.data?.tweets || []
      const pagination = response.data?.data?.pagination || {}

      if (append) {
        setTweets((prev) => [...prev, ...fetchedTweets])
      } else {
        setTweets(fetchedTweets)
      }

      setHasMore(pageNum < pagination.totalPages)
      setError(null)
    } catch (err) {
      console.error('Error fetching tweets:', err)
      setError('Failed to load community posts.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (channelId) {
      fetchTweets(1, false)
      setPage(1)
    }
  }, [channelId])

  const handleLoadMore = () => {
    const nextPage = page + 1
    fetchTweets(nextPage, true)
    setPage(nextPage)
  }

  const handleCreateTweet = async (e) => {
    e.preventDefault()
    if (!newTweetContent.trim() || newTweetContent.length > 280) return

    try {
      setSubmitting(true)
      const response = await tweetAPI.createTweet(newTweetContent)
      const createdTweet = response.data.data

      setTweets((prev) => [createdTweet, ...prev])
      setNewTweetContent('')
      setShowPollEditor(false)
      setError(null)
    } catch (err) {
      console.error('Error creating post:', err)
      setError(err.response?.data?.message || 'Failed to create post.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStartEdit = (tweet) => {
    setEditingTweetId(tweet._id)
    setEditingContent(tweet.content)
  }

  const handleCancelEdit = () => {
    setEditingTweetId(null)
    setEditingContent('')
  }

  const handleUpdateTweet = async (tweetId) => {
    if (!editingContent.trim() || editingContent.length > 280) return

    try {
      setSubmitting(true)
      const response = await tweetAPI.updateTweet(tweetId, editingContent)
      const updatedTweet = response.data.data

      setTweets((prev) =>
        prev.map((t) => (t._id === tweetId ? { ...t, ...updatedTweet } : t))
      )
      setEditingTweetId(null)
      setEditingContent('')
      setError(null)
    } catch (err) {
      console.error('Error updating post:', err)
      setError(err.response?.data?.message || 'Failed to update post.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteTweet = async (tweetId) => {
    if (!window.confirm('Are you sure you want to delete this community post?')) return

    try {
      await tweetAPI.deleteTweet(tweetId)
      setTweets((prev) => prev.filter((t) => t._id !== tweetId))
      setError(null)
    } catch (err) {
      console.error('Error deleting post:', err)
      setError('Failed to delete post.')
    }
  }

  const handleToggleLike = async (tweetId) => {
    try {
      const response = await likeAPI.toggleTweetLike(tweetId)
      const isLikedNow = response.data?.data?.liked

      setTweets((prev) =>
        prev.map((t) => {
          if (t._id === tweetId) {
            const countDiff = isLikedNow ? 1 : -1
            return {
              ...t,
              isLikedByUser: isLikedNow,
              likeCount: Math.max(0, (t.likeCount || 0) + countDiff),
            }
          }
          return t
        })
      )
    } catch (err) {
      console.error('Error toggling like:', err)
    }
  }

  const formatRelativeTime = (dateString) => {
    const now = new Date()
    const past = new Date(dateString)
    const diffSec = Math.floor((now - past) / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHr = Math.floor(diffMin / 60)
    const diffDays = Math.floor(diffHr / 24)

    if (diffSec < 60) return 'Just now'
    if (diffMin < 60) return `${diffMin}m ago`
    if (diffHr < 24) return `${diffHr}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return past.toLocaleDateString()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-sora font-semibold">
          {error}
        </div>
      )}

      {/* CREATOR POST PUBLISHER (Royal Blue Accent Header) */}
      {isOwner && (
        <form onSubmit={handleCreateTweet} className="p-5 rounded-3xl bg-white dark:bg-communityDarkCard border border-gray-200 dark:border-gray-800 shadow-premium space-y-4">
          <div className="flex gap-3">
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-10 h-10 rounded-2xl object-cover ring-2 ring-royalBlue/30" />
            ) : (
              <div className="w-10 h-10 rounded-2xl bg-royalBlue text-white font-bold flex items-center justify-center text-sm">
                {(user?.username || 'C')[0].toUpperCase()}
              </div>
            )}
            <div className="flex-1 space-y-3">
              <textarea
                placeholder="Share a video update, discussion prompt, or announcement with your community..."
                value={newTweetContent}
                onChange={(e) => setNewTweetContent(e.target.value)}
                maxLength={280}
                rows={3}
                className="w-full bg-gray-50 dark:bg-[#161B22] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-royalBlue/50 resize-none text-sm transition"
              />

              {showPollEditor && <PollCard pollQuestion={newTweetContent || "Creator Discussion Poll"} />}

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPollEditor(!showPollEditor)}
                    className={`p-2 rounded-xl text-xs font-sora font-semibold flex items-center gap-1.5 transition ${showPollEditor ? 'bg-royalBlue text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                  >
                    <BarChart2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Add Poll</span>
                  </button>

                  <span className={`text-xs ${newTweetContent.length >= 250 ? 'text-amber-500 font-bold' : 'text-gray-400'}`}>
                    {newTweetContent.length} / 280
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !newTweetContent.trim()}
                  className="px-5 py-2.5 bg-royalBlue hover:bg-blueAccent disabled:opacity-50 text-white font-sora font-semibold text-xs rounded-xl shadow-md shadow-royalBlue/20 transition flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Publishing...' : 'Publish Update'}</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* COMMUNITY DISCUSSIONS & POSTS LIST */}
      <div className="space-y-6">
        {tweets.length === 0 && !loading ? (
          <div className="text-center py-16 bg-white dark:bg-communityDarkCard rounded-3xl border border-gray-200 dark:border-gray-800 p-8 shadow-sm">
            <Users className="w-12 h-12 mx-auto text-royalBlue mb-3" />
            <h3 className="font-sora font-bold text-lg text-gray-900 dark:text-white">No Community Updates Yet</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
              This creator hasn't published any community posts yet. Stay tuned for upcoming video updates and discussions!
            </p>
          </div>
        ) : (
          tweets.map((tweet) => {
            const isEditing = editingTweetId === tweet._id
            return (
              <div key={tweet._id} className="p-6 rounded-3xl bg-white dark:bg-communityDarkCard border border-gray-200 dark:border-gray-800/80 shadow-premium hover:shadow-premium-hover transition-all duration-300">
                <div className="flex gap-3.5">
                  {tweet.owner?.avatar ? (
                    <img src={tweet.owner.avatar} alt={tweet.owner.fullname} className="w-11 h-11 rounded-2xl object-cover ring-2 ring-royalBlue/20" />
                  ) : (
                    <div className="w-11 h-11 rounded-2xl bg-royalBlue text-white font-bold flex items-center justify-center text-sm">
                      {(tweet.owner?.username || 'C')[0].toUpperCase()}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-sora font-bold text-sm text-gray-900 dark:text-white truncate">
                          {tweet.owner?.fullname || tweet.owner?.username}
                        </span>
                        <CheckCircle2 className="w-4 h-4 text-royalBlue fill-current flex-shrink-0" />
                        <span className="text-xs text-gray-400">@{tweet.owner?.username}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-400 font-medium">{formatRelativeTime(tweet.createdAt)}</span>
                      </div>

                      {/* Owner actions */}
                      {isOwner && !isEditing && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleStartEdit(tweet)}
                            className="p-1.5 text-gray-400 hover:text-royalBlue rounded-lg transition"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTweet(tweet._id)}
                            className="p-1.5 text-gray-400 hover:text-crimson rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Content / Edit Form */}
                    {isEditing ? (
                      <div className="space-y-3 mt-2">
                        <textarea
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          maxLength={280}
                          rows={3}
                          className="w-full bg-gray-50 dark:bg-[#161B22] border border-gray-200 dark:border-gray-800 rounded-2xl p-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-royalBlue"
                        />
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">{editingContent.length} / 280</span>
                          <div className="flex gap-2">
                            <button
                              onClick={handleCancelEdit}
                              className="px-3 py-1.5 rounded-xl bg-gray-200 dark:bg-gray-800 text-xs font-semibold"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleUpdateTweet(tweet._id)}
                              className="px-3 py-1.5 rounded-xl bg-royalBlue text-white text-xs font-semibold"
                            >
                              Save Changes
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-sans whitespace-pre-wrap mb-4">
                        {tweet.content}
                      </p>
                    )}

                    {/* Actions Bar */}
                    {!isEditing && (
                      <div className="flex items-center gap-6 pt-3 border-t border-gray-100 dark:border-gray-800/60 text-xs text-gray-500 font-semibold">
                        <button
                          onClick={() => handleToggleLike(tweet._id)}
                          className={`flex items-center gap-1.5 transition ${tweet.isLikedByUser ? 'text-crimson' : 'hover:text-crimson'
                            }`}
                        >
                          <Heart className={`w-4 h-4 ${tweet.isLikedByUser ? 'fill-current' : ''}`} />
                          <span>{tweet.likeCount || 0}</span>
                        </button>

                        <button className="flex items-center gap-1.5 hover:text-royalBlue transition">
                          <MessageSquare className="w-4 h-4" />
                          <span>Reply</span>
                        </button>

                        <button className="flex items-center gap-1.5 hover:text-emerald-500 transition">
                          <Repeat className="w-4 h-4" />
                          <span>Repost</span>
                        </button>

                        <button className="flex items-center gap-1.5 hover:text-amber-500 transition">
                          <Bookmark className="w-4 h-4" />
                          <span>Save</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}

        {/* Load More */}
        {hasMore && !loading && (
          <div className="flex justify-center pt-4">
            <button
              onClick={handleLoadMore}
              className="px-6 py-2.5 rounded-2xl bg-white dark:bg-communityDarkCard border border-gray-200 dark:border-gray-800 text-xs font-sora font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Load More Discussions
            </button>
          </div>
        )}
      </div>

      {/* FEATURED CREATOR COMMUNITIES CARDS */}
      <div className="pt-8 space-y-4">
        <h3 className="font-sora font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-royalBlue" />
          <span>Recommended Communities</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CommunityCard
            community={{
              name: 'Drishya AI Creators Hub',
              members: '28.4K',
              activity: 'Active 2m ago',
              description: 'Official creator network for discussing AI workflows, prompts, and thumbnail techniques.',
              image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80'
            }}
          />
          <CommunityCard
            community={{
              name: 'Tech & Video Production',
              members: '19.1K',
              activity: 'Active 12m ago',
              description: 'Hardware reviews, camera setups, editing shortcuts, and video growth strategies.',
              image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80'
            }}
          />
        </div>
      </div>
    </div>
  )
}
