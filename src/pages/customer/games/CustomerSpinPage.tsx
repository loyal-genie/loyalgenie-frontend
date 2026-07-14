import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { WinCelebration, NoWin } from '@/components/customer/win-celebration'
import { useInstantWinPlay } from '@/hooks/useInstantWinPlay'
import { getCampaignTheme, getPlayScreenBackground } from '@/lib/campaign-themes'
import { getCustomerBusinessPath } from '@/lib/customer-ui'
import {
  buildSpinSegmentsFromRewards,
  pickSpinLandingIndex,
  segmentAngles,
  spinConfigToSegments,
  spinRotationForLanding,
} from '@/lib/instant-win-ui'
import { spinRewardChipStyleLight, spinSegmentAccentHex } from '@/lib/spin-segment-colors'
import { SpinWheelGradientDefs, segmentPathFill } from '@/components/vendor/SpinWheelGradientDefs'
import type { SpinSegment } from '@/lib/types'

type State = 'idle' | 'spinning' | 'result'

const SPARKLE_POS = [
  { top: '14%', left: '10%' },
  { top: '22%', right: '8%' },
  { top: '48%', left: '3%' },
  { top: '52%', right: '5%' },
  { bottom: '30%', left: '8%' },
  { bottom: '22%', right: '9%' },
  { top: '70%', left: '14%' },
  { top: '60%', right: '12%' },
]

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

function hexMix(hexA: string, hexB: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(hexA)
  const [r2, g2, b2] = hexToRgb(hexB)
  const mix = (a: number, b: number) => Math.round(a + (b - a) * t)
  return `#${[mix(r1, r2), mix(g1, g2), mix(b1, b2)].map(v => v.toString(16).padStart(2, '0')).join('')}`
}

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
  const theme = getCampaignTheme('spin')
  const accentRgb = hexToRgb(theme.accent).join(',')
  const lightAccent = hexMix(theme.accent, '#FFFFFF', 0.35)

  const goToCafe = () => navigate(getCustomerBusinessPath(businessId), { replace: true })

  const tryAgain = () => {
    resetPlay()
    setState('idle')
    setRotation(0)
    idleRef.current = 0
    setIdleAngle(0)
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

  const winPrizes = useMemo(
    () => segments.filter(s => s.isWin && (s.label || s.reward).trim()),
    [segments],
  )

  const [state, setState] = useState<State>('idle')
  const [rotation, setRotation] = useState(0)
  const [idleAngle, setIdleAngle] = useState(0)
  const [landedIdx, setLandedIdx] = useState<number | null>(null)
  const rotationBeforeSpinRef = useRef(0)
  const idleRef = useRef(0)
  const rafRef = useRef<number | null>(null)

  const segAngles = useMemo(() => segmentAngles(segments), [segments])

  // Gentle idle drift (prototype)
  useEffect(() => {
    if (state !== 'idle') {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      return
    }
    let last = performance.now()
    const tick = (now: number) => {
      const dt = now - last
      last = now
      idleRef.current += dt * 0.012
      setIdleAngle(idleRef.current)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [state])

  const spin = () => {
    if (state !== 'idle' || !canPlay || isPlaying) return
    rotationBeforeSpinRef.current = idleRef.current
    setRotation(idleRef.current)
    setState('spinning')
    setLandedIdx(null)
    startPlay()
  }

  useEffect(() => {
    if (state !== 'spinning' || !playResult) return

    const idx = pickSpinLandingIndex(segments, playResult.won, playResult.reward)
    const extraSpins = 6 + Math.floor(Math.random() * 3)
    const targetAngle = spinRotationForLanding(segments, idx)
    const finalRotation = rotationBeforeSpinRef.current + extraSpins * 360 + targetAngle

    setLandedIdx(idx)
    setRotation(finalRotation)

    const t = setTimeout(() => setState('result'), 5500)
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
        mechanic="spin"
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
        mechanic="spin"
      />
    )
  }

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center" style={{ background: getPlayScreenBackground('spin') }}>
        <Loader2 className="size-10 animate-spin" style={{ color: theme.accent }} />
      </div>
    )
  }

  const cx = 150
  const cy = 150
  const r = 140
  const currentAngle = state === 'idle' ? idleAngle : rotation

  const studs = Array.from({ length: 16 }, (_, i) => {
    const angle = (i * (360 / 16) - 90) * (Math.PI / 180)
    return { x: cx + 155 * Math.cos(angle), y: cy + 155 * Math.sin(angle) }
  })

  const ticks = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * 30 - 90) * (Math.PI / 180)
    return {
      x1: cx + 147 * Math.cos(angle),
      y1: cy + 147 * Math.sin(angle),
      x2: cx + 134 * Math.cos(angle),
      y2: cy + 134 * Math.sin(angle),
    }
  })

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-between px-5 pt-12 pb-10 max-w-[440px] mx-auto relative overflow-hidden"
      style={{ background: getPlayScreenBackground('spin') }}
    >
      {/* Ambient orbs */}
      <div
        className="absolute top-20 -left-24 w-72 h-72 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, rgba(${accentRgb},0.12) 0%, transparent 70%)`,
          filter: 'blur(56px)',
        }}
      />
      <div
        className="absolute bottom-28 -right-24 w-64 h-64 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${theme.accent}18 0%, transparent 70%)`,
          filter: 'blur(48px)',
        }}
      />

      {/* Back + status */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="absolute top-12 left-4 z-20 size-9 rounded-full bg-black/5 backdrop-blur-md flex items-center justify-center border-0 cursor-pointer"
        aria-label="Go back"
      >
        <ArrowLeft className="size-4 text-gray-700" />
      </button>
      <p className="absolute top-14 right-4 text-[10px] text-gray-500 z-20 font-semibold">
        {playState ? `${playState.playsUsedToday}/${playState.playsPerDay} today` : 'Spin the Wheel'}
      </p>

      {/* Idle sparkles */}
      {state === 'idle' &&
        SPARKLE_POS.map((pos, i) => (
          <motion.div
            key={i}
            className="absolute pointer-events-none select-none z-10"
            style={{ ...pos, color: `rgba(${accentRgb},0.4)` }}
            animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.8, 1.3, 0.8], rotate: [0, 15, 0] }}
            transition={{ duration: 2.5 + i * 0.3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
          >
            ✦
          </motion.div>
        ))}

      <div className="flex-1 flex flex-col items-center justify-center w-full z-10 pt-6">
        <div className="text-center mb-4">
          <h1 className="text-xl font-extrabold text-gray-900">{campaign?.name ?? 'Spin the Wheel'}</h1>
          <p className="text-sm text-gray-600 mt-1">
            {playError ||
              (state === 'spinning'
                ? 'Spinning…'
                : canPlay
                  ? 'Tap SPIN to try your luck!'
                  : (playState?.message ?? 'Cannot play'))}
          </p>
        </div>

        {/* Wheel */}
        <div className="relative flex items-center justify-center my-2">
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{ width: 330, height: 330 }}
            animate={
              state === 'spinning'
                ? {
                    boxShadow: [
                      `0 0 40px rgba(${accentRgb},0.3)`,
                      `0 0 90px rgba(${accentRgb},0.65)`,
                      `0 0 40px rgba(${accentRgb},0.3)`,
                    ],
                  }
                : { boxShadow: `0 0 30px rgba(${accentRgb},0.15)` }
            }
            transition={{ duration: 1.2, repeat: state === 'spinning' ? Infinity : 0, ease: 'easeInOut' }}
          />

          {/* Pointer */}
          <div className="absolute top-[-4px] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center drop-shadow-lg">
            <div
              className="w-0 h-0"
              style={{
                borderLeft: '16px solid transparent',
                borderRight: '16px solid transparent',
                borderTop: `36px solid ${theme.accent}`,
                filter: `drop-shadow(0 3px 8px rgba(${accentRgb},0.8))`,
              }}
            />
            <div
              className="w-6 h-6 rounded-full -mt-1.5"
              style={{ background: `linear-gradient(145deg, ${lightAccent}, ${theme.accent})` }}
            />
          </div>

          <motion.div
            animate={{ rotate: currentAngle }}
            transition={
              state === 'spinning'
                ? { duration: 5, ease: [0.05, 0.95, 0.15, 1] }
                : { duration: 0 }
            }
          >
            <svg width="316" height="316" viewBox="0 0 300 300">
              <SpinWheelGradientDefs
                segments={segments.map((seg, i) => ({ id: `seg-${i}`, color: seg.color }))}
              />
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
                const isLanded = landedIdx === i && state === 'result'

                const words = seg.label.split(' ')
                const lines =
                  words.length > 1
                    ? [
                        words.slice(0, Math.ceil(words.length / 2)).join(' '),
                        words.slice(Math.ceil(words.length / 2)).join(' '),
                      ]
                    : [seg.label.length > 8 ? `${seg.label.slice(0, 7)}…` : seg.label]

                let labelRotation = startAngleDeg + sliceAngle / 2 + 90
                if (labelRotation > 90 && labelRotation < 270) labelRotation += 180

                return (
                  <g key={i}>
                    <path
                      d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                      fill={segmentPathFill(seg.color, `seg-${i}`)}
                      stroke="rgba(0,0,0,0.12)"
                      strokeWidth="1.5"
                      opacity={isLanded ? 1 : landedIdx !== null ? 0.5 : 0.92}
                    />
                    {sliceAngle >= 16 && (
                      <text
                        x={tx}
                        y={ty}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="white"
                        fontSize="9.5"
                        fontWeight="700"
                        transform={`rotate(${labelRotation}, ${tx}, ${ty})`}
                      >
                        {lines.map((line, li) => (
                          <tspan
                            key={li}
                            x={tx}
                            dy={lines.length === 1 ? 0 : li === 0 ? -6 : 12}
                          >
                            {line}
                          </tspan>
                        ))}
                      </text>
                    )}
                  </g>
                )
              })}

              <circle
                cx={cx}
                cy={cy}
                r={148}
                fill="none"
                stroke={`rgba(${accentRgb},0.25)`}
                strokeWidth={5}
              />

              {ticks.map((t, i) => (
                <line
                  key={i}
                  x1={t.x1}
                  y1={t.y1}
                  x2={t.x2}
                  y2={t.y2}
                  stroke="rgba(255,255,255,0.45)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              ))}

              {studs.map((s, i) => (
                <circle
                  key={i}
                  cx={s.x}
                  cy={s.y}
                  r="4.5"
                  fill={theme.accent}
                  opacity="0.7"
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth="0.5"
                />
              ))}

              <defs>
                <radialGradient id="spinCenterGrad" cx="40%" cy="35%">
                  <stop offset="0%" stopColor="#2D1B69" />
                  <stop offset="100%" stopColor="#08071A" />
                </radialGradient>
              </defs>
              <circle cx={cx} cy={cy} r="32" fill="#08071A" stroke={theme.accent} strokeWidth="2.5" />
              <circle cx={cx} cy={cy} r="26" fill="url(#spinCenterGrad)" />
              <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="18">
                🧞
              </text>
            </svg>
          </motion.div>
        </div>
      </div>

      {/* Prize strip — above SPIN (prototype order) */}
      {winPrizes.length > 0 && (
        <div className="w-full flex gap-2 justify-center flex-wrap mb-4 z-10">
          {winPrizes.map((s, i) => {
            const chip = spinRewardChipStyleLight(s.color)
            const accent = spinSegmentAccentHex(s.color)
            return (
              <span
                key={`${s.label}-${i}`}
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full leading-tight"
                style={{
                  background: chip.background,
                  color: chip.textColor,
                  border: `1px solid ${chip.borderColor}`,
                }}
              >
                <span
                  className="size-1.5 rounded-full shrink-0"
                  style={{ background: accent }}
                  aria-hidden
                />
                {s.label}
              </span>
            )
          })}
        </div>
      )}

      <motion.button
        type="button"
        whileTap={{ scale: 0.94 }}
        onClick={spin}
        disabled={state === 'spinning' || !canPlay || isPlaying}
        className="w-full py-5 rounded-2xl text-xl font-extrabold disabled:opacity-50 border-0 cursor-pointer z-10"
        style={{
          background:
            state === 'spinning'
              ? '#F3F4F6'
              : `linear-gradient(135deg, ${lightAccent}, ${theme.accent})`,
          color: state === 'spinning' ? '#9CA3AF' : '#ffffff',
          boxShadow: state === 'spinning' ? 'none' : `0 8px 32px rgba(${accentRgb},0.45)`,
        }}
        animate={
          state === 'idle' && canPlay
            ? {
                boxShadow: [
                  `0 8px 32px rgba(${accentRgb},0.35)`,
                  `0 8px 52px rgba(${accentRgb},0.65)`,
                  `0 8px 32px rgba(${accentRgb},0.35)`,
                ],
              }
            : {}
        }
        transition={{ duration: 1.8, repeat: state === 'idle' && canPlay ? Infinity : 0, ease: 'easeInOut' }}
      >
        {state === 'spinning' ? '🎡 Spinning…' : '✨ SPIN'}
      </motion.button>
    </div>
  )
}
