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

function secondsUntilExpiry(expiresAt: string | null | undefined): number {
  if (!expiresAt) return 0
  return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000))
}

export function LivePIN({ campaignId, active = true, compact = false, daily = false }: LivePINProps) {
  const { data, isLoading, isFetching, refetch } = useCampaignPin(campaignId, active)
  const [displayPin, setDisplayPin] = useState('···')
  const [refreshing, setRefreshing] = useState(false)
  const prevPin = useRef<string | null>(null)
  const prevExpiresAt = useRef<string | null>(null)

  const serverSeconds = data?.expiresAt
    ? secondsUntilExpiry(data.expiresAt)
    : (data?.secondsRemaining ?? 0)

  // Sync display PIN; flash when pin OR expiry window changes (rotation)
  useEffect(() => {
    if (!data?.pin) return
    const pinChanged = prevPin.current && prevPin.current !== data.pin
    const expiryChanged = prevExpiresAt.current && prevExpiresAt.current !== data.expiresAt
    if (pinChanged || expiryChanged) {
      setRefreshing(true)
      setTimeout(() => setRefreshing(false), 400)
    }
    prevPin.current = data.pin
    prevExpiresAt.current = data.expiresAt ?? null
    setDisplayPin(data.pin)
  }, [data?.pin, data?.expiresAt])

  const cycle = data?.cycleSeconds ?? (daily ? 86400 : 120)
  const isDaily = daily || cycle >= 86400
  const urgency = isDaily ? serverSeconds <= 3600 : serverSeconds <= 15
  const atExpiry = serverSeconds <= 0
  const waitingForNewPin = atExpiry && isFetching
  const pct = cycle > 0 ? Math.max(0, serverSeconds) / cycle : 0
  const r = 28
  const circ = 2 * Math.PI * r
  const dash = circ * (1 - pct)

  const timeLabel = isDaily
    ? (atExpiry ? 'Rotating…' : serverSeconds >= 3600 ? `${Math.floor(serverSeconds / 3600)}h ${Math.floor((serverSeconds % 3600) / 60)}m` : `${Math.floor(serverSeconds / 60)}m ${serverSeconds % 60}s`)
    : (atExpiry ? 'Rotating…' : `${serverSeconds}s`)

  const pinLoading = isLoading || refreshing || (isFetching && !data?.pin)

  // Force network refetch at expiry (don't rely on deduped cache)
  useEffect(() => {
    if (!active || !atExpiry) return
    const pull = () => void refetch({ cancelRefetch: false })
    pull()
    const interval = setInterval(pull, 400)
    return () => clearInterval(interval)
  }, [active, atExpiry, refetch])

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
          atExpiry ? 'border-purple-200 bg-purple-50' : urgency ? 'border-orange-200 bg-orange-50' : 'border-v-border-b/40 bg-v-surface-2',
        )}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={`${displayPin}-${data?.expiresAt ?? ''}`}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className={cn('text-lg font-black tracking-[0.2em]', atExpiry || urgency ? 'text-orange-600' : 'text-v-text')}
          >
            {pinLoading ? '···' : displayPin}
          </motion.span>
        </AnimatePresence>
        <span className={cn('text-[9px] font-semibold flex items-center gap-1', atExpiry || urgency ? 'text-orange-500' : 'text-v-text-3')}>
          {waitingForNewPin ? <RefreshCw className="w-2.5 h-2.5 animate-spin" /> : null}
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
            stroke={atExpiry ? '#7C3AED' : urgency ? '#D97706' : '#7C3AED'}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={atExpiry ? 0 : dash}
            style={{ transition: 'stroke-dashoffset 0.25s linear, stroke 0.3s' }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <AnimatePresence mode="wait">
            <motion.span
              key={`${displayPin}-${data?.expiresAt ?? ''}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className={cn('text-2xl font-black tracking-[0.15em]', atExpiry || urgency ? 'text-orange-600' : 'text-v-text')}
            >
              {pinLoading ? '···' : displayPin}
            </motion.span>
          </AnimatePresence>
          <span className={cn('text-[10px] font-semibold mt-0.5 flex items-center gap-1', atExpiry || urgency ? 'text-orange-500' : 'text-v-text-3')}>
            {waitingForNewPin ? <RefreshCw className="w-3 h-3 animate-spin" /> : null}
            {timeLabel}
          </span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs font-semibold text-v-text">Staff PIN</p>
        <p className="text-[10px] text-v-text-3">
          {atExpiry
            ? 'New PIN loading — old PIN still works for check-in'
            : isDaily
              ? 'Rotates daily at midnight'
              : `Rotates every ${cycle}s · stays valid after rotation`}
        </p>
      </div>
    </div>
  )
}
