import { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import AccountCard from '../components/AccountCard'
import TransactionTable from '../components/TransactionTable'
import { accountService } from '../services/accountService'
import { transactionService } from '../services/transactionService'
import { cardService } from '../services/cardService'
import { formatCurrency } from '../utils/formatCurrency'

const PAGE_SIZE = 8
const CREDIT_TYPES = new Set(['DEPOSIT', 'TRANSFER_CREDIT', 'LOAN_DISBURSEMENT'])

export default function Dashboard() {
  const navigate = useNavigate()
  const [accounts, setAccounts] = useState([])
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [cards, setCards] = useState([])
  const [recentTxns, setRecentTxns] = useState([])
  const [transactions, setTransactions] = useState([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [txnLoading, setTxnLoading] = useState(false)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    loadAccounts()
    cardService.getMyCards().then(setCards).catch(() => setCards([]))
  }, [])

  useEffect(() => {
    if (selectedAccount) {
      loadTransactions(selectedAccount.accountNumber, 0)
      transactionService.getHistory(selectedAccount.accountNumber)
        .then(setRecentTxns)
        .catch(() => setRecentTxns([]))
    }
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

  const { income, expense } = useMemo(() => {
    const now = new Date()
    let inc = 0, exp = 0
    for (const t of recentTxns) {
      const d = new Date(t.createdAt)
      if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) continue
      if (CREDIT_TYPES.has(t.transactionType)) inc += t.amount
      else exp += t.amount
    }
    return { income: inc, expense: exp }
  }, [recentTxns])

  const chartBars = useMemo(() => {
    const last = [...recentTxns].slice(0, 9).reverse()
    const maxAbs = Math.max(1, ...last.map(t => t.amount))
    return last.map(t => ({
      day: new Date(t.createdAt).getDate(),
      heightPct: Math.max(8, Math.round((t.amount / maxAbs) * 100)),
      credit: CREDIT_TYPES.has(t.transactionType),
    }))
  }, [recentTxns])

  const latestFive = recentTxns.slice(0, 5)

  if (loading) return (
    <AppLayout section="Dashboard">
      <div style={styles.center}>Loading your accounts...</div>
    </AppLayout>
  )

  return (
    <AppLayout section="Dashboard">
      {error && <div style={styles.error}>{error}</div>}

      {/* Account selector */}
      <div style={styles.topRow}>
        <span style={styles.sectionTitle}>My Accounts</span>
        <div style={styles.quickActions}>
          <button style={styles.qa} onClick={() => navigate('/transfer')}>💸 Transfer</button>
          <button style={{ ...styles.qa, background: '#1B4F72' }} onClick={() => navigate('/deposit')}>➕ Deposit</button>
          <button style={{ ...styles.qa, background: '#922B21' }} onClick={() => navigate('/withdraw')}>➖ Withdraw</button>
          <button style={{ ...styles.qa, background: '#17A589' }} onClick={() => navigate('/open-account')}>🏦 New Account</button>
        </div>
      </div>

      {accounts.length === 0 ? (
        <div style={styles.noAccounts}>
          <p>You have no accounts yet.</p>
          <button style={styles.createBtn} onClick={() => navigate('/open-account')}>Open Your First Account</button>
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

      {/* My Cards + Balance */}
      <div style={styles.splitRow} className="scf-split-row">
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <span style={styles.panelTitle}>My Cards</span>
            <Link to="/cards" style={styles.panelLink}>Manage &rsaquo;</Link>
          </div>
          <div style={styles.cardStrip}>
            {cards.slice(0, 3).map((c, i) => (
              <div key={c.id} style={{ ...styles.miniCard, background: i === 0 ? 'linear-gradient(135deg, var(--scf-navy-light), var(--scf-navy))' : 'rgba(11,37,69,0.06)', color: i === 0 ? '#fff' : 'var(--scf-navy)' }}>
                <div style={styles.miniCardType}>{c.cardType}</div>
                <div style={styles.miniCardNum}>{c.maskedCardNumber}</div>
              </div>
            ))}
            <button style={styles.addCardTile} onClick={() => navigate('/cards')}>+</button>
          </div>
        </div>

        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <span style={styles.panelTitle}>Balance</span>
            <span style={styles.panelSub}>This month</span>
          </div>
          <div style={styles.balanceValue}>{formatCurrency(totalBalance)}</div>
          <div style={styles.incomeExpenseRow}>
            <div>
              <div style={styles.ieLabel}>↗ Income</div>
              <div style={{ ...styles.ieValue, color: 'var(--scf-success)' }}>+{formatCurrency(income)}</div>
            </div>
            <div>
              <div style={styles.ieLabel}>↘ Expense</div>
              <div style={{ ...styles.ieValue, color: 'var(--scf-danger)' }}>-{formatCurrency(expense)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly summary + Latest transactions */}
      <div style={styles.splitRow} className="scf-split-row">
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <span style={styles.panelTitle}>Monthly Summary</span>
          </div>
          {chartBars.length === 0 ? (
            <div style={styles.chartEmpty}>Not enough activity yet</div>
          ) : (
            <div style={styles.chart}>
              {chartBars.map((b, i) => (
                <div key={i} style={styles.chartCol}>
                  <div style={{
                    ...styles.chartBar,
                    height: `${b.heightPct}%`,
                    background: b.credit ? 'var(--scf-success)' : 'var(--scf-blue)',
                  }} />
                  <span style={styles.chartLabel}>{b.day}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <span style={styles.panelTitle}>Latest Transactions</span>
          </div>
          {latestFive.length === 0 ? (
            <div style={styles.chartEmpty}>No transactions yet</div>
          ) : (
            <div style={styles.latestList}>
              {latestFive.map(t => (
                <div key={t.id} style={styles.latestRow}>
                  <div>
                    <div style={styles.latestType}>{t.transactionType.replace('_', ' ')}</div>
                    <div style={styles.latestDesc}>{t.description}</div>
                  </div>
                  <div style={{
                    ...styles.latestAmt,
                    color: CREDIT_TYPES.has(t.transactionType) ? 'var(--scf-success)' : 'var(--scf-danger)',
                  }}>
                    {CREDIT_TYPES.has(t.transactionType) ? '+' : '-'}{formatCurrency(t.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Full transaction history */}
      {selectedAccount && (
        <div style={styles.historySection}>
          <div style={styles.historyHeader}>
            <h2 style={styles.sectionTitleDark}>Transaction History — {selectedAccount.accountNumber}</h2>
            <button style={styles.statementBtn} onClick={handleDownload} disabled={downloading}>
              {downloading ? 'Preparing...' : '⬇ Download Statement'}
            </button>
          </div>
          {txnLoading ? (
            <div style={styles.center}>Loading transactions...</div>
          ) : (
            <TransactionTable transactions={transactions} page={page} totalPages={totalPages} onPageChange={handlePageChange} />
          )}
        </div>
      )}
    </AppLayout>
  )
}

const styles = {
  center: { padding: '60px', textAlign: 'center', color: '#7f8c8d' },
  error: { background: '#fdecea', color: '#c0392b', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' },
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', margin: '4px 0 16px' },
  sectionTitle: { fontSize: '16px', fontWeight: 700, color: '#2c3e50' },
  sectionTitleDark: { fontSize: '16px', fontWeight: 700, color: '#2c3e50' },
  quickActions: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  qa: { background: 'var(--scf-blue)', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: '8px', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' },
  noAccounts: { background: '#fff', borderRadius: '14px', padding: '48px', textAlign: 'center', color: '#7f8c8d', marginBottom: '32px' },
  createBtn: { marginTop: '16px', background: 'var(--scf-blue)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' },
  cardsRow: { display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '28px' },
  splitRow: { display: 'grid', gridTemplateColumns: 'minmax(0,1.3fr) minmax(0,1fr)', gap: '20px', marginBottom: '28px' },
  panel: { background: '#fff', borderRadius: '16px', padding: '22px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  panelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' },
  panelTitle: { fontSize: '14.5px', fontWeight: 700, color: 'var(--scf-navy)' },
  panelSub: { fontSize: '12px', color: '#95a5a6' },
  panelLink: { fontSize: '12.5px', fontWeight: 600, color: 'var(--scf-blue)', textDecoration: 'none' },
  cardStrip: { display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' },
  miniCard: { minWidth: '160px', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '18px' },
  miniCardType: { fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.5px', opacity: 0.8 },
  miniCardNum: { fontSize: '13px', fontFamily: 'monospace' },
  addCardTile: {
    minWidth: '56px', borderRadius: '12px', border: '1.5px dashed var(--scf-border)',
    background: 'transparent', color: 'var(--scf-text-muted)', fontSize: '22px', cursor: 'pointer',
  },
  balanceValue: { fontSize: '30px', fontWeight: 700, color: 'var(--scf-navy)', marginBottom: '18px' },
  incomeExpenseRow: { display: 'flex', gap: '32px' },
  ieLabel: { fontSize: '12px', color: '#95a5a6', marginBottom: '4px' },
  ieValue: { fontSize: '15px', fontWeight: 700 },
  chartEmpty: { padding: '40px 0', textAlign: 'center', color: '#95a5a6', fontSize: '13px' },
  chart: { display: 'flex', alignItems: 'flex-end', gap: '10px', height: '140px' },
  chartCol: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', flex: 1, height: '100%' },
  chartBar: { width: '100%', maxWidth: '22px', borderRadius: '6px 6px 0 0' },
  chartLabel: { fontSize: '10.5px', color: '#95a5a6', marginTop: '6px' },
  latestList: { display: 'flex', flexDirection: 'column', gap: '14px' },
  latestRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  latestType: { fontSize: '13px', fontWeight: 600, color: '#2c3e50' },
  latestDesc: { fontSize: '11.5px', color: '#95a5a6' },
  latestAmt: { fontSize: '13.5px', fontWeight: 700 },
  historySection: { background: '#fff', borderRadius: '14px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  historyHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' },
  statementBtn: { background: 'transparent', border: '1.5px solid var(--scf-border)', color: 'var(--scf-navy)', padding: '8px 16px', borderRadius: '8px', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' },
}
