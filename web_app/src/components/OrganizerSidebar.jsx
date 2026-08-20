
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ScanFace, CalendarPlus, LogOut } from 'lucide-react'
export default function OrganizerSidebar(){
 const nav=useNavigate(); const logout=()=>{localStorage.removeItem('attendance_session');nav('/login')}
 return <aside className="sidebar">
  <div className="brand"><div className="brand-logo">CC</div><div className="brand-title">CCIS<br/>Attendance System</div></div>
  <nav className="nav">
   <NavLink to="/organizer/dashboard" className={({isActive})=>`nav-item ${isActive?'active':''}`}><LayoutDashboard size={18}/>Dashboard</NavLink>
   <NavLink to="/organizer/kiosk" className={({isActive})=>`nav-item ${isActive?'active':''}`}><ScanFace size={18}/>Kiosk Attendance</NavLink>
   <NavLink to="/organizer/events" className={({isActive})=>`nav-item ${isActive?'active':''}`}><CalendarPlus size={18}/>Create Event</NavLink>
  </nav>
  <div className="logout"><div className="nav-item" onClick={logout}><LogOut size={18}/>Log out</div></div>
 </aside>
}
