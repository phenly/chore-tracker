import { fmtDollar, PS5_GOAL } from '../lib/utils'

export default function PS5Bar({ savings }) {
  const pct = Math.min((savings / PS5_GOAL) * 100, 100)
  const remaining = Math.max(PS5_GOAL - savings, 0)

  return (
    <div style={{
      margin: '0 16px 16px',
      borderRadius: '16px',
      padding: '14px 16px',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>🎮 PS5 Quest</div>
        <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>
          <span style={{ color: '#fbbf24' }}>{fmtDollar(savings)}</span>
          <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 400 }}> / {fmtDollar(PS5_GOAL)}</span>
        </div>
      </div>
      <div style={{ height: '14px', background: 'rgba(255,255,255,0.08)', borderRadius: '7px', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: 'linear-gradient(90deg, #7c3aed, #2563eb, #06b6d4)',
          borderRadius: '7px',
          transition: 'width 0.6s cubic-bezier(0.34,1.56,0.64,1)',
          boxShadow: '0 0 12px rgba(6,182,212,0.5)',
          minWidth: pct > 0 ? '4px' : '0',
        }} />
      </div>
      <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginTop: '6px', textAlign: 'right' }}>
        {fmtDollar(remaining)} to go!
      </div>
    </div>
  )
}
