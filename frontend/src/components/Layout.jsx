import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import Notification from './Notification'
import { useUIStore } from '../stores/uiStore'

const Layout = () => {
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen)
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen)
  const location = useLocation()

  // Close sidebar on page route change
  useEffect(() => {
    setSidebarOpen(false)
  }, [location, setSidebarOpen])

  return (
    <div className="min-h-screen bg-white dark:bg-[#0D0D0D] text-gray-900 dark:text-gray-100 flex flex-col font-sans selection:bg-crimson selection:text-white transition-colors duration-300">
      <Navbar />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Floating Sidebar & Click-Outside Backdrop Overlay */}
        {isSidebarOpen && (
          <>
            {/* Backdrop overlay to minimize sidebar on clicking outside */}
            <div 
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs transition-opacity duration-300" 
            />
            <div className="fixed inset-y-0 left-0 z-50 h-full">
              <Sidebar />
            </div>
          </>
        )}

        {/* Main Content Area */}
        <main 
          onClick={() => {
            if (isSidebarOpen) setSidebarOpen(false)
          }}
          className="flex-1 overflow-y-auto min-h-[calc(100vh-4rem)]"
        >
          <Outlet />
        </main>
      </div>

      <Notification />
    </div>
  )
}

export default Layout
