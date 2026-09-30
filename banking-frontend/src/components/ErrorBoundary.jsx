import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Unhandled UI error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.page}>
          <div style={styles.card}>
            <div style={styles.icon}>⚠️</div>
            <h1 style={styles.title}>Something went wrong</h1>
            <p style={styles.subtitle}>
              An unexpected error occurred. Try reloading the page — if the
              problem continues, your data is safe and unaffected.
            </p>
            <button style={styles.button} onClick={() => window.location.assign('/dashboard')}>
              Reload
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--scf-bg, #f3f5f9)',
    padding: '24px',
  },
  card: {
    background: '#fff',
    borderRadius: '16px',
    padding: '40px',
    maxWidth: '420px',
    textAlign: 'center',
    boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
  },
  icon: { fontSize: '40px', marginBottom: '12px' },
  title: { fontSize: '20px', fontWeight: 700, color: 'var(--scf-navy, #0B2545)', marginBottom: '8px' },
  subtitle: { fontSize: '14px', color: '#64748b', lineHeight: 1.6, marginBottom: '24px' },
  button: {
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    background: 'var(--scf-navy, #0B2545)',
    color: '#fff',
    fontWeight: 600,
    fontSize: '14px',
    cursor: 'pointer',
  },
}
