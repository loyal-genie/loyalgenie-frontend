import { useEffect, useState } from 'react'
import { Timer } from 'lucide-react'

function getRemaining(targetMs: number) {
  const diffMs = targetMs - Date.now()
  const clamped = Math.max(0, diffMs)
  const totalMinutes = Math.floor(clamped / 60000)
  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60,
    expired: diffMs <= 0,
  }
}

interface CountdownTimerProps {
  /** ISO datetime to count down to */
  target: string
  color: string
  className?: string
}

/** Compact "Hh Mm" badge — used next to Flash Deal title. Ticks every 30s. */
export function CountdownTimer({ target, color, className = '' }: CountdownTimerProps) {
  const targetMs = new Date(target).getTime()
  const [remaining, setRemaining] = useState(() => getRemaining(targetMs))

  useEffect(() => {
    const id = setInterval(() => setRemaining(getRemaining(targetMs)), 30_000)
    return () => clearInterval(id)
  }, [targetMs])

  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${className}`}
      style={{ background: `${color}18`, color }}
    >
      <Timer className="size-3 shrink-0" />
      {remaining.expired ? 'Ended' : `${remaining.hours}h ${remaining.minutes}m`}
    </span>
  )
}
