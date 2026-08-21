export default function Analytics() {
  return (
    <div className="page">
      <section className="card content-card">
        <div className="analytics-filters">
          <div><label>Event</label><select><option>All Event</option></select></div>
          <div><label>&nbsp;</label><select><option>All Program</option></select></div>
          <div><label>&nbsp;</label><select><option>All Year and Section</option></select></div>
          <div><label>Date Range</label><input type="date" /></div>
        </div>

        <div className="analytics-grid">
          <section className="chart-panel">
            <h3>Attendance Over Time</h3>
            <svg viewBox="0 0 600 190">
              <polyline fill="rgba(105,70,198,.22)" stroke="#6846c6" strokeWidth="4"
                points="20,150 110,68 205,108 315,50 415,47 540,96 540,170 20,170" />
              <line x1="20" y1="170" x2="570" y2="170" stroke="#aaa" />
            </svg>
          </section>

          <section className="chart-panel">
            <h3>By Program</h3>
            <div className="program-grid">
              <div className="donut"><span>Average<br/>Attendance<br/><b>91%</b></span></div>
              <div>
                <p>● BSIT <b>94%</b></p>
                <p>● BSCS <b>90%</b></p>
                <p>● BSBA <b>89%</b></p>
                <p>● BSHM <b>86%</b></p>
                <p>● Others <b>84%</b></p>
              </div>
            </div>
          </section>
        </div>

        <section className="chart-panel year-card">
          <h3>By Year and Section</h3>
          {['BSCS 1A','BSCS 1B','BSIT 1A','BSIT 1B','BSCS 2A','BSCS 2B'].map(x=>(
            <div className="year-row" key={x}><span>{x}</span><b>95%</b></div>
          ))}
        </section>
      </section>
    </div>
  )
}
