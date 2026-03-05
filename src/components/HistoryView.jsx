import { useState, useEffect } from 'react'
import { loadHistory } from '../hooks/useWeekData'
import { formatWeekRange, fmtDollar, getWeekStartStr } from '../lib/utils'
import Header from './Header'

export default function HistoryView() {
  const [weeks, setWeeks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadHistory()
      .then(setWeeks)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const weekStart = getWeekStartStr()

  return (
    <>
      <Header weekStart={weekStart} />
      <div style={{ padding: '16px' }}>
        <div style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px', color: 'rgba(255,255,255,0.7)' }}>
          📜 Past Weeks
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.3)' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '8px', animation: 'pop 1s ease infinite' }}>📜</div>
            Loading history…
          </div>
        )}

        {error && (
          <div style={{
            padding: '16px', borderRadius: '12px',
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            color: '#f87171', fontSize: '0.85rem',
          }}>
            ⚠️ {error}
          </div>
        )}

        {!loading && !error && weeks.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            color: 'rgba(255,255,255,0.25)', fontSize: '0.9rem',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎮</div>
            No paid weeks yet — keep earning!
          </div>
        )}

        {weeks.map((week) => {
          const baseline = Number(week.baseline_earned ?? 0)
          const daily = Number(week.daily_earned ?? 0)
          const weekly = Number(week.weekly_earned ?? 0)
          const total = Number(week.total_earned ?? 0)

          return (
            <div key={week.week_start} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px', padding: '16px', marginBottom: '12px',
              animation: 'fadeIn 0.3s ease',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                  {formatWeekRange(week.week_start)}
                </span>
                <span style={{
                  background: 'rgba(74,222,128,0.15)',
                  border: '1px solid rgba(74,222,128,0.4)',
                  color: '#4ade80', borderRadius: '20px', padding: '3px 12px',
                  fontSize: '0.72rem', fontWeight: 700,
                }}>
                  ✓ PAID
                </span>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                {[
                  { label: 'Base', val: baseline, icon: '⭐', color: baseline > 0 ? '#4ade80' : '#f87171' },
                  { label: 'Daily', val: daily, icon: '⚡', color: '#60a5fa' },
                  { label: 'Weekly', val: weekly, icon: '🚀', color: '#a78bfa' },
                ].map((item) => (
                  <div key={item.label} style={{
                    flex: 1, background: 'rgba(255,255,255,0.05)',
                    borderRadius: '10px', padding: '8px', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '0.9rem' }}>{item.icon}</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: item.color }}>{fmtDollar(item.val)}</div>
                    <div style={{ fontSize: '0.65rem', opacity: 0.4 }}>{item.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ textAlign: 'right', fontSize: '1.2rem', fontWeight: 900, color: '#fbbf24' }}>
                Total: {fmtDollar(total)}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
