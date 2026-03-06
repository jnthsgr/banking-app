import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { accountService } from '../services/accountService'
import { transactionService } from '../services/transactionService'
import { formatCurrency } from '../utils/formatCurrency'

export default function Deposit() {
  const navigate = useNavigate()
  const [accounts, setAccounts] = useState([])
  const [form, setForm] = useState({ accountNumber: '', amount: '', description: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    accountService.getMyAccounts().then(data => {
      setAccounts(data)
      if (data.length > 0) setForm(f => ({ ...f, accountNumber: data[0].accountNumber }))
    })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const result = await transactionService.deposit({
        accountNumber: form.accountNumber,
        amount: parseFloat(form.amount),
        description: form.description || 'Deposit',
      })
      setSuccess(result)
    } catch (err) {
      setError(err.response?.data?.message || 'Deposit failed')
    } finally {
      setLoading(false)
    }
  }

  if (success) return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>✅</div>
            <h2 style={styles.successTitle}>Deposit Successful</h2>
            <p style={styles.successAmt}>{formatCurrency(success.amount)}</p>
            <p style={styles.successSub}>New Balance: {formatCurrency(success.balanceAfter)}</p>
            <p style={styles.ref}>Ref: {success.referenceNumber}</p>
            <button onClick={() => navigate('/dashboard')} style={styles.btn}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>Deposit Funds</h2>
          {error && <div style={styles.error}>{error}</div>}
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Select Account</label>
              <select
                value={form.accountNumber}
                onChange={e => setForm({ ...form, accountNumber: e.target.value })}
                style={styles.input}
              >
                {accounts.map(a => (
                  <option key={a.id} value={a.accountNumber}>
                    {a.accountType} — {a.accountNumber} ({formatCurrency(a.balance)})
                  </option>
                ))}
              </select>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Amount (₹)</label>
              <input
                type="number" min="1" step="0.01"
                placeholder="Enter amount"
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
                style={styles.input} required
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Description (optional)</label>
              <input
                type="text" placeholder="e.g. Salary credit"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                style={styles.input}
              />
            </div>
            <button type="submit" style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
              {loading ? 'Processing...' : 'Deposit'}
            </button>
            <button type="button" onClick={() => navigate('/dashboard')} style={styles.cancelBtn}>
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
  container: { maxWidth: '480px', margin: '0 auto', padding: '48px 24px' },
  card: { background: '#fff', borderRadius: '16px', padding: '40px', boxShadow: '0 2px 16px rgba(0,0,0,0.08)' },
  title: { fontSize: '22px', fontWeight: '700', color: '#1B4F72', marginBottom: '24px' },
  error: { background: '#fdecea', color: '#c0392b', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#2c3e50' },
  input: { padding: '11px 13px', borderRadius: '8px', border: '1.5px solid #dde1e7', fontSize: '14px', outline: 'none' },
  btn: { padding: '13px', background: 'linear-gradient(135deg, #1B4F72, #2E86C1)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' },
  cancelBtn: { padding: '11px', background: 'transparent', color: '#7f8c8d', border: '1.5px solid #dde1e7', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' },
  successTitle: { fontSize: '22px', fontWeight: '700', color: '#1B4F72', marginBottom: '8px' },
  successAmt: { fontSize: '36px', fontWeight: '700', color: '#2e7d32', marginBottom: '8px' },
  successSub: { fontSize: '15px', color: '#5d6d7e', marginBottom: '6px' },
  ref: { fontSize: '12px', color: '#95a5a6', fontFamily: 'monospace', marginBottom: '24px' },
}