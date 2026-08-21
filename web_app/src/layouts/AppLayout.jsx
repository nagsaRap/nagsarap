import { Outlet, useLocation } from 'react-router-dom'
import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'

const titles = {
  '/admin/dashboard': 'Dashboard',
  '/admin/students': 'Student Management',
  '/admin/events': 'Events',
  '/admin/analytics': 'Analytics',
  '/organizer/dashboard': 'Dashboard',
  '/organizer/students': 'Student Management',
  '/organizer/kiosk': 'Kiosk',
  '/organizer/events': 'Create Event',
  '/organizer/events/new': 'Create Event',
}

export default function AppLayout({ role }) {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const title = titles[location.pathname] || (location.pathname.includes('/organizer/events') ? 'Create Event' : 'Dashboard')

  return (
    <div className="app-shell">
      <Sidebar role={role} open={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="main-area">
        <Topbar title={title} onMenu={() => setMenuOpen(!menuOpen)} />
        <Outlet />
      </main>
    </div>
  )
}
