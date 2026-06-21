import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'

const CONFETTI = ['#7C3AED', '#F5C518', '#A78BFA', '#FDE68A', '#C4B5FD', '#FBBF24']
/** Time to show points-only success before auto-returning (ms). */
const RESULT_VIEW_PAUSE_MS = 2400

interface MilestoneReward {
  name: string
  icon: string
  code: string
}

interface LoyaltyPointsSplashProps {
  pointsBefore: number
  totalPoints: number
  businessName: string
  milestonesUnlocked?: MilestoneReward[]
  onComplete: () => void
  onBackToCafe?: () => void
}

function toPoints(value: unknown): number {
  const n = Number(value)
  return Number.isFinite(n) ? Math.trunc(n) : 0
}

export function LoyaltyPointsSplash({
  pointsBefore,
  totalPoints,
  businessName,
  milestonesUnlocked = [],
  onComplete,
  onBackToCafe,
}: LoyaltyPointsSplashProps) {
  const before = toPoints(pointsBefore)
  const total = toPoints(totalPoints)
  const earned = Math.max(0, total - before)
  const [displayPoints, setDisplayPoints] = useState(before)
  const won = milestonesUnlocked.length > 0
  const primaryReward = milestonesUnlocked[0]
  const handleExit = onBackToCafe ?? onComplete

  useEffect(() => {
    if (earned <= 0) {
      setDisplayPoints(total)
      return
    }
    let current = before
    setDisplayPoints(before)
    const interval = setInterval(() => {
      current += 1
      setDisplayPoints(current)
      if (current >= total) clearInterval(interval)
    }, 80)
    return () => clearInterval(interval)
  }, [before, total, earned])

  useEffect(() => {
    if (won) return
    const t = setTimeout(onComplete, RESULT_VIEW_PAUSE_MS)
    return () => clearTimeout(t)
  }, [won, onComplete])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center min-h-dvh px-6 overflow-y-auto"
      style={{ background: 'linear-gradient(165deg, #43036d 0%, #2d110e 38%, #1c0038 100%)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button
        type="button"
        onClick={handleExit}
        className="absolute top-[max(2.75rem,env(safe-area-inset-top))] left-4 z-20 size-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center border-0 cursor-pointer"
        aria-label="Back to cafe"
      >
        <ArrowLeft className="size-4 text-white" />
      </button>

      <div className="relative z-10 flex flex-col items-center justify-center flex-1 w-full max-w-sm py-16">
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
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: [0, 1.25, 1], rotate: [-20, 10, 0] }}
          transition={{ type: 'spring', stiffness: 240, damping: 14 }}
          className={`relative z-10 flex items-center justify-center mb-5 ${
            won ? 'w-[180px] h-[180px]' : 'w-24 h-24 rounded-full'
          }`}
          style={
            won
              ? undefined
              : {
                  background: 'linear-gradient(135deg, #7C3AED, #F5C518)',
                  boxShadow: '0 0 80px rgba(124,58,237,0.55), 0 20px 50px rgba(0,0,0,0.35)',
                }
          }
        >
          {won ? (
            <div className="relative size-full">
              <div className="absolute inset-0 rounded-full bg-[#5b0e81]/30" />
              <div className="absolute inset-[15px] rounded-full bg-[#631cbb]/40 flex items-center justify-center">
                <span className="text-[96px] leading-none">{primaryReward.icon}</span>
              </div>
            </div>
          ) : (
            <span className="text-5xl leading-none">⭐</span>
          )}
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative z-10 text-xs font-bold tracking-widest uppercase mb-2 text-[#F5C518]"
        >
          {won ? '🎉 YOU WON!' : `Checked in at ${businessName}`}
        </motion.p>

        {won && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="relative z-10 w-full text-center"
          >
            <p className="text-sm text-[#e8b050] font-semibold mb-3">
              +{earned} points earned · {total} total
            </p>
            <h3 className="text-[32px] font-semibold text-white mb-2 leading-tight">{primaryReward.name}</h3>
            <p className="text-sm text-white/55 mb-8">Added to your wallet</p>
            <div className="bg-white/10 rounded-[10px] px-6 py-4 mb-3 mx-auto max-w-[220px]">
              <p className="text-xs text-white/80 mb-1">Reward Code</p>
              <p className="font-semibold text-xl text-white tracking-wide">{primaryReward.code}</p>
            </div>
            {milestonesUnlocked.length > 1 && (
              <div className="mb-3 space-y-2">
                {milestonesUnlocked.slice(1).map(m => (
                  <div key={m.code} className="text-sm text-white/80">
                    {m.icon} {m.name} · <span className="font-semibold text-white">{m.code}</span>
                  </div>
                ))}
              </div>
            )}
            <p className="text-sm text-white/45 mb-10 px-4">
              Show this code to the staff at the counter to redeem
            </p>
            <div className="w-full space-y-3">
              <Link
                to="/customer/wallet"
                className="block w-full py-4 rounded-[14px] font-medium text-base text-center text-white no-underline bg-white/10"
              >
                View in Wallet
              </Link>
              <button
                type="button"
                onClick={handleExit}
                className="w-full py-4 rounded-[14px] font-bold text-base text-white bg-[#631cbb] border-0 cursor-pointer"
              >
                Back to Cafe
              </button>
            </div>
          </motion.div>
        )}

        {!won && (
          <>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="relative z-10 text-5xl font-black text-white mb-2 tabular-nums"
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
              transition={{ delay: 0.25 }}
              className="relative z-10 text-sm font-semibold text-purple-200 mb-1"
            >
              Loyalty Points
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="relative z-10 text-sm text-white/55 mb-6"
            >
              +{earned} points earned today
            </motion.p>

            {onBackToCafe && (
              <motion.button
                type="button"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                onClick={handleExit}
                className="relative z-10 w-full py-4 rounded-[14px] font-bold text-base text-white bg-[#631cbb] border-0 cursor-pointer"
              >
                Back to Cafe
              </motion.button>
            )}
          </>
        )}
      </div>
    </motion.div>
  )
}
