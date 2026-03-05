import { formatCurrency } from '../utils/formatCurrency'
import { formatDate } from '../utils/formatDate'

export default function TransactionTable({ transactions }) {
  if (!transactions || transactions.length === 0) {
    return (
      <div style={styles.empty}>
        No transactions yet. Make your first deposit!
      </div>
    )
  }

  const getTypeStyle = (type) => {
    if (type === 'DEPOSIT' || type === 'TRANSFER_CREDIT') {
      return { color: '#2e7d32', background: '#e8f5e9' }
    }
    return { color: '#c0392b', background: '#fdecea' }
  }

  const getSign = (type) => {
    return type === 'DEPOSIT' || type === 'TRANSFER_CREDIT' ? '+' : '-'
  }

  return (
    <div style={styles.wrapper}>
      <table style={styles.table}>
        <thead>
          <tr style={styles.headerRow}>
            <th style={styles.th}>Date</th>
            <th style={styles.th}>Type</th>
            <th style={styles.th}>Description</th>
            <th style={styles.th}>Reference</th>
            <th style={{ ...styles.th, textAlign: 'right' }}>Amount</th>
            <th style={{ ...styles.th, textAlign: 'right' }}>Balance</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((txn, i) => (
            <tr
              key={txn.id}
              style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc' }}
            >
              <td style={styles.td}>{formatDate(txn.createdAt)}</td>
              <td style={styles.td}>
                <span style={{ ...styles.typeBadge, ...getTypeStyle(txn.transactionType) }}>
                  {txn.transactionType.replace('_', ' ')}
                </span>
              </td>
              <td style={styles.td}>{txn.description}</td>
              <td style={{ ...styles.td, fontFamily: 'monospace', fontSize: '12px' }}>
                {txn.referenceNumber}
              </td>
              <td style={{
                ...styles.td,
                textAlign: 'right',
                fontWeight: '600',
                color: getTypeStyle(txn.transactionType).color,
              }}>
                {getSign(txn.transactionType)}{formatCurrency(txn.amount)}
              </td>
              <td style={{ ...styles.td, textAlign: 'right', color: '#5d6d7e' }}>
                {formatCurrency(txn.balanceAfter)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const styles = {
  wrapper: {
    overflowX: 'auto',
    borderRadius: '10px',
    border: '1px solid #e8ecf0',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  },
  headerRow: {
    background: '#f0f4f8',
  },
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '700',
    color: '#5d6d7e',
    letterSpacing: '0.5px',
    borderBottom: '1px solid #e8ecf0',
  },
  td: {
    padding: '13px 16px',
    borderBottom: '1px solid #f0f2f5',
    color: '#2c3e50',
  },
  typeBadge: {
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600',
  },
  empty: {
    padding: '40px',
    textAlign: 'center',
    color: '#95a5a6',
    fontSize: '14px',
  },
}