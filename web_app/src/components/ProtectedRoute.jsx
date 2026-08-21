import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ role, children }) {
  const session = JSON.parse(localStorage.getItem('attendance_session') || 'null')

  if (!session) return <Navigate to="/login" replace />

  if (role && session.role !== role) {
    return <Navigate to={`/${session.role}/dashboard`} replace />
  }

  return children
}
