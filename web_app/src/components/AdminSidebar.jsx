
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, CalendarDays, BarChart3, LogOut } from 'lucide-react'
export default function AdminSidebar(){
 const nav=useNavigate(); const logout=()=>{localStorage.removeItem('attendance_session');nav('/login')}
 return <aside className="sidebar">
  <div className="brand"><div className="brand-logo">CC</div><div className="brand-title">CCIS<br/>Attendance System</div></div>
  <nav className="nav">
   <NavLink to="/admin/dashboard" className={({isActive})=>`nav-item ${isActive?'active':''}`}><LayoutDashboard size={18}/>Dashboard</NavLink>
   <NavLink to="/admin/students" className={({isActive})=>`nav-item ${isActive?'active':''}`}><Users size={18}/>Student Management</NavLink>
   <NavLink to="/admin/events" className={({isActive})=>`nav-item ${isActive?'active':''}`}><CalendarDays size={18}/>Events</NavLink>
   <NavLink to="/admin/analytics" className={({isActive})=>`nav-item ${isActive?'active':''}`}><BarChart3 size={18}/>Analysis</NavLink>
  </nav>
  <div className="logout"><div className="nav-item" onClick={logout}><LogOut size={18}/>Log out</div></div>
 </aside>
}
