import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import Notification from './Notification'
import { useUIStore } from '../stores/uiStore'

const Layout = () => {
  const isSidebarOpen = useUIStore(state => state.isSidebarOpen)

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {isSidebarOpen && <Sidebar />}
      
      <div className="flex-1 flex flex-col">
        <Navbar />
        
        <main className="flex-1 overflow-auto bg-gray-950">
          <Outlet />
        </main>
      </div>
      
      <Notification />
    </div>
  )
}

export default Layout
