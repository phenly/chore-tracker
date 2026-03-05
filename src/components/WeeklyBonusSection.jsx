import { useState } from 'react'
import { WEEKLY_BONUS, fmtDollar } from '../lib/utils'
import SectionHeader from './SectionHeader'

export default function WeeklyBonusSection({ weeklyChecks, onToggle, isPaid, weeklyEarnings, weeklyMultiplier, weeklyBase, completedWeekly }) {
  const [popAnim, setPopAnim] = useState(null)

  const triggerPop = (key) => {
    setPopAnim(key)
    setTimeout(() => setPopAnim(null), 400)
  }

  // Nudge: best remaining chore + next multiplier
  const unchecked = WEEKLY_BONUS.filter((c) => !weeklyChecks[c.id])
  const bestNextValue = unchecked.length > 0 ? Math.max(...unchecked.map((c) => c.value)) : 0
  const nextMultiplier = weeklyMultiplier + 1
  const nextWeeklyTotal = (weeklyBase + bestNextValue) * nextMultiplier

  return (
    <>
      <SectionHeader
        icon="🚀"
        title="Weekly Bonus Chores"
        subtitle="More chores = bigger multiplier!"
        color="#a78bfa"
      />
      <div style={{
        margin: '0 16px 20px',
        borderRadius: '16px',
        padding: '14px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(167,139,250,0.2)',
      }}>
        {/* Horizontal chore tiles */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {WEEKLY_BONUS.map((chore) => {
            const checked = weeklyChecks[chore.id]
            return (
              <div
                key={chore.id}
                className={`tap${popAnim === chore.id ? ' pop-anim' : ''}`}
                onClick={() => {
                  if (isPaid) return
                  triggerPop(chore.id)
                  onToggle(chore.id)
                }}
                style={{
                  flex: 1, borderRadius: '12px', padding: '12px 6px',
                  background: checked
                    ? 'linear-gradient(135deg, rgba(124,58,237,0.4), rgba(37,99,235,0.4))'
                    : 'rgba(255,255,255,0.05)',
                  border: `2px solid ${checked ? '#7c3aed' : 'rgba(255,255,255,0.1)'}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                  transition: 'all 0.2s ease',
                  opacity: isPaid ? 0.7 : 1,
                }}
              >
                <div style={{ fontSize: '1.6rem' }}>{chore.icon}</div>
                <div style={{
                  fontSize: '0.6rem', fontWeight: 700, textAlign: 'center', lineHeight: 1.2,
                  color: checked ? '#fff' : 'rgba(255,255,255,0.45)',
                }}>
                  {chore.label}
                </div>
                <div style={{
                  fontSize: '0.78rem', fontWeight: 900,
                  color: checked ? '#fbbf24' : 'rgba(255,255,255,0.25)',
                }}>
                  {fmtDollar(chore.value)}
                </div>
              </div>
            )
          })}
        </div>

        {/* Live math display */}
        <div style={{
          background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '14px 16px',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          {weeklyMultiplier === 0 ? (
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>
              Tap a chore above to start earning!
            </div>
          ) : (
            <>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '8px', flexWrap: 'wrap', marginBottom: '12px',
              }}>
                {completedWeekly.map((chore, idx) => (
                  <span key={chore.id} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>{fmtDollar(chore.value)}</span>
                    <span style={{ fontSize: '0.85rem' }}>{chore.icon}</span>
                    {idx < completedWeekly.length - 1 && (
                      <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 700, marginLeft: '3px' }}>+</span>
                    )}
                  </span>
                ))}
                <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 700, fontSize: '1.1rem' }}>=</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff' }}>{fmtDollar(weeklyBase)}</span>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 700, fontSize: '1.1rem' }}>×</span>
                <span style={{
                  fontSize: '1.3rem', fontWeight: 900, color: '#a78bfa',
                  background: 'rgba(167,139,250,0.15)',
                  border: '1px solid rgba(167,139,250,0.4)',
                  borderRadius: '8px', padding: '2px 10px',
                }}>
                  {weeklyMultiplier}x
                </span>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 700, fontSize: '1.1rem' }}>=</span>
                <span style={{
                  fontSize: '1.6rem', fontWeight: 900, color: '#fbbf24',
                  textShadow: '0 0 16px rgba(251,191,36,0.5)',
                }}>
                  {fmtDollar(weeklyEarnings)}
                </span>
              </div>

              {weeklyMultiplier < 4 && (
                <div style={{
                  textAlign: 'center', fontSize: '0.78rem',
                  color: 'rgba(255,255,255,0.4)',
                  borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px',
                }}>
                  Add 1 more chore →{' '}
                  <span style={{ color: '#a78bfa', fontWeight: 700 }}>{nextMultiplier}x multiplier</span>
                  {' '}→ earn{' '}
                  <span style={{ color: '#fbbf24', fontWeight: 700 }}>{fmtDollar(nextWeeklyTotal)}</span>
                </div>
              )}
              {weeklyMultiplier === 4 && (
                <div style={{
                  textAlign: 'center', fontSize: '0.82rem', color: '#fbbf24', fontWeight: 700,
                  borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px',
                }}>
                  🏆 MAX MULTIPLIER — all chores done!
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
