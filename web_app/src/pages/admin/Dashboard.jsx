import { UsersRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function AdminDashboard() {
  const navigate = useNavigate()

  return (
    <div className="page">
      <div className="dashboard-grid">
        <section className="card admin-total">
          <h3>Total Students Registered</h3>
          <div className="round-icon"><UsersRound size={46} /></div>
          <strong>1,013</strong>
          <b>Students</b>
          <small>Total number of students registered in the system.</small>
        </section>

        <section className="card chart-card">
          <h3>PAST EVENT ATTENDANCE TREND</h3>
          <svg viewBox="0 0 600 190">
            <polyline fill="rgba(95,63,255,.10)" stroke="#5e3fff" strokeWidth="4"
              points="20,150 115,72 210,108 315,50 410,48 535,84 535,170 20,170" />
            <line x1="20" y1="170" x2="570" y2="170" stroke="#bbb" />
          </svg>
        </section>
      </div>

      <div className="lower-grid">
        <section className="card">
          <div className="section-head"><h3>RECENT EVENTS</h3><button className="text-btn" onClick={()=>navigate('/admin/events')}>View All →</button></div>
          <table>
            <tbody>
              {['General Assembly','Event 4','Event 3','Event 2','Event 1'].map((e,i)=>(
                <tr key={e}><td>▣</td><td><b>{e}</b><small>August {14-i}, 2026</small></td><td><span className="badge green">95%</span></td></tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="card">
          <div className="section-head"><h3>PENDING EVENT APPROVALS</h3><button className="text-btn" onClick={()=>navigate('/admin/events')}>View All →</button></div>
          <article className="event-row pending">
            <div><h3>College Re-Organization</h3><small>▣ August 14, 2026 &nbsp; ◷ 7:00 AM - 8:00 AM</small><small>⌖ CCIS Lobby 1</small></div>
            <button className="primary-btn small" onClick={()=>navigate('/admin/events')}>Review →</button>
          </article>
        </section>
      </div>
    </div>
  )
}
