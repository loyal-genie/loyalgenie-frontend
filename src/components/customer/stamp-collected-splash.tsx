import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const CONFETTI = ['#F5C518', '#F59E0B', '#FDE68A', '#FBBF24', '#FCD34D']

interface StampCollectedSplashProps {
  fromCount: number
  toCount: number
  totalStamps: number
  enrolled?: boolean
  onComplete: () => void
}

export function StampCollectedSplash({
  fromCount,
  toCount,
  totalStamps,
  enrolled,
  onComplete,
}: StampCollectedSplashProps) {
  const [displayCount, setDisplayCount] = useState(fromCount)

  useEffect(() => {
    if (toCount <= fromCount) {
      setDisplayCount(toCount)
      return
    }
    const steps = toCount - fromCount
    const stepMs = Math.min(400, 1200 / steps)
    let current = fromCount
    const interval = setInterval(() => {
      current += 1
      setDisplayCount(current)
      if (current >= toCount) clearInterval(interval)
    }, stepMs)
    return () => clearInterval(interval)
  }, [fromCount, toCount])

  useEffect(() => {
    const t = setTimeout(onComplete, 2400)
    return () => clearTimeout(t)
  }, [onComplete])

  return (
    <motion.div
      className="fixed inset-0 z-40 flex flex-col items-center justify-center px-6"
      style={{ background: 'linear-gradient(145deg, #1A0545 0%, #2D1B69 45%, #0D0B1E 100%)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {CONFETTI.map((color, i) => (
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
        className="absolute inset-0 pointer-events-none flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.8, 0] }}
        transition={{ duration: 1.4 }}
      >
        <motion.div
          className="w-[100vw] h-[100vw] max-w-[24rem] max-h-[24rem] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(245,197,24,0.4) 0%, transparent 65%)' }}
          initial={{ scale: 0.3 }}
          animate={{ scale: 1.5 }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
        />
      </motion.div>

      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: [0, 1.3, 1], rotate: [-30, 8, 0] }}
        transition={{ type: 'spring', stiffness: 260, damping: 14 }}
        className="relative z-10 w-28 h-28 rounded-3xl flex items-center justify-center text-5xl mb-6"
        style={{
          background: 'linear-gradient(135deg, #F59E0B, #D97706)',
          boxShadow: '0 0 60px rgba(245,158,11,0.5), 0 20px 40px rgba(0,0,0,0.3)',
        }}
      >
        ✦
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative z-10 text-xs font-bold tracking-widest uppercase mb-2"
        style={{ color: '#F5C518' }}
      >
        {enrolled ? 'Stamp collected!' : 'Card started!'}
      </motion.p>

      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 text-3xl font-extrabold text-white mb-3"
      >
        <motion.span
          key={displayCount}
          initial={{ scale: 1.4, color: '#F5C518' }}
          animate={{ scale: 1, color: '#FFFFFF' }}
          transition={{ type: 'spring', stiffness: 300, damping: 18 }}
        >
          {displayCount}
        </motion.span>
        <span className="text-white/50"> / {totalStamps}</span>
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
        className="relative z-10 text-sm text-white/60"
      >
        {toCount > fromCount
          ? `+${toCount - fromCount} stamp${toCount - fromCount > 1 ? 's' : ''} added`
          : 'Keep visiting to unlock rewards'}
      </motion.p>
    </motion.div>
  )
}
