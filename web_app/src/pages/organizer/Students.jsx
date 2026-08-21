import { attendees } from '../../data/mockData'

export default function OrganizerStudents() {
  const rows = [...attendees, ...attendees]

  return (
    <div className="page">
      <section className="card content-card">
        <div className="filters">
          <input placeholder="Search Student ID or Name" />
          <select><option>Course</option></select>
          <select><option>Section</option></select>
        </div>

        <div className="student-columns">
          {[rows.slice(0, 5), rows.slice(5, 10)].map((group, idx) => (
            <div className="student-list" key={idx}>
              {group.map((a, i) => (
                <div className="student-row" key={i}>
                  <div className="avatar">{i + 1}</div>
                  <div className="student-name"><b>{a[0]}</b><small>{a[1]}</small></div>
                  <span>{a[2]}</span>
                  <span className="badge green">Present</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="pagination">
          <button>← Previous</button><button className="active">1</button><button>2</button><button>3</button><span>...</span><button>67</button><button>68</button><button>Next →</button>
        </div>
      </section>
    </div>
  )
}
