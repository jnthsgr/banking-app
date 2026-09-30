import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { adminService } from '../services/adminService'
import { formatCurrency } from '../utils/formatCurrency'

export default function AdminPanel() {
  const [tab, setTab] = useState('accounts')
  const [users, setUsers] = useState([])
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyAccount, setBusyAccount] = useState(null)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [u, a] = await Promise.all([
        adminService.getUsers(),
        adminService.getAccounts(),
      ])
      setUsers(u)
      setAccounts(a)
    } catch {
      setError('Failed to load back-office data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const toggleFreeze = async (account) => {
    setBusyAccount(account.accountNumber)
    try {
      if (account.status === 'FROZEN') {
        await adminService.unfreezeAccount(account.accountNumber)
      } else {
        await adminService.freezeAccount(account.accountNumber)
      }
      await load()
    } catch {
      setError('Failed to update account status')
    } finally {
      setBusyAccount(null)
    }
  }

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>
        <h1 style={styles.title}>Back Office</h1>
        <p style={styles.subtitle}>Customer and account oversight for Saagar Capital Finance staff.</p>

        <div style={styles.tabs}>
          <button
            style={{ ...styles.tab, ...(tab === 'accounts' ? styles.tabActive : {}) }}
            onClick={() => setTab('accounts')}
          >
            Accounts ({accounts.length})
          </button>
          <button
            style={{ ...styles.tab, ...(tab === 'users' ? styles.tabActive : {}) }}
            onClick={() => setTab('users')}
          >
            Customers ({users.length})
          </button>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.card}>
          {loading ? (
            <div style={styles.center}>Loading...</div>
          ) : tab === 'accounts' ? (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Account #</th>
                  <th style={styles.th}>Owner</th>
                  <th style={styles.th}>Type</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Balance</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}></th>
                </tr>
              </thead>
              <tbody>
                {accounts.map(a => (
                  <tr key={a.id}>
                    <td style={{ ...styles.td, fontFamily: 'monospace' }}>{a.accountNumber}</td>
                    <td style={styles.td}>{a.ownerName}<br /><span style={styles.muted}>{a.ownerEmail}</span></td>
                    <td style={styles.td}>{a.accountType}</td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>{formatCurrency(a.balance)}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusBadge,
                        background: a.status === 'ACTIVE' ? '#e8f5e9' : '#fdecea',
                        color: a.status === 'ACTIVE' ? '#2e7d32' : '#c0392b',
                      }}>{a.status}</span>
                    </td>
                    <td style={styles.td}>
                      <button
                        style={styles.actionBtn}
                        disabled={busyAccount === a.accountNumber}
                        onClick={() => toggleFreeze(a)}
                      >
                        {a.status === 'FROZEN' ? 'Unfreeze' : 'Freeze'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Phone</th>
                  <th style={styles.th}>Role</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td style={styles.td}>{u.fullName}</td>
                    <td style={styles.td}>{u.email}</td>
                    <td style={styles.td}>{u.phoneNumber}</td>
                    <td style={styles.td}>{u.role}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusBadge,
                        background: u.isActive ? '#e8f5e9' : '#fdecea',
                        color: u.isActive ? '#2e7d32' : '#c0392b',
                      }}>{u.isActive ? 'ACTIVE' : 'SUSPENDED'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: 'var(--scf-bg)' },
  container: { maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' },
  title: { fontSize: '24px', fontWeight: '700', color: 'var(--scf-navy)' },
  subtitle: { fontSize: '14px', color: 'var(--scf-text-muted)', marginBottom: '24px' },
  tabs: { display: 'flex', gap: '8px', marginBottom: '20px' },
  tab: {
    padding: '9px 18px', borderRadius: '8px', border: '1.5px solid var(--scf-border)',
    background: '#fff', fontSize: '13px', fontWeight: '600', color: 'var(--scf-text-muted)', cursor: 'pointer',
  },
  tabActive: { background: 'var(--scf-navy)', color: '#fff', border: '1.5px solid var(--scf-navy)' },
  error: { background: '#fdecea', color: '#c0392b', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px' },
  card: { background: '#fff', borderRadius: '14px', padding: '8px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflowX: 'auto' },
  center: { padding: '40px', textAlign: 'center', color: '#7f8c8d' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: '11.5px', fontWeight: '700', color: '#5d6d7e', letterSpacing: '0.5px', borderBottom: '1px solid #e8ecf0' },
  td: { padding: '13px 16px', borderBottom: '1px solid #f0f2f5', color: '#2c3e50' },
  muted: { color: '#95a5a6', fontSize: '12px' },
  statusBadge: { padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' },
  actionBtn: {
    padding: '6px 14px', borderRadius: '8px', border: 'none',
    background: 'var(--scf-blue)', color: '#fff', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
  },
}
