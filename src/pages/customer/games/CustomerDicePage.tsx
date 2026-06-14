import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { WinCelebration, NoWin } from '@/components/customer/win-celebration'

type State = 'idle' | 'rolling' | 'result'

const OUTCOMES: Record<number, string | null> = {
  1: null, 2: null, 3: 'Free Dessert 🍰', 4: '₹50 Off 🏷️', 5: null, 6: 'Free Dessert 🍰',
}

const STAR_POSITIONS = [
  { top: '8%', left: '12%' }, { top: '15%', left: '88%' },
  { top: '35%', left: '5%' }, { top: '50%', left: '92%' },
  { top: '70%', left: '8%' }, { top: '78%', left: '85%' },
  { top: '90%', left: '20%' }, { top: '88%', left: '72%' },
  { top: '25%', left: '50%' }, { top: '60%', left: '45%' },
]

function DiceFaceSVG({ value }: { value: number }) {
  const dots: Record<number, [number, number][]> = {
    1: [[50, 50]],
    2: [[28, 28], [72, 72]],
    3: [[28, 28], [50, 50], [72, 72]],
    4: [[28, 28], [72, 28], [28, 72], [72, 72]],
    5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
    6: [[28, 28], [72, 28], [28, 50], [72, 50], [28, 72], [72, 72]],
  }
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      {(dots[value] || []).map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="9" fill="#0D0B1E" />
      ))}
    </svg>
  )
}

export function CustomerDicePage() {
  const navigate = useNavigate()
  const [state, setState] = useState<State>('idle')
  const [displayValue, setDisplayValue] = useState(1)
  const [won, setWon] = useState(false)
  const [wonReward, setWonReward] = useState('')

  const roll = () => {
    if (state !== 'idle') return
    setState('rolling')

    let count = 0
    const interval = setInterval(() => {
      setDisplayValue(Math.floor(1 + Math.random() * 6))
      count++
      if (count > 14) {
        clearInterval(interval)
        const final = Math.floor(1 + Math.random() * 6)
        setDisplayValue(final)
        const reward = OUTCOMES[final]
        setWon(!!reward)
        setWonReward(reward || '')
        setTimeout(() => setState('result'), 800)
      }
    }, 120)
  }

  if (state === 'result' && won) return <WinCelebration reward={wonReward} emoji="🎲" />
  if (state === 'result' && !won) return <NoWin />

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between px-5 pt-12 pb-10 relative overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #1A0545 0%, #2D1B69 45%, #0D0B1E 100%)' }}
    >
      {/* Background stars */}
      {STAR_POSITIONS.map((pos, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-white/30 pointer-events-none"
          style={{ top: pos.top, left: pos.left }}
          animate={{ opacity: [0.2, 0.7, 0.2], scale: [0.8, 1.3, 0.8] }}
          transition={{ duration: 2 + i * 0.3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.25 }}
        />
      ))}

      {/* Back */}
      <div className="w-full flex items-center mb-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-white/50 hover:text-white/70 transition-colors text-sm"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>

      <div className="text-center">
        <h1 className="text-2xl font-extrabold text-white mb-1">Roll a Dice!</h1>
        <p className="text-sm text-white/60">Roll 3, 4, or 6 to win a reward</p>
      </div>

      {/* Dice with perspective */}
      <div className="relative flex flex-col items-center justify-center" style={{ perspective: 600 }}>
        {/* Floor shadow */}
        <motion.div
          className="absolute -bottom-6 rounded-full bg-black/30 blur-xl pointer-events-none"
          animate={
            state === 'rolling'
              ? { width: ['8rem', '5rem', '8rem'], height: ['1.5rem', '0.75rem', '1.5rem'] }
              : { width: '8rem', height: '1.5rem' }
          }
          transition={state === 'rolling' ? { duration: 0.4, repeat: 4, ease: 'easeInOut' } : {}}
        />

        <motion.button
          onClick={roll}
          disabled={state === 'rolling'}
          animate={
            state === 'rolling'
              ? {
                  rotateX: [0, 360, 720, 1080],
                  rotateY: [0, 270, 540, 810],
                }
              : {}
          }
          transition={
            state === 'rolling'
              ? { duration: 1.8, ease: 'easeOut' }
              : {}
          }
          whileTap={state === 'idle' ? { scale: 0.92 } : {}}
          className="w-48 h-48 rounded-3xl bg-white flex items-center justify-center cursor-pointer select-none"
          style={{
            transformStyle: 'preserve-3d',
            boxShadow: state === 'rolling'
              ? '0 24px 64px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.5), 0 0 40px rgba(139,92,246,0.5)'
              : '0 16px 48px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.4)',
          }}
        >
          <div className="w-32 h-32">
            <DiceFaceSVG value={displayValue} />
          </div>
        </motion.button>
      </div>

      {/* Prize chart */}
      <div className="w-full glass rounded-2xl p-4">
        <p className="text-xs text-white/50 font-semibold mb-3 text-center uppercase tracking-wide">Prize Chart</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { faces: [1, 2], label: 'No win', isWin: false },
            { faces: [3, 4], label: '3 & 4 Win!', isWin: true },
            { faces: [5, 6], label: '6 Wins!', isWin: true },
          ].map((group, gi) => (
            <div
              key={gi}
              className={`rounded-xl p-3 text-center ${group.isWin ? 'border border-yellow-400/30' : ''}`}
              style={{ background: group.isWin ? 'rgba(245,197,24,0.08)' : 'rgba(255,255,255,0.04)' }}
            >
              <div className="flex gap-1 justify-center mb-2">
                {group.faces.map(n => (
                  <div key={n} className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                    <div className="w-6 h-6"><DiceFaceSVG value={n} /></div>
                  </div>
                ))}
              </div>
              <p
                className="text-[9px] font-bold leading-tight"
                style={{ color: group.isWin ? '#F5C518' : 'rgba(255,255,255,0.3)' }}
              >
                {group.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <motion.button
        whileTap={{ scale: 0.94 }}
        onClick={roll}
        disabled={state === 'rolling'}
        className="w-full py-5 rounded-2xl text-xl font-extrabold transition-all disabled:opacity-50"
        style={{
          background: state === 'rolling' ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #22C55E, #16A34A)',
          color: state === 'rolling' ? 'white' : '#08071A',
          boxShadow: state !== 'rolling' ? '0 8px 32px rgba(34,197,94,0.35)' : 'none',
        }}
      >
        {state === 'rolling' ? '🎲 Rolling…' : '🎲 Roll the Dice'}
      </motion.button>
    </div>
  )
}
