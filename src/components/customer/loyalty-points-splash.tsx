import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Gift } from 'lucide-react'

const CONFETTI = ['#7C3AED', '#F5C518', '#A78BFA', '#FDE68A', '#C4B5FD', '#FBBF24']

interface LoyaltyPointsSplashProps {
  pointsEarned: number
  totalPoints: number
  businessName: string
  milestonesUnlocked?: { name: string; icon: string; code: string }[]
  onComplete: () => void
}

export function LoyaltyPointsSplash({
  pointsEarned,
  totalPoints,
  businessName,
  milestonesUnlocked = [],
  onComplete,
}: LoyaltyPointsSplashProps) {
  const [displayPoints, setDisplayPoints] = useState(totalPoints - pointsEarned)

  useEffect(() => {
    const from = totalPoints - pointsEarned
    if (pointsEarned <= 0) {
      setDisplayPoints(totalPoints)
      return
    }
    let current = from
    const interval = setInterval(() => {
      current += 1
      setDisplayPoints(current)
      if (current >= totalPoints) clearInterval(interval)
    }, 80)
    return () => clearInterval(interval)
  }, [pointsEarned, totalPoints])

  useEffect(() => {
    const delay = milestonesUnlocked.length > 0 ? 3500 : 2800
    const t = setTimeout(onComplete, delay)
    return () => clearTimeout(t)
  }, [onComplete, milestonesUnlocked.length])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6"
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
            width: 6 + (i % 4) * 5,
            height: 6 + (i % 4) * 5,
            background: color,
            left: `${8 + i * 15}%`,
            top: '15%',
          }}
          initial={{ y: 0, opacity: 0.9 }}
          animate={{ y: [0, -100, 220], opacity: [0.9, 1, 0], rotate: [0, 180, 360] }}
          transition={{ duration: 2, delay: i * 0.1, ease: 'easeOut' }}
        />
      ))}

      <motion.div
        className="absolute inset-0 pointer-events-none flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.7, 0] }}
        transition={{ duration: 1.6 }}
      >
        <motion.div
          className="w-[100vw] h-[100vw] max-w-[28rem] max-h-[28rem] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.45) 0%, transparent 65%)' }}
          initial={{ scale: 0.2 }}
          animate={{ scale: 1.6 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </motion.div>

      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: [0, 1.25, 1], rotate: [-20, 10, 0] }}
        transition={{ type: 'spring', stiffness: 240, damping: 14 }}
        className="relative z-10 w-24 h-24 rounded-full flex items-center justify-center text-5xl mb-5"
        style={{
          background: 'linear-gradient(135deg, #7C3AED, #F5C518)',
          boxShadow: '0 0 80px rgba(124,58,237,0.55), 0 20px 50px rgba(0,0,0,0.35)',
        }}
      >
        ⭐
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="relative z-10 text-xs font-bold tracking-[0.2em] uppercase mb-2 text-amber-300 flex items-center gap-1.5"
      >
        <Sparkles className="w-3.5 h-3.5" /> Checked in at {businessName}
      </motion.p>

      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="relative z-10 text-5xl font-black text-white mb-2"
      >
        <motion.span
          key={displayPoints}
          initial={{ scale: 1.5, color: '#F5C518' }}
          animate={{ scale: 1, color: '#FFFFFF' }}
          transition={{ type: 'spring', stiffness: 300, damping: 18 }}
        >
          {displayPoints}
        </motion.span>
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="relative z-10 text-sm font-semibold text-purple-200 mb-1"
      >
        Loyalty Points
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="relative z-10 text-sm text-white/55"
      >
        +{pointsEarned} points earned today
      </motion.p>

      {milestonesUnlocked.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="relative z-10 mt-6 w-full max-w-xs rounded-2xl p-4 border border-amber-400/30"
          style={{ background: 'rgba(245,197,24,0.12)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-4 h-4 text-amber-300" />
            <span className="text-xs font-bold text-amber-200 uppercase tracking-wider">Reward Unlocked!</span>
          </div>
          {milestonesUnlocked.map(m => (
            <div key={m.code} className="flex items-center gap-2 text-sm text-white">
              <span className="text-xl">{m.icon}</span>
              <span className="font-semibold">{m.name}</span>
            </div>
          ))}
          <p className="text-[10px] text-amber-200/70 mt-2">Redeem from your Profile → Wallet</p>
        </motion.div>
      )}
    </motion.div>
  )
}
