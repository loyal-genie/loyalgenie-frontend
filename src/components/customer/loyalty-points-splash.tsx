import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { getCampaignTheme, getRewardScreenBackground } from '@/lib/campaign-themes'

const CONFETTI = ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#FBBF24', '#FDE68A']

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
  const theme = getCampaignTheme('check-in-loyalty')
  const accent = theme.accent

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

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center min-h-dvh px-6 overflow-y-auto"
      style={{ background: getRewardScreenBackground('check-in-loyalty') }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button
        type="button"
        onClick={handleExit}
        className="absolute top-[max(2.75rem,env(safe-area-inset-top))] left-4 z-20 size-9 rounded-full bg-black/5 backdrop-blur-sm flex items-center justify-center border-0 cursor-pointer"
        aria-label="Back to vendor"
      >
        <ArrowLeft className="size-4 text-gray-700" />
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
                  background: `linear-gradient(135deg, ${accent}, ${theme.accentTo})`,
                  boxShadow: `0 0 80px ${accent}88, 0 20px 50px rgba(0,0,0,0.12)`,
                }
          }
        >
          {won ? (
            <div className="relative size-full">
              <div
                className="absolute inset-0 rounded-full"
                style={{ background: `${accent}12`, border: `2.5px solid ${accent}30` }}
              />
              <div className="absolute inset-[15px] rounded-full flex items-center justify-center">
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
          className="relative z-10 text-xs font-bold tracking-widest uppercase mb-2"
          style={{ color: accent }}
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
            <p className="text-sm font-semibold mb-3" style={{ color: accent }}>
              +{earned} points earned · {total} total
            </p>
            <h3 className="text-[32px] font-semibold text-gray-900 mb-2 leading-tight">{primaryReward.name}</h3>
            <p className="text-sm font-medium text-gray-700 mb-8">Added to your wallet</p>
            <div
              className="rounded-[10px] px-6 py-4 mb-3 mx-auto max-w-[220px] bg-white"
              style={{ border: `1.5px solid ${accent}40`, boxShadow: `0 4px 16px ${accent}18` }}
            >
              <p className="text-xs font-bold mb-1" style={{ color: accent }}>
                Reward Code
              </p>
              <p className="font-bold text-xl tracking-wide text-gray-900">
                {primaryReward.code}
              </p>
            </div>
            {milestonesUnlocked.length > 1 && (
              <div className="mb-3 space-y-2">
                {milestonesUnlocked.slice(1).map(m => (
                  <div key={m.code} className="text-sm font-medium text-gray-700">
                    {m.icon} {m.name} · <span className="font-semibold text-gray-900">{m.code}</span>
                  </div>
                ))}
              </div>
            )}
            <p className="text-sm font-medium text-gray-600 mb-10 px-4">
              Show this code to the staff at the counter to redeem
            </p>
            <div className="w-full space-y-3">
              <Link
                to="/customer/wallet"
                className="block w-full py-4 rounded-full font-bold text-base text-center text-white no-underline"
                style={{
                  background: `linear-gradient(135deg, ${accent}, ${theme.accentTo})`,
                  boxShadow: `0 8px 28px ${accent}50`,
                }}
              >
                View Rewards
              </Link>
              <button
                type="button"
                onClick={handleExit}
                className="w-full py-4 rounded-full font-bold text-base text-white border-0 cursor-pointer"
                style={{
                  background: theme.accentTo,
                  boxShadow: `0 6px 20px ${theme.accentTo}40`,
                }}
              >
                ← Back to Business
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
              className="relative z-10 text-5xl font-black text-gray-900 mb-2 tabular-nums"
            >
              <motion.span
                key={displayPoints}
                initial={{ scale: 1.5, color: accent }}
                animate={{ scale: 1, color: '#111827' }}
                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              >
                {displayPoints}
              </motion.span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="relative z-10 text-sm font-semibold mb-1"
              style={{ color: accent }}
            >
              Loyalty Points
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="relative z-10 text-sm font-medium text-gray-700 mb-6"
            >
              +{earned} points earned today
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="relative z-10 w-full space-y-3"
            >
              <Link
                to="/customer/wallet"
                className="block w-full py-4 rounded-full font-bold text-base text-center text-white no-underline"
                style={{
                  background: `linear-gradient(135deg, ${accent}, ${theme.accentTo})`,
                  boxShadow: `0 8px 28px ${accent}50`,
                }}
              >
                View Rewards
              </Link>
              <button
                type="button"
                onClick={handleExit}
                className="w-full py-4 rounded-full font-bold text-base text-white border-0 cursor-pointer"
                style={{
                  background: theme.accentTo,
                  boxShadow: `0 6px 20px ${theme.accentTo}40`,
                }}
              >
                ← Back to Business
              </button>
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  )
}
