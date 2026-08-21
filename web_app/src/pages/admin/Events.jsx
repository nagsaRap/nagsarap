import { useState } from 'react'
import { organizerEvents as initialEvents } from '../../data/mockData'

export default function AdminEvents() {
  const [events, setEvents] = useState(initialEvents)
  const [tab, setTab] = useState('all')

  const shown = tab === 'all' ? events : events.filter(e => e.status === tab)

  const changeStatus = (id, status) => {
    setEvents(events.map(e => e.id === id ? {...e, status} : e))
  }

  return (
    <div className="page">
      <section className="card content-card">
        <div className="tabs">
          {['all','approved','pending','completed','declined'].map(t => (
            <button key={t} className={`${tab === t ? 'active' : ''} ${t}`} onClick={()=>setTab(t)}>
              {t[0].toUpperCase()+t.slice(1)}
            </button>
          ))}
        </div>
      </section>

      <div className="event-list">
        {shown.map(event => (
          <article className={`event-row ${event.status}`} key={event.id}>
            <div><h3>{event.title}</h3><small>▣ {event.date} &nbsp; ◷ {event.time}</small><small>⌖ {event.location}</small></div>
            <div className="event-buttons">
              {event.status === 'pending' ? (
                <>
                  <button className="primary-btn small" onClick={()=>changeStatus(event.id, 'declined')}>Decline</button>
                  <button className="primary-btn small" onClick={()=>changeStatus(event.id, 'approved')}>Approve</button>
                </>
              ) : (
                <button className="primary-btn small" onClick={()=>alert(`View report: ${event.title}`)}>View Report</button>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
