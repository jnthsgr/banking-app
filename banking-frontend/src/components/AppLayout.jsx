import { useAuth } from '../context/AuthContext'
import Sidebar from './Sidebar'

export default function AppLayout({ section, children }) {
  const { user } = useAuth()

  const now = new Date()
  const dateLabel = now.toLocaleString('en-IN', {
    hour: '2-digit', minute: '2-digit',
    day: '2-digit', month: 'short', year: 'numeric',
  })

  return (
    <div style={styles.shell}>
      <Sidebar />
      <div style={styles.main}>
        <header style={styles.topbar}>
          <div>
            <span style={styles.crumb}>{section}</span>
            <span style={styles.greeting}>
              {' '}&middot; Hello {user?.fullName?.split(' ')[0] || 'there'}, welcome back.
            </span>
          </div>
          <span style={styles.date}>{dateLabel}</span>
        </header>
        <div style={styles.content}>
          {children}
        </div>
      </div>
    </div>
  )
}

const styles = {
  shell: { display: 'flex', minHeight: '100vh', background: 'var(--scf-bg)' },
  main: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' },
  topbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 32px',
    flexWrap: 'wrap',
    gap: '8px',
  },
  crumb: { fontSize: '14px', fontWeight: 700, color: 'var(--scf-navy)' },
  greeting: { fontSize: '14px', color: 'var(--scf-text-muted)' },
  date: { fontSize: '12.5px', color: 'var(--scf-text-muted)' },
  content: { flex: 1, padding: '0 32px 40px' },
}
