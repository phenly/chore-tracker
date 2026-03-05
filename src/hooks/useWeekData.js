import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { getWeekStartStr, DAILY_BONUS, WEEKLY_BONUS } from '../lib/utils'

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
  }
}

export function useWeekData(weekStart) {
  const [state, setState] = useState(buildEmptyState())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [ps5Savings, setPs5Savings] = useState(0)
  const stateRef = useRef(state)
  stateRef.current = state

  // Load all data for this week
  const loadWeek = useCallback(async (ws) => {
    setLoading(true)
    setError(null)
    try {
      const [baselineRes, dailyRes, weeklyRes, weeksRes, ps5Res] = await Promise.all([
        supabase.from('baseline_checks').select('*').eq('week_start', ws),
        supabase.from('daily_bonus_checks').select('*').eq('week_start', ws),
        supabase.from('weekly_bonus_checks').select('*').eq('week_start', ws),
        supabase.from('weeks').select('*').eq('week_start', ws).maybeSingle(),
        supabase.from('weeks').select('total_earned').eq('is_paid', true),
      ])

      if (baselineRes.error) throw baselineRes.error
      if (dailyRes.error) throw dailyRes.error
      if (weeklyRes.error) throw weeklyRes.error
      if (weeksRes.error) throw weeksRes.error
      if (ps5Res.error) throw ps5Res.error

      // Build state from DB rows
      const newState = buildEmptyState()

      for (const row of baselineRes.data || []) {
        if (row.chore_id === 'laundry' || row.day_index === -1) {
          newState.baselineChecks.laundry = row.checked
        } else if (row.day_index >= 0) {
          newState.baselineChecks[row.chore_id][row.day_index] = row.checked
        }
      }

      for (const row of dailyRes.data || []) {
        if (newState.dailyChecks[row.chore_id]) {
          newState.dailyChecks[row.chore_id][row.day_index] = row.checked
        }
      }

      for (const row of weeklyRes.data || []) {
        if (row.chore_id in newState.weeklyChecks) {
          newState.weeklyChecks[row.chore_id] = row.checked
        }
      }

      if (weeksRes.data) {
        newState.isPaid = weeksRes.data.is_paid
        newState.paidAt = weeksRes.data.paid_at
        newState.totalEarned = weeksRes.data.total_earned
      }

      // Compute PS5 savings from all paid weeks
      const savings = (ps5Res.data || []).reduce((sum, row) => sum + Number(row.total_earned || 0), 0)
      setPs5Savings(savings)

      setState(newState)
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

  // Realtime subscriptions for live family sync
  useEffect(() => {
    if (!weekStart) return

    const channels = [
      supabase.channel(`baseline-${weekStart}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'baseline_checks', filter: `week_start=eq.${weekStart}` },
          () => loadWeek(weekStart))
        .subscribe(),
      supabase.channel(`daily-${weekStart}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_bonus_checks', filter: `week_start=eq.${weekStart}` },
          () => loadWeek(weekStart))
        .subscribe(),
      supabase.channel(`weekly-${weekStart}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'weekly_bonus_checks', filter: `week_start=eq.${weekStart}` },
          () => loadWeek(weekStart))
        .subscribe(),
      supabase.channel(`weeks-${weekStart}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'weeks', filter: `week_start=eq.${weekStart}` },
          () => loadWeek(weekStart))
        .subscribe(),
    ]

    return () => channels.forEach((c) => supabase.removeChannel(c))
  }, [weekStart, loadWeek])

  // Toggle baseline daily chore
  const toggleBaseline = useCallback(async (choreId, dayIndex) => {
    if (stateRef.current.isPaid) return
    const newVal = choreId === 'laundry'
      ? !stateRef.current.baselineChecks.laundry
      : !stateRef.current.baselineChecks[choreId][dayIndex]

    // Optimistic update
    setState((prev) => {
      const next = JSON.parse(JSON.stringify(prev))
      if (choreId === 'laundry') {
        next.baselineChecks.laundry = newVal
      } else {
        next.baselineChecks[choreId][dayIndex] = newVal
      }
      return next
    })

    // day_index: -1 for laundry (once/week), 0-6 for daily
    const row = {
      week_start: weekStart,
      chore_id: choreId,
      day_index: choreId === 'laundry' ? -1 : dayIndex,
      checked: newVal,
      updated_at: new Date().toISOString(),
    }

    await supabase.from('baseline_checks').upsert(row, {
      onConflict: 'week_start,chore_id,day_index',
      ignoreDuplicates: false,
    })
  }, [weekStart])

  // Toggle daily bonus chore
  const toggleDaily = useCallback(async (choreId, dayIndex) => {
    if (stateRef.current.isPaid) return
    const newVal = !stateRef.current.dailyChecks[choreId][dayIndex]

    setState((prev) => {
      const next = JSON.parse(JSON.stringify(prev))
      next.dailyChecks[choreId][dayIndex] = newVal
      return next
    })

    await supabase.from('daily_bonus_checks').upsert(
      { week_start: weekStart, chore_id: choreId, day_index: dayIndex, checked: newVal, updated_at: new Date().toISOString() },
      { onConflict: 'week_start,chore_id,day_index', ignoreDuplicates: false }
    )
  }, [weekStart])

  // Toggle weekly bonus chore
  const toggleWeekly = useCallback(async (choreId) => {
    if (stateRef.current.isPaid) return
    const newVal = !stateRef.current.weeklyChecks[choreId]

    setState((prev) => ({
      ...prev,
      weeklyChecks: { ...prev.weeklyChecks, [choreId]: newVal },
    }))

    await supabase.from('weekly_bonus_checks').upsert(
      { week_start: weekStart, chore_id: choreId, checked: newVal, updated_at: new Date().toISOString() },
      { onConflict: 'week_start,chore_id', ignoreDuplicates: false }
    )
  }, [weekStart])

  // Mark week as paid
  const markPaid = useCallback(async (totalEarned, baselineEarned, dailyEarned, weeklyEarned) => {
    const now = new Date().toISOString()
    await supabase.from('weeks').upsert(
      {
        week_start: weekStart,
        is_paid: true,
        paid_at: now,
        total_earned: totalEarned,
        baseline_earned: baselineEarned,
        daily_earned: dailyEarned,
        weekly_earned: weeklyEarned,
      },
      { onConflict: 'week_start', ignoreDuplicates: false }
    )
    setState((prev) => ({ ...prev, isPaid: true, paidAt: now, totalEarned }))
    setPs5Savings((prev) => prev + totalEarned)
  }, [weekStart])

  return {
    ...state,
    loading,
    error,
    ps5Savings,
    toggleBaseline,
    toggleDaily,
    toggleWeekly,
    markPaid,
    reload: () => loadWeek(weekStart),
  }
}

// Load all paid weeks for history view
export async function loadHistory() {
  const { data, error } = await supabase
    .from('weeks')
    .select('*')
    .eq('is_paid', true)
    .order('week_start', { ascending: false })
  if (error) throw error
  return data || []
}
