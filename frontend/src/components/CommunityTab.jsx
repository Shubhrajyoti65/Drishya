import { useState, useEffect } from 'react'
import { tweetAPI, likeAPI } from '../services/api'
import { useAuth } from '../hooks/useAuth'

export default function CommunityTab({ channelId, isOwner }) {
  const { user } = useAuth()
  const [tweets, setTweets] = useState([])
  const [newTweetContent, setNewTweetContent] = useState('')
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
      
      // Prepend the new tweet to the list
      setTweets((prev) => [createdTweet, ...prev])
      setNewTweetContent('')
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
    if (!window.confirm('Are you sure you want to delete this post?')) return

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

  // Format date helper
  const formatRelativeTime = (dateString) => {
    const now = new Date()
    const past = new Date(dateString)
    const diffMs = now - past
    const diffSec = Math.floor(diffMs / 1000)
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
    <div className="max-w-2xl mx-auto space-y-6">
      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Write Community Post Form */}
      {isOwner && (
        <form onSubmit={handleCreateTweet} className="bg-gray-800 border border-gray-700 rounded-xl p-4 shadow-xl">
          <div className="flex gap-3">
            <img
              src={user?.avatar || 'https://via.placeholder.com/150'}
              alt="My Avatar"
              className="w-10 h-10 rounded-full object-cover border border-gray-600"
            />
            <div className="flex-1 space-y-3">
              <textarea
                placeholder="What's on your mind? Share an update..."
                value={newTweetContent}
                onChange={(e) => setNewTweetContent(e.target.value)}
                maxLength={280}
                rows={3}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm transition"
              />
              <div className="flex items-center justify-between">
                <span className={`text-xs ${newTweetContent.length >= 250 ? 'text-amber-400' : 'text-gray-500'}`}>
                  {newTweetContent.length} / 280
                </span>
                <button
                  type="submit"
                  disabled={submitting || !newTweetContent.trim()}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm font-semibold rounded-lg shadow transition duration-200"
                >
                  {submitting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Tweets List */}
      <div className="space-y-4">
        {tweets.length === 0 && !loading ? (
          <div className="text-center py-12 bg-gray-800/40 border border-gray-800 rounded-xl">
            <svg className="w-12 h-12 mx-auto text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-gray-400 text-sm">No community posts yet.</p>
          </div>
        ) : (
          tweets.map((tweet) => {
            const isEditing = editingTweetId === tweet._id
            return (
              <div key={tweet._id} className="bg-gray-800 border border-gray-700/80 rounded-xl p-4 shadow hover:border-gray-600/80 transition duration-200">
                <div className="flex gap-3">
                  <img
                    src={tweet.owner?.avatar || 'https://via.placeholder.com/150'}
                    alt={tweet.owner?.fullname}
                    className="w-10 h-10 rounded-full object-cover border border-gray-700"
                  />
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-bold text-white text-sm truncate">{tweet.owner?.fullname}</span>
                        <span className="text-xs text-gray-400 truncate">@{tweet.owner?.username}</span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500 flex-shrink-0">{formatRelativeTime(tweet.createdAt)}</span>
                      </div>
                      
                      {/* Owner actions */}
                      {isOwner && !isEditing && (
                        <div className="flex items-center gap-1 text-gray-400">
                          <button
                            onClick={() => handleStartEdit(tweet)}
                            className="p-1 hover:text-blue-400 rounded transition"
                            title="Edit Post"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteTweet(tweet._id)}
                            className="p-1 hover:text-red-400 rounded transition"
                            title="Delete Post"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Content / Edit Area */}
                    {isEditing ? (
                      <div className="mt-2 space-y-2">
                        <textarea
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          maxLength={280}
                          rows={3}
                          className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                        />
                        <div className="flex items-center justify-between text-xs">
                          <span className={`${editingContent.length >= 250 ? 'text-amber-400' : 'text-gray-500'}`}>
                            {editingContent.length} / 280
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={handleCancelEdit}
                              disabled={submitting}
                              className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded font-medium"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleUpdateTweet(tweet._id)}
                              disabled={submitting || !editingContent.trim()}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium disabled:bg-gray-600"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-100 text-sm whitespace-pre-wrap leading-relaxed mt-1">{tweet.content}</p>
                    )}

                    {/* Actions */}
                    {!isEditing && (
                      <div className="mt-4 flex items-center">
                        <button
                          onClick={() => handleToggleLike(tweet._id)}
                          className={`flex items-center gap-1.5 text-xs font-semibold py-1 px-2.5 rounded-full transition duration-150 ${
                            tweet.isLikedByUser
                              ? 'bg-blue-900/40 text-blue-400 border border-blue-800'
                              : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                          }`}
                        >
                          <svg
                            className="w-4 h-4"
                            fill={tweet.isLikedByUser ? 'currentColor' : 'none'}
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                          </svg>
                          <span>{tweet.likeCount || 0}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}

        {/* Load More Button */}
        {hasMore && !loading && (
          <div className="flex justify-center pt-4">
            <button
              onClick={handleLoadMore}
              className="px-6 py-2 bg-gray-800 border border-gray-700 hover:bg-gray-700 text-white text-sm font-semibold rounded-lg shadow transition"
            >
              Load More
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
    </div>
  )
}
