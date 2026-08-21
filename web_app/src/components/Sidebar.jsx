import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, CalendarDays, BarChart3, ScanFace, LogOut } from 'lucide-react'

export default function Sidebar({ role, open, onClose }) {
  const navigate = useNavigate()

  const logout = () => {
    localStorage.removeItem('attendance_session')
    navigate('/login')
  }

  const admin = role === 'admin'

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="brand">
        <div className="logo">CCIS</div>
        <div>
          <b>CCIS</b>
          <span>Attendance System</span>
        </div>
      </div>

      <nav className="nav">
        <NavLink to={`/${role}/dashboard`} onClick={onClose} className={({isActive}) => `navlink ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={21} /> Dashboard
        </NavLink>

        {admin ? (
          <>
            <NavLink to="/admin/students" onClick={onClose} className={({isActive}) => `navlink ${isActive ? 'active' : ''}`}>
              <Users size={21} /> Student Management
            </NavLink>
            <NavLink to="/admin/events" onClick={onClose} className={({isActive}) => `navlink ${isActive ? 'active' : ''}`}>
              <CalendarDays size={21} /> Events
            </NavLink>
            <NavLink to="/admin/analytics" onClick={onClose} className={({isActive}) => `navlink ${isActive ? 'active' : ''}`}>
              <BarChart3 size={21} /> Analysis
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/organizer/kiosk" onClick={onClose} className={({isActive}) => `navlink ${isActive ? 'active' : ''}`}>
              <ScanFace size={21} /> Kiosk Attendance
            </NavLink>
            <NavLink to="/organizer/events" onClick={onClose} className={({isActive}) => `navlink ${isActive ? 'active' : ''}`}>
              <CalendarDays size={21} /> Create Event
            </NavLink>
          </>
        )}
      </nav>

      <button className="logout-link" onClick={logout}>
        <LogOut size={23} /> Log out
      </button>
    </aside>
  )
}
