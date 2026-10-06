import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useUIStore } from '../stores/uiStore'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../context/ThemeContext'
import SearchBar from './SearchBar'
import {
  Sparkles,
  Upload,
  Bell,
  BellOff,
  Sun,
  Moon,
  Menu,
  User,
  Video,
  Layers,
  CheckCheck,
  Trash2,
  X,
  UserPlus
} from 'lucide-react'

export default function Navbar() {
  const toggleSidebar = useUIStore((state) => state.toggleSidebar)
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen)
  const { user } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()

  // Notification state
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Welcome to Drishya!',
      message: 'Explore AI Studio to generate scripts, thumbnails & voiceovers.',
      time: 'Just now',
      unread: true,
      type: 'ai'
    },
    {
      id: 2,
      title: 'New Subscriber',
      message: '@alex_creator subscribed to your channel.',
      time: '2 hours ago',
      unread: true,
      type: 'subscriber'
    },
    {
      id: 3,
      title: 'System Update',
      message: 'New creator memberships & community tools are active.',
      time: '1 day ago',
      unread: false,
      type: 'system'
    }
  ])

  const notificationRef = useRef(null)

  // Track scroll position for header glassmorphism transition
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close notifications dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const unreadCount = notifications.filter(n => n.unread).length

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-200 border-b ${isScrolled
          ? 'bg-neu-surface/90 backdrop-blur-md border-neu-border shadow-neu-raised-sm'
          : 'bg-neu-surface/60 backdrop-blur-sm border-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* Left: Sidebar Toggle & Drishya Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="p-2.5 rounded-2xl bg-neu-surface text-neu-text-secondary hover:text-neu-text shadow-neu-raised-xs hover:shadow-neu-raised-sm active:shadow-neu-inset-xs border border-neu-border transition-all duration-200"
            title="Toggle Sidebar"
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-crimson to-redAccent flex items-center justify-center text-white shadow-neu-glow-crimson group-hover:scale-105 transition duration-200 border border-red-500/30">
              <Video className="w-5 h-5 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="font-sora font-extrabold text-xl tracking-tight text-neu-text leading-none">
                Drishya<span className="text-crimson">.</span>
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Floating Search Bar */}
        <div className="flex-1 max-w-xl mx-2 hidden sm:block">
          <SearchBar />
        </div>

        {/* Right: Actions (AI Studio, Notifications, Theme, Profile) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* AI Studio Flagship Button */}
          <Link
            to="/generator"
            className={`px-3.5 py-2 rounded-2xl font-sora font-semibold text-xs sm:text-sm transition-all duration-200 flex items-center gap-1.5 border ${location.pathname === '/generator'
                ? 'bg-gradient-to-r from-blueAccent to-crimson text-white shadow-neu-glow-crimson border-red-500/30'
                : 'bg-neu-surface text-neu-text hover:text-crimson shadow-neu-raised-xs hover:shadow-neu-raised-sm active:shadow-neu-inset-xs border-neu-border'
              }`}
            title="Drishya AI Studio"
          >
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="hidden md:inline">AI Studio</span>
          </Link>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-2xl bg-neu-surface text-neu-text-secondary hover:text-neu-text shadow-neu-raised-xs hover:shadow-neu-raised-sm active:shadow-neu-inset-xs border border-neu-border transition-all duration-200"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neu-text-secondary" />}
          </button>

          {/* Notifications Button & Popover Container */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2.5 rounded-2xl transition-all duration-200 relative flex items-center justify-center border ${showNotifications
                  ? 'bg-neu-surface text-crimson shadow-neu-inset-xs border-crimson/40'
                  : 'bg-neu-surface text-neu-text-secondary hover:text-neu-text shadow-neu-raised-xs hover:shadow-neu-raised-sm active:shadow-neu-inset-xs border-neu-border'
                }`}
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-crimson ring-2 ring-neu-surface"></span>
              )}
            </button>

            {/* Notifications Popover Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-neu-surface border border-neu-border rounded-3xl shadow-neu-raised-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">

                {/* Popover Header */}
                <div className="p-4 border-b border-neu-border flex items-center justify-between bg-neu-surface">
                  <div className="flex items-center gap-2">
                    <h3 className="font-sora font-extrabold text-sm text-neu-text">
                      Notifications
                    </h3>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 text-[10px] font-sora font-bold bg-crimson/15 text-crimson rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {notifications.length > 0 && (
                      <>
                        <button
                          onClick={markAllAsRead}
                          className="p-1.5 text-[11px] font-sora font-semibold text-neu-text-secondary hover:text-crimson hover:bg-neu-hover rounded-xl transition flex items-center gap-1"
                          title="Mark all as read"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Mark read</span>
                        </button>
                        <button
                          onClick={clearAllNotifications}
                          className="p-1.5 text-[11px] font-sora font-semibold text-neu-text-secondary hover:text-crimson hover:bg-neu-hover rounded-xl transition flex items-center gap-1"
                          title="Clear all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Popover Body */}
                <div className="max-h-80 overflow-y-auto divide-y divide-neu-border">
                  {notifications.length === 0 ? (
                    <div className="py-10 px-6 text-center flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-2xl bg-neu-surface shadow-neu-inset-xs border border-neu-border flex items-center justify-center text-neu-text-muted mb-2">
                        <BellOff className="w-6 h-6" />
                      </div>
                      <h4 className="font-sora font-bold text-sm text-neu-text">No updates</h4>
                      <p className="text-xs text-neu-text-muted mt-1 max-w-[220px]">
                        You're all caught up! Check back later for new updates.
                      </p>
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        className={`p-4 flex items-start gap-3 transition relative group ${item.unread
                            ? 'bg-crimson/5'
                            : 'hover:bg-neu-hover'
                          }`}
                      >
                        <div className="p-2 rounded-xl bg-neu-surface shadow-neu-inset-xs border border-neu-border text-crimson flex-shrink-0 mt-0.5">
                          {item.type === 'ai' && <Sparkles className="w-4 h-4 text-amber-500" />}
                          {item.type === 'subscriber' && <UserPlus className="w-4 h-4 text-blueAccent" />}
                          {item.type === 'system' && <Bell className="w-4 h-4 text-crimson" />}
                        </div>

                        <div className="flex-1 min-w-0 pr-4">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="font-sora font-bold text-xs text-neu-text truncate">
                              {item.title}
                            </h4>
                            <span className="text-[10px] text-neu-text-muted font-sora shrink-0">
                              {item.time}
                            </span>
                          </div>
                          <p className="text-xs text-neu-text-secondary mt-0.5 leading-snug">
                            {item.message}
                          </p>
                        </div>

                        <button
                          onClick={() => removeNotification(item.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-neu-text-muted hover:text-crimson transition rounded-md absolute top-3 right-3"
                          title="Dismiss"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

              </div>
            )}
          </div>

          {/* User Profile Avatar / Link */}
          <Link
            to={user?.username ? `/channel/${user.username}` : "/profile"}
            className="p-1 rounded-2xl bg-neu-surface border border-neu-border shadow-neu-raised-xs hover:shadow-neu-raised-sm active:shadow-neu-inset-xs transition-all duration-200 flex items-center"
            title={user?.fullname || "My Profile"}
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.fullname || "Profile"}
                className="w-8 h-8 rounded-xl object-cover border border-neu-border"
              />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-neu-hover text-neu-text flex items-center justify-center font-bold text-xs">
                <User className="w-4 h-4" />
              </div>
            )}
          </Link>
        </div>

      </div>

      {/* Mobile Search Bar Row */}
      <div className="px-4 pb-2 sm:hidden">
        <SearchBar />
      </div>
    </header>
  )
}
