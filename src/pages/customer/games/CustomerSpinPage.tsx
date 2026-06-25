import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { WinCelebration, NoWin } from '@/components/customer/win-celebration'
import { useInstantWinPlay } from '@/hooks/useInstantWinPlay'
import { getCustomerBusinessPath } from '@/lib/customer-ui'
import { promptProfileCompletionAfterGame } from '@/lib/profile-completion'
import { buildSpinSegmentsFromRewards, pickSpinLandingIndex } from '@/lib/instant-win-ui'
import type { SpinSegment } from '@/lib/types'

type State = 'idle' | 'spinning' | 'result'

export function CustomerSpinPage() {
  const navigate = useNavigate()
  const {
    businessId,
    businessName,
    campaign,
    playState,
    loading,
    canPlay,
    playResult,
    playError,
    isPlaying,
    startPlay,
    resetPlay,
  } = useInstantWinPlay()

  const goToCafe = () => promptProfileCompletionAfterGame(navigate, getCustomerBusinessPath(businessId))

  const tryAgain = () => {
    resetPlay()
    setState('idle')
    setRotation(0)
    setLandedIdx(null)
  }

  const segments = useMemo((): SpinSegment[] => {
    if (campaign?.rewards?.length) return buildSpinSegmentsFromRewards(campaign.rewards)
    return buildSpinSegmentsFromRewards([{ name: 'Free Coffee', icon: '☕' }])
  }, [campaign?.rewards])

  const [state, setState] = useState<State>('idle')
  const [rotation, setRotation] = useState(0)
  const [landedIdx, setLandedIdx] = useState<number | null>(null)

  const segCount = segments.length
  const segAngle = 360 / segCount

  const spin = () => {
    if (state !== 'idle' || !canPlay || isPlaying) return
    setState('spinning')
    setLandedIdx(null)
    startPlay()
  }

  useEffect(() => {
    if (state !== 'spinning' || !playResult) return

    const idx = pickSpinLandingIndex(segments, playResult.won, playResult.reward?.name)
    const extraSpins = 5 + Math.floor(Math.random() * 3)
    const targetAngle = 360 - (idx * segAngle + segAngle / 2) + 90
    const finalRotation = rotation + extraSpins * 360 + (targetAngle % 360)

    setLandedIdx(idx)
    setRotation(finalRotation)

    const t = setTimeout(() => setState('result'), 4500)
    return () => clearTimeout(t)
  }, [state, playResult, segments, segAngle, rotation])

  useEffect(() => {
    if (playError && state === 'spinning') {
      setState('idle')
      resetPlay()
    }
  }, [playError, state, resetPlay])

  if (state === 'result' && playResult?.won && playResult.reward) {
    return (
      <WinCelebration
        reward={playResult.reward.name}
        emoji={playResult.reward.icon || '🎡'}
        code={playResult.code ?? undefined}
        businessName={businessName}
        onBackToCafe={goToCafe}
      />
    )
  }

  if (state === 'result' && playResult && !playResult.won) {
    return (
      <NoWin
        onTryAgain={tryAgain}
        onBackToCafe={goToCafe}
        playsLeft={playResult.playsRemaining}
        attempts={{ used: playResult.playsUsedToday, total: playResult.playsPerDay }}
      />
    )
  }

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#1c0038]">
        <Loader2 className="size-10 text-[#d4a8ff] animate-spin" />
      </div>
    )
  }

  const cx = 150, cy = 150, r = 140
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * 30 - 90) * (Math.PI / 180)
    return {
      x1: cx + 148 * Math.cos(angle),
      y1: cy + 148 * Math.sin(angle),
      x2: cx + 136 * Math.cos(angle),
      y2: cy + 136 * Math.sin(angle),
    }
  })

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-between px-5 pt-12 pb-10"
      style={{ background: 'linear-gradient(165deg, #43036d 0%, #2d110e 38%, #1c0038 100%)' }}
    >
      <div className="w-full flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-white/50 hover:text-white/70 text-sm bg-transparent border-0 cursor-pointer"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        {playState && (
          <span className="text-[10px] text-white/60 font-bold">
            {playState.playsUsedToday}/{playState.playsPerDay} today
          </span>
        )}
      </div>

      <div className="text-center">
        <h1 className="text-2xl font-extrabold text-white mb-1">{campaign?.name ?? 'Spin the Wheel!'}</h1>
        <p className="text-sm text-white/60">
          {playError || (state === 'spinning' ? 'Spinning…' : canPlay ? 'Tap SPIN to try your luck!' : playState?.message ?? 'Cannot play')}
        </p>
      </div>

      <div className="relative flex items-center justify-center my-4">
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

        <div className="absolute top-[-2px] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
          <div
            className="w-0 h-0"
            style={{
              borderLeft: '12px solid transparent',
              borderRight: '12px solid transparent',
              borderTop: '28px solid #F5C518',
            }}
          />
        </div>

        <motion.div
          className="relative"
          animate={{ rotate: rotation }}
          transition={state === 'spinning' ? { duration: 4, ease: [0.2, 0.8, 0.3, 1] } : { duration: 0 }}
        >
          <svg width="300" height="300" viewBox="0 0 300 300">
            {segments.map((seg, i) => {
              const startAngle = (i * segAngle - 90) * (Math.PI / 180)
              const endAngle = ((i + 1) * segAngle - 90) * (Math.PI / 180)
              const x1 = cx + r * Math.cos(startAngle)
              const y1 = cy + r * Math.sin(startAngle)
              const x2 = cx + r * Math.cos(endAngle)
              const y2 = cy + r * Math.sin(endAngle)
              const midAngle = (startAngle + endAngle) / 2
              const tx = cx + r * 0.65 * Math.cos(midAngle)
              const ty = cy + r * 0.65 * Math.sin(midAngle)
              return (
                <g key={i}>
                  <path
                    d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`}
                    fill={seg.color}
                    stroke="rgba(255,255,255,0.12)"
                    strokeWidth="1.5"
                    opacity={landedIdx === i ? 1 : 0.92}
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
                    {seg.label}
                  </text>
                </g>
              )
            })}
            <circle cx={cx} cy={cy} r={148} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={4} />
            {ticks.map((t, i) => (
              <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
            ))}
            <circle cx={cx} cy={cy} r="30" fill="#08071A" stroke="#F5C518" strokeWidth="2" />
            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="20">🎡</text>
          </svg>
        </motion.div>
      </div>

      <motion.button
        type="button"
        whileTap={{ scale: 0.94 }}
        onClick={spin}
        disabled={state === 'spinning' || !canPlay || isPlaying}
        className="w-full py-5 rounded-2xl text-xl font-extrabold disabled:opacity-50 border-0 cursor-pointer"
        style={{
          background: state === 'spinning' ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #F5C518, #F59E0B)',
          color: state === 'spinning' ? 'white' : '#08071A',
        }}
      >
        {state === 'spinning' ? '🎡 Spinning…' : '✨ SPIN'}
      </motion.button>
    </div>
  )
}
