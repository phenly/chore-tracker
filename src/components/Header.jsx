import { formatWeekRange } from '../lib/utils'

export default function Header({ weekStart }) {
  return (
    <div style={{
      padding: '18px 20px 14px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'sticky', top: 0, zIndex: 100,
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      background: 'rgba(13,13,26,0.88)',
      borderBottom: '1px solid rgba(124,58,237,0.2)',
    }}>
      <div>
        <div style={{
          fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.5px',
          background: 'linear-gradient(90deg, #fbbf24, #f97316, #fbbf24)',
          backgroundSize: '200% auto',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          animation: 'shimmer 3s linear infinite',
        }}>
          The Allowance Arcade
        </div>
        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
          {formatWeekRange(weekStart)}
        </div>
      </div>
      <div style={{
        width: '52px', height: '52px',
        background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
        borderRadius: '14px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.7rem',
        boxShadow: '0 4px 16px rgba(124,58,237,0.5), inset 0 1px 0 rgba(255,255,255,0.15)',
        flexShrink: 0,
      }}>
        🎮
      </div>
    </div>
  )
}
