import { useState, useEffect } from 'react'
import { playlistAPI } from '../services/api'
import { useAuthStore } from '../stores/authStore'

export default function Playlist() {
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(true)
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    const fetchPlaylists = async () => {
      if (!user?._id) return
      try {
        const response = await playlistAPI.getUserPlaylists(user._id, 1, 20)
        setPlaylists(response.data.data.docs)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlaylists()
  }, [user])

  if (loading) return <div className="p-6">Loading...</div>

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">My Playlists</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {playlists.map((playlist) => (
          <div key={playlist._id} className="bg-gray-800 rounded-lg p-4 cursor-pointer hover:shadow-lg transition">
            <div className="aspect-video bg-gray-700 rounded mb-3 flex items-center justify-center text-2xl">
              📋
            </div>
            <h3 className="font-bold text-lg">{playlist.name}</h3>
            <p className="text-gray-400">{playlist.videos?.length || 0} videos</p>
          </div>
        ))}
      </div>
    </div>
  )
}
