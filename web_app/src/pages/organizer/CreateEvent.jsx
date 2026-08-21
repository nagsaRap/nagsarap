import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function CreateEvent() {
  const [step, setStep] = useState(1)
  const [locations, setLocations] = useState([{ name: 'CCIS', radius: 80 }])
  const navigate = useNavigate()

  const addLocation = () => setLocations([...locations, { name: '', radius: 80 }])

  return (
    <div className="page">
      <div className="wizard">
        {['Details', 'Geolocation', 'Review'].map((label, index) => {
          const n = index + 1
          return (
            <div className={`wizard-step ${step === n ? 'active' : ''} ${step > n ? 'done' : ''}`} key={label}>
              <span>{step > n ? '✓' : n}</span>{label}
            </div>
          )
        })}
      </div>

      {step === 1 && (
        <section className="card content-card">
          <h2>Event Information</h2>
          <label>Event Title</label>
          <input defaultValue="General Assembly" />
          <label>Description</label>
          <textarea defaultValue="General Assembly at the CCIS Lobby 1" />

          <div className="form-grid">
            <div><label>Date</label><input type="date" defaultValue="2026-08-14" /></div>
            <div><label>Time In</label><input type="time" defaultValue="07:00" /></div>
            <div><label>Time Out</label><input type="time" defaultValue="12:00" /></div>
          </div>

          <label>Attendance Rule</label>
          <div className="rule-box">
            <div><span className="dot green"></span><b>Start Attendance</b><small>07:00 AM</small></div>
            <div><span className="dot yellow"></span><b>Present Until</b><small>08:00 AM</small></div>
            <div><span className="dot red"></span><b>Attendance Closed</b><small>After 12:01</small></div>
          </div>

          <div className="actions-row end"><button className="primary-btn" onClick={() => setStep(2)}>NEXT →</button></div>
        </section>
      )}

      {step === 2 && (
        <section className="card content-card">
          <h2>Set Location</h2>
          <div className="map-placeholder"><span>📍</span></div>

          {locations.map((loc, i) => (
            <div className="location-row" key={i}>
              <div><label>Location Name</label><input value={loc.name} onChange={e => {
                const copy = [...locations]; copy[i].name = e.target.value; setLocations(copy)
              }} /></div>
              <div><label>Set Radius (in meters)</label><input type="number" value={loc.radius} onChange={e => {
                const copy = [...locations]; copy[i].radius = e.target.value; setLocations(copy)
              }} /></div>
            </div>
          ))}

          <div className="center"><button className="primary-btn" onClick={addLocation}>+ Add Another Location</button></div>

          <div className="actions-row"><button className="primary-btn" onClick={() => setStep(1)}>← BACK</button><button className="primary-btn" onClick={() => setStep(3)}>NEXT →</button></div>
        </section>
      )}

      {step === 3 && (
        <section className="card content-card">
          <h2>Review</h2>
          <div className="review-box">
            <p><b>Event Title:</b> General Assembly</p>
            <p><b>Description:</b> General Assembly at the CCIS Lobby 1</p>
            <p><b>Date:</b> August 14, 2026</p>
            <p><b>Time In:</b> 07:00 AM</p>
            <p><b>Time Out:</b> 12:00 PM</p>
          </div>

          <div className="rule-box">
            <div><span className="dot green"></span><b>Start Attendance</b><small>07:00 AM</small></div>
            <div><span className="dot yellow"></span><b>Present Until</b><small>08:00 AM</small></div>
            <div><span className="dot red"></span><b>Attendance Closed</b><small>After 12:01</small></div>
          </div>

          <div className="review-box"><b>Geolocation:</b> CCIS 80 meters</div>

          <div className="actions-row">
            <button className="primary-btn" onClick={() => setStep(2)}>← BACK</button>
            <button className="primary-btn" onClick={() => navigate('/organizer/events/submitted')}>SUBMIT FOR APPROVAL →</button>
          </div>
        </section>
      )}
    </div>
  )
}
