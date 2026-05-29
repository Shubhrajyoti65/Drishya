import { Link } from 'react-router-dom'
import { useUIStore } from '../stores/uiStore'
import { useAuth } from '../hooks/useAuth'

export default function Sidebar() {
  const toggleSidebar = useUIStore((state) => state.toggleSidebar)
  const { handleLogout } = useAuth()

  return (
    <aside className="w-64 bg-gray-800 border-r border-gray-700 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-blue-400">Drishya</h1>
        <button
          onClick={toggleSidebar}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      <nav className="space-y-2">
        <Link to="/" className="block px-4 py-2 rounded hover:bg-gray-700 text-white">
          Home
        </Link>
        <Link to="/upload" className="block px-4 py-2 rounded hover:bg-gray-700 text-white">
          Upload
        </Link>
        <Link to="/profile" className="block px-4 py-2 rounded hover:bg-gray-700 text-white">
          My Profile
        </Link>
        <Link to="/playlists" className="block px-4 py-2 rounded hover:bg-gray-700 text-white">
          Playlists
        </Link>
        <Link to="/generator" className="block px-4 py-2 rounded hover:bg-gray-700 text-white">
          Content Generator
        </Link>
      </nav>

      <hr className="my-6 border-gray-700" />

      <div className="space-y-2">
        <Link to="/settings" className="block px-4 py-2 rounded hover:bg-gray-700 text-gray-300">
          Settings
        </Link>
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 text-gray-300"
        >
          Logout
        </button>
      </div>
    </aside>
  )
}
