import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { WinCelebration, NoWin } from '@/components/customer/win-celebration'
import { campaigns } from '@/lib/mock-data'
import type { SpinSegment } from '@/lib/types'

const spinCampaign = campaigns.find(c => c.mechanic === 'spin')!
const segments = (spinCampaign.config as { segments: SpinSegment[] }).segments

type State = 'idle' | 'spinning' | 'result'

export function CustomerSpinPage() {
  const navigate = useNavigate()
  const [state, setState] = useState<State>('idle')
  const [rotation, setRotation] = useState(0)
  const [won, setWon] = useState(false)
  const [wonReward, setWonReward] = useState('')
  const [landedIdx, setLandedIdx] = useState<number | null>(null)

  const segCount = segments.length
  const segAngle = 360 / segCount

  const spin = () => {
    if (state !== 'idle') return
    setState('spinning')

    const winSegs = segments.map((s, i) => ({ ...s, i })).filter(s => s.isWin)
    const noWinSegs = segments.map((s, i) => ({ ...s, i })).filter(s => !s.isWin)
    const didWin = Math.random() < 0.55
    const target = didWin
      ? winSegs[Math.floor(Math.random() * winSegs.length)]
      : noWinSegs[Math.floor(Math.random() * noWinSegs.length)]

    const extraSpins = 5 + Math.floor(Math.random() * 3)
    const targetAngle = 360 - (target.i * segAngle + segAngle / 2) + 90
    const finalRotation = rotation + extraSpins * 360 + (targetAngle % 360)

    setRotation(finalRotation)
    setLandedIdx(target.i)

    setTimeout(() => {
      setWon(didWin)
      setWonReward(target.reward || '')
      setState('result')
    }, 4500)
  }

  if (state === 'result' && won) return <WinCelebration reward={wonReward} emoji="🎡" />
  if (state === 'result' && !won) return <NoWin />

  const cx = 150, cy = 150, r = 140

  // 12 triangle tick marks around the outer ring
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * 30 - 90) * (Math.PI / 180)
    const outerR = 148
    const innerR = 136
    return {
      x1: cx + outerR * Math.cos(angle),
      y1: cy + outerR * Math.sin(angle),
      x2: cx + innerR * Math.cos(angle),
      y2: cy + innerR * Math.sin(angle),
    }
  })

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between px-5 pt-12 pb-10"
      style={{ background: 'linear-gradient(145deg, #1A0545 0%, #2D1B69 45%, #0D0B1E 100%)' }}
    >
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
        <h1 className="text-2xl font-extrabold text-white mb-1">Spin the Wheel!</h1>
        <p className="text-sm text-white/60">
          {state === 'spinning' ? 'Spinning…' : 'Tap SPIN to try your luck!'}
        </p>
      </div>

      <div className="relative flex items-center justify-center my-4">
        {/* Glow ring behind wheel — pulses during spinning */}
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{ width: 300, height: 300 }}
          animate={
            state === 'spinning'
              ? { boxShadow: ['0 0 40px rgba(139,92,246,0.4)', '0 0 80px rgba(139,92,246,0.8)', '0 0 40px rgba(139,92,246,0.4)'] }
              : { boxShadow: '0 0 30px rgba(139,92,246,0.2)' }
          }
          transition={{ duration: 1.2, repeat: state === 'spinning' ? Infinity : 0, ease: 'easeInOut' }}
        />

        {/* Gold pointer at top */}
        <div className="absolute top-[-2px] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
          <div
            className="w-0 h-0"
            style={{
              borderLeft: '12px solid transparent',
              borderRight: '12px solid transparent',
              borderTop: '28px solid #F5C518',
              filter: 'drop-shadow(0 2px 4px rgba(245,197,24,0.6))',
            }}
          />
          <div className="w-4 h-4 rounded-full -mt-1" style={{ background: '#F5C518' }} />
        </div>

        {/* Wheel */}
        <motion.div
          className="relative"
          animate={{ rotate: rotation }}
          transition={state === 'spinning' ? { duration: 4, ease: [0.2, 0.8, 0.3, 1] } : { duration: 0 }}
        >
          <svg width="300" height="300" viewBox="0 0 300 300">
            {/* Segments */}
            {segments.map((seg, i) => {
              const startAngle = (i * segAngle - 90) * (Math.PI / 180)
              const endAngle = ((i + 1) * segAngle - 90) * (Math.PI / 180)
              const x1 = cx + r * Math.cos(startAngle)
              const y1 = cy + r * Math.sin(startAngle)
              const x2 = cx + r * Math.cos(endAngle)
              const y2 = cy + r * Math.sin(endAngle)
              const midAngle = (startAngle + endAngle) / 2
              const tx = cx + (r * 0.65) * Math.cos(midAngle)
              const ty = cy + (r * 0.65) * Math.sin(midAngle)
              const isLanded = landedIdx === i
              const label = seg.label.length > 8 ? seg.label.slice(0, 7) + '…' : seg.label

              return (
                <g key={i}>
                  <path
                    d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`}
                    fill={seg.color}
                    stroke="rgba(255,255,255,0.12)"
                    strokeWidth="1.5"
                    opacity={isLanded ? 1 : 0.92}
                  />
                  <text
                    x={tx} y={ty}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize="9"
                    fontWeight="700"
                    transform={`rotate(${i * segAngle + segAngle / 2}, ${tx}, ${ty})`}
                  >
                    {label}
                  </text>
                </g>
              )
            })}

            {/* Outer decorative ring */}
            <circle cx={cx} cy={cy} r={148} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={4} />

            {/* 12 tick marks */}
            {ticks.map((t, i) => (
              <line
                key={i}
                x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ))}

            {/* Center circle with 🧞 */}
            <circle cx={cx} cy={cy} r="30" fill="#08071A" stroke="#F5C518" strokeWidth="2" />
            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="20">🧞</text>
          </svg>
        </motion.div>
      </div>

      {/* SPIN button */}
      <motion.button
        whileTap={{ scale: 0.94 }}
        onClick={spin}
        disabled={state === 'spinning'}
        className="w-full py-5 rounded-2xl text-xl font-extrabold transition-all disabled:opacity-50"
        style={{
          background: state === 'spinning' ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #F5C518, #F59E0B)',
          color: state === 'spinning' ? 'white' : '#08071A',
          boxShadow: state !== 'spinning' ? '0 8px 32px rgba(245,197,24,0.45)' : 'none',
        }}
        animate={
          state === 'idle'
            ? { boxShadow: ['0 8px 32px rgba(245,197,24,0.35)', '0 8px 48px rgba(245,197,24,0.65)', '0 8px 32px rgba(245,197,24,0.35)'] }
            : {}
        }
        transition={{ duration: 1.8, repeat: state === 'idle' ? Infinity : 0, ease: 'easeInOut' }}
      >
        {state === 'spinning' ? '🎡 Spinning…' : '✨ SPIN'}
      </motion.button>
    </div>
  )
}
