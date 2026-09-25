import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthenticateWithRedirectCallback, useUser } from '@clerk/react'
import { useAuth } from './hooks/useAuth'
import { useAuthStore } from './stores/authStore'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import Home from './pages/Home'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Upload from './pages/Upload'
import Watch from './pages/Watch'
import Profile from './pages/Profile'
import Channel from './pages/Channel'
import Playlist from './pages/Playlist'
import PlaylistVideos from './pages/PlaylistVideos'
import Settings from './pages/Settings'
import SearchResults from './pages/SearchResults'
import ContentGenerator from './pages/ContentGenerator'
import MyMemberships from './pages/MyMemberships'
import CreatorMemberships from './pages/CreatorMemberships'
import CommunityPage from './pages/CommunityPage'

function ClerkAuthSync() {
  const { isLoaded, isSignedIn, user } = useUser()
  const { login, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isLoaded && isSignedIn && user && !isAuthenticated) {
      const primaryEmail = user.primaryEmailAddress?.emailAddress || `${user.username || user.id}@clerk.user`
      const fullname = user.fullName || user.firstName || 'Creator'
      const rawUsername = user.username || user.firstName?.toLowerCase() || `user_${user.id.slice(0, 8)}`
      const username = rawUsername.trim().replace(/\s+/g, '_').toLowerCase()
      const avatar = user.imageUrl

      const clerkUserData = {
        _id: user.id,
        email: primaryEmail,
        fullname,
        username,
        avatar,
      }

      localStorage.setItem('user', JSON.stringify(clerkUserData))
      localStorage.setItem('accessToken', `clerk_token_${user.id}`)
      login(clerkUserData, `clerk_token_${user.id}`)
    }
  }, [isLoaded, isSignedIn, user, isAuthenticated, login])

  return null
}

function App() {
  const { isAuthenticated } = useAuth()

  return (
    <ThemeProvider>
      <Router>
        <ClerkAuthSync />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/sso-callback" element={<AuthenticateWithRedirectCallback />} />
          
          <Route element={<Layout />}>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/watch/:videoId" element={<Watch />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/channel/:username" element={<Channel />} />
            <Route path="/channel/:username/:tab" element={<Channel />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
              <Route path="/upload" element={<Upload />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/memberships" element={<MyMemberships />} />
              <Route path="/creator/memberships" element={<CreatorMemberships />} />
              <Route path="/playlists" element={<Playlist />} />
              <Route path="/playlist/:playlistId" element={<PlaylistVideos />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/generator" element={<ContentGenerator />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App
