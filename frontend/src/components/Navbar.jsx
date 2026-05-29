import { Link } from 'react-router-dom'
import { useUIStore } from '../stores/uiStore'
import SearchBar from './SearchBar'

export default function Navbar() {
  const toggleSidebar = useUIStore((state) => state.toggleSidebar)
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen)

  return (
    <nav className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {!isSidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-700 text-gray-300 hover:text-white transition flex items-center justify-center"
            title="Open Sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <Link to="/" className="text-xl font-bold text-blue-400 hover:opacity-85 lg:hidden">
          Drishya
        </Link>
      </div>

      <div className="flex-1 max-w-md">
        <SearchBar />
      </div>

      <div className="flex items-center gap-4">
        <Link to="/upload" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-md transition flex items-center gap-1">
          <span>Create</span>
        </Link>
        <Link to="/profile" className="p-2 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition" title="My Profile">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </Link>
      </div>
    </nav>
  )
}
