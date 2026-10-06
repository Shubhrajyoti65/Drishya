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
    <aside className="w-64 bg-neu-surface border-r border-neu-border p-5 flex flex-col h-full z-40 transition-all duration-200 shadow-neu-raised-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link to="/" onClick={handleLinkClick} className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-crimson to-redAccent flex items-center justify-center text-white shadow-neu-glow-crimson border border-red-500/30">
            <Video className="w-4 h-4 fill-current" />
          </div>
          <span className="font-sora font-bold text-lg text-neu-text">
            Drishya<span className="text-crimson">.</span>
          </span>
        </Link>
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-xl text-neu-text-muted hover:text-neu-text bg-neu-surface hover:shadow-neu-raised-xs active:shadow-neu-inset-xs border border-transparent hover:border-neu-border transition-all duration-200"
          title="Close Sidebar"
          aria-label="Close Sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 space-y-6 overflow-y-auto pr-1">
        <div>
          <h3 className="text-[11px] font-sora font-semibold text-neu-text-muted uppercase tracking-wider mb-3 px-3">
            Menu
          </h3>
          <nav className="space-y-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon
              const active = isActive(link.path)
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={handleLinkClick}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-medium text-sm transition-all duration-200 border ${
                    active
                      ? 'bg-neu-surface shadow-neu-inset-xs text-crimson font-semibold border-crimson/30'
                      : 'text-neu-text-secondary hover:text-neu-text bg-neu-surface hover:shadow-neu-raised-xs active:shadow-neu-inset-xs border-transparent hover:border-neu-border'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${active ? 'text-crimson' : 'text-neu-text-muted'}`} />
                    <span>{link.name}</span>
                  </div>
                  {link.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-blueAccent to-crimson text-white">
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
          <h3 className="text-[11px] font-sora font-semibold text-neu-text-muted uppercase tracking-wider mb-3 px-3">
            Explore & Network
          </h3>
          <nav className="space-y-1.5">
            <Link
              to="/community"
              onClick={handleLinkClick}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-medium text-sm transition-all duration-200 border ${
                location.pathname === '/community'
                  ? 'bg-neu-surface shadow-neu-inset-xs text-crimson font-semibold border-crimson/30'
                  : 'text-neu-text-secondary hover:text-neu-text bg-neu-surface hover:shadow-neu-raised-xs active:shadow-neu-inset-xs border-transparent hover:border-neu-border'
              }`}
            >
              <Users className="w-4 h-4 text-royalBlue" />
              <span>Creator Community</span>
            </Link>
          </nav>
        </div>
      </div>

      {/* Footer / Account */}
      <div className="pt-4 mt-auto border-t border-neu-border space-y-1.5">
        <Link
          to="/settings"
          onClick={handleLinkClick}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-medium text-sm transition-all duration-200 border ${
            isActive('/settings')
              ? 'bg-neu-surface shadow-neu-inset-xs text-neu-text font-semibold border-neu-border'
              : 'text-neu-text-secondary hover:text-neu-text bg-neu-surface hover:shadow-neu-raised-xs active:shadow-neu-inset-xs border-transparent hover:border-neu-border'
          }`}
        >
          <Settings className="w-4 h-4 text-neu-text-muted" />
          <span>Settings</span>
        </Link>
        <button
          onClick={() => {
            handleLinkClick()
            handleLogout()
          }}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-medium text-sm text-neu-text-secondary hover:text-crimson bg-neu-surface hover:shadow-neu-raised-xs active:shadow-neu-inset-xs border border-transparent hover:border-crimson/30 transition-all duration-200"
        >
          <LogOut className="w-4 h-4 text-neu-text-muted" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
