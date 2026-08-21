import { Bell, UserCircle, ChevronDown, Menu } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Topbar({ title, onMenu }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const session = JSON.parse(localStorage.getItem('attendance_session') || '{}')

  const logout = () => {
    localStorage.removeItem('attendance_session')
    navigate('/login')
  }

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="mobile-menu-btn" onClick={onMenu}><Menu size={22} /></button>
        <h1>{title}</h1>
      </div>

      <div className="top-actions">
        <Bell size={18} />

        <button className="user-chip" onClick={() => setOpen(!open)}>
          <UserCircle size={23} />
          <span className="user-meta">
            <b>{session.role === 'admin' ? 'Admin' : 'Organizer'}</b>
            <small>{session.name}</small>
          </span>
          <ChevronDown size={14} />
        </button>

        {open && (
          <div className="profile-dropdown">
            <div className="profile-head">
              <b>{session.name}</b>
              <small>{session.id}</small>
            </div>
            <button>Personal Information</button>
            <button>Settings</button>
            <button>About</button>
            <button className="danger" onClick={logout}>Log Out</button>
          </div>
        )}
      </div>
    </header>
  )
}
