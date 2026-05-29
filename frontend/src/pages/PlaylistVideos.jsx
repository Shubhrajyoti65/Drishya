import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { playlistAPI, videoAPI } from '../services/api'

export default function PlaylistVideos() {
  const { playlistId } = useParams()
  const [playlist, setPlaylist] = useState(null)
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const response = await playlistAPI.getPlaylist(playlistId)
        setPlaylist(response.data.data)
        setVideos(response.data.data.videos || [])
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlaylist()
  }, [playlistId])

  if (loading) return <div className="p-6">Loading...</div>
  if (!playlist) return <div className="p-6">Playlist not found</div>

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-2">{playlist.name}</h2>
      <p className="text-gray-400 mb-6">{videos.length} videos</p>

      <div className="space-y-4">
        {videos.map((video) => (
          <div
            key={video._id}
            className="bg-gray-800 rounded-lg overflow-hidden flex hover:shadow-lg transition group cursor-pointer"
          >
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-40 aspect-video object-cover group-hover:opacity-75 transition"
            />
            <div className="flex-1 p-4">
              <h3 className="font-semibold text-white">{video.title}</h3>
              <p className="text-sm text-gray-400">{video.owner?.fullname}</p>
              <p className="text-sm text-gray-500 mt-2">{video.views} views</p>
            </div>
            <button className="px-4 py-2 text-red-500 hover:bg-red-500/10 rounded transition">
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
