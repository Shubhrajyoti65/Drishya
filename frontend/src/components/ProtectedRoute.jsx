import { Navigate, Outlet } from 'react-router-dom'

const ProtectedRoute = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return children ? children : <Outlet />
}

export default ProtectedRoute
