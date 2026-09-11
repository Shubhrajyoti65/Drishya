import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import Notification from './Notification'
import { useUIStore } from '../stores/uiStore'

const Layout = () => {
  const isSidebarOpen = useUIStore(state => state.isSidebarOpen)

  return (
    <div className="min-h-screen bg-white dark:bg-[#0D0D0D] text-gray-900 dark:text-gray-100 flex flex-col font-sans selection:bg-crimson selection:text-white transition-colors duration-300">
      <Navbar />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Floating / Sliding Drawer Sidebar */}
        {isSidebarOpen && (
          <div className="fixed inset-y-0 left-0 z-50 h-full">
            <Sidebar />
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>

      <Notification />
    </div>
  )
}

export default Layout
