import { useState } from 'react'
import { DAYS, DAILY_BONUS, LEVEL_LABELS, LEVEL_COLORS, computeDayValues, fmtDollar } from '../lib/utils'
import SectionHeader from './SectionHeader'

export default function DailyBonusSection({ dailyChecks, todayIndex, onToggle, isPaid }) {
  const [popAnim, setPopAnim] = useState(null)

  const triggerPop = (key) => {
    setPopAnim(key)
    setTimeout(() => setPopAnim(null), 400)
  }

  return (
    <>
      <SectionHeader
        icon="⚡"
        title="Daily Bonus Chores"
        subtitle="Each day earns more — don't skip!"
        color="#60a5fa"
      />
      <div style={{ margin: '0 16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {DAILY_BONUS.map((chore) => {
          const checked = dailyChecks[chore.id]
          const daysCount = checked.filter(Boolean).length
          const earned = daysCount > 0 ? chore.rates[daysCount - 1] : 0
          const levelColor = LEVEL_COLORS[daysCount]
          const dayValues = computeDayValues(checked, chore.rates, todayIndex)

          return (
            <div key={chore.id} style={{
              background: 'rgba(255,255,255,0.04)',
              border: daysCount > 0
                ? `1px solid ${levelColor}55`
                : '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '14px',
              transition: 'border-color 0.3s',
            }}>
              {/* Chore header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.5rem' }}>{chore.icon}</span>
                  <div style={{ fontSize: '1rem', fontWeight: 700 }}>{chore.label}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {daysCount > 0 && (
                    <div style={{
                      background: levelColor, color: '#fff',
                      borderRadius: '8px', padding: '3px 10px',
                      fontSize: '0.75rem', fontWeight: 800,
                    }}>
                      {LEVEL_LABELS[daysCount]}
                    </div>
                  )}
                  <div style={{
                    fontSize: '1.3rem', fontWeight: 900,
                    color: daysCount > 0 ? '#fbbf24' : 'rgba(255,255,255,0.2)',
                    minWidth: '58px', textAlign: 'right',
                  }}>
                    {daysCount > 0 ? fmtDollar(earned) : '—'}
                  </div>
                </div>
              </div>

              {/* Level progress bar */}
              <div style={{ display: 'flex', gap: '3px', marginBottom: '10px' }}>
                {[1, 2, 3, 4, 5, 6, 7].map((lvl) => (
                  <div key={lvl} style={{
                    flex: 1, height: '5px', borderRadius: '3px',
                    background: daysCount >= lvl ? levelColor : 'rgba(255,255,255,0.08)',
                    transition: 'background 0.25s',
                  }} />
                ))}
              </div>

              {/* Day boxes */}
              <div style={{ display: 'flex', gap: '5px' }}>
                {DAYS.map((d, i) => {
                  const { val, type } = dayValues[i]
                  const isFuture = type === 'future'
                  const isMissed = type === 'missed'
                  const isChecked = type === 'checked'
                  const animKey = `${chore.id}-${i}`

                  let bg = 'rgba(255,255,255,0.05)'
                  let borderColor = i === todayIndex ? 'rgba(251,191,36,0.6)' : 'rgba(255,255,255,0.1)'
                  let textColor = 'rgba(255,255,255,0.3)'
                  let borderWidth = i === todayIndex ? '2px' : '1px'

                  if (isChecked) {
                    bg = `${levelColor}30`
                    borderColor = i === todayIndex ? 'rgba(251,191,36,0.7)' : `${levelColor}80`
                    textColor = '#fbbf24'
                  } else if (isMissed) {
                    bg = 'rgba(239,68,68,0.1)'
                    borderColor = 'rgba(239,68,68,0.3)'
                    textColor = 'rgba(239,68,68,0.7)'
                  }

                  return (
                    <div key={d} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <div
                        className={`tap${popAnim === animKey ? ' pop-anim' : ''}`}
                        onClick={() => {
                          if (isPaid) return
                          triggerPop(animKey)
                          onToggle(chore.id, i)
                        }}
                        style={{
                          width: '100%', height: '44px', borderRadius: '8px',
                          border: `${borderWidth} solid ${borderColor}`,
                          background: bg,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          opacity: isFuture ? 0.45 : isPaid ? 0.7 : 1,
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <span style={{ fontSize: '0.82rem', fontWeight: 900, color: textColor, lineHeight: 1 }}>
                          {isMissed
                            ? '$0.00'
                            : val !== null
                              ? fmtDollar(val)
                              : ''}
                        </span>
                      </div>
                      <div style={{
                        fontSize: '0.62rem',
                        color: i === todayIndex ? '#fbbf24' : 'rgba(255,255,255,0.25)',
                        fontWeight: i === todayIndex ? 800 : 400,
                      }}>
                        {d}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Nudge text */}
              {daysCount > 0 && daysCount < 7 && (
                <div style={{
                  marginTop: '8px', fontSize: '0.72rem',
                  color: 'rgba(255,255,255,0.35)', textAlign: 'center',
                }}>
                  {7 - daysCount} more day{7 - daysCount !== 1 ? 's' : ''} → earn up to{' '}
                  <span style={{ color: '#fbbf24', fontWeight: 700 }}>{fmtDollar(chore.rates[6])}</span> total
                </div>
              )}
              {daysCount === 7 && (
                <div style={{ marginTop: '8px', fontSize: '0.72rem', color: '#fbbf24', fontWeight: 700, textAlign: 'center' }}>
                  🏆 MAX LEVEL — all 7 days done!
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
