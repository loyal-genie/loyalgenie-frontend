import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw } from 'lucide-react'
import { useCampaignPin } from '@/hooks/useCampaigns'
import { cn } from '@/lib/utils'

interface LivePINProps {
  campaignId: string
  active?: boolean
  compact?: boolean
  daily?: boolean
}

export function LivePIN({ campaignId, active = true, compact = false, daily = false }: LivePINProps) {
  const { data, isLoading, isFetching, refetch } = useCampaignPin(campaignId, active)
  const [displayPin, setDisplayPin] = useState('···')
  const [seconds, setSeconds] = useState(120)
  const [refreshing, setRefreshing] = useState(false)
  const prevPin = useRef<string | null>(null)
  const refetchingRef = useRef(false)

  useEffect(() => {
    if (!data) return
    if (prevPin.current && prevPin.current !== data.pin) {
      setRefreshing(true)
      setTimeout(() => setRefreshing(false), 400)
    }
    prevPin.current = data.pin
    setDisplayPin(data.pin)
    setSeconds(data.secondsRemaining)
    refetchingRef.current = false
  }, [data])

  // Local countdown tick
  useEffect(() => {
    if (!active) return
    const interval = setInterval(() => {
      setSeconds(s => Math.max(0, s - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [active])

  // When timer hits zero, fetch the new PIN immediately
  useEffect(() => {
    if (!active || seconds > 0 || refetchingRef.current) return
    refetchingRef.current = true
    refetch()
  }, [seconds, active, refetch])

  const cycle = data?.cycleSeconds ?? (daily ? 86400 : 120)
  const isDaily = daily || cycle >= 86400
  const urgency = isDaily ? seconds <= 3600 : seconds <= 15
  const expired = seconds === 0
  const pct = cycle > 0 ? seconds / cycle : 0
  const r = 28
  const circ = 2 * Math.PI * r
  const dash = circ * (1 - pct)

  const timeLabel = isDaily
    ? (expired ? 'Refreshing…' : seconds >= 3600 ? `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m` : `${Math.floor(seconds / 60)}m ${seconds % 60}s`)
    : (expired ? 'Refreshing…' : `${seconds}s`)

  if (!active) {
    return (
      <div className="text-center py-4">
        <div className="text-4xl font-black tracking-[0.3em] text-v-border-b">---</div>
        <p className="text-xs text-v-text-3 mt-2">PIN inactive — campaign not running</p>
      </div>
    )
  }

  if (compact) {
    return (
      <div
        className={cn(
          'flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl border',
          expired ? 'border-purple-200 bg-purple-50' : urgency ? 'border-orange-200 bg-orange-50' : 'border-v-border-b/40 bg-v-surface-2',
        )}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={displayPin}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className={cn('text-lg font-black tracking-[0.2em]', expired || urgency ? 'text-orange-600' : 'text-v-text')}
          >
            {isLoading || refreshing || (isFetching && expired) ? '···' : displayPin}
          </motion.span>
        </AnimatePresence>
        <span className={cn('text-[9px] font-semibold flex items-center gap-1', expired || urgency ? 'text-orange-500' : 'text-v-text-3')}>
          {expired && isFetching ? <RefreshCw className="w-2.5 h-2.5 animate-spin" /> : null}
          {timeLabel}
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative flex items-center justify-center">
        <svg width="80" height="80" className="-rotate-90">
          <circle cx="40" cy="40" r={r} fill="none" stroke="#E5E1F8" strokeWidth="3" />
          <circle
            cx="40"
            cy="40"
            r={r}
            fill="none"
            stroke={expired ? '#7C3AED' : urgency ? '#D97706' : '#7C3AED'}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={expired ? 0 : dash}
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <AnimatePresence mode="wait">
            <motion.span
              key={displayPin}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className={cn('text-2xl font-black tracking-[0.15em]', expired || urgency ? 'text-orange-600' : 'text-v-text')}
            >
              {isLoading || refreshing || (isFetching && expired) ? '···' : displayPin}
            </motion.span>
          </AnimatePresence>
          <span className={cn('text-[10px] font-semibold mt-0.5 flex items-center gap-1', expired || urgency ? 'text-orange-500' : 'text-v-text-3')}>
            {expired && isFetching ? <RefreshCw className="w-3 h-3 animate-spin" /> : null}
            {expired ? 'New PIN loading…' : `${seconds}s`}
          </span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs font-semibold text-v-text">Staff PIN</p>
        <p className="text-[10px] text-v-text-3">
          {expired ? 'New PIN loading…' : isDaily ? 'Rotates daily at midnight' : `Rotates every ${cycle}s · auto-refreshes`}
        </p>
      </div>
    </div>
  )
}
