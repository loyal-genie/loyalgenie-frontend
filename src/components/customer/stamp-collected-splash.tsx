import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2 } from 'lucide-react'

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
      style={{ background: 'linear-gradient(165deg, #43036d 0%, #2d110e 38%, #1c0038 100%)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {ready && !pending && (
        <button
          type="button"
          onClick={handleExit}
          className="absolute top-[max(2.75rem,env(safe-area-inset-top))] left-4 z-20 size-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center border-0 cursor-pointer"
          aria-label="Back to vendor"
        >
          <ArrowLeft className="size-4 text-white" />
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
                  background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                  boxShadow: '0 0 60px rgba(245,158,11,0.5), 0 20px 40px rgba(0,0,0,0.3)',
                }
          }
        >
          {pending ? (
            <Loader2 className="size-12 text-white animate-spin" />
          ) : won ? (
            <div className="relative size-full">
              <div className="absolute inset-0 rounded-full bg-[#5b0e81]/30" />
              <div className="absolute inset-[15px] rounded-full bg-[#631cbb]/40 flex items-center justify-center">
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
          className="relative z-10 text-xs font-bold tracking-widest uppercase mb-2 text-[#F5C518]"
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
            <h3 className="text-[32px] font-semibold text-white mb-2 leading-tight">{reward!.name}</h3>
            <p className="text-sm text-white/55 mb-8">Added to your wallet</p>
            <div className="bg-white/10 rounded-[10px] px-6 py-4 mb-3 mx-auto max-w-[220px]">
              <p className="text-xs text-white/80 mb-1">Reward Code</p>
              <p className="font-semibold text-xl text-white tracking-wide">{reward!.code ?? '—'}</p>
            </div>
            <p className="text-sm text-white/45 mb-10 px-4">
              Show this code to the staff at the counter to redeem
            </p>
            <div className="w-full space-y-3">
              <Link
                to="/customer/wallet"
                className="block w-full py-4 rounded-[14px] font-medium text-base text-center text-white no-underline bg-white/10"
              >
                View Rewards
              </Link>
              <button
                type="button"
                onClick={handleExit}
                className="w-full py-4 rounded-[14px] font-bold text-base text-white bg-[#631cbb] border-0 cursor-pointer"
              >
                Back to Vendor
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

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative z-10 text-base font-semibold text-white/90 mb-1"
            >
              {toCount} collected · {remaining} remaining
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="relative z-10 text-sm text-white/55 text-center max-w-xs mb-6"
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
                className="block w-full py-4 rounded-[14px] font-medium text-base text-center text-white no-underline bg-white/10"
              >
                View Rewards
              </Link>
              <button
                type="button"
                onClick={handleExit}
                className="w-full py-4 rounded-[14px] font-bold text-base text-white bg-[#631cbb] border-0 cursor-pointer"
              >
                Back to Vendor
              </button>
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  )
}
