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
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/90 dark:bg-[#0D0D0D]/90 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-800/80 shadow-sm' 
          : 'bg-white/50 dark:bg-[#0D0D0D]/50 backdrop-blur-sm border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Sidebar Toggle & Drishya Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60 transition duration-200"
            title="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-crimson to-redAccent flex items-center justify-center text-white shadow-md shadow-crimson/20 group-hover:scale-105 transition duration-200">
              <Video className="w-5 h-5 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="font-sora font-extrabold text-xl tracking-tight text-gray-900 dark:text-white leading-none">
                Drishya<span className="text-crimson">.</span>
              </span>
              <span className="text-[10px] font-medium tracking-widest text-gray-500 uppercase">
                Creator Platform
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
            className={`px-3.5 py-2 rounded-xl font-sora font-semibold text-xs sm:text-sm transition-all duration-200 flex items-center gap-1.5 shadow-sm ${
              location.pathname === '/generator'
                ? 'bg-gradient-to-r from-blueAccent to-crimson text-white shadow-glow-ai'
                : 'bg-gray-100 dark:bg-gray-800/80 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700/80 border border-gray-200 dark:border-gray-700/50'
            }`}
            title="Drishya AI Studio"
          >
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="hidden md:inline">AI Studio</span>
          </Link>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60 transition duration-200"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
          </button>

          {/* Notifications Button & Popover Container */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2 rounded-xl transition duration-200 relative flex items-center justify-center ${
                showNotifications 
                  ? 'bg-crimson/10 text-crimson dark:bg-crimson/20' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60'
              }`}
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-crimson ring-2 ring-white dark:ring-[#0D0D0D]"></span>
              )}
            </button>

            {/* Notifications Popover Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-[#141417] border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                
                {/* Popover Header */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-800/80 flex items-center justify-between bg-gray-50/50 dark:bg-[#18181C]/50">
                  <div className="flex items-center gap-2">
                    <h3 className="font-sora font-extrabold text-sm text-gray-900 dark:text-white">
                      Notifications
                    </h3>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 text-[10px] font-sora font-bold bg-crimson/10 text-crimson rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {notifications.length > 0 && (
                      <>
                        <button
                          onClick={markAllAsRead}
                          className="p-1.5 text-[11px] font-sora font-semibold text-gray-500 hover:text-crimson hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition flex items-center gap-1"
                          title="Mark all as read"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Mark read</span>
                        </button>
                        <button
                          onClick={clearAllNotifications}
                          className="p-1.5 text-[11px] font-sora font-semibold text-gray-500 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition flex items-center gap-1"
                          title="Clear all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Popover Body */}
                <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800/60">
                  {notifications.length === 0 ? (
                    <div className="py-10 px-6 text-center flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800/60 flex items-center justify-center text-gray-400 dark:text-gray-500 mb-2">
                        <BellOff className="w-6 h-6" />
                      </div>
                      <h4 className="font-sora font-bold text-sm text-gray-800 dark:text-gray-200">No updates</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-[220px]">
                        You're all caught up! Check back later for new updates.
                      </p>
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        className={`p-4 flex items-start gap-3 transition relative group ${
                          item.unread 
                            ? 'bg-crimson/5 dark:bg-crimson/10' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800/40'
                        }`}
                      >
                        <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-crimson flex-shrink-0 mt-0.5">
                          {item.type === 'ai' && <Sparkles className="w-4 h-4 text-amber-400" />}
                          {item.type === 'subscriber' && <UserPlus className="w-4 h-4 text-blue-500" />}
                          {item.type === 'system' && <Bell className="w-4 h-4 text-crimson" />}
                        </div>

                        <div className="flex-1 min-w-0 pr-4">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="font-sora font-bold text-xs text-gray-900 dark:text-white truncate">
                              {item.title}
                            </h4>
                            <span className="text-[10px] text-gray-400 font-sora shrink-0">
                              {item.time}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 leading-snug">
                            {item.message}
                          </p>
                        </div>

                        <button
                          onClick={() => removeNotification(item.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition rounded-md absolute top-3 right-3"
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
            className="p-1 rounded-xl hover:ring-2 hover:ring-crimson/50 transition duration-200 flex items-center"
            title={user?.fullname || "My Profile"}
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.fullname || "Profile"}
                className="w-8 h-8 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center justify-center font-bold text-xs">
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
