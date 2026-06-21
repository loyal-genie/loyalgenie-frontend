import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const CONFETTI_COLORS = ['#5b0e81', '#fad499', '#631cbb', '#e8b050', '#d4a8ff', '#9b59e8']

function Confetti() {
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    delay: Math.random() * 0.6,
    duration: 2.2 + Math.random() * 2,
    rotate: Math.random() * 360,
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {pieces.map(p => (
        <motion.div
          key={p.id}
          initial={{ y: -20, x: `${p.x}vw`, opacity: 1, rotate: p.rotate }}
          animate={{ y: '110vh', opacity: 0, rotate: p.rotate + 720 }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
          className="absolute w-1.5 h-1 rounded-sm"
          style={{ background: p.color }}
        />
      ))}
    </div>
  )
}

interface WinCelebrationProps {
  reward: string
  emoji?: string
  code?: string
  businessName?: string
  onClose?: () => void
  closeLabel?: string
}

export function WinCelebration({
  reward,
  emoji = '☕',
  code,
  businessName,
  onClose,
  closeLabel = '← Back to Dashboard',
}: WinCelebrationProps) {
  const displayCode = code ?? 'LG-WIN7'

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center min-h-dvh px-5 overflow-y-auto"
      style={{ background: 'linear-gradient(174deg, #43036d 2%, #2e1403 93%)' }}
    >
      <Confetti />
      <div className="relative z-10 text-center w-full max-w-sm mx-auto pt-16 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[#d4af35] text-base font-normal mb-6"
        >
          🎉 YOU WON!
        </motion.p>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.15 }}
          className="relative mx-auto size-[180px] mb-8"
        >
          <div className="absolute inset-0 rounded-full bg-[#5b0e81]/30" />
          <div className="absolute inset-[15px] rounded-full bg-[#631cbb]/40 flex items-center justify-center">
            <span className="text-[96px] leading-none">{emoji}</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-[32px] font-semibold text-white mb-2 leading-tight">{reward}</h2>
          <p className="text-sm text-[rgba(184,184,184,0.64)] mb-8">
            {businessName ? `Added to your wallet · ${businessName}` : 'Added to your wallet'}
          </p>

          <div className="bg-[rgba(217,217,217,0.1)] rounded-[10px] px-6 py-4 mb-3 mx-auto max-w-[174px]">
            <p className="text-xs text-white/80 mb-1">Reward Code</p>
            <p className="font-semibold text-xl text-white tracking-wide">{displayCode}</p>
          </div>
          <p className="text-sm text-[rgba(217,217,217,0.47)] mb-10">
            Show this code to the staff at the counter to redeem
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="space-y-4"
        >
          <Link
            to="/customer/wallet"
            className="block w-full py-4 rounded-[14px] font-medium text-base text-center text-white no-underline bg-white/10"
          >
            View in Wallet →
          </Link>
          <button
            type="button"
            className="block w-full py-2 text-base text-[rgba(254,254,254,0.44)] bg-transparent border-0 cursor-pointer"
            onClick={onClose}
          >
            {closeLabel}
          </button>
        </motion.div>
      </div>
    </div>
  )
}

export function NoWin({ onClose, playsLeft, attempts }: {
  onClose?: () => void
  playsLeft?: number
  attempts?: { used: number; total: number }
}) {
  const navigate = useNavigate()

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center min-h-dvh px-5"
      style={{ background: 'linear-gradient(174deg, #43036d 2%, #2e1403 93%)' }}
    >
      <div className="text-center w-full max-w-sm mx-auto pb-[env(safe-area-inset-bottom)]">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="text-6xl mb-5"
        >
          😔
        </motion.div>
        <h2 className="text-2xl font-semibold text-white mb-2">So close!</h2>
        <p className="text-sm text-white/60 mb-2">Not this time — your next visit could be the one.</p>
        {attempts && (
          <p className="text-sm font-bold text-[#d4a8ff] mb-2">
            {attempts.used}/{attempts.total} attempts used today
          </p>
        )}
        <p className="text-xs text-white/30 mb-8">Every visit gives you a new chance to win 🍀</p>

        {playsLeft !== undefined && playsLeft > 0 ? (
          <button
            type="button"
            className="block w-full py-4 rounded-[14px] font-bold text-sm text-white bg-[#631cbb] border-0 cursor-pointer mb-3"
            onClick={onClose}
          >
            Try Again ({playsLeft} left)
          </button>
        ) : (
          <button
            type="button"
            className="block w-full py-4 rounded-[14px] font-medium text-white bg-white/10 border-0 cursor-pointer mb-3"
            onClick={() => { onClose?.(); navigate(-1) }}
          >
            ← Back
          </button>
        )}
      </div>
    </div>
  )
}
