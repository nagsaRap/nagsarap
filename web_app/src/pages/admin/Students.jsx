import { useState } from 'react'
import { students as initialStudents } from '../../data/mockData'

export default function AdminStudents() {
  const [students, setStudents] = useState(initialStudents)
  const [modal, setModal] = useState(null)

  const deleteStudent = (index) => {
    if (confirm(`Delete ${students[index][1]}?`)) {
      setStudents(students.filter((_, i) => i !== index))
    }
  }

  return (
    <div className="page">
      <section className="card content-card">
        <div className="section-head">
          <span></span>
          <button className="primary-btn" onClick={() => setModal({type:'add'})}>+ Add Student</button>
        </div>

        <div className="filters">
          <input placeholder="Search Student ID or Name" />
          <select><option>Course</option></select>
          <select><option>Section</option></select>
          <select><option>Status</option></select>
        </div>

        <div className="table-scroll">
          <table>
            <thead><tr><th>Student ID</th><th>Name</th><th>Program</th><th>Year & Section</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {students.map((r, i) => (
                <tr key={i}>
                  <td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td><td className="active-text">{r[4]}</td>
                  <td>
                    <button className="icon-btn" onClick={()=>setModal({type:'edit',index:i})}>✎</button>
                    <button className="icon-btn" onClick={()=>deleteStudent(i)}>🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <button>← Previous</button><button className="active">1</button><button>2</button><button>3</button><span>...</span><button>67</button><button>68</button><button>Next →</button>
        </div>
      </section>

      {modal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>{modal.type === 'add' ? 'Add Student' : 'Edit Student'}</h3>
            <input placeholder="Student ID" />
            <input placeholder="Name" />
            <input placeholder="Program" />
            <input placeholder="Year & Section" />
            <div className="state-actions">
              <button className="primary-btn" onClick={()=>setModal(null)}>Cancel</button>
              <button className="primary-btn" onClick={()=>setModal(null)}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
