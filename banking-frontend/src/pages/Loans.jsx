import { useState, useEffect } from 'react'
import AppLayout from '../components/AppLayout'
import { loanService } from '../services/loanService'
import { accountService } from '../services/accountService'
import { formatCurrency } from '../utils/formatCurrency'

const PRODUCT_ICONS = { PERSONAL: '💼', HOME: '🏠', AUTO: '🚗', EDUCATION: '🎓' }

export default function Loans() {
  const [products, setProducts] = useState([])
  const [loans, setLoans] = useState([])
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)
  const [applying, setApplying] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ amount: '', tenureMonths: '', accountNumber: '' })

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [p, l, a] = await Promise.all([
        loanService.getProducts(),
        loanService.getMyLoans(),
        accountService.getMyAccounts(),
      ])
      setProducts(p)
      setLoans(l)
      setAccounts(a)
      if (a.length > 0) setForm(f => ({ ...f, accountNumber: a[0].accountNumber }))
    } catch {
      setError('Failed to load loan products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openApply = (product) => {
    setSelected(product)
    setSuccess(null)
    setError('')
  }

  const handleApply = async (e) => {
    e.preventDefault()
    setApplying(true)
    setError('')
    try {
      const result = await loanService.apply({
        loanType: selected.loanType,
        amount: parseFloat(form.amount),
        tenureMonths: parseInt(form.tenureMonths, 10),
        accountNumber: form.accountNumber,
      })
      setSuccess(result)
      setSelected(null)
      await load()
    } catch (err) {
      setError(err.response?.data?.message || 'Loan application failed')
    } finally {
      setApplying(false)
    }
  }

  return (
    <AppLayout section="Loans">
      <h1 style={styles.title}>Loan Products</h1>
      <p style={styles.subtitle}>Apply in minutes — approved loans are disbursed instantly to your account.</p>

      {error && <div style={styles.error}>{error}</div>}
      {success && (
        <div style={styles.success}>
          ✅ {formatCurrency(success.principalAmount)} disbursed to {success.disbursementAccountNumber}.
          EMI: {formatCurrency(success.monthlyInstallment)}/mo for {success.tenureMonths} months.
        </div>
      )}

      {loading ? (
        <div style={styles.center}>Loading loan products...</div>
      ) : (
        <div style={styles.grid}>
          {products.map(p => (
            <div key={p.loanType} style={styles.productCard}>
              <div style={styles.productIcon}>{PRODUCT_ICONS[p.loanType]}</div>
              <h3 style={styles.productTitle}>{p.displayName}</h3>
              <p style={styles.productDesc}>{p.description}</p>
              <div style={styles.productMeta}>
                <span>{p.interestRateApr}% APR</span>
                <span>Up to {formatCurrency(p.maxAmount)}</span>
                <span>Up to {p.maxTenureMonths} mo</span>
              </div>
              <button style={styles.applyBtn} onClick={() => openApply(p)} disabled={accounts.length === 0}>
                Apply Now
              </button>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div style={styles.modalOverlay} onClick={() => setSelected(null)}>
          <form
            style={styles.modal}
            onClick={e => e.stopPropagation()}
            onSubmit={handleApply}
          >
            <h2 style={styles.modalTitle}>Apply for {selected.displayName}</h2>
            <div style={styles.field}>
              <label style={styles.label}>Amount (max {formatCurrency(selected.maxAmount)})</label>
              <input
                type="number" min="1" max={selected.maxAmount} step="0.01" required
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
                style={styles.input}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Tenure in months (max {selected.maxTenureMonths})</label>
              <input
                type="number" min="1" max={selected.maxTenureMonths} required
                value={form.tenureMonths}
                onChange={e => setForm({ ...form, tenureMonths: e.target.value })}
                style={styles.input}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Disburse To</label>
              <select
                value={form.accountNumber}
                onChange={e => setForm({ ...form, accountNumber: e.target.value })}
                style={styles.input}
              >
                {accounts.map(a => (
                  <option key={a.id} value={a.accountNumber}>
                    {a.accountType} — {a.accountNumber}
                  </option>
                ))}
              </select>
            </div>
            <div style={styles.modalActions}>
              <button type="button" style={styles.cancelBtn} onClick={() => setSelected(null)}>Cancel</button>
              <button type="submit" style={styles.submitBtn} disabled={applying}>
                {applying ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      )}

      <h2 style={styles.sectionTitle}>My Loans</h2>
      {loans.length === 0 ? (
        <div style={styles.empty}>No loans yet.</div>
      ) : (
        <div style={styles.card}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Type</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Principal</th>
                <th style={styles.th}>Rate</th>
                <th style={styles.th}>Tenure</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>EMI</th>
                <th style={styles.th}>Account</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loans.map(l => (
                <tr key={l.id}>
                  <td style={styles.td}>{PRODUCT_ICONS[l.loanType]} {l.loanType}</td>
                  <td style={{ ...styles.td, textAlign: 'right' }}>{formatCurrency(l.principalAmount)}</td>
                  <td style={styles.td}>{l.interestRateApr}%</td>
                  <td style={styles.td}>{l.tenureMonths} mo</td>
                  <td style={{ ...styles.td, textAlign: 'right' }}>{formatCurrency(l.monthlyInstallment)}</td>
                  <td style={{ ...styles.td, fontFamily: 'monospace' }}>{l.disbursementAccountNumber}</td>
                  <td style={styles.td}>
                    <span style={styles.statusBadge}>{l.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppLayout>
  )
}

const styles = {
  title: { fontSize: '22px', fontWeight: 700, color: 'var(--scf-navy)' },
  subtitle: { fontSize: '13.5px', color: 'var(--scf-text-muted)', marginTop: '4px', marginBottom: '24px' },
  error: { background: '#fdecea', color: '#c0392b', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px' },
  success: { background: '#e8f5e9', color: '#2e7d32', padding: '12px 16px', borderRadius: '8px', fontSize: '13.5px', marginBottom: '20px' },
  center: { padding: '60px', textAlign: 'center', color: '#7f8c8d' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '18px', marginBottom: '36px' },
  productCard: { background: '#fff', borderRadius: '16px', padding: '22px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '10px' },
  productIcon: { fontSize: '26px' },
  productTitle: { fontSize: '15px', fontWeight: 700, color: 'var(--scf-navy)' },
  productDesc: { fontSize: '12.5px', color: 'var(--scf-text-muted)', lineHeight: 1.5, minHeight: '52px' },
  productMeta: { display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '11.5px', color: '#5d6d7e', fontWeight: 600 },
  applyBtn: {
    marginTop: '8px', padding: '10px', borderRadius: '8px', border: 'none',
    background: 'var(--scf-navy)', color: '#fff', fontWeight: 600, fontSize: '13px', cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed', inset: 0, background: 'rgba(11,37,69,0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 200,
  },
  modal: { background: '#fff', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '16px' },
  modalTitle: { fontSize: '18px', fontWeight: 700, color: 'var(--scf-navy)' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: 600, color: '#2c3e50' },
  input: { padding: '11px 13px', borderRadius: '8px', border: '1.5px solid #dde1e7', fontSize: '14px', outline: 'none' },
  modalActions: { display: 'flex', gap: '10px', marginTop: '4px' },
  cancelBtn: { flex: 1, padding: '11px', background: 'transparent', color: '#7f8c8d', border: '1.5px solid #dde1e7', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' },
  submitBtn: { flex: 1, padding: '11px', background: 'linear-gradient(135deg, var(--scf-navy-light), var(--scf-navy))', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' },
  sectionTitle: { fontSize: '16px', fontWeight: 700, color: '#2c3e50', marginBottom: '16px' },
  empty: { background: '#fff', borderRadius: '14px', padding: '40px', textAlign: 'center', color: '#7f8c8d' },
  card: { background: '#fff', borderRadius: '14px', padding: '8px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: '11.5px', fontWeight: 700, color: '#5d6d7e', letterSpacing: '0.5px', borderBottom: '1px solid #e8ecf0' },
  td: { padding: '13px 16px', borderBottom: '1px solid #f0f2f5', color: '#2c3e50' },
  statusBadge: { padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: '#e8f5e9', color: '#2e7d32' },
}
