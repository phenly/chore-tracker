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
  const {
    baselineChecks, dailyChecks, weeklyChecks,
    isPaid, loading, error, ps5Savings,
    toggleBaseline, toggleDaily, toggleWeekly, markPaid,
  } = useWeekData(weekStart)

  const earnings = computeEarnings({ baselineChecks, dailyChecks, weeklyChecks, todayIndex })
  const { baselineEarnings, dailyEarnings, weeklyEarnings, weeklyMultiplier, weeklyBase, completedWeekly, total, baselineComplete } = earnings

  const handlePayday = async () => {
    await markPaid(total, baselineEarnings, dailyEarnings, weeklyEarnings)
    setShowModal(false)
  }

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

      <PS5Bar savings={ps5Savings} />

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

      {/* Payday button */}
      <div style={{ margin: '0 16px 8px' }}>
        {isPaid ? (
          <div style={{
            width: '100%', padding: '16px', borderRadius: '14px',
            background: 'rgba(74,222,128,0.1)',
            border: '1px solid rgba(74,222,128,0.3)',
            textAlign: 'center', fontSize: '1rem', fontWeight: 800, color: '#4ade80',
          }}>
            ✅ Week Paid — {fmtDollar(total)}
          </div>
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
