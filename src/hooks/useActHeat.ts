import { useEffect, useState } from 'react'
import { supabase } from '../utils/supabase'

// Global heat by act id (heatmap FR-6). An act with null or no entry has no heat.
type Heat = Record<string, number | null>

/**
 * Loads the global heat of the acts of a festival from `act_stats`. It loads
 * only when `enabled` is true, so "My picks" mode makes no request.
 */
export const useActHeat = (festivalId: string | null, enabled: boolean) => {
  const [heat, setHeat] = useState<Heat>({})
  const [loadedFor, setLoadedFor] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled || !festivalId || loadedFor === festivalId) return
    let cancelled = false

    const load = async () => {
      setError(null)
      const { data, error: heatError } = await supabase
        .from('act_stats')
        .select('act_id, heat, acts!inner(festival_id)')
        .eq('acts.festival_id', festivalId)

      if (cancelled) return
      if (heatError) {
        console.error('Error loading heat:', heatError)
        setError(heatError.message)
        return
      }

      const next: Heat = {}
      for (const row of data ?? []) next[row.act_id] = row.heat
      setHeat(next)
      setLoadedFor(festivalId)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [festivalId, enabled, loadedFor])

  return { heat, error }
}
