import { useState, useEffect } from 'react'
import { loadAllWeeks } from '../hooks/useWeekData'
import { formatWeekRange, fmtDollar, getWeekStartStr } from '../lib/utils'
import Header from './Header'
import WeekDetail from './WeekDetail'

export default function HistoryView() {
  const [weeks, setWeeks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedWeek, setSelectedWeek] = useState(null)

  const currentWeekStart = getWeekStartStr()

  useEffect(() => {
    loadAllWeeks()
      .then(setWeeks)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (selectedWeek) {
    return (
      <WeekDetail
        weekStart={selectedWeek}
        onBack={() => setSelectedWeek(null)}
      />
    )
  }

  return (
    <>
      <Header weekStart={currentWeekStart} />
      <div style={{ padding: '16px' }}>
        <div style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px', color: 'rgba(255,255,255,0.7)' }}>
          📜 All Weeks
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

        {weeks.map((week) => {
          const baseline = Number(week.baseline_earned ?? 0)
          const daily = Number(week.daily_earned ?? 0)
          const weekly = Number(week.weekly_earned ?? 0)
          const total = Number(week.total_earned ?? 0)
          const isCurrentWeek = week.week_start === currentWeekStart

          return (
            <div
              key={week.week_start}
              className="tap"
              onClick={() => setSelectedWeek(week.week_start)}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${isCurrentWeek ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '16px', padding: '16px', marginBottom: '12px',
                animation: 'fadeIn 0.3s ease',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                    {formatWeekRange(week.week_start)}
                  </span>
                  {isCurrentWeek && (
                    <span style={{ marginLeft: '8px', fontSize: '0.7rem', color: '#a78bfa', fontWeight: 700 }}>
                      THIS WEEK
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {week.is_paid ? (
                    <span style={{
                      background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.4)',
                      color: '#4ade80', borderRadius: '20px', padding: '3px 12px',
                      fontSize: '0.72rem', fontWeight: 700,
                    }}>
                      ✓ PAID
                    </span>
                  ) : (
                    <span style={{
                      background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)',
                      color: '#fbbf24', borderRadius: '20px', padding: '3px 12px',
                      fontSize: '0.72rem', fontWeight: 700,
                    }}>
                      UNPAID
                    </span>
                  )}
                  <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.9rem' }}>›</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                {[
                  { label: 'Base', val: baseline, icon: '⭐', color: baseline > 0 ? '#4ade80' : 'rgba(255,255,255,0.3)' },
                  { label: 'Daily', val: daily, icon: '⚡', color: daily > 0 ? '#60a5fa' : 'rgba(255,255,255,0.3)' },
                  { label: 'Weekly', val: weekly, icon: '🚀', color: weekly > 0 ? '#a78bfa' : 'rgba(255,255,255,0.3)' },
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

              <div style={{ textAlign: 'right', fontSize: '1.2rem', fontWeight: 900, color: total > 0 ? '#fbbf24' : 'rgba(255,255,255,0.2)' }}>
                Total: {fmtDollar(total)}
              </div>
            </div>
          )
        })}

        {!loading && !error && weeks.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            color: 'rgba(255,255,255,0.25)', fontSize: '0.9rem',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎮</div>
            No weeks found.
          </div>
        )}
      </div>
    </>
  )
}
