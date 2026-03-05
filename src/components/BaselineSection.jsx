import { useState } from 'react'
import { DAYS, BASELINE_CHORES } from '../lib/utils'
import SectionHeader from './SectionHeader'

export default function BaselineSection({ baselineChecks, todayIndex, onToggle, isPaid, baselineComplete }) {
  const [popAnim, setPopAnim] = useState(null)

  const triggerPop = (key) => {
    setPopAnim(key)
    setTimeout(() => setPopAnim(null), 400)
  }

  const handleToggle = (choreId, dayIndex) => {
    if (isPaid) return
    triggerPop(choreId === 'laundry' ? 'laundry' : `${choreId}-${dayIndex}`)
    onToggle(choreId, dayIndex)
  }

  return (
    <>
      <SectionHeader
        icon="⭐"
        title="Baseline Chores"
        subtitle="Every day + laundry = $5.00"
        color="#fbbf24"
      />
      <div style={{
        margin: '0 16px 20px',
        borderRadius: '16px',
        padding: '16px',
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${baselineComplete ? 'rgba(74,222,128,0.35)' : 'rgba(248,113,113,0.3)'}`,
        transition: 'border-color 0.4s',
      }}>
        {/* Day labels */}
        <div style={{ display: 'flex', gap: '5px', marginBottom: '8px', paddingLeft: '110px' }}>
          {DAYS.map((d, i) => (
            <div key={d} style={{
              width: '32px', textAlign: 'center', fontSize: '0.7rem', flexShrink: 0,
              color: i === todayIndex ? '#fbbf24' : 'rgba(255,255,255,0.3)',
              fontWeight: i === todayIndex ? 800 : 400,
            }}>
              {d}
            </div>
          ))}
        </div>

        {BASELINE_CHORES.map((chore) => (
          <div key={chore.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '6px' }}>
            {/* Label */}
            <div style={{ width: '110px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '1.2rem' }}>{chore.icon}</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{chore.label}</span>
            </div>

            {chore.daily ? (
              <div style={{ display: 'flex', gap: '5px' }}>
                {DAYS.map((d, i) => {
                  const checked = baselineChecks[chore.id][i]
                  const isPast = i <= todayIndex
                  const isMissedPast = isPast && !checked
                  const animKey = `${chore.id}-${i}`

                  return (
                    <div
                      key={d}
                      className={`tap${popAnim === animKey ? ' pop-anim' : ''}`}
                      onClick={() => handleToggle(chore.id, i)}
                      style={{
                        width: '32px', height: '32px', flexShrink: 0,
                        borderRadius: '8px',
                        border: i === todayIndex
                          ? '2px solid rgba(251,191,36,0.6)'
                          : isMissedPast
                            ? '1px solid rgba(248,113,113,0.4)'
                            : '1px solid rgba(255,255,255,0.12)',
                        background: checked
                          ? 'linear-gradient(135deg, #4ade80, #16a34a)'
                          : isMissedPast
                            ? 'rgba(239,68,68,0.12)'
                            : 'rgba(255,255,255,0.06)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1rem',
                        opacity: isPaid ? 0.7 : 1,
                      }}
                    >
                      {checked ? chore.icon : isMissedPast ? '✕' : ''}
                    </div>
                  )
                })}
              </div>
            ) : (
              // Laundry — single wide button
              <div
                className={`tap${popAnim === 'laundry' ? ' pop-anim' : ''}`}
                onClick={() => handleToggle(chore.id, null)}
                style={{
                  padding: '7px 16px', borderRadius: '9px',
                  background: baselineChecks.laundry
                    ? 'linear-gradient(135deg, #4ade80, #16a34a)'
                    : 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  fontSize: '0.88rem',
                  display: 'flex', alignItems: 'center', gap: '7px',
                  opacity: isPaid ? 0.7 : 1,
                }}
              >
                {chore.icon} {baselineChecks.laundry ? 'Done!' : 'Tap when done'}
              </div>
            )}
          </div>
        ))}

        {/* Status bar */}
        <div style={{
          marginTop: '10px', padding: '9px 14px', borderRadius: '10px', textAlign: 'center',
          background: baselineComplete ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${baselineComplete ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.08)'}`,
          fontSize: '0.85rem', fontWeight: 700,
          color: baselineComplete ? '#4ade80' : 'rgba(255,255,255,0.35)',
          transition: 'all 0.3s',
        }}>
          {baselineComplete ? '✅ $5.00 earned — keep it up!' : 'Complete every day + laundry to earn $5.00'}
        </div>
      </div>
    </>
  )
}
