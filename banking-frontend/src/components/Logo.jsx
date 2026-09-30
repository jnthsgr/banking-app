export default function Logo({ size = 34, light = false, showWordmark = true }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <svg width={size} height={size} viewBox="0 0 64 64" style={{ flexShrink: 0 }}>
        <defs>
          <linearGradient id="scf-logo-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#123B6B" />
            <stop offset="100%" stopColor="#0B2545" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="14" fill="url(#scf-logo-grad)" />
        <path d="M32 12 L52 22 H12 Z" fill="#C9962E" />
        <rect x="16" y="26" width="6" height="22" fill="#ffffff" />
        <rect x="29" y="26" width="6" height="22" fill="#ffffff" />
        <rect x="42" y="26" width="6" height="22" fill="#ffffff" />
        <rect x="12" y="50" width="40" height="5" rx="1.5" fill="#ffffff" />
      </svg>
      {showWordmark && (
        <span
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 700,
            fontSize: `${size * 0.5}px`,
            letterSpacing: '0.2px',
            color: light ? '#ffffff' : 'var(--scf-navy)',
            lineHeight: 1,
          }}
        >
          Saagar Capital <span style={{ color: 'var(--scf-gold)' }}>Finance</span>
        </span>
      )}
    </div>
  )
}
