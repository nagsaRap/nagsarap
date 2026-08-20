
import { useNavigate } from 'react-router-dom'
export default function Dashboard(){const nav=useNavigate();return <div className="page">
 <div className="grid-2">
  <div className="card admin-stat"><div className="section-title">Total Students Registered</div><div style={{fontSize:54}}>👥</div><div className="num">1,013</div><b>Students</b><small>Total number of students registered in the system.</small></div>
  <div className="card chart"><div className="section-title">PAST EVENT ATTENDANCE TREND</div><svg viewBox="0 0 600 220"><polyline fill="none" stroke="#5e43ff" strokeWidth="4" points="20,180 110,80 210,130 320,55 430,52 540,92"/><line x1="20" y1="190" x2="570" y2="190" stroke="#aaa"/></svg></div>
 </div>
 <div className="grid-2-equal" style={{marginTop:18}}>
  <div className="card" style={{padding:16}}><div style={{display:'flex',justifyContent:'space-between'}}><div className="section-title">RECENT EVENTS</div><button className="btn secondary" onClick={()=>nav('/admin/events')}>View All</button></div>
   <table className="table"><tbody>{['General Assembly','Event 4','Event 3','Event 2','Event 1'].map((x,i)=><tr key={x}><td>▣</td><td><b>{x}</b><br/><small>August {14-i}, 2026</small></td><td><span className="badge green">{[80,89,84,86,90][i]}%</span></td></tr>)}</tbody></table>
  </div>
  <div className="card" style={{padding:16}}><div style={{display:'flex',justifyContent:'space-between'}}><div className="section-title">PENDING EVENT APPROVALS</div><button className="btn secondary" onClick={()=>nav('/admin/events')}>View All</button></div><div className="event-card pending"><div><h3>College Re-Organization</h3><small>August 14, 2026 • 7:00 AM - 8:00 AM<br/>CCIS Lobby 1</small></div><button className="btn">Review →</button></div></div>
 </div>
 </div>}
