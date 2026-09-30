import { useState, useEffect } from 'react'
import AppLayout from '../components/AppLayout'
import { cardService } from '../services/cardService'
import { accountService } from '../services/accountService'
import { formatCurrency } from '../utils/formatCurrency'

const GRADIENTS = [
  'linear-gradient(135deg, var(--scf-navy-light), var(--scf-navy))',
  'linear-gradient(135deg, #2E86C1, #123B6B)',
  'linear-gradient(135deg, #C9962E, #8a6a1f)',
]

export default function Cards() {
  const [cards, setCards] = useState([])
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ accountNumber: '', cardType: 'DEBIT' })
  const [issuing, setIssuing] = useState(false)
  const [busyCard, setBusyCard] = useState(null)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [c, a] = await Promise.all([cardService.getMyCards(), accountService.getMyAccounts()])
      setCards(c)
      setAccounts(a)
      if (a.length > 0) setForm(f => ({ ...f, accountNumber: a[0].accountNumber }))
    } catch {
      setError('Failed to load your cards')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleIssue = async (e) => {
    e.preventDefault()
    setIssuing(true)
    setError('')
    try {
      await cardService.issueCard(form.accountNumber, form.cardType)
      setShowForm(false)
      await load()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to issue card')
    } finally {
      setIssuing(false)
    }
  }

  const toggleLock = async (card) => {
    setBusyCard(card.id)
    try {
      if (card.status === 'LOCKED') await cardService.unlockCard(card.id)
      else await cardService.lockCard(card.id)
      await load()
    } catch {
      setError('Failed to update card')
    } finally {
      setBusyCard(null)
    }
  }

  return (
    <AppLayout section="Cards">
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>My Cards</h1>
          <p style={styles.subtitle}>Issue virtual debit or credit cards linked to your accounts.</p>
        </div>
        <button style={styles.newBtn} onClick={() => setShowForm(s => !s)} disabled={accounts.length === 0}>
          + Issue Card
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {showForm && (
        <form onSubmit={handleIssue} style={styles.formCard}>
          <div style={styles.formRow}>
            <div style={styles.field}>
              <label style={styles.label}>Link to Account</label>
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
            <div style={styles.field}>
              <label style={styles.label}>Card Type</label>
              <select
                value={form.cardType}
                onChange={e => setForm({ ...form, cardType: e.target.value })}
                style={styles.input}
              >
                <option value="DEBIT">Debit Card</option>
                <option value="CREDIT">Credit Card</option>
              </select>
            </div>
          </div>
          <button type="submit" style={styles.submitBtn} disabled={issuing}>
            {issuing ? 'Issuing...' : 'Issue Card'}
          </button>
        </form>
      )}

      {loading ? (
        <div style={styles.center}>Loading your cards...</div>
      ) : cards.length === 0 ? (
        <div style={styles.empty}>
          <p>You don't have any cards yet.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {cards.map((card, i) => (
            <div key={card.id} style={{ ...styles.card, background: GRADIENTS[i % GRADIENTS.length] }}>
              <div style={styles.cardTop}>
                <span style={styles.cardType}>{card.cardType}</span>
                <span style={{
                  ...styles.statusBadge,
                  background: card.status === 'ACTIVE' ? 'rgba(255,255,255,0.2)' : 'rgba(179,38,30,0.35)',
                }}>
                  {card.status}
                </span>
              </div>
              <div style={styles.cardNumber}>{card.maskedCardNumber}</div>
              <div style={styles.cardBottom}>
                <div>
                  <div style={styles.cardMeta}>Cardholder</div>
                  <div style={styles.cardValue}>{card.cardholderName}</div>
                </div>
                <div>
                  <div style={styles.cardMeta}>Expires</div>
                  <div style={styles.cardValue}>
                    {String(new Date(card.expiryDate).getMonth() + 1).padStart(2, '0')}/
                    {String(new Date(card.expiryDate).getFullYear()).slice(-2)}
                  </div>
                </div>
              </div>
              {card.cardType === 'CREDIT' && (
                <div style={styles.limit}>Credit limit: {formatCurrency(card.creditLimit)}</div>
              )}
              <button
                style={styles.lockBtn}
                onClick={() => toggleLock(card)}
                disabled={busyCard === card.id}
              >
                {card.status === 'LOCKED' ? '🔓 Unlock' : '🔒 Lock'}
              </button>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  )
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' },
  title: { fontSize: '22px', fontWeight: 700, color: 'var(--scf-navy)' },
  subtitle: { fontSize: '13.5px', color: 'var(--scf-text-muted)', marginTop: '4px' },
  newBtn: {
    padding: '11px 20px', borderRadius: '8px', border: 'none',
    background: 'var(--scf-navy)', color: '#fff', fontWeight: 600, fontSize: '13.5px', cursor: 'pointer',
  },
  error: { background: '#fdecea', color: '#c0392b', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px' },
  formCard: { background: '#fff', borderRadius: '14px', padding: '24px', marginBottom: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  formRow: { display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '18px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '200px' },
  label: { fontSize: '13px', fontWeight: 600, color: '#2c3e50' },
  input: { padding: '11px 13px', borderRadius: '8px', border: '1.5px solid #dde1e7', fontSize: '14px', outline: 'none' },
  submitBtn: {
    padding: '12px 22px', borderRadius: '8px', border: 'none',
    background: 'linear-gradient(135deg, var(--scf-navy-light), var(--scf-navy))',
    color: '#fff', fontWeight: 600, fontSize: '14px', cursor: 'pointer',
  },
  center: { padding: '60px', textAlign: 'center', color: '#7f8c8d' },
  empty: { background: '#fff', borderRadius: '14px', padding: '48px', textAlign: 'center', color: '#7f8c8d' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
  card: { borderRadius: '18px', padding: '24px', color: '#fff', display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '190px' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardType: { fontSize: '12px', fontWeight: 700, letterSpacing: '1px', color: 'rgba(255,255,255,0.85)' },
  statusBadge: { fontSize: '10.5px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px' },
  cardNumber: { fontSize: '19px', letterSpacing: '2px', fontFamily: 'monospace' },
  cardBottom: { display: 'flex', justifyContent: 'space-between' },
  cardMeta: { fontSize: '10px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  cardValue: { fontSize: '13px', fontWeight: 600 },
  limit: { fontSize: '12px', color: 'rgba(255,255,255,0.8)' },
  lockBtn: {
    alignSelf: 'flex-start', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
    color: '#fff', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
  },
}
