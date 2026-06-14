import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const CONFETTI_COLORS = ['#7C3AED', '#F5C518', '#EC4899', '#06B6D4', '#22C55E', '#F59E0B', '#A78BFA', '#FDE68A']

type ConfettiShape = { w: number; h: number }

function getShape(i: number): ConfettiShape {
  if (i % 3 === 0) return { w: 6, h: 4 }   // small rectangle
  if (i % 3 === 1) return { w: 5, h: 5 }   // tiny square
  return { w: 10, h: 2 }                    // thin strip
}

function Confetti() {
  const wave1 = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    delay: Math.random() * 0.4,
    duration: 2 + Math.random() * 2,
    rotate: Math.random() * 360,
    shape: getShape(i),
  }))

  const wave2 = Array.from({ length: 40 }, (_, i) => ({
    id: i + 40,
    x: Math.random() * 100,
    color: CONFETTI_COLORS[(i + 3) % CONFETTI_COLORS.length],
    delay: 0.5 + Math.random() * 0.4,
    duration: 2 + Math.random() * 2,
    rotate: Math.random() * 360,
    shape: getShape(i + 1),
  }))

  const pieces = [...wave1, ...wave2]

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

interface WinCelebrationProps {
  reward: string
  emoji?: string
  code?: string
  businessName?: string
  onClose?: () => void
}

export function WinCelebration({ reward, emoji = '🎁', code, onClose }: WinCelebrationProps) {
  const displayCode = code ?? `LG-WIN7`

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'linear-gradient(145deg, #1A0545 0%, #2D1B69 45%, #0D0B1E 100%)' }}
    >
      <Confetti />
      <div className="relative z-10 text-center px-8 w-full max-w-sm mx-auto">
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: [0, 1.2, 1], rotate: [-20, 0] }}
          transition={{ type: 'spring', stiffness: 300, damping: 16, delay: 0.1 }}
          className="text-8xl mb-4 select-none"
        >
          {emoji}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: '#F5C518' }}>
            🎉 YOU WON!
          </p>
          <h2 className="text-3xl font-extrabold text-white mb-1 text-glow-gold leading-tight">{reward}</h2>
          <p className="text-sm text-white/60 mb-5">Added to your wallet</p>

          {/* Reward code pill */}
          <div className="inline-block bg-white/10 border border-white/20 rounded-xl px-5 py-2.5 mb-6">
            <p className="text-[10px] text-white/40 uppercase tracking-widest mb-0.5">Reward Code</p>
            <p className="font-mono text-lg font-bold text-white tracking-wider">{displayCode}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-3"
        >
          <Link
            to="/customer/wallet"
            className="block w-full py-4 rounded-2xl font-bold text-base text-center"
            style={{ background: 'linear-gradient(135deg, #F5C518, #F59E0B)', color: '#08071A' }}
          >
            View in Wallet →
          </Link>
          <button
            className="block w-full py-3 rounded-2xl glass text-white text-sm text-center"
            onClick={onClose}
          >
            Play Again
          </button>
        </motion.div>
      </div>
    </div>
  )
}

export function NoWin({ onClose }: { onClose?: () => void }) {
  const navigate = useNavigate()

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'linear-gradient(145deg, #1A0545 0%, #2D1B69 45%, #0D0B1E 100%)' }}
    >
      <div className="text-center px-8 w-full max-w-sm mx-auto">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 0.9, 1] }}
          transition={{ type: 'spring', stiffness: 300, damping: 16 }}
          className="text-6xl mb-5 select-none"
        >
          😔
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-2xl font-extrabold text-white mb-2">Not this time…</h2>
          <p className="text-sm text-white/60 mb-2">Better luck on your next visit!</p>
          <p className="text-xs text-white/30 mb-8">Every visit gives you a new chance to win 🍀</p>

          <button
            className="block w-full py-4 rounded-2xl glass text-white font-bold text-base text-center mb-3"
            onClick={() => { onClose?.(); navigate(-1) }}
          >
            ← Back
          </button>
        </motion.div>
      </div>
    </div>
  )
}
