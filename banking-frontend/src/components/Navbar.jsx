import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav style={styles.nav}>
      <Link to="/dashboard" style={{ textDecoration: 'none' }}>
        <Logo size={30} light />
      </Link>
      <div style={styles.right}>
        {user?.role === 'ADMIN' && (
          <Link to="/admin" style={styles.adminLink}>Admin</Link>
        )}
        <span style={styles.welcome}>Hello, {user?.fullName?.split(' ')[0]}</span>
        <span style={styles.badge}>{user?.role}</span>
        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
      </div>
    </nav>
  )
}

const styles = {
  nav: {
    background: 'linear-gradient(135deg, var(--scf-navy-light), var(--scf-navy))',
    padding: '0 32px',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  adminLink: {
    color: '#fff',
    fontSize: '13px',
    fontWeight: '600',
    textDecoration: 'none',
    padding: '6px 12px',
    borderRadius: '8px',
    background: 'rgba(201,150,46,0.25)',
    border: '1px solid rgba(201,150,46,0.5)',
  },
  welcome: {
    color: '#fff',
    fontSize: '14px',
  },
  badge: {
    background: 'rgba(255,255,255,0.2)',
    color: '#fff',
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '0.5px',
  },
  logoutBtn: {
    background: 'rgba(255,255,255,0.15)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.3)',
    padding: '7px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: 'pointer',
    fontWeight: '600',
  },
}
