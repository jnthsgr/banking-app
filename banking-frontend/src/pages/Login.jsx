import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/authService'
import Logo from '../components/Logo'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await authService.login(form)
      login({ fullName: data.fullName, email: data.email, role: data.role }, data.token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page} className="scf-auth-page">
      <div style={styles.brandPanel} className="scf-auth-brand">
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Logo size={40} light />
        </Link>
        <div style={styles.brandCopy}>
          <h1 style={styles.brandTitle}>Welcome back.</h1>
          <p style={styles.brandSubtitle}>
            Sign in to manage your accounts, move money instantly, and track
            every transaction in real time.
          </p>
        </div>
        <div style={styles.brandFooter}>
          🔒 Protected by JWT authentication &amp; BCrypt password hashing
        </div>
      </div>

      <div style={styles.formPanel}>
        <div style={styles.card}>
          <h2 style={styles.title}>Sign In</h2>
          <p style={styles.subtitle}>Enter your credentials to access your account</p>

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Email Address</label>
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <input
                name="password"
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>

            <button
              type="submit"
              style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={styles.link}>
            Don't have an account?{' '}
            <Link to="/register" style={styles.linkText}>Register here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
  },
  brandPanel: {
    background: 'linear-gradient(160deg, var(--scf-navy-light) 0%, var(--scf-navy) 100%)',
    padding: '48px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  brandCopy: { maxWidth: '420px' },
  brandTitle: {
    fontFamily: "'Fraunces', serif",
    fontSize: '38px',
    fontWeight: 700,
    color: '#fff',
    marginBottom: '14px',
  },
  brandSubtitle: { fontSize: '15px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.7 },
  brandFooter: { fontSize: '13px', color: 'rgba(255,255,255,0.55)' },
  formPanel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--scf-bg)',
    padding: '48px 24px',
  },
  card: { width: '100%', maxWidth: '400px' },
  title: { fontSize: '26px', fontWeight: '700', color: 'var(--scf-navy)', marginBottom: '6px' },
  subtitle: { fontSize: '14px', color: 'var(--scf-text-muted)', marginBottom: '28px' },
  error: {
    background: '#fdecea',
    color: '#c0392b',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '16px',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#2c3e50' },
  input: {
    padding: '12px 14px',
    borderRadius: '8px',
    border: '1.5px solid #dde1e7',
    fontSize: '14px',
    outline: 'none',
    background: '#fff',
  },
  button: {
    padding: '13px',
    background: 'linear-gradient(135deg, var(--scf-navy-light), var(--scf-navy))',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '4px',
  },
  link: { marginTop: '20px', fontSize: '13px', color: '#7f8c8d' },
  linkText: { color: 'var(--scf-blue)', fontWeight: '600', textDecoration: 'none' },
}
