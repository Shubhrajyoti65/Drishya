import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
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

function App() {
  const { isAuthenticated } = useAuth()

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchResults />} />
          
          <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
            <Route path="/upload" element={<Upload />} />
            <Route path="/watch/:videoId" element={<Watch />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/channel/:username" element={<Channel />} />
            <Route path="/playlists" element={<Playlist />} />
            <Route path="/playlist/:playlistId" element={<PlaylistVideos />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/generator" element={<ContentGenerator />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  )
}

export default App
