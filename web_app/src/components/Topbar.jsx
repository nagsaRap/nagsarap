
import { useState } from 'react'
import { Bell, UserCircle, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
export default function Topbar({title='Dashboard'}){
  const [open,setOpen]=useState(false); const nav=useNavigate()
  const session=JSON.parse(localStorage.getItem('attendance_session')||'{}')
  const logout=()=>{localStorage.removeItem('attendance_session');nav('/login')}
  return <header className="topbar">
    <div className="top-title">{title}</div>
    <div style={{display:'flex',alignItems:'center',gap:16,position:'relative'}}>
      <Bell size={18}/>
      <div className="user-menu" onClick={()=>setOpen(!open)}>
        <UserCircle size={22}/><div><b>{session.role==='admin'?'Admin':'Organizer'}</b><br/>{session.name||'User'}</div><ChevronDown size={14}/>
      </div>
      {open&&<div className="profile-pop">
        <div className="item"><b>{session.name||'User'}</b><br/><small>{session.id||'23-140023'}</small></div>
        <div className="item">Personal Information</div><div className="item">Settings</div><div className="item">About</div>
        <div className="item" style={{color:'red',cursor:'pointer'}} onClick={logout}>Log Out</div>
      </div>}
    </div>
  </header>
}
