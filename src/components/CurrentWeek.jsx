import { useState } from 'react'
import { useWeekData } from '../hooks/useWeekData'
import { getTodayIndex, computeEarnings, fmtDollar } from '../lib/utils'
import Header from './Header'
import EarningsHero from './EarningsHero'
import PS5Bar from './PS5Bar'
import BaselineSection from './BaselineSection'
import DailyBonusSection from './DailyBonusSection'
import WeeklyBonusSection from './WeeklyBonusSection'
import PaydayModal from './PaydayModal'

export default function CurrentWeek({ weekStart }) {
  const todayIndex = getTodayIndex()
  const [showModal, setShowModal] = useState(false)
  const [showUnmarkConfirm, setShowUnmarkConfirm] = useState(false)
  const {
    baselineChecks, dailyChecks, weeklyChecks,
    isPaid, totalEarned, loading, error, ps5PaidSavings, ps5UnpaidSavings,
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

  // PS5 bar: paid segment = locked savings; unpaid = all other unpaid weeks plus
  // this week's live total (so it updates as chores are checked).
  const unpaidSavings = ps5UnpaidSavings + (isPaid ? 0 : total)

  if (loading) {
    return (
      <>
        <Header weekStart={weekStart} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: '2rem', animation: 'pop 1s ease infinite' }}>🎮</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>Loading…</div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Header weekStart={weekStart} />
        <div style={{ margin: '20px 16px', padding: '20px', borderRadius: '16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
          <div style={{ fontWeight: 700, marginBottom: '8px', color: '#f87171' }}>⚠️ Connection Error</div>
          <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginBottom: '16px' }}>{error}</div>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
            Make sure the Supabase database tables are set up. Run the SQL migration in{' '}
            <code style={{ color: '#a78bfa' }}>supabase/migrations/001_initial.sql</code>.
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header weekStart={weekStart} />

      <EarningsHero
        baselineEarnings={baselineEarnings}
        dailyEarnings={dailyEarnings}
        weeklyEarnings={weeklyEarnings}
        total={total}
        baselineComplete={baselineComplete}
      />

      <PS5Bar paidSavings={ps5PaidSavings} unpaidSavings={unpaidSavings} />

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

      {/* Payday / unmark button */}
      <div style={{ margin: '0 16px 8px' }}>
        {isPaid ? (
          <>
            <div style={{
              width: '100%', padding: '16px', borderRadius: '14px',
              background: 'rgba(74,222,128,0.1)',
              border: '1px solid rgba(74,222,128,0.3)',
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
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
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
