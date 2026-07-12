import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { WinCelebration, NoWin } from '@/components/customer/win-celebration'
import { useInstantWinPlay } from '@/hooks/useInstantWinPlay'
import { getCustomerBusinessPath } from '@/lib/customer-ui'
import { buildSpinSegmentsFromRewards, pickSpinLandingIndex, segmentAngles, spinConfigToSegments, spinRotationForLanding } from '@/lib/instant-win-ui'
import { spinRewardChipStyle } from '@/lib/spin-segment-colors'
import { SpinWheelGradientDefs, segmentPathFill } from '@/components/vendor/SpinWheelGradientDefs'
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

  const goToCafe = () => navigate(getCustomerBusinessPath(businessId), { replace: true })

  const tryAgain = () => {
    resetPlay()
    setState('idle')
    setRotation(0)
    rotationBeforeSpinRef.current = 0
    setLandedIdx(null)
  }

  const segments = useMemo((): SpinSegment[] => {
    if (campaign?.spinConfig?.segments?.length) {
      return spinConfigToSegments(campaign.spinConfig.segments)
    }
    if (campaign?.rewards?.length) return buildSpinSegmentsFromRewards(campaign.rewards)
    return buildSpinSegmentsFromRewards([{ name: 'Free Coffee', icon: '☕' }])
  }, [campaign?.spinConfig?.segments, campaign?.rewards])

  const [state, setState] = useState<State>('idle')
  const [rotation, setRotation] = useState(0)
  const [landedIdx, setLandedIdx] = useState<number | null>(null)
  const rotationBeforeSpinRef = useRef(0)

  const segAngles = useMemo(() => segmentAngles(segments), [segments])

  const spin = () => {
    if (state !== 'idle' || !canPlay || isPlaying) return
    rotationBeforeSpinRef.current = rotation
    setState('spinning')
    setLandedIdx(null)
    startPlay()
  }

  useEffect(() => {
    if (state !== 'spinning' || !playResult) return

    const idx = pickSpinLandingIndex(segments, playResult.won, playResult.reward)
    const extraSpins = 5 + Math.floor(Math.random() * 3)
    const targetAngle = spinRotationForLanding(segments, idx)
    const finalRotation = rotationBeforeSpinRef.current + extraSpins * 360 + targetAngle

    setLandedIdx(idx)
    setRotation(finalRotation)

    const t = setTimeout(() => setState('result'), 4500)
    return () => clearTimeout(t)
  }, [state, playResult, segments])

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
      <div className="min-h-dvh flex items-center justify-center bg-[#f8fafc]">
        <Loader2 className="size-10 text-[#93c5fd] animate-spin" />
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
      className="min-h-dvh flex flex-col items-center justify-between px-5 pt-12 pb-10 max-w-[440px] mx-auto"
      style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 55%, #eff6ff 100%)' }}
    >
      <div className="w-full flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-[#64748b] hover:text-[#334155] text-sm bg-transparent border-0 cursor-pointer"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        {playState && (
          <span className="text-[10px] text-[#64748b] font-bold">
            {playState.playsUsedToday}/{playState.playsPerDay} today
          </span>
        )}
      </div>

      <div className="text-center">
        <h1 className="text-2xl font-extrabold text-[#1e3a8a] mb-1">{campaign?.name ?? 'Spin the Wheel!'}</h1>
        <p className="text-sm text-[#64748b]">
          {playError || (state === 'spinning' ? 'Spinning…' : canPlay ? 'Tap SPIN to try your luck!' : playState?.message ?? 'Cannot play')}
        </p>
      </div>

      <div className="relative flex items-center justify-center my-4">
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{ width: 300, height: 300 }}
          animate={
            state === 'spinning'
              ? { boxShadow: ['0 0 28px rgba(147,197,253,0.35)', '0 0 48px rgba(147,197,253,0.55)', '0 0 28px rgba(147,197,253,0.35)'] }
              : { boxShadow: '0 0 24px rgba(191,219,254,0.45)' }
          }
          transition={{ duration: 1.2, repeat: state === 'spinning' ? Infinity : 0, ease: 'easeInOut' }}
        />

        <div className="absolute top-[-2px] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
          <div
            className="w-0 h-0"
            style={{
              borderLeft: '12px solid transparent',
              borderRight: '12px solid transparent',
              borderTop: '28px solid #93c5fd',
            }}
          />
        </div>

        <motion.div
          className="relative"
          animate={{ rotate: rotation }}
          transition={state === 'spinning' ? { duration: 4, ease: [0.2, 0.8, 0.3, 1] } : { duration: 0 }}
        >
          <svg width="300" height="300" viewBox="0 0 300 300">
            <SpinWheelGradientDefs segments={segments.map((seg, i) => ({ id: `seg-${i}`, color: seg.color }))} />
            {segments.map((seg, i) => {
              let startAngleDeg = -90
              for (let j = 0; j < i; j++) startAngleDeg += segAngles[j] ?? 0
              const sliceAngle = segAngles[i] ?? 360 / segments.length
              const startAngle = (startAngleDeg * Math.PI) / 180
              const endAngle = ((startAngleDeg + sliceAngle) * Math.PI) / 180
              const x1 = cx + r * Math.cos(startAngle)
              const y1 = cy + r * Math.sin(startAngle)
              const x2 = cx + r * Math.cos(endAngle)
              const y2 = cy + r * Math.sin(endAngle)
              const largeArc = sliceAngle > 180 ? 1 : 0
              const midAngle = (startAngle + endAngle) / 2
              const tx = cx + r * 0.65 * Math.cos(midAngle)
              const ty = cy + r * 0.65 * Math.sin(midAngle)
              const labelAngle = startAngleDeg + sliceAngle / 2
              return (
                <g key={i}>
                  <path
                    d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                    fill={segmentPathFill(seg.color, `seg-${i}`)}
                    stroke="rgba(255,255,255,0.55)"
                    strokeWidth="1.5"
                    opacity={landedIdx === i ? 1 : 0.92}
                  />
                  {sliceAngle >= 16 && (
                    <text
                      x={tx} y={ty}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontSize="9"
                      fontWeight="700"
                      transform={`rotate(${labelAngle}, ${tx}, ${ty})`}
                    >
                      {seg.label}
                    </text>
                  )}
                </g>
              )
            })}
            <circle cx={cx} cy={cy} r={148} fill="none" stroke="#dbeafe" strokeWidth={4} />
            {ticks.map((t, i) => (
              <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke="#93c5fd" strokeWidth="2" />
            ))}
            <circle cx={cx} cy={cy} r="30" fill="#eff6ff" stroke="#93c5fd" strokeWidth="2" />
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
          background: state === 'spinning'
            ? '#e2e8f0'
            : 'linear-gradient(135deg, #bfdbfe 0%, #93c5fd 55%, #60a5fa 100%)',
          color: state === 'spinning' ? '#64748b' : '#1e3a8a',
          boxShadow: state === 'spinning' ? 'none' : '0 12px 28px rgba(147,197,253,0.35)',
        }}
      >
        {state === 'spinning' ? '🎡 Spinning…' : '✨ SPIN'}
      </motion.button>

      {segments.some(s => s.isWin) && (
        <div className="w-full mt-4 rounded-2xl border border-[#dbeafe] bg-white/90 px-3 py-2.5 shadow-[0_4px_16px_rgba(147,197,253,0.12)]">
          <p className="text-center text-[10px] font-bold uppercase tracking-[0.14em] text-[#64748b] mb-2">
            Possible rewards
          </p>
          <div className="flex gap-2 justify-center flex-wrap">
            {segments.filter(s => s.isWin).map((s, i) => {
              const chip = spinRewardChipStyle(s.color)
              return (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full leading-tight"
                  style={{
                    background: chip.background,
                    border: `1px solid ${chip.borderColor}`,
                    color: chip.textColor,
                  }}
                >
                  <span
                    className="size-2 rounded-full shrink-0 ring-1 ring-white/30"
                    style={{ background: chip.dotBackground }}
                    aria-hidden
                  />
                  {s.label}
                </span>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
