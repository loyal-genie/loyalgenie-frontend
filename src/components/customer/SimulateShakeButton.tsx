import { useEffect, useRef } from 'react'

interface SimulateShakeButtonProps {
  onTick: () => void
  className?: string
}

/** Fires onTick every 16ms while held — desktop shake simulation (POC pattern). */
export function SimulateShakeButton({ onTick, className }: SimulateShakeButtonProps) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function start() {
    onTick()
    intervalRef.current = setInterval(onTick, 16)
  }

  function stop() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = null
  }

  useEffect(() => () => stop(), [])

  return (
    <button
      type="button"
      className={
        className ??
        'px-6 py-2.5 rounded-lg text-sm font-medium bg-white/6 text-white/60 border border-white/10 select-none touch-manipulation cursor-pointer hover:bg-white/10 active:bg-white/15 transition-colors'
      }
      onPointerDown={start}
      onPointerUp={stop}
      onPointerLeave={stop}
    >
      Hold to Simulate Shake
    </button>
  )
}
