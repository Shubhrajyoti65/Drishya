import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { authAPI, videoAPI, subscriptionAPI } from '../services/api'

export default function Channel() {
  const { username } = useParams()
  const [channel, setChannel] = useState(null)
  const [videos, setVideos] = useState([])
  const [isSubscribed, setIsSubscribed] = useState(false)

  useEffect(() => {
    const fetchChannelData = async () => {
      try {
        const channelResponse = await authAPI.getChannelProfile(username)
        setChannel(channelResponse.data.data)

        const videosResponse = await videoAPI.getVideos(1, 12, 'createdAt', 'desc', channelResponse.data.data._id)
        setVideos(videosResponse.data.data.docs)

        const subResponse = await subscriptionAPI.checkSubscription(channelResponse.data.data._id)
        setIsSubscribed(subResponse.data.data.isSubscribed)
      } catch (error) {
        console.error('Error:', error)
      }
    }

    fetchChannelData()
  }, [username])

  const handleToggleSubscribe = async () => {
    try {
      const response = await subscriptionAPI.toggleSubscription(channel._id)
      setIsSubscribed(response.data.data.subscribed)
      setChannel((prev) => ({
        ...prev,
        subscribersCount: response.data.data.subscribed
          ? prev.subscribersCount + 1
          : Math.max(0, prev.subscribersCount - 1),
      }))
    } catch (error) {
      console.error('Error toggling subscription:', error)
    }
  }

  if (!channel) return <div className="p-6">Loading...</div>

  return (
    <div className="p-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-40 rounded-lg mb-6"></div>
      
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">{channel.fullname}</h1>
          <p className="text-gray-400">@{channel.username}</p>
          <p className="text-gray-400">{channel.subscribersCount} Subscribers</p>
        </div>
        <button
          onClick={handleToggleSubscribe}
          className={`px-6 py-2 rounded font-semibold transition ${isSubscribed ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
        >
          {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
        </button>
      </div>

      <h2 className="text-xl font-bold mb-4">Videos</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {videos.map((video) => (
          <div key={video._id} className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition">
            <img src={video.thumbnail} alt={video.title} className="w-full aspect-video object-cover" />
            <div className="p-3">
              <h3 className="font-semibold truncate">{video.title}</h3>
              <p className="text-sm text-gray-400">{video.views} views</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
