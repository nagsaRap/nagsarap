import { useState } from 'react'

export default function Kiosk() {
  const [success, setSuccess] = useState(false)

  return (
    <div className="page">
      <section className="card kiosk-card">
        <div className="kiosk-head">
          <div><b>GENERAL ASSEMBLY</b> <span className="badge green">ON-GOING</span></div>
          <small>▣ August 14, 2026 &nbsp;&nbsp; ◷ 7:00 AM - 8:00 AM</small>
        </div>

        <div className="tips">💡 Tips: Make sure your face is visible and well lit before scanning.</div>

        <div className="camera-frame" onClick={() => setSuccess(true)}>
          <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
          <div className="face-oval"></div>
        </div>

        <div className="camera-caption">READY FOR FACE SCAN<br />LOOK AT THE CAMERA</div>
      </section>

      {success && (
        <div className="modal-backdrop" onClick={() => setSuccess(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="success-circle">✓</div>
            <h3>Attendance Record successfully</h3>
            <p>Greetings Cabie, Lowell 23-140023</p>
            <button className="primary-btn" onClick={() => setSuccess(false)}>Continue</button>
          </div>
        </div>
      )}
    </div>
  )
}
