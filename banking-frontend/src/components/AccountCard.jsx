import { formatCurrency } from '../utils/formatCurrency'

export default function AccountCard({ account, selected, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        ...styles.card,
        border: selected
          ? '2px solid #2E86C1'
          : '2px solid transparent',
        transform: selected ? 'translateY(-2px)' : 'none',
      }}
    >
      <div style={styles.top}>
        <span style={styles.type}>{account.accountType}</span>
        <span style={{
          ...styles.status,
          background: account.status === 'ACTIVE' ? '#e8f5e9' : '#fdecea',
          color: account.status === 'ACTIVE' ? '#2e7d32' : '#c0392b',
        }}>
          {account.status}
        </span>
      </div>
      <div style={styles.balance}>{formatCurrency(account.balance)}</div>
      <div style={styles.accNum}>A/C {account.accountNumber}</div>
    </div>
  )
}

const styles = {
  card: {
    background: 'linear-gradient(135deg, #1B4F72, #2E86C1)',
    borderRadius: '14px',
    padding: '24px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    minWidth: '240px',
  },
  top: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  type: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: '12px',
    fontWeight: '600',
    letterSpacing: '1px',
  },
  status: {
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600',
  },
  balance: {
    color: '#fff',
    fontSize: '28px',
    fontWeight: '700',
    marginBottom: '8px',
  },
  accNum: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '13px',
    fontFamily: 'monospace',
  },
}