import { useCallback, useEffect, useRef } from 'react'

/** Debounce rapid Supabase Realtime bursts (e.g. game_plays) to cut refetch storms. */
export function useDebouncedCallback(fn: () => void, delayMs: number) {
  const fnRef = useRef(fn)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  fnRef.current = fn

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  return useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      timerRef.current = null
      fnRef.current()
    }, delayMs)
  }, [delayMs])
}
