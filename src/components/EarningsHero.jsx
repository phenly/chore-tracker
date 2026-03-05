import { fmtDollar } from '../lib/utils'

export default function EarningsHero({ baselineEarnings, dailyEarnings, weeklyEarnings, total, baselineComplete }) {
  const pills = [
    { label: 'Base', val: baselineEarnings, color: baselineEarnings > 0 ? '#4ade80' : '#f87171', icon: '⭐' },
    { label: 'Daily', val: dailyEarnings, color: '#60a5fa', icon: '⚡' },
    { label: 'Weekly', val: weeklyEarnings, color: '#a78bfa', icon: '🚀' },
  ]

  return (
    <div style={{
      margin: '16px',
      borderRadius: '20px',
      padding: '20px',
      background: 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(37,99,235,0.25))',
      border: '1px solid rgba(124,58,237,0.4)',
    }}>
      <div style={{
        fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)',
        textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '6px',
      }}>
        This Week's Earnings
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', marginBottom: '16px' }}>
        <div style={{
          fontSize: '3.5rem', fontWeight: 900, lineHeight: 1,
          color: '#fbbf24', textShadow: '0 0 30px rgba(251,191,36,0.5)',
        }}>
          {fmtDollar(total)}
        </div>
        <div style={{ paddingBottom: '8px', opacity: 0.4, fontSize: '1rem' }}>/ $35.00 max</div>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        {pills.map((p) => (
          <div key={p.label} style={{
            flex: 1,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px',
            padding: '8px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '0.85rem' }}>{p.icon}</div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: p.color }}>{fmtDollar(p.val)}</div>
            <div style={{ fontSize: '0.65rem', opacity: 0.5, marginTop: '1px' }}>{p.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
