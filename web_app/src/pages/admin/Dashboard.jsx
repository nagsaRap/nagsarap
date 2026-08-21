import { UsersRound, CalendarDays, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const recent = [
    ['General Assembly', 'August 14, 2026'],
    ['Event 4', 'August 9, 2026'],
    ['Event 3', 'July 31, 2026'],
    ['Event 2', 'July 28, 2026'],
    ['Event 1', 'August 14, 2025'],
  ]

  return (
    <div className="page admin-dashboard-page">
      <div className="dashboard-grid admin-dashboard-grid">
        <section className="card admin-total figma-card">
          <h3>Total Students Registered</h3>
          <div className="round-icon"><UsersRound size={44} strokeWidth={2.3} /></div>
          <strong>1,013</strong>
          <b>Students</b>
          <div className="metric-divider" />
          <small>Total number of students registered<br/>in the system.</small>
        </section>

        <section className="card chart-card figma-card admin-trend-card">
          <h3>PAST EVENT ATTENDANCE TREND</h3>
          <div className="admin-chart-shell">
            <div className="chart-y-axis"><span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span></div>
            <div className="chart-main">
              <svg viewBox="0 0 640 220" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="adminArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6647ff" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#6647ff" stopOpacity="0.02" />
                  </linearGradient>
                </defs>
                {[30,75,120,165,210].map((y) => <line key={y} x1="0" y1={y} x2="640" y2={y} stroke="#ececf1" strokeWidth="1" />)}
                <path d="M20 166 L132 78 L242 128 L358 54 L468 51 L590 94 L590 210 L20 210 Z" fill="url(#adminArea)" />
                <polyline fill="none" stroke="#5c3cff" strokeWidth="4" points="20,166 132,78 242,128 358,54 468,51 590,94" />
                {[[20,166],[132,78],[242,128],[358,54],[468,51],[590,94]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="5" fill="#5c3cff" />)}
              </svg>
              <div className="admin-chart-labels"><span>General Assembly</span><span>Event 2</span><span>Event 3</span><span>Event 4</span><span>Event 5</span><span>Event 6</span></div>
            </div>
          </div>
        </section>
      </div>

      <div className="lower-grid admin-lower-grid">
        <section className="card figma-card recent-events-card">
          <div className="section-head compact-head"><h3>RECENT EVENTS</h3><button className="text-btn" onClick={()=>navigate('/admin/events')}>View All <ArrowRight size={15}/></button></div>
          <div className="recent-events-list">
            {recent.map(([name,date])=>(
              <div className="recent-event-row" key={name+date}>
                <span className="recent-icon"><CalendarDays size={15}/></span>
                <span className="recent-event-info"><b>{name}</b><small>{date}</small></span>
                <span className="badge percent-badge">95%</span>
              </div>
            ))}
          </div>
        </section>

        <section className="card figma-card pending-approvals-card">
          <div className="section-head compact-head"><h3>PENDING EVENT APPROVALS</h3><button className="text-btn" onClick={()=>navigate('/admin/events')}>View All <ArrowRight size={15}/></button></div>
          <article className="event-row pending figma-pending-event">
            <div>
              <h3>College Re-Organization</h3>
              <small>▣ August 14, 2026 &nbsp;&nbsp; ◷ 7:00 AM - 8:00 AM</small>
              <small>⌖ CCIS Lobby 1</small>
            </div>
            <button className="primary-btn small" onClick={()=>navigate('/admin/events')}>Review <ArrowRight size={12}/></button>
          </article>
        </section>
      </div>
    </div>
  )
}
