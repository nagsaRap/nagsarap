
import { Navigate, useLocation } from 'react-router-dom'
export default function ProtectedRoute({children, role}){
  const location=useLocation()
  const session=JSON.parse(localStorage.getItem('attendance_session')||'null')
  if(!session) return <Navigate to="/login" replace state={{from:location}}/>
  if(role && session.role!==role) return <Navigate to={`/${session.role}/dashboard`} replace/>
  return children
}
