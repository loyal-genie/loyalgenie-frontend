import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

const CONFETTI = ['#F5C518', '#F59E0B', '#FDE68A', '#FBBF24', '#FCD34D']
/** Time to show the success result before auto-advancing (ms). */
const RESULT_VIEW_PAUSE_MS = 2400

interface StampCollectedSplashProps {
  fromCount: number
  toCount: number
  totalStamps: number
  enrolled?: boolean
  pending?: boolean
  onComplete: () => void
}

export function StampCollectedSplash({
  fromCount,
  toCount,
  totalStamps,
  enrolled,
  pending = false,
  onComplete,
}: StampCollectedSplashProps) {
  const [displayCount, setDisplayCount] = useState(fromCount)
  const remaining = Math.max(0, totalStamps - toCount)
  const ready = !pending && toCount >= fromCount

  useEffect(() => {
    if (pending || toCount <= fromCount) {
      setDisplayCount(pending ? fromCount : toCount)
      return
    }
    const steps = toCount - fromCount
    const stepMs = Math.min(300, 900 / Math.max(steps, 1))
    if (steps <= 1) {
      setDisplayCount(toCount)
      return
    }
    let current = fromCount
    const interval = setInterval(() => {
      current += 1
      setDisplayCount(current)
      if (current >= toCount) clearInterval(interval)
    }, stepMs)
    return () => clearInterval(interval)
  }, [fromCount, toCount, pending])

  useEffect(() => {
    if (!ready) return
    const t = setTimeout(onComplete, RESULT_VIEW_PAUSE_MS)
    return () => clearTimeout(t)
  }, [ready, onComplete])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6"
      style={{ background: 'linear-gradient(165deg, #43036d 0%, #2d110e 38%, #1c0038 100%)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {ready &&
        CONFETTI.map((color, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 8 + (i % 3) * 4,
              height: 8 + (i % 3) * 4,
              background: color,
              left: `${15 + i * 14}%`,
              top: '20%',
            }}
            initial={{ y: 0, opacity: 0.9, scale: 1 }}
            animate={{ y: [0, -120, 200], opacity: [0.9, 1, 0], scale: [1, 1.4, 0.6] }}
            transition={{ duration: 1.8, delay: i * 0.08, ease: 'easeOut' }}
          />
        ))}

      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: pending ? 1 : [0, 1.3, 1], rotate: pending ? 0 : [-30, 8, 0] }}
        transition={{ type: 'spring', stiffness: 260, damping: 14 }}
        className="relative z-10 w-28 h-28 rounded-3xl flex items-center justify-center text-5xl mb-6"
        style={{
          background: 'linear-gradient(135deg, #F59E0B, #D97706)',
          boxShadow: '0 0 60px rgba(245,158,11,0.5), 0 20px 40px rgba(0,0,0,0.3)',
        }}
      >
        {pending ? <Loader2 className="size-12 text-white animate-spin" /> : '☕'}
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative z-10 text-xs font-bold tracking-widest uppercase mb-2"
        style={{ color: '#F5C518' }}
      >
        {pending ? 'Collecting stamp…' : enrolled ? 'Stamp collected!' : 'Card started!'}
      </motion.p>

      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative z-10 text-4xl font-extrabold text-white mb-2 tabular-nums"
      >
        <motion.span
          key={displayCount}
          initial={ready ? { scale: 1.4, color: '#F5C518' } : false}
          animate={{ scale: 1, color: '#FFFFFF' }}
          transition={{ type: 'spring', stiffness: 300, damping: 18 }}
        >
          {displayCount}
        </motion.span>
        <span className="text-white/50"> / {totalStamps}</span>
      </motion.h2>

      {!pending && (
        <>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="relative z-10 text-base font-semibold text-white/90 mb-1"
          >
            {toCount} collected · {remaining} remaining
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="relative z-10 text-sm text-white/55 text-center max-w-xs"
          >
            {remaining === 0
              ? 'Card complete — enjoy your reward!'
              : remaining === 1
                ? 'Just 1 more stamp to complete your card'
                : `${remaining} more stamps until your reward`}
          </motion.p>
        </>
      )}
    </motion.div>
  )
}
