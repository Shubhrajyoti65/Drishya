import { useAuth } from '../hooks/useAuth'
import { Navigate } from 'react-router-dom'

export default function Profile() {
  const { user } = useAuth()

  if (user?.username) {
    return <Navigate to={`/channel/${user.username}`} replace />
  }

  return <Navigate to="/login" replace />
}
