export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.inner}>
        <div style={styles.top}>
          <div>
            <div style={styles.brand}>Saagar Capital Finance</div>
            <p style={styles.tagline}>Digital banking, built on trust and transparency.</p>
          </div>
          <div style={styles.links}>
            <span style={styles.linkGroupTitle}>Product</span>
            <span>Accounts</span>
            <span>Transfers</span>
            <span>Statements</span>
          </div>
          <div style={styles.links}>
            <span style={styles.linkGroupTitle}>Company</span>
            <span>Security</span>
            <span>Support</span>
          </div>
        </div>
        <div style={styles.disclosure}>
          Saagar Capital Finance is a demonstration banking platform built to showcase
          full-stack engineering practices. It is not a licensed bank or financial
          institution, and no real funds are held, transferred, or insured.
        </div>
        <div style={styles.copyright}>
          © {new Date().getFullYear()} Saagar Capital Finance. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

const styles = {
  footer: {
    background: 'var(--scf-navy)',
    color: 'rgba(255,255,255,0.85)',
    marginTop: '48px',
  },
  inner: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '48px 24px 28px',
  },
  top: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: '32px',
    paddingBottom: '28px',
    borderBottom: '1px solid rgba(255,255,255,0.12)',
  },
  brand: {
    fontFamily: "'Fraunces', serif",
    fontWeight: 700,
    fontSize: '18px',
    color: '#fff',
    marginBottom: '6px',
  },
  tagline: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.6)',
    maxWidth: '320px',
  },
  links: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    fontSize: '13px',
    color: 'rgba(255,255,255,0.7)',
  },
  linkGroupTitle: {
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.5px',
    color: 'rgba(255,255,255,0.45)',
    marginBottom: '4px',
    textTransform: 'uppercase',
  },
  disclosure: {
    fontSize: '12px',
    lineHeight: 1.6,
    color: 'rgba(255,255,255,0.5)',
    maxWidth: '760px',
    padding: '20px 0',
  },
  copyright: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.4)',
  },
}
