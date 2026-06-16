import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const CONFETTI_COLORS = ['#7C3AED', '#F5C518', '#EC4899', '#06B6D4', '#22C55E', '#F59E0B', '#A78BFA', '#FDE68A']

type ConfettiShape = { w: number; h: number }

function getShape(i: number): ConfettiShape {
  if (i % 3 === 0) return { w: 6, h: 4 }
  if (i % 3 === 1) return { w: 5, h: 5 }
  return { w: 10, h: 2 }
}

function Confetti() {
  const pieces = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    delay: Math.random() * 0.6,
    duration: 2.2 + Math.random() * 2,
    rotate: Math.random() * 360,
    shape: getShape(i),
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {pieces.map(p => (
        <motion.div
          key={p.id}
          initial={{ y: -20, x: `${p.x}vw`, opacity: 1, rotate: p.rotate }}
          animate={{ y: '110vh', opacity: 0, rotate: p.rotate + 720 }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
          className="absolute"
          style={{ width: p.shape.w, height: p.shape.h, background: p.color, borderRadius: 1 }}
        />
      ))}
    </div>
  )
}

function WinBurst() {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 1.2 }}
    >
      <motion.div
        className="w-[120vw] h-[120vw] max-w-[32rem] max-h-[32rem] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(245,197,24,0.35) 0%, transparent 65%)' }}
        initial={{ scale: 0.2 }}
        animate={{ scale: 1.4 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
    </motion.div>
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

export function WinCelebration({ reward, emoji = '🎁', code, onClose, closeLabel = 'Play Again' }: WinCelebrationProps) {
  const displayCode = code ?? `LG-WIN7`

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center min-h-dvh px-4 sm:px-6"
      style={{ background: 'linear-gradient(145deg, #1A0545 0%, #2D1B69 45%, #0D0B1E 100%)' }}
    >
      <Confetti />
      <WinBurst />
      <div className="relative z-10 text-center w-full max-w-sm mx-auto pb-[env(safe-area-inset-bottom)]">
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: [0, 1.25, 1], rotate: [-20, 0] }}
          transition={{ type: 'spring', stiffness: 280, damping: 14, delay: 0.1 }}
          className="text-6xl sm:text-8xl mb-3 sm:mb-4 select-none inline-block"
        >
          {emoji}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <motion.p
            className="text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-2"
            style={{ color: '#F5C518' }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            🎉 YOU WON!
          </motion.p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-1 text-glow-gold leading-tight px-2">
            {reward}
          </h2>
          <p className="text-xs sm:text-sm text-white/60 mb-4 sm:mb-5">Added to your wallet</p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="inline-block bg-white/10 border border-white/20 rounded-xl px-4 sm:px-5 py-2 sm:py-2.5 mb-5 sm:mb-6 w-full max-w-[16rem]"
          >
            <p className="text-[9px] sm:text-[10px] text-white/40 uppercase tracking-widest mb-0.5">Reward Code</p>
            <p className="font-mono text-base sm:text-lg font-bold text-white tracking-wider break-all">{displayCode}</p>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="space-y-2.5 sm:space-y-3"
        >
          <Link
            to="/customer/wallet"
            className="block w-full py-3.5 sm:py-4 rounded-2xl font-bold text-sm sm:text-base text-center no-underline active:scale-[0.98] transition-transform"
            style={{ background: 'linear-gradient(135deg, #F5C518, #F59E0B)', color: '#08071A' }}
          >
            View in Wallet →
          </Link>
          <button
            type="button"
            className="block w-full py-3 sm:py-3.5 rounded-2xl glass text-white text-sm text-center border-0 cursor-pointer active:scale-[0.98] transition-transform"
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
      className="fixed inset-0 z-50 flex items-center justify-center min-h-dvh px-4 sm:px-6"
      style={{ background: 'linear-gradient(145deg, #1A0545 0%, #2D1B69 45%, #0D0B1E 100%)' }}
    >
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        style={{ background: 'radial-gradient(circle at center, rgba(30,20,60,0.8) 0%, transparent 70%)' }}
      />
      <div className="text-center w-full max-w-sm mx-auto relative z-10 pb-[env(safe-area-inset-bottom)]">
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: [0, 0.95, 1], rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 16 }}
          className="text-5xl sm:text-6xl mb-4 sm:mb-5 select-none"
        >
          😔
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-2">So close!</h2>
          <p className="text-xs sm:text-sm text-white/60 mb-2">Not this time — your next visit could be the one.</p>
          {attempts && (
            <p className="text-xs sm:text-sm font-bold text-purple-300 mb-2">
              {attempts.used}/{attempts.total} attempts used today
            </p>
          )}
          <p className="text-[10px] sm:text-xs text-white/30 mb-6 sm:mb-8">Every visit gives you a new chance to win 🍀</p>

          {playsLeft !== undefined && playsLeft > 0 ? (
            <button
              type="button"
              className="block w-full py-3.5 sm:py-4 rounded-2xl font-bold text-sm sm:text-base text-center mb-3 border-0 cursor-pointer active:scale-[0.98] transition-transform"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #5B21B6)', color: 'white' }}
              onClick={onClose}
            >
              Try Again ({playsLeft} left)
            </button>
          ) : (
            <button
              type="button"
              className="block w-full py-3.5 sm:py-4 rounded-2xl glass text-white font-bold text-sm sm:text-base text-center mb-3 border-0 cursor-pointer active:scale-[0.98] transition-transform"
              onClick={() => { onClose?.(); navigate(-1) }}
            >
              ← Back
            </button>
          )}
        </motion.div>
      </div>
    </div>
  )
}
