import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { organizerEvents } from '../../data/mockData'

export default function OrganizerEvents() {
  const [tab, setTab] = useState('all')
  const navigate = useNavigate()

  const events = tab === 'all' ? organizerEvents : organizerEvents.filter(e => e.status === tab)

  const doAction = (label, event) => alert(`${label}: ${event.title}`)

  return (
    <div className="page">
      <section className="card content-card">
        <div className="section-head">
          <h2>My Events</h2>
          <button className="primary-btn" onClick={() => navigate('/organizer/events/new')}>+ Create Event</button>
        </div>

        <div className="tabs">
          {['all', 'approved', 'pending', 'completed', 'declined'].map(t => (
            <button key={t} className={`${tab === t ? 'active' : ''} ${t}`} onClick={() => setTab(t)}>
              {t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </section>

      <div className="event-list">
        {events.map(event => (
          <article className={`event-row ${event.status}`} key={event.id}>
            <div>
              <h3>{event.title}</h3>
              <small>▣ {event.date} &nbsp;&nbsp; ◷ {event.time}</small>
              <small>⌖ {event.location}</small>
            </div>
            <div className="event-buttons">
              <button className="primary-btn small" onClick={() => doAction(event.status === 'approved' ? 'View Attendance' : event.status === 'pending' ? 'View' : 'View Report', event)}>
                {event.status === 'approved' ? 'View Attendance' : event.status === 'pending' ? 'View' : 'View Report'}
              </button>
              <button className="primary-btn small" onClick={() => doAction('Edit', event)}>Edit</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
