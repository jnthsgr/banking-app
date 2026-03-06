import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { accountService } from '../services/accountService'

export default function OpenAccount() {
  const navigate = useNavigate()
  const [accountType, setAccountType] = useState('SAVINGS')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await accountService.createAccount(accountType)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>Open a New Account</h2>
          <p style={styles.subtitle}>Choose your account type below</p>

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={styles.options}>
              {['SAVINGS', 'CURRENT'].map(type => (
                <div
                  key={type}
                  onClick={() => setAccountType(type)}
                  style={{
                    ...styles.option,
                    border: accountType === type
                      ? '2px solid #2E86C1'
                      : '2px solid #e0e0e0',
                    background: accountType === type ? '#EBF5FB' : '#fff',
                  }}
                >
                  <span style={styles.optionIcon}>
                    {type === 'SAVINGS' ? '🏦' : '💼'}
                  </span>
                  <span style={styles.optionTitle}>{type}</span>
                  <span style={styles.optionDesc}>
                    {type === 'SAVINGS'
                      ? 'Personal savings account'
                      : 'Business current account'}
                  </span>
                </div>
              ))}
            </div>

            <button
              type="submit"
              style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Open Account'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              style={styles.cancelBtn}
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#f0f2f5' },
  container: { maxWidth: '520px', margin: '0 auto', padding: '48px 24px' },
  card: {
    background: '#fff',
    borderRadius: '16px',
    padding: '40px',
    boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
  },
  title: { fontSize: '22px', fontWeight: '700', color: '#1B4F72', marginBottom: '8px' },
  subtitle: { fontSize: '14px', color: '#7f8c8d', marginBottom: '28px' },
  error: {
    background: '#fdecea', color: '#c0392b',
    padding: '10px 14px', borderRadius: '8px',
    fontSize: '14px', marginBottom: '16px',
  },
  options: { display: 'flex', gap: '16px', marginBottom: '28px' },
  option: {
    flex: 1, padding: '20px', borderRadius: '12px',
    cursor: 'pointer', textAlign: 'center',
    display: 'flex', flexDirection: 'column', gap: '6px',
    transition: 'all 0.2s',
  },
  optionIcon: { fontSize: '32px' },
  optionTitle: { fontSize: '15px', fontWeight: '700', color: '#1B4F72' },
  optionDesc: { fontSize: '12px', color: '#7f8c8d' },
  btn: {
    width: '100%', padding: '13px',
    background: 'linear-gradient(135deg, #1B4F72, #2E86C1)',
    color: '#fff', border: 'none', borderRadius: '8px',
    fontSize: '15px', fontWeight: '600', cursor: 'pointer',
    marginBottom: '12px',
  },
  cancelBtn: {
    width: '100%', padding: '11px',
    background: 'transparent', color: '#7f8c8d',
    border: '1.5px solid #dde1e7', borderRadius: '8px',
    fontSize: '14px', cursor: 'pointer',
  },
}