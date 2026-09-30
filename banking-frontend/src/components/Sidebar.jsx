import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ICONS = {
  home: (
    <path d="M4 11.5 12 4l8 7.5M6 10v9a1 1 0 0 0 1 1h3v-6h4v6h3a1 1 0 0 0 1-1v-9" />
  ),
  cards: (
    <>
      <rect x="3" y="6" width="18" height="13" rx="2.5" />
      <path d="M3 10.5h18" />
      <path d="M7 15h4" />
    </>
  ),
  loans: (
    <>
      <path d="M4 21V10l8-6 8 6v11" />
      <path d="M9 21v-6h6v6" />
    </>
  ),
  admin: (
    <>
      <path d="M12 3 4 6.5V11c0 4.9 3.4 8.9 8 10 4.6-1.1 8-5.1 8-10V6.5L12 3Z" />
      <path d="M9.5 12.2 11.3 14l3.2-3.6" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
}

function Icon({ name, size = 20 }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
    >
      {ICONS[name]}
    </svg>
  )
}

function RailLink({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        ...styles.link,
        ...(isActive ? styles.linkActive : {}),
      })}
      title={label}
    >
      <Icon name={icon} />
    </NavLink>
  )
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside style={styles.rail}>
      <div style={styles.logoMark} title="Saagar Capital Finance">
        <svg width="22" height="22" viewBox="0 0 64 64">
          <path d="M32 12 L52 22 H12 Z" fill="#C9962E" />
          <rect x="16" y="26" width="6" height="22" fill="#ffffff" />
          <rect x="29" y="26" width="6" height="22" fill="#ffffff" />
          <rect x="42" y="26" width="6" height="22" fill="#ffffff" />
          <rect x="12" y="50" width="40" height="5" rx="1.5" fill="#ffffff" />
        </svg>
      </div>

      <nav style={styles.nav}>
        <RailLink to="/dashboard" icon="home" label="Dashboard" />
        <RailLink to="/cards" icon="cards" label="Cards" />
        <RailLink to="/loans" icon="loans" label="Loans" />
        {user?.role === 'ADMIN' && (
          <RailLink to="/admin" icon="admin" label="Back Office" />
        )}
      </nav>

      <button style={styles.plusBtn} title="Open a new account" onClick={() => navigate('/open-account')}>
        <Icon name="plus" size={18} />
      </button>

      <button style={styles.avatar} title={`${user?.fullName || ''} — Logout`} onClick={handleLogout}>
        {user?.fullName?.[0]?.toUpperCase() || '?'}
      </button>
    </aside>
  )
}

const styles = {
  rail: {
    width: '72px',
    minWidth: '72px',
    background: 'var(--scf-navy)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px 0',
    gap: '28px',
    minHeight: '100vh',
  },
  logoMark: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, var(--scf-navy-light), #06182f)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1,
  },
  link: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'rgba(255,255,255,0.55)',
    textDecoration: 'none',
  },
  linkActive: {
    background: 'rgba(201,150,46,0.18)',
    color: 'var(--scf-gold)',
  },
  plusBtn: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    border: '1.5px dashed rgba(255,255,255,0.3)',
    background: 'transparent',
    color: 'rgba(255,255,255,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  avatar: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    border: 'none',
    background: 'var(--scf-gold)',
    color: 'var(--scf-navy)',
    fontWeight: 700,
    fontSize: '14px',
    cursor: 'pointer',
  },
}
