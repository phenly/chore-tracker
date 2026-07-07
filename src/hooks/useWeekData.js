import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { getAllWeeks, getWeekStartStr, getTodayIndex, computeEarnings, effectiveTotal } from '../lib/utils'

const EMPTY_BASELINE = {
  bed: [false, false, false, false, false, false, false],
  room: [false, false, false, false, false, false, false],
  laundry: false,
}
const EMPTY_DAILY = {
  poop: [false, false, false, false, false, false, false],
  dish: [false, false, false, false, false, false, false],
  table: [false, false, false, false, false, false, false],
}
const EMPTY_WEEKLY = { mow: false, trash: false, tp: false, groceries: false }

function buildEmptyState() {
  return {
    baselineChecks: JSON.parse(JSON.stringify(EMPTY_BASELINE)),
    dailyChecks: JSON.parse(JSON.stringify(EMPTY_DAILY)),
    weeklyChecks: { ...EMPTY_WEEKLY },
    isPaid: false,
    paidAt: null,
    totalEarned: null,
    overrideTotal: null,
    totalEditedAt: null,
  }
}

function buildStateFromRows(baselineRows, dailyRows, weeklyRows, weekRow) {
  const newState = buildEmptyState()

  for (const row of baselineRows) {
    if (row.chore_id === 'laundry' || row.day_index === -1) {
      newState.baselineChecks.laundry = row.checked
    } else if (row.day_index >= 0 && newState.baselineChecks[row.chore_id]) {
      newState.baselineChecks[row.chore_id][row.day_index] = row.checked
    }
  }

  for (const row of dailyRows) {
    if (newState.dailyChecks[row.chore_id]) {
      newState.dailyChecks[row.chore_id][row.day_index] = row.checked
    }
  }

  for (const row of weeklyRows) {
    if (row.chore_id in newState.weeklyChecks) {
      newState.weeklyChecks[row.chore_id] = row.checked
    }
  }

  if (weekRow) {
    newState.isPaid = weekRow.is_paid
    newState.paidAt = weekRow.paid_at
    newState.totalEarned = weekRow.total_earned
    newState.overrideTotal = weekRow.override_total ?? null
    newState.totalEditedAt = weekRow.total_edited_at ?? null
  }

  return newState
}

export function useWeekData(weekStart) {
  const [state, setState] = useState(buildEmptyState())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [ps5PaidSavings, setPs5PaidSavings] = useState(0)
  const [ps5UnpaidSavings, setPs5UnpaidSavings] = useState(0)
  const stateRef = useRef(state)
  stateRef.current = state

  // Initial load only — never called again after mount
  const loadWeek = useCallback(async (ws) => {
    setLoading(true)
    setError(null)
    try {
      const [baselineRes, dailyRes, weeklyRes, weeksRes, allWeeks] = await Promise.all([
        supabase.from('baseline_checks').select('*').eq('week_start', ws),
        supabase.from('daily_bonus_checks').select('*').eq('week_start', ws),
        supabase.from('weekly_bonus_checks').select('*').eq('week_start', ws),
        supabase.from('weeks').select('*').eq('week_start', ws).maybeSingle(),
        loadAllWeeks(),
      ])

      if (baselineRes.error) throw baselineRes.error
      if (dailyRes.error) throw dailyRes.error
      if (weeklyRes.error) throw weeklyRes.error
      if (weeksRes.error) throw weeksRes.error

      const newState = buildStateFromRows(
        baselineRes.data || [],
        dailyRes.data || [],
        weeklyRes.data || [],
        weeksRes.data,
      )
      // Paid savings = all paid weeks. Unpaid savings here excludes the loaded week —
      // the current-week screen adds its own live total on top, so it updates as chores
      // are checked without double-counting.
      const paidSavings = allWeeks
        .filter((w) => w.is_paid)
        .reduce((sum, w) => sum + Number(w.total_earned || 0), 0)
      const unpaidSavings = allWeeks
        .filter((w) => !w.is_paid && w.week_start !== ws)
        .reduce((sum, w) => sum + Number(w.total_earned || 0), 0)

      setState(newState)
      setPs5PaidSavings(paidSavings)
      setPs5UnpaidSavings(unpaidSavings)
    } catch (err) {
      console.error('Failed to load week data:', err)
      setError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (weekStart) loadWeek(weekStart)
  }, [weekStart, loadWeek])

  // Realtime: apply payload changes directly to state — no re-fetch, no loading flash.
  // This handles updates from OTHER family devices. Own-device changes are already
  // reflected via optimistic updates, so echoed events are no-ops (state matches DB).
  useEffect(() => {
    if (!weekStart) return

    const baseline = supabase
      .channel(`rt-baseline-${weekStart}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'baseline_checks', filter: `week_start=eq.${weekStart}` },
        ({ new: row }) => {
          if (!row) return
          setState((prev) => {
            const next = JSON.parse(JSON.stringify(prev))
            if (row.chore_id === 'laundry' || row.day_index === -1) {
              next.baselineChecks.laundry = row.checked
            } else if (row.day_index >= 0 && next.baselineChecks[row.chore_id]) {
              next.baselineChecks[row.chore_id][row.day_index] = row.checked
            }
            return next
          })
        },
      )
      .subscribe()

    const daily = supabase
      .channel(`rt-daily-${weekStart}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'daily_bonus_checks', filter: `week_start=eq.${weekStart}` },
        ({ new: row }) => {
          if (!row) return
          setState((prev) => {
            const next = JSON.parse(JSON.stringify(prev))
            if (next.dailyChecks[row.chore_id]) {
              next.dailyChecks[row.chore_id][row.day_index] = row.checked
            }
            return next
          })
        },
      )
      .subscribe()

    const weekly = supabase
      .channel(`rt-weekly-${weekStart}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'weekly_bonus_checks', filter: `week_start=eq.${weekStart}` },
        ({ new: row }) => {
          if (!row) return
          setState((prev) => ({
            ...prev,
            weeklyChecks: { ...prev.weeklyChecks, [row.chore_id]: row.checked },
          }))
        },
      )
      .subscribe()

    const weeks = supabase
      .channel(`rt-weeks-${weekStart}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'weeks', filter: `week_start=eq.${weekStart}` },
        ({ new: row }) => {
          if (!row) return
          setState((prev) => ({
            ...prev,
            isPaid: row.is_paid,
            paidAt: row.paid_at,
            totalEarned: row.total_earned,
            overrideTotal: row.override_total ?? null,
            totalEditedAt: row.total_edited_at ?? null,
          }))
          // Recompute PS5 savings silently when payday changes from another device
          supabase
            .from('weeks')
            .select('total_earned')
            .eq('is_paid', true)
            .then(({ data }) => {
              if (data) {
                const savings = data.reduce((sum, r) => sum + Number(r.total_earned || 0), 0)
                setPs5PaidSavings(savings)
              }
            })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(baseline)
      supabase.removeChannel(daily)
      supabase.removeChannel(weekly)
      supabase.removeChannel(weeks)
    }
  }, [weekStart])

  // Toggle baseline daily chore — optimistic update, then sync
  const toggleBaseline = useCallback(async (choreId, dayIndex) => {
    if (stateRef.current.isPaid) return
    const newVal = choreId === 'laundry'
      ? !stateRef.current.baselineChecks.laundry
      : !stateRef.current.baselineChecks[choreId][dayIndex]

    setState((prev) => {
      const next = JSON.parse(JSON.stringify(prev))
      if (choreId === 'laundry') {
        next.baselineChecks.laundry = newVal
      } else {
        next.baselineChecks[choreId][dayIndex] = newVal
      }
      return next
    })

    supabase.from('baseline_checks').upsert(
      {
        week_start: weekStart,
        chore_id: choreId,
        day_index: choreId === 'laundry' ? -1 : dayIndex,
        checked: newVal,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'week_start,chore_id,day_index', ignoreDuplicates: false },
    ).then(({ error }) => { if (error) console.error('baseline sync error:', error) })
  }, [weekStart])

  // Toggle daily bonus chore — optimistic update, then sync
  const toggleDaily = useCallback(async (choreId, dayIndex) => {
    if (stateRef.current.isPaid) return
    const newVal = !stateRef.current.dailyChecks[choreId][dayIndex]

    setState((prev) => {
      const next = JSON.parse(JSON.stringify(prev))
      next.dailyChecks[choreId][dayIndex] = newVal
      return next
    })

    supabase.from('daily_bonus_checks').upsert(
      { week_start: weekStart, chore_id: choreId, day_index: dayIndex, checked: newVal, updated_at: new Date().toISOString() },
      { onConflict: 'week_start,chore_id,day_index', ignoreDuplicates: false },
    ).then(({ error }) => { if (error) console.error('daily sync error:', error) })
  }, [weekStart])

  // Toggle weekly bonus chore — optimistic update, then sync
  const toggleWeekly = useCallback((choreId) => {
    if (stateRef.current.isPaid) return
    const newVal = !stateRef.current.weeklyChecks[choreId]

    setState((prev) => ({
      ...prev,
      weeklyChecks: { ...prev.weeklyChecks, [choreId]: newVal },
    }))

    supabase.from('weekly_bonus_checks').upsert(
      { week_start: weekStart, chore_id: choreId, checked: newVal, updated_at: new Date().toISOString() },
      { onConflict: 'week_start,chore_id', ignoreDuplicates: false },
    ).then(({ error }) => { if (error) console.error('weekly sync error:', error) })
  }, [weekStart])

  // Mark week as paid. Stores the EFFECTIVE total (a manual override wins over the
  // button-calculated total) so PS5 savings reflect the edited amount. The section
  // breakdown is always stored button-calculated.
  const markPaid = useCallback(async (totalEarned, baselineEarned, dailyEarned, weeklyEarned) => {
    const now = new Date().toISOString()
    const override = stateRef.current.overrideTotal
    const finalTotal = (override !== null && override !== undefined) ? Number(override) : totalEarned
    setState((prev) => ({ ...prev, isPaid: true, paidAt: now, totalEarned: finalTotal }))
    setPs5PaidSavings((prev) => prev + finalTotal)

    await supabase.from('weeks').upsert(
      {
        week_start: weekStart,
        is_paid: true,
        paid_at: now,
        total_earned: finalTotal,
        baseline_earned: baselineEarned,
        daily_earned: dailyEarned,
        weekly_earned: weeklyEarned,
      },
      { onConflict: 'week_start', ignoreDuplicates: false },
    )
  }, [weekStart])

  // Unmark week as paid — reopens it for editing
  const unmarkPaid = useCallback(async () => {
    const removedTotal = stateRef.current.totalEarned || 0
    setState((prev) => ({ ...prev, isPaid: false, paidAt: null }))
    setPs5PaidSavings((prev) => Math.max(0, prev - removedTotal))

    await supabase.from('weeks').upsert(
      { week_start: weekStart, is_paid: false, paid_at: null },
      { onConflict: 'week_start', ignoreDuplicates: false },
    )
  }, [weekStart])

  // Save a manual total override (only meaningful while the week is unpaid — the UI
  // enforces that). Records when it was edited for the "Edited on" note.
  const saveOverride = useCallback(async (amount) => {
    const now = new Date().toISOString()
    const val = Number(amount)
    setState((prev) => ({ ...prev, overrideTotal: val, totalEditedAt: now }))

    await supabase.from('weeks').upsert(
      { week_start: weekStart, override_total: val, total_edited_at: now },
      { onConflict: 'week_start', ignoreDuplicates: false },
    )
  }, [weekStart])

  // Clear the override — the week reverts to its button-calculated total and the
  // "Edited on" note disappears.
  const clearOverride = useCallback(async () => {
    setState((prev) => ({ ...prev, overrideTotal: null, totalEditedAt: null }))

    await supabase.from('weeks').upsert(
      { week_start: weekStart, override_total: null, total_edited_at: null },
      { onConflict: 'week_start', ignoreDuplicates: false },
    )
  }, [weekStart])

  return {
    ...state,
    loading,
    error,
    ps5PaidSavings,
    ps5UnpaidSavings,
    toggleBaseline,
    toggleDaily,
    toggleWeekly,
    markPaid,
    unmarkPaid,
    saveOverride,
    clearOverride,
  }
}

// Load all weeks in history range — returns every week from HISTORY_START to now.
// Earnings are computed live from the check tables so UNPAID weeks show real totals
// (the weeks table's *_earned columns are only written at payday). Paid weeks keep
// their locked-in stored amounts — mirroring WeekDetail's paid-vs-live display rule.
export async function loadAllWeeks() {
  const allWeeks = getAllWeeks()
  const [weeksRes, baselineRes, dailyRes, weeklyRes] = await Promise.all([
    supabase.from('weeks').select('*').in('week_start', allWeeks),
    supabase.from('baseline_checks').select('*').in('week_start', allWeeks),
    supabase.from('daily_bonus_checks').select('*').in('week_start', allWeeks),
    supabase.from('weekly_bonus_checks').select('*').in('week_start', allWeeks),
  ])
  if (weeksRes.error) throw weeksRes.error
  if (baselineRes.error) throw baselineRes.error
  if (dailyRes.error) throw dailyRes.error
  if (weeklyRes.error) throw weeklyRes.error

  const weekMap = {}
  for (const row of (weeksRes.data || [])) weekMap[row.week_start] = row

  const groupByWeek = (rows) => {
    const grouped = {}
    for (const row of (rows || [])) (grouped[row.week_start] ||= []).push(row)
    return grouped
  }
  const baselineByWeek = groupByWeek(baselineRes.data)
  const dailyByWeek = groupByWeek(dailyRes.data)
  const weeklyByWeek = groupByWeek(weeklyRes.data)

  // Past weeks count all 7 days as elapsed; the current week respects today's index.
  const currentWeek = getWeekStartStr()
  const currentTodayIndex = getTodayIndex()

  return allWeeks.map((ws) => {
    const weekRow = weekMap[ws]
    const { baselineChecks, dailyChecks, weeklyChecks } = buildStateFromRows(
      baselineByWeek[ws] || [],
      dailyByWeek[ws] || [],
      weeklyByWeek[ws] || [],
      weekRow,
    )
    const todayIndex = ws === currentWeek ? currentTodayIndex : 6
    const computed = computeEarnings({ baselineChecks, dailyChecks, weeklyChecks, todayIndex })

    const isPaid = weekRow?.is_paid ?? false
    const overrideTotal = weekRow?.override_total ?? null
    // Breakdown (base/daily/weekly): paid weeks use locked-in stored amounts (falling
    // back to computed if null on an older row); unpaid weeks use freshly computed
    // values. The total is the EFFECTIVE total — a manual override wins over both.
    const useStored = isPaid && weekRow
    return {
      week_start: ws,
      is_paid: isPaid,
      override_total: overrideTotal,
      total_edited_at: weekRow?.total_edited_at ?? null,
      baseline_earned: useStored ? Number(weekRow.baseline_earned ?? computed.baselineEarnings) : computed.baselineEarnings,
      daily_earned: useStored ? Number(weekRow.daily_earned ?? computed.dailyEarnings) : computed.dailyEarnings,
      weekly_earned: useStored ? Number(weekRow.weekly_earned ?? computed.weeklyEarnings) : computed.weeklyEarnings,
      total_earned: effectiveTotal({
        overrideTotal,
        isPaid,
        storedTotal: weekRow?.total_earned,
        computedTotal: computed.total,
      }),
    }
  })
}
