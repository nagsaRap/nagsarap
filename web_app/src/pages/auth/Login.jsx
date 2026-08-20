
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
export default function Login(){
 const [role,setRole]=useState('admin'); const [username,setUsername]=useState(''); const [password,setPassword]=useState(''); const [error,setError]=useState(''); const nav=useNavigate()
 const submit=(e)=>{e.preventDefault(); if(!username||!password){setError('Enter your username and password.');return}
  const session={role,name:role==='admin'?'Raphael Gabion':'Lowell Cabie',id:role==='admin'?'ADMIN-001':'ORG-001'}
  localStorage.setItem('attendance_session',JSON.stringify(session)); nav(`/${role}/dashboard`)
 }
 return <div className="auth-page"><div className="auth-card">
  <div className="auth-brand"><div className="auth-logo">CCIS</div><h1>Attendance System</h1><p>University-ready attendance management for administrators and organizers.</p></div>
  <form className="auth-form" onSubmit={submit}>
   <h1>Sign in</h1><div className="muted">Use your authorized account to continue.</div>
   <div className="role-switch"><button type="button" className={role==='admin'?'active':''} onClick={()=>setRole('admin')}>Admin</button><button type="button" className={role==='organizer'?'active':''} onClick={()=>setRole('organizer')}>Organizer</button></div>
   <div className="field"><label>Username / Email</label><input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Enter username or email"/></div>
   <div className="field"><label>Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter password"/></div>
   {error&&<div style={{color:'red',fontSize:12,marginBottom:10}}>{error}</div>}
   <button className="btn block">Log in</button>
   <div style={{fontSize:11,color:'#777',marginTop:12}}>UI prototype only — real Laravel authentication will replace this mock login later.</div>
  </form>
 </div></div>
}
