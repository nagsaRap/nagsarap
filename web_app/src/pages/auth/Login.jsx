import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [role, setRole] = useState('organizer')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const submit = (e) => {
    e.preventDefault()

    if (!username || !password) {
      setError('Enter your username and password.')
      return
    }

    const session = role === 'admin'
      ? { role: 'admin', name: 'Raphael Gabion', id: 'ADMIN-001' }
      : { role: 'organizer', name: 'Lowell Cabie', id: 'ORG-001' }

    localStorage.setItem('attendance_session', JSON.stringify(session))
    navigate(`/${role}/dashboard`)
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-logo">CCIS</div>
          <h1>Attendance System</h1>
          <p>Secure access for administrators and organizers.</p>
        </div>

        <form className="login-form" onSubmit={submit}>
          <h2>Sign in</h2>
          <p className="muted">Choose your role and enter your credentials.</p>

          <div className="role-switch">
            <button type="button" className={role === 'admin' ? 'active' : ''} onClick={() => setRole('admin')}>Admin</button>
            <button type="button" className={role === 'organizer' ? 'active' : ''} onClick={() => setRole('organizer')}>Organizer</button>
          </div>

          <label>Username / Email</label>
          <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter username or email" />

          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" />

          {error && <div className="error">{error}</div>}

          <button className="primary-btn full">Log in</button>
          <small className="muted">UI prototype: any non-empty username and password works.</small>
        </form>
      </div>
    </div>
  )
}
