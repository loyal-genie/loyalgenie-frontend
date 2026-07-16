import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { getCampaignTheme, getRewardScreenBackground } from '@/lib/campaign-themes'

const CONFETTI = ['#F5C518', '#F59E0B', '#FDE68A', '#FBBF24', '#FCD34D']

export interface StampRewardInfo {
  name: string
  emoji: string
  code?: string
}

interface StampCollectedSplashProps {
  fromCount: number
  toCount: number
  totalStamps: number
  enrolled?: boolean
  pending?: boolean
  reward?: StampRewardInfo | null
  onComplete: () => void
  onBackToVendor?: () => void
}

export function StampCollectedSplash({
  fromCount,
  toCount,
  totalStamps,
  enrolled,
  pending = false,
  reward = null,
  onComplete,
  onBackToVendor,
}: StampCollectedSplashProps) {
  const [displayCount, setDisplayCount] = useState(fromCount)
  const remaining = Math.max(0, totalStamps - toCount)
  const ready = !pending && toCount >= fromCount
  const won = Boolean(reward)
  const handleExit = onBackToVendor ?? onComplete
  const theme = getCampaignTheme('stamp')
  const accent = theme.accent

  useEffect(() => {
    if (pending || toCount <= fromCount) {
      setDisplayCount(pending ? fromCount : toCount)
      return
    }
    const steps = toCount - fromCount
    if (steps <= 1) {
      setDisplayCount(toCount)
      return
    }
    const stepMs = Math.min(300, 900 / steps)
    let current = fromCount
    const interval = setInterval(() => {
      current += 1
      setDisplayCount(current)
      if (current >= toCount) clearInterval(interval)
    }, stepMs)
    return () => clearInterval(interval)
  }, [fromCount, toCount, pending])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center min-h-dvh px-6 overflow-y-auto"
      style={{ background: getRewardScreenBackground('stamp') }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {ready && !pending && (
        <button
          type="button"
          onClick={handleExit}
          className="absolute top-[max(2.75rem,env(safe-area-inset-top))] left-4 z-20 size-9 rounded-full bg-black/5 backdrop-blur-sm flex items-center justify-center border-0 cursor-pointer"
          aria-label="Back to vendor"
        >
          <ArrowLeft className="size-4 text-gray-700" />
        </button>
      )}

      <div className="relative z-10 flex flex-col items-center justify-center flex-1 w-full max-w-sm py-16">
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
                top: '18%',
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
          className={`relative z-10 flex items-center justify-center mb-5 ${
            won && !pending ? 'w-[180px] h-[180px]' : 'w-28 h-28 rounded-3xl'
          }`}
          style={
            won && !pending
              ? undefined
              : {
                  background: `linear-gradient(135deg, ${accent}, ${theme.accentTo})`,
                  boxShadow: `0 0 60px ${accent}80, 0 20px 40px rgba(0,0,0,0.12)`,
                }
          }
        >
          {pending ? (
            <Loader2 className="size-12 text-white animate-spin" />
          ) : won ? (
            <div className="relative size-full">
              <div
                className="absolute inset-0 rounded-full"
                style={{ background: `${accent}12`, border: `2.5px solid ${accent}30` }}
              />
              <div className="absolute inset-[15px] rounded-full flex items-center justify-center">
                <span className="text-[96px] leading-none">{reward!.emoji}</span>
              </div>
            </div>
          ) : (
            <span className="text-5xl leading-none">☕</span>
          )}
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative z-10 text-xs font-bold tracking-widest uppercase mb-2"
          style={{ color: accent }}
        >
          {pending ? 'Collecting stamp…' : won ? '🎉 YOU WON!' : enrolled ? 'Stamp collected!' : 'Card started!'}
        </motion.p>

        {!pending && won && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="relative z-10 w-full text-center"
          >
            <h3 className="text-[32px] font-semibold text-gray-900 mb-2 leading-tight">{reward!.name}</h3>
            <p className="text-sm font-medium text-gray-700 mb-8">Added to your wallet</p>
            <div
              className="rounded-[10px] px-6 py-4 mb-3 mx-auto max-w-[220px] bg-white"
              style={{ border: `1.5px solid ${accent}40`, boxShadow: `0 4px 16px ${accent}18` }}
            >
              <p className="text-xs font-bold mb-1" style={{ color: accent }}>
                Reward Code
              </p>
              <p className="font-bold text-xl tracking-wide text-gray-900">
                {reward!.code ?? '—'}
              </p>
            </div>
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

        {!pending && !won && (
          <>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="relative z-10 text-4xl font-extrabold text-gray-900 mb-2 tabular-nums"
            >
              <motion.span
                key={displayCount}
                initial={ready ? { scale: 1.4, color: accent } : false}
                animate={{ scale: 1, color: '#111827' }}
                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              >
                {displayCount}
              </motion.span>
              <span className="text-gray-400"> / {totalStamps}</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative z-10 text-base font-semibold text-gray-700 mb-1"
            >
              {toCount} collected · {remaining} remaining
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="relative z-10 text-sm font-medium text-gray-700 text-center max-w-xs mb-6"
            >
              {remaining === 0
                ? 'Card complete — enjoy your reward!'
                : remaining === 1
                  ? 'Just 1 more stamp to complete your card'
                  : `${remaining} more stamps until your reward`}
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
