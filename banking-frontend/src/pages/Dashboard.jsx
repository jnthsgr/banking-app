import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import AccountCard from '../components/AccountCard'
import TransactionTable from '../components/TransactionTable'
import Footer from '../components/Footer'
import { accountService } from '../services/accountService'
import { transactionService } from '../services/transactionService'
import { formatCurrency } from '../utils/formatCurrency'

const PAGE_SIZE = 8

export default function Dashboard() {
  const navigate = useNavigate()
  const [accounts, setAccounts] = useState([])
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [txnLoading, setTxnLoading] = useState(false)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    loadAccounts()
  }, [])

  useEffect(() => {
    if (selectedAccount) loadTransactions(selectedAccount.accountNumber, 0)
  }, [selectedAccount])

  const loadAccounts = async () => {
    try {
      const data = await accountService.getMyAccounts()
      setAccounts(data)
      if (data.length > 0) setSelectedAccount(data[0])
    } catch {
      setError('Failed to load accounts')
    } finally {
      setLoading(false)
    }
  }

  const loadTransactions = async (accountNumber, pageNum) => {
    setTxnLoading(true)
    try {
      const data = await transactionService.getHistoryPaged(accountNumber, pageNum, PAGE_SIZE)
      setTransactions(data.content)
      setTotalPages(data.totalPages || 1)
      setPage(data.number || 0)
    } catch {
      setTransactions([])
    } finally {
      setTxnLoading(false)
    }
  }

  const handlePageChange = (newPage) => {
    if (selectedAccount) loadTransactions(selectedAccount.accountNumber, newPage)
  }

  const handleDownload = async () => {
    if (!selectedAccount) return
    setDownloading(true)
    try {
      await transactionService.downloadStatement(selectedAccount.accountNumber)
    } catch {
      setError('Failed to download statement')
    } finally {
      setDownloading(false)
    }
  }

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0)

  if (loading) return (
    <div>
      <Navbar />
      <div style={styles.center}>Loading your accounts...</div>
    </div>
  )

  return (
    <div style={styles.page}>
      <Navbar />

      <div style={styles.container}>

        {/* Summary Bar */}
        <div style={styles.summaryBar}>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Total Balance</span>
            <span style={styles.summaryValue}>{formatCurrency(totalBalance)}</span>
          </div>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Total Accounts</span>
            <span style={styles.summaryValue}>{accounts.length}</span>
          </div>
          <div style={styles.summaryActions}>
            <button
              style={styles.actionBtn}
              onClick={() => navigate('/transfer')}
            >
              💸 Transfer
            </button>
            <button
              style={{ ...styles.actionBtn, background: '#1B4F72' }}
              onClick={() => navigate('/deposit')}
            >
              ➕ Deposit
            </button>
            <button
              style={{ ...styles.actionBtn, background: '#922B21' }}
              onClick={() => navigate('/withdraw')}
            >
              ➖ Withdraw
            </button>
            <button
              style={{ ...styles.actionBtn, background: '#17A589' }}
              onClick={() => navigate('/open-account')}
            >
              🏦 New Account
            </button>
          </div>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {/* Account Cards */}
        <h2 style={styles.sectionTitle}>My Accounts</h2>
        {accounts.length === 0 ? (
          <div style={styles.noAccounts}>
            <p>You have no accounts yet.</p>
            <button
              style={styles.createBtn}
              onClick={() => navigate('/open-account')}
            >
              Open Your First Account
            </button>
          </div>
        ) : (
          <div style={styles.cardsRow}>
            {accounts.map(acc => (
              <AccountCard
                key={acc.id}
                account={acc}
                selected={selectedAccount?.id === acc.id}
                onClick={() => setSelectedAccount(acc)}
              />
            ))}
          </div>
        )}

        {/* Transaction History */}
        {selectedAccount && (
          <div style={styles.historySection}>
            <div style={styles.historyHeader}>
              <h2 style={styles.sectionTitle}>
                Transaction History — {selectedAccount.accountNumber}
              </h2>
              <button
                style={styles.statementBtn}
                onClick={handleDownload}
                disabled={downloading}
              >
                {downloading ? 'Preparing...' : '⬇ Download Statement'}
              </button>
            </div>
            {txnLoading ? (
              <div style={styles.center}>Loading transactions...</div>
            ) : (
              <TransactionTable
                transactions={transactions}
                page={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        )}

      </div>

      <Footer />
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: 'var(--scf-bg)' },
  container: { maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' },
  center: { padding: '60px', textAlign: 'center', color: '#7f8c8d' },
  summaryBar: {
    background: '#fff',
    borderRadius: '14px',
    padding: '24px 28px',
    display: 'flex',
    alignItems: 'center',
    gap: '40px',
    marginBottom: '32px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    flexWrap: 'wrap',
  },
  summaryItem: { display: 'flex', flexDirection: 'column', gap: '4px' },
  summaryLabel: { fontSize: '12px', color: '#95a5a6', fontWeight: '600', letterSpacing: '0.5px' },
  summaryValue: { fontSize: '22px', fontWeight: '700', color: 'var(--scf-navy)' },
  summaryActions: { display: 'flex', gap: '10px', marginLeft: 'auto', flexWrap: 'wrap' },
  actionBtn: {
    background: 'var(--scf-blue)',
    color: '#fff',
    border: 'none',
    padding: '10px 18px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  error: {
    background: '#fdecea',
    color: '#c0392b',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: '16px',
  },
  cardsRow: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
    marginBottom: '32px',
  },
  noAccounts: {
    background: '#fff',
    borderRadius: '14px',
    padding: '48px',
    textAlign: 'center',
    color: '#7f8c8d',
    marginBottom: '32px',
  },
  createBtn: {
    marginTop: '16px',
    background: 'var(--scf-blue)',
    color: '#fff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  historySection: {
    background: '#fff',
    borderRadius: '14px',
    padding: '24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  historyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  statementBtn: {
    background: 'transparent',
    border: '1.5px solid var(--scf-border)',
    color: 'var(--scf-navy)',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '12.5px',
    fontWeight: '600',
    cursor: 'pointer',
  },
}
