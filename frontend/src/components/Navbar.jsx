import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useUIStore } from '../stores/uiStore'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../context/ThemeContext'
import SearchBar from './SearchBar'
import { 
  Sparkles, 
  Upload, 
  Bell, 
  Sun, 
  Moon, 
  Menu, 
  User, 
  Video, 
  Layers
} from 'lucide-react'

export default function Navbar() {
  const toggleSidebar = useUIStore((state) => state.toggleSidebar)
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen)
  const { user } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()

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

        {/* Right: Actions (AI Studio, Upload, Notifications, Theme, Profile) */}
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

          {/* Upload Button */}
          <Link
            to="/upload"
            className="px-3.5 py-2 bg-crimson hover:bg-redAccent text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-crimson/20 transition-all duration-200 flex items-center gap-1.5 hover:scale-[1.02]"
            title="Upload Video"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden md:inline">Upload</span>
          </Link>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60 transition duration-200"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
          </button>

          {/* Notifications Button */}
          <button
            className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60 transition duration-200 relative hidden sm:flex"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-crimson"></span>
          </button>

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
