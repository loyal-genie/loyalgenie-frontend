import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn, generatePIN } from '@/lib/utils'
import type { Campaign } from '@/lib/types'

const CYCLE = 60

interface LivePINProps {
  campaign: Campaign
  compact?: boolean
}

export function LivePIN({ campaign, compact = false }: LivePINProps) {
  const [pin, setPin] = useState(campaign.pin)
  const [seconds, setSeconds] = useState(CYCLE)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          setRefreshing(true)
          setTimeout(() => {
            setPin(generatePIN())
            setRefreshing(false)
          }, 300)
          return CYCLE
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const pct = seconds / CYCLE
  const r = 28
  const circ = 2 * Math.PI * r
  const dash = circ * (1 - pct)
  const urgency = seconds <= 10

  if (compact) {
    return (
      <div
        className={cn(
          'flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl border',
          urgency ? 'border-orange-200 bg-orange-50' : 'border-v-border-b/40 bg-v-surface-2',
        )}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={pin}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className={cn('text-lg font-black tracking-[0.2em]', urgency ? 'text-orange-600' : 'text-v-text')}
          >
            {refreshing ? '···' : pin}
          </motion.span>
        </AnimatePresence>
        <span className={cn('text-[9px] font-semibold', urgency ? 'text-orange-500' : 'text-v-text-3')}>
          {seconds}s
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
            stroke={urgency ? '#D97706' : '#7C3AED'}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={dash}
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <AnimatePresence mode="wait">
            <motion.span
              key={pin}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className={cn('text-2xl font-black tracking-[0.15em]', urgency ? 'text-orange-600' : 'text-v-text')}
            >
              {refreshing ? '···' : pin}
            </motion.span>
          </AnimatePresence>
          <span className={cn('text-[10px] font-semibold mt-0.5', urgency ? 'text-orange-500' : 'text-v-text-3')}>
            {seconds}s
          </span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs font-semibold text-v-text">Staff PIN</p>
        <p className="text-[10px] text-v-text-3">Rotates every 60s</p>
      </div>
    </div>
  )
}
