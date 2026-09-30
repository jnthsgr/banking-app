import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/Logo'
import Footer from '../components/Footer'

const FEATURES = [
  {
    icon: '🔐',
    title: 'Bank-grade security',
    desc: 'Every password is BCrypt-hashed and every session is protected by short-lived, signed JWTs.',
  },
  {
    icon: '⚡',
    title: 'Real-time transfers',
    desc: 'Move money between accounts instantly, with atomic, all-or-nothing transaction guarantees.',
  },
  {
    icon: '📊',
    title: 'Full transaction history',
    desc: 'Every deposit, withdrawal, and transfer is logged with a reference number and running balance.',
  },
  {
    icon: '🧾',
    title: 'Downloadable statements',
    desc: 'Export any account’s activity to CSV for your records in a single click.',
  },
]

export default function Landing() {
  const { token, user } = useAuth()

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <Logo size={34} />
        <div style={styles.navActions}>
          {token ? (
            <Link to="/dashboard" style={styles.primaryBtn}>Go to Dashboard</Link>
          ) : (
            <>
              <Link to="/login" style={styles.ghostBtn}>Sign In</Link>
              <Link to="/register" style={styles.primaryBtn}>Open an Account</Link>
            </>
          )}
        </div>
      </nav>

      <header style={styles.hero}>
        <div style={styles.heroInner}>
          <span style={styles.badge}>Online Banking, Reimagined</span>
          <h1 style={styles.heroTitle}>
            Banking that moves<br />as fast as you do.
          </h1>
          <p style={styles.heroSubtitle}>
            Open a Savings or Current account in minutes. Transfer funds instantly,
            track every rupee, and stay in control — from any device.
          </p>
          <div style={styles.heroActions}>
            <Link to={token ? '/dashboard' : '/register'} style={styles.heroPrimary}>
              {token ? 'Go to Dashboard' : `Get Started${user ? '' : ' — It’s Free'}`}
            </Link>
            <Link to="/login" style={styles.heroSecondary}>Sign In</Link>
          </div>
        </div>
      </header>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Everything you need, nothing you don't</h2>
        <div style={styles.grid}>
          {FEATURES.map(f => (
            <div key={f.title} style={styles.card}>
              <div style={styles.cardIcon}>{f.icon}</div>
              <h3 style={styles.cardTitle}>{f.title}</h3>
              <p style={styles.cardDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={styles.ctaSection}>
        <div style={styles.ctaCard}>
          <h2 style={styles.ctaTitle}>Ready to open your account?</h2>
          <p style={styles.ctaSubtitle}>Registration takes less than a minute.</p>
          <Link to={token ? '/dashboard' : '/register'} style={styles.ctaBtn}>
            {token ? 'Go to Dashboard' : 'Create Free Account'}
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: 'var(--scf-bg)' },
  nav: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '24px 24px 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navActions: { display: 'flex', alignItems: 'center', gap: '12px' },
  ghostBtn: {
    padding: '10px 18px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--scf-navy)',
    textDecoration: 'none',
  },
  primaryBtn: {
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#fff',
    background: 'linear-gradient(135deg, var(--scf-navy-light), var(--scf-navy))',
    textDecoration: 'none',
  },
  hero: { padding: '72px 24px 64px' },
  heroInner: { maxWidth: '780px', margin: '0 auto', textAlign: 'center' },
  badge: {
    display: 'inline-block',
    padding: '6px 14px',
    borderRadius: '20px',
    background: 'rgba(201,150,46,0.14)',
    color: '#8a6a1f',
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.5px',
    marginBottom: '20px',
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontFamily: "'Fraunces', serif",
    fontSize: 'clamp(32px, 5vw, 52px)',
    fontWeight: 700,
    color: 'var(--scf-navy)',
    lineHeight: 1.15,
    marginBottom: '20px',
  },
  heroSubtitle: {
    fontSize: '17px',
    color: 'var(--scf-text-muted)',
    lineHeight: 1.6,
    maxWidth: '560px',
    margin: '0 auto 32px',
  },
  heroActions: { display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' },
  heroPrimary: {
    padding: '15px 30px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, var(--scf-navy-light), var(--scf-navy))',
    color: '#fff',
    fontWeight: 700,
    fontSize: '15px',
    textDecoration: 'none',
    boxShadow: '0 12px 24px rgba(11,37,69,0.25)',
  },
  heroSecondary: {
    padding: '15px 30px',
    borderRadius: '10px',
    background: '#fff',
    color: 'var(--scf-navy)',
    fontWeight: 700,
    fontSize: '15px',
    textDecoration: 'none',
    border: '1.5px solid var(--scf-border)',
  },
  section: { maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' },
  sectionTitle: {
    fontSize: '26px',
    fontWeight: 700,
    color: 'var(--scf-navy)',
    textAlign: 'center',
    marginBottom: '36px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
    gap: '20px',
  },
  card: {
    background: 'var(--scf-surface)',
    borderRadius: '16px',
    padding: '28px 24px',
    boxShadow: '0 2px 16px rgba(11,37,69,0.06)',
  },
  cardIcon: { fontSize: '28px', marginBottom: '14px' },
  cardTitle: { fontSize: '15px', fontWeight: 700, color: 'var(--scf-navy)', marginBottom: '8px' },
  cardDesc: { fontSize: '13.5px', color: 'var(--scf-text-muted)', lineHeight: 1.6 },
  ctaSection: { padding: '20px 24px 72px' },
  ctaCard: {
    maxWidth: '1100px',
    margin: '0 auto',
    background: 'linear-gradient(135deg, var(--scf-navy-light), var(--scf-navy))',
    borderRadius: '24px',
    padding: '56px 24px',
    textAlign: 'center',
  },
  ctaTitle: { fontFamily: "'Fraunces', serif", fontSize: '28px', fontWeight: 700, color: '#fff', marginBottom: '10px' },
  ctaSubtitle: { fontSize: '15px', color: 'rgba(255,255,255,0.75)', marginBottom: '28px' },
  ctaBtn: {
    display: 'inline-block',
    padding: '15px 34px',
    borderRadius: '10px',
    background: 'var(--scf-gold)',
    color: 'var(--scf-navy)',
    fontWeight: 700,
    fontSize: '15px',
    textDecoration: 'none',
  },
}
