import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { WinCelebration, NoWin } from '@/components/customer/win-celebration'
import { getCampaignForMechanic } from '@/lib/customer-game'

type State = 'idle' | 'shaking' | 'result'

const PARTICLE_COLORS = ['#7C3AED', '#F5C518', '#EC4899', '#06B6D4', '#22C55E', '#F59E0B', '#A78BFA', '#FDE68A']

export function CustomerShakePage() {
  const navigate = useNavigate()
  const { search } = useLocation()
  const campaign = getCampaignForMechanic(search, 'shake')
  const shakeConfig = campaign.config as { playsPerUser?: number; winProbability?: number }
  const WIN_PROBABILITY = shakeConfig.winProbability ?? 0.65
  const MAX_PLAYS = shakeConfig.playsPerUser ?? campaign.playsPerUser ?? 2
  const defaultReward = campaign.rewards[0]
  const REWARD = defaultReward ? `${defaultReward.name} ${defaultReward.icon}` : 'Free Coffee ☕'

  const [state, setState] = useState<State>('idle')
  const [won, setWon] = useState(false)
  const [playsLeft, setPlaysLeft] = useState(MAX_PLAYS)

  const handleShake = () => {
    if (state !== 'idle' || playsLeft <= 0) return
    setState('shaking')

    setTimeout(() => {
      const didWin = Math.random() < WIN_PROBABILITY
      setWon(didWin)
      setPlaysLeft(p => p - 1)
      setState('result')
    }, 3000)
  }

  const handlePlayAgain = () => {
    if (playsLeft <= 0) return
    setState('idle')
    setWon(false)
  }

  if (state === 'result' && won) {
    return <WinCelebration reward={REWARD} emoji="☕" onClose={handlePlayAgain} />
  }
  if (state === 'result' && !won) {
    return <NoWin onClose={handlePlayAgain} />
  }

  const isShaking = state === 'shaking'

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between px-5 pt-12 pb-10"
      style={{ background: 'linear-gradient(145deg, #1A0545 0%, #2D1B69 45%, #0D0B1E 100%)' }}
    >
      {/* Back button */}
      <div className="w-full flex items-center justify-between mb-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-white/50 hover:text-white/70 transition-colors text-sm"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <div className="glass rounded-full px-3 py-1.5">
          <p className="text-xs text-white/70 font-medium">{playsLeft} play{playsLeft !== 1 ? 's' : ''} remaining</p>
        </div>
      </div>

      {/* Title */}
      <div className="text-center">
        <motion.h1
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-extrabold text-white mb-1"
        >
          Shake &amp; Win!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-sm text-white/60"
        >
          {isShaking ? 'Keep shaking…' : 'Tap the phone to reveal your reward'}
        </motion.p>
      </div>

      {/* Phone hero */}
      <div className="relative flex items-center justify-center my-4">
        {/* Ripple rings during shaking */}
        {isShaking && [0, 0.35, 0.7, 1.05].map((delay, i) => (
          <motion.div
            key={i}
            className="absolute rounded-[2.5rem] border-2 border-purple-400/40 pointer-events-none"
            style={{ width: '11rem', height: '18rem' }}
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={{ duration: 1.1, delay, repeat: Infinity }}
          />
        ))}

        {/* Floating particles during shaking */}
        {isShaking && Array.from({ length: 8 }, (_, i) => (
          <motion.div
            key={`p-${i}`}
            className="absolute w-2 h-2 rounded-full pointer-events-none"
            style={{
              background: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
              left: `calc(50% + ${(Math.random() - 0.5) * 80}px)`,
              bottom: '60%',
            }}
            initial={{ y: 0, opacity: 1, scale: 1 }}
            animate={{ y: -120 - i * 10, opacity: 0, scale: 0.4, x: (i % 2 === 0 ? 1 : -1) * (20 + i * 8) }}
            transition={{ duration: 1.2, delay: i * 0.15, repeat: Infinity, ease: 'easeOut' }}
          />
        ))}

        {/* Phone illustration */}
        <motion.button
          onClick={handleShake}
          disabled={isShaking || playsLeft <= 0}
          animate={
            isShaking
              ? {
                  x: [0, -16, 18, -14, 16, -10, 12, -8, 10, 0],
                  y: [0, 10, -8, 12, -10, 8, -6, 4, -4, 0],
                  rotate: [0, -10, 12, -8, 10, -6, 8, -4, 6, 0],
                }
              : { y: [0, -8, 0] }
          }
          transition={
            isShaking
              ? { duration: 0.35, repeat: 8, ease: 'easeInOut' }
              : { duration: 3, repeat: Infinity, ease: 'easeInOut' }
          }
          whileTap={!isShaking ? { scale: 0.95 } : {}}
          className="relative flex flex-col items-center justify-center"
          style={{
            width: '11rem',
            height: '18rem',
            borderRadius: '2.5rem',
            background: 'linear-gradient(145deg, #2D1B69, #1A0545)',
            border: '2px solid rgba(167,139,250,0.4)',
            boxShadow: isShaking
              ? '0 0 80px rgba(139,92,246,0.7), 0 30px 60px rgba(0,0,0,0.8)'
              : '0 0 40px rgba(139,92,246,0.3), 0 20px 40px rgba(0,0,0,0.6)',
          }}
        >
          {/* Notch */}
          <div className="absolute top-4 w-20 h-1.5 rounded-full" style={{ background: 'rgba(0,0,0,0.4)' }} />
          {/* Speaker */}
          <div className="absolute bottom-5 w-12 h-1 rounded-full" style={{ background: 'rgba(0,0,0,0.4)' }} />

          <AnimatePresence mode="wait">
            {!isShaking ? (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-3"
              >
                <span className="text-5xl select-none">🤳</span>
                <div className="text-center">
                  <p className="text-xs font-semibold text-white/80">Tap to Shake</p>
                  <p className="text-[10px] text-white/40 mt-0.5">Hold tight!</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="shaking"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-3"
              >
                <motion.span
                  className="text-5xl select-none"
                  animate={{ scale: [1, 1.3, 1], rotate: [0, 25, -25, 0] }}
                  transition={{ duration: 0.35, repeat: Infinity }}
                >
                  🎁
                </motion.span>
                <p className="text-xs font-semibold text-white/80">Shaking...</p>
                <div className="flex gap-1.5">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-purple-400"
                      animate={{ scale: [1, 1.6, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 0.5, delay: i * 0.15, repeat: Infinity }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Bottom info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center"
      >
        <p className="text-xs text-white/30">Win probability: 65% · Each visit qualifies</p>
      </motion.div>
    </div>
  )
}
