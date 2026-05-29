import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { videoAPI, commentAPI, likeAPI } from '../services/api'

export default function Watch() {
  const { videoId } = useParams()
  const [video, setVideo] = useState(null)
  const [comments, setComments] = useState([])
  const [isLiked, setIsLiked] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await videoAPI.getVideoById(videoId)
        setVideo(response.data.data)

        const commentsResponse = await commentAPI.getComments(videoId)
        setComments(commentsResponse.data.data.docs)

        const likeCheck = await likeAPI.checkVideoLike(videoId)
        setIsLiked(likeCheck.data.data.isLiked)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchVideo()
  }, [videoId])

  const handleToggleLike = async () => {
    try {
      const response = await likeAPI.toggleVideoLike(videoId)
      setIsLiked(response.data.data.liked)
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  if (loading) return <div className="p-6">Loading...</div>
  if (!video) return <div className="p-6">Video not found</div>

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <video
            src={video.videoFile}
            controls
            className="w-full rounded-lg bg-black"
          />
          
          <div className="mt-4">
            <h1 className="text-2xl font-bold">{video.title}</h1>
            <p className="text-gray-400 mt-2">{video.description}</p>
            
            <div className="flex gap-4 mt-4">
              <button
                onClick={handleToggleLike}
                className={`px-4 py-2 rounded font-semibold transition ${isLiked ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'}`}
              >
                👍 Like
              </button>
              <button className="px-4 py-2 bg-gray-700 rounded">
                💬 {comments.length}
              </button>
              <button className="px-4 py-2 bg-gray-700 rounded">
                📤 Share
              </button>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-bold mb-4">Comments</h2>
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment._id} className="bg-gray-800 rounded p-3">
                  <p className="font-semibold">{comment.owner?.username}</p>
                  <p className="text-gray-300">{comment.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold mb-4">Recommended</h2>
          <div className="space-y-4">
            {/* Recommendations will be loaded here */}
          </div>
        </div>
      </div>
    </div>
  )
}
