import { useEffect, useRef } from 'react'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'

type PostgresChangeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*'

type RealtimeTable =
  | 'campaigns'
  | 'customer_rewards'
  | 'game_plays'
  | 'stamp_cards'
  | 'loyalty_cards'

interface RealtimeSubscription {
  table: RealtimeTable
  event?: PostgresChangeEvent
  filter?: string
  onChange: () => void
  enabled?: boolean
}

let channelSeq = 0

/**
 * Subscribe to Supabase postgres_changes.
 * Uses a unique channel per mount so React Strict Mode / filter changes
 * never call `.on()` on an already-subscribed channel (Supabase reuses names).
 */
export function useSupabaseRealtime({
  table,
  event = '*',
  filter,
  onChange,
  enabled = true,
}: RealtimeSubscription) {
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    if (!enabled || !isSupabaseConfigured()) return

    const supabase = getSupabase()
    if (!supabase) return

    const channelName = `rt:${table}:${++channelSeq}`
    const channel = supabase.channel(channelName)

    channel.on(
      'postgres_changes',
      {
        event,
        schema: 'public',
        table,
        ...(filter ? { filter } : {}),
      },
      () => onChangeRef.current(),
    )

    channel.subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [table, event, filter, enabled])
}
