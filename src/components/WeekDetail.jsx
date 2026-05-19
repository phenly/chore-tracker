import { useState } from 'react'
import { useWeekData } from '../hooks/useWeekData'
import { computeEarnings, fmtDollar, formatWeekRange, getWeekStartStr } from '../lib/utils'
import EarningsHero from './EarningsHero'
import BaselineSection from './BaselineSection'
import DailyBonusSection from './DailyBonusSection'
import WeeklyBonusSection from './WeeklyBonusSection'
import PaydayModal from './PaydayModal'

// Past weeks treat all 7 days as elapsed; current week respects today's index
function getEffectiveTodayIndex(weekStart) {
  const currentWeek = getWeekStartStr()
  if (weekStart === currentWeek) {
    const day = new Date().getDay()
    return day === 0 ? 6 : day - 1
  }
  return 6
}

export default function WeekDetail({ weekStart, onBack }) {
  const todayIndex = getEffectiveTodayIndex(weekStart)
  const [showModal, setShowModal] = useState(false)
  const [showUnmarkConfirm, setShowUnmarkConfirm] = useState(false)

  const {
    baselineChecks, dailyChecks, weeklyChecks,
    isPaid, totalEarned, loading, error,
    toggleBaseline, toggleDaily, toggleWeekly, markPaid, unmarkPaid,
  } = useWeekData(weekStart)

  const earnings = computeEarnings({ baselineChecks, dailyChecks, weeklyChecks, todayIndex })
  const { baselineEarnings, dailyEarnings, weeklyEarnings, weeklyMultiplier, weeklyBase, completedWeekly, total, baselineComplete } = earnings

  const handlePayday = async () => {
    await markPaid(total, baselineEarnings, dailyEarnings, weeklyEarnings)
    setShowModal(false)
  }

  const handleUnmark = async () => {
    await unmarkPaid()
    setShowUnmarkConfirm(false)
  }

  return (
    <>
      {/* Header with back button */}
      <div style={{
        padding: '18px 20px 14px',
        display: 'flex', alignItems: 'center', gap: '12px',
        position: 'sticky', top: 0, zIndex: 100,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        background: 'rgba(13,13,26,0.88)',
        borderBottom: '1px solid rgba(124,58,237,0.2)',
      }}>
        <button
          onClick={onBack}
          className="tap"
          style={{
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '10px', padding: '8px 12px', color: '#a78bfa',
            fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          ← Back
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Week</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {formatWeekRange(weekStart)}
          </div>
        </div>
        {isPaid && (
          <span style={{
            background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.4)',
            color: '#4ade80', borderRadius: '20px', padding: '4px 12px',
            fontSize: '0.72rem', fontWeight: 700, flexShrink: 0,
          }}>
            ✓ PAID
          </span>
        )}
      </div>

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: '2rem', animation: 'pop 1s ease infinite' }}>📜</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>Loading week…</div>
        </div>
      )}

      {error && (
        <div style={{ margin: '20px 16px', padding: '20px', borderRadius: '16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: '0.85rem' }}>
          ⚠️ {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <EarningsHero
            baselineEarnings={baselineEarnings}
            dailyEarnings={dailyEarnings}
            weeklyEarnings={weeklyEarnings}
            total={isPaid ? (totalEarned ?? total) : total}
            baselineComplete={baselineComplete}
          />

          <BaselineSection
            baselineChecks={baselineChecks}
            todayIndex={todayIndex}
            onToggle={toggleBaseline}
            isPaid={isPaid}
            baselineComplete={baselineComplete}
          />

          <DailyBonusSection
            dailyChecks={dailyChecks}
            todayIndex={todayIndex}
            onToggle={toggleDaily}
            isPaid={isPaid}
          />

          <WeeklyBonusSection
            weeklyChecks={weeklyChecks}
            onToggle={toggleWeekly}
            isPaid={isPaid}
            weeklyEarnings={weeklyEarnings}
            weeklyMultiplier={weeklyMultiplier}
            weeklyBase={weeklyBase}
            completedWeekly={completedWeekly}
          />

          {/* Pay / unmark button */}
          <div style={{ margin: '0 16px 8px' }}>
            {isPaid ? (
              <>
                <div style={{
                  width: '100%', padding: '16px', borderRadius: '14px',
                  background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)',
                  textAlign: 'center', fontSize: '1rem', fontWeight: 800, color: '#4ade80',
                  marginBottom: '10px',
                }}>
                  ✅ Week Paid — {fmtDollar(totalEarned ?? total)}
                </div>
                {showUnmarkConfirm ? (
                  <div style={{
                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: '14px', padding: '16px',
                  }}>
                    <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginBottom: '12px', textAlign: 'center' }}>
                      This will unlock the week for editing and remove{' '}
                      <span style={{ color: '#f87171', fontWeight: 700 }}>{fmtDollar(totalEarned ?? total)}</span>{' '}
                      from the PS5 paid balance. Continue?
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => setShowUnmarkConfirm(false)}
                        style={{
                          flex: 1, padding: '12px', borderRadius: '10px',
                          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                          color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUnmark}
                        style={{
                          flex: 1, padding: '12px', borderRadius: '10px',
                          background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)',
                          color: '#f87171', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
                        }}
                      >
                        Unlock Week
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowUnmarkConfirm(true)}
                    style={{
                      width: '100%', padding: '12px',
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px', color: 'rgba(255,255,255,0.4)',
                      fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    🔓 Unmark as Paid
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={() => setShowModal(true)}
                style={{
                  width: '100%', padding: '16px',
                  background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                  border: 'none', borderRadius: '14px', color: '#fff',
                  fontSize: '1.1rem', fontWeight: 800, cursor: 'pointer',
                  boxShadow: '0 4px 24px rgba(124,58,237,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
                }}
              >
                💸 Mark Week as Paid — {fmtDollar(total)}
              </button>
            )}
          </div>
        </>
      )}

      {showModal && (
        <PaydayModal
          total={total}
          baselineEarnings={baselineEarnings}
          dailyEarnings={dailyEarnings}
          weeklyEarnings={weeklyEarnings}
          onConfirm={handlePayday}
          onCancel={() => setShowModal(false)}
        />
      )}
    </>
  )
}
