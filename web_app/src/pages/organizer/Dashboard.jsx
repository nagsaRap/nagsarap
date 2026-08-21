import { useNavigate } from 'react-router-dom'
import { attendees } from '../../data/mockData'

export default function OrganizerDashboard() {
  const navigate = useNavigate()

  return (
    <div className="page">
      <section className="card today-card">
        <div>
          <small>TODAY'S EVENT</small>
          <h2>GENERAL ASSEMBLY <span className="badge green">ON-GOING</span></h2>
          <p>▣ August 14, 2026 &nbsp;&nbsp; ◷ 7:00 AM - 8:00 AM &nbsp;&nbsp; ⌖ Main Campus</p>
        </div>
      </section>

      <div className="dashboard-grid">
        <section className="card present-card">
          <h3>Present</h3>
          <strong>768</strong>
          <span>of 1,013 students</span>
          <b>75.81%</b>
          <small>Attendance Rate</small>
        </section>

        <section className="card chart-card">
          <h3>LIVE ATTENDANCE</h3>
          <svg viewBox="0 0 600 190">
            <polyline fill="rgba(64,73,238,.12)" stroke="#3345ee" strokeWidth="4"
              points="20,155 95,125 170,92 245,68 325,50 405,41 490,39 570,40 570,170 20,170" />
            <line x1="20" y1="170" x2="570" y2="170" stroke="#bbb" />
          </svg>
        </section>
      </div>

      <div className="lower-grid">
        <section className="card attendance-status">
          <h3>Attendance Status</h3>
          <div className="status-row"><div><span className="dot green"></span>Present <small>Server Confirmed</small></div><strong>768</strong></div>
          <div className="status-row"><div><span className="dot yellow"></span>Pending Sync <small>Offline Devices</small></div><strong>17</strong></div>
          <div className="status-row"><div><span className="dot red"></span>Absent <small>Not Yet Attended</small></div><strong>228</strong></div>
        </section>

        <section className="card">
          <div className="section-head">
            <h3>WHO ARE PRESENT IN TODAY'S EVENT</h3>
            <button className="text-btn" onClick={() => navigate('/organizer/students')}>View All →</button>
          </div>
          <div className="table-scroll">
            <table>
              <tbody>
                {attendees.map((a, i) => (
                  <tr key={i}>
                    <td><b>{a[0]}</b><small>{a[1]}</small></td>
                    <td>{a[2]}</td>
                    <td><span className="badge green">Present</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
