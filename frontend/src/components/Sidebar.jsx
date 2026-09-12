import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useUIStore } from '../stores/uiStore'
import { useAuth } from '../hooks/useAuth'
import { 
  Home, 
  User, 
  ListVideo, 
  Sparkles, 
  Settings, 
  LogOut, 
  X, 
  Users, 
  Video,
  Star
} from 'lucide-react'

export default function Sidebar() {
  const toggleSidebar = useUIStore((state) => state.toggleSidebar)
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen)
  const { user, handleLogout } = useAuth()
  const location = useLocation()

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'AI Studio', path: '/generator', icon: Sparkles, badge: 'AI' },
    { name: 'My Profile', path: user?.username ? `/channel/${user.username}` : "/profile", icon: User },
    { name: 'My Subscriptions', path: '/memberships', icon: Star },
    { name: 'Playlists', path: '/playlists', icon: ListVideo },
  ]

  const isActive = (path) => location.pathname === path

  const handleLinkClick = () => {
    setSidebarOpen(false)
  }

  return (
    <aside className="w-64 bg-white dark:bg-[#0D0D0D] border-r border-gray-200 dark:border-gray-800/80 p-5 flex flex-col h-full z-40 transition-all duration-300 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link to="/" onClick={handleLinkClick} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-crimson flex items-center justify-center text-white shadow-md shadow-crimson/20">
            <Video className="w-4 h-4 fill-current" />
          </div>
          <span className="font-sora font-bold text-lg text-gray-900 dark:text-white">
            Drishya<span className="text-crimson">.</span>
          </span>
        </Link>
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          title="Close Sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 space-y-6 overflow-y-auto pr-1">
        <div>
          <h3 className="text-[11px] font-sora font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
            Menu
          </h3>
          <nav className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon
              const active = isActive(link.path)
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={handleLinkClick}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                    active
                      ? 'bg-crimson/10 dark:bg-crimson/20 text-crimson font-semibold'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${active ? 'text-crimson' : 'text-gray-400'}`} />
                    <span>{link.name}</span>
                  </div>
                  {link.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-gradient-to-r from-blueAccent to-crimson text-white">
                      {link.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Communities Section */}
        <div>
          <h3 className="text-[11px] font-sora font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
            Explore & Network
          </h3>
          <nav className="space-y-1">
            <Link
              to="/community"
              onClick={handleLinkClick}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition ${
                location.pathname === '/community'
                  ? 'bg-crimson/10 dark:bg-crimson/20 text-crimson font-semibold'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 text-royalBlue" />
              <span>Creator Community</span>
            </Link>
          </nav>
        </div>
      </div>

      {/* Footer / Account */}
      <div className="pt-4 mt-auto border-t border-gray-200 dark:border-gray-800 space-y-1">
        <Link
          to="/settings"
          onClick={handleLinkClick}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition ${
            isActive('/settings')
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4 text-gray-400" />
          <span>Settings</span>
        </Link>
        <button
          onClick={() => {
            handleLinkClick()
            handleLogout()
          }}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-crimson transition"
        >
          <LogOut className="w-4 h-4 text-gray-400" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
