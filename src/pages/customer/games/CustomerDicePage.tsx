import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useAnimation } from 'framer-motion'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { WinCelebration, NoWin } from '@/components/customer/win-celebration'
import { DiceFace } from '@/components/shared/DiceFace'
import { useInstantWinPlay } from '@/hooks/useInstantWinPlay'
import { getCustomerBusinessPath } from '@/lib/customer-ui'
import { pickDiceLandingValue, type DicePlayOutcome } from '@/lib/instant-win-ui'

type State = 'idle' | 'rolling' | 'landed' | 'result'

const CUBE_SIZE = 132
const HALF = CUBE_SIZE / 2

// Face layout on the cube (opposite faces sum to 7, like a real die).
const CUBE_FACES: { value: number; transform: string }[] = [
  { value: 1, transform: `rotateY(0deg) translateZ(${HALF}px)` }, // front
  { value: 6, transform: `rotateY(180deg) translateZ(${HALF}px)` }, // back
  { value: 3, transform: `rotateY(90deg) translateZ(${HALF}px)` }, // right
  { value: 4, transform: `rotateY(-90deg) translateZ(${HALF}px)` }, // left
  { value: 2, transform: `rotateX(90deg) translateZ(${HALF}px)` }, // top
  { value: 5, transform: `rotateX(-90deg) translateZ(${HALF}px)` }, // bottom
]

// Cube rotation that brings a given face flat toward the viewer.
function faceOrientation(value: number): { x: number; y: number } {
  switch (value) {
    case 1: return { x: 0, y: 0 }
    case 6: return { x: 0, y: 180 }
    case 3: return { x: 0, y: -90 }
    case 4: return { x: 0, y: 90 }
    case 2: return { x: -90, y: 0 }
    case 5: return { x: 90, y: 0 }
    default: return { x: 0, y: 0 }
  }
}

const IDLE_TILT = { x: -22, y: 24 }
const SPARKLES = [
  { top: '10%', left: '14%', d: 2.2 }, { top: '18%', left: '82%', d: 2.8 },
  { top: '40%', left: '8%', d: 2.5 }, { top: '46%', left: '90%', d: 3.1 },
  { top: '68%', left: '12%', d: 2.4 }, { top: '74%', left: '84%', d: 2.9 },
]

export function CustomerDicePage() {
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

  const [state, setState] = useState<State>('idle')
  const controls = useAnimation()
  const rotation = useRef({ ...IDLE_TILT })
  const rollStartedRef = useRef(false)

  const outcomes = useMemo<DicePlayOutcome[]>(
    () =>
      (campaign?.diceConfig?.outcomes ?? []).map(o => ({
        value: o.value,
        isWin: o.isWin,
        reward: o.reward ?? null,
      })),
    [campaign?.diceConfig],
  )

  const faceChart = useMemo(() => {
    const byValue = new Map(outcomes.map(o => [o.value, o]))
    return [1, 2, 3, 4, 5, 6].map(v => {
      const o = byValue.get(v)
      const win = Boolean(o?.isWin && (o?.reward ?? '').trim())
      return { value: v, win, reward: win ? (o!.reward ?? '') : null }
    })
  }, [outcomes])

  const goToCafe = () => navigate(getCustomerBusinessPath(businessId), { replace: true })

  const tryAgain = () => {
    resetPlay()
    rollStartedRef.current = false
    setState('idle')
    controls.set({ rotateX: rotation.current.x, rotateY: rotation.current.y })
  }

  const roll = () => {
    if (state !== 'idle' || !canPlay || isPlaying) return
    rollStartedRef.current = false
    setState('rolling')
    startPlay()
  }

  // Drive the 3D tumble once the server result arrives (runs exactly once per roll).
  useEffect(() => {
    if (state !== 'rolling' || !playResult || rollStartedRef.current) return
    rollStartedRef.current = true

    const final = pickDiceLandingValue(outcomes, playResult.won, playResult.reward)
    const target = faceOrientation(final)
    const cur = rotation.current
    // Extra full spins over ~2.8s so the tumble feels exciting before landing.
    const nextX = target.x + 360 * (Math.floor((cur.x - target.x) / 360) + 6)
    const nextY = target.y + 360 * (Math.floor((cur.y - target.y) / 360) + 7)
    rotation.current = { x: nextX, y: nextY }

    controls
      .start({
        rotateX: nextX,
        rotateY: nextY,
        transition: { duration: 2.8, ease: [0.12, 0.65, 0.2, 1] },
      })
      .then(() => {
        setState('landed')
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, playResult])

  // After showing the landed face for a beat, move to the reward screen.
  useEffect(() => {
    if (state !== 'landed') return
    const t = setTimeout(() => setState('result'), 1500)
    return () => clearTimeout(t)
  }, [state])

  useEffect(() => {
    if (playError && state === 'rolling') {
      rollStartedRef.current = false
      setState('idle')
      resetPlay()
      controls.set({ rotateX: rotation.current.x, rotateY: rotation.current.y })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playError, state])

  if (state === 'result' && playResult?.won && playResult.reward) {
    return (
      <WinCelebration
        reward={playResult.reward.name}
        emoji={playResult.reward.icon || '🎲'}
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
      <div className="min-h-dvh flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #fff5f5 100%)' }}>
        <Loader2 className="size-10 text-[#fda4af] animate-spin" />
      </div>
    )
  }

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-between px-5 pt-12 pb-10 relative overflow-hidden max-w-[440px] mx-auto"
      style={{ background: 'linear-gradient(180deg, #ffffff 0%, #fffafa 50%, #fff1f2 100%)' }}
    >
      {/* Soft ambient glow */}
      <div
        className="absolute w-72 h-72 rounded-full pointer-events-none"
        style={{ top: '6%', left: '-25%', background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, transparent 70%)', filter: 'blur(46px)' }}
      />
      <div
        className="absolute w-72 h-72 rounded-full pointer-events-none"
        style={{ bottom: '2%', right: '-25%', background: 'radial-gradient(circle, rgba(254,202,202,0.45) 0%, transparent 70%)', filter: 'blur(52px)' }}
      />

      {SPARKLES.map((s, i) => (
        <motion.div
          key={i}
          className="absolute size-1.5 rounded-full bg-[#fecdd3] pointer-events-none"
          style={{ top: s.top, left: s.left }}
          animate={{ opacity: [0.2, 0.7, 0.2], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: s.d, repeat: Infinity }}
        />
      ))}

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="self-start flex items-center gap-1.5 text-[#9f1239]/45 text-sm bg-transparent border-0 cursor-pointer z-10"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="text-center relative z-10">
        <h1 className="text-2xl font-extrabold text-[#9f1239]/80 mb-1">{campaign?.name ?? 'Roll a Dice'}</h1>
        <p className="text-sm font-medium text-[#fb7185]">
          {playError || (state === 'rolling' ? 'Rolling the dice…' : state === 'landed' ? 'Revealing your result…' : canPlay ? 'Tap ROLL to try your luck!' : playState?.message ?? 'Cannot play')}
        </p>
      </div>

      {/* 3D dice stage */}
      <div className="relative z-10 flex flex-col items-center" style={{ perspective: '1100px' }}>
        <motion.div
          animate={controls}
          initial={{ rotateX: IDLE_TILT.x, rotateY: IDLE_TILT.y }}
          style={{
            width: CUBE_SIZE,
            height: CUBE_SIZE,
            position: 'relative',
            transformStyle: 'preserve-3d',
          }}
        >
          {CUBE_FACES.map(face => (
            <div
              key={face.value}
              className="absolute inset-0 flex items-center justify-center rounded-[22px] bg-white"
              style={{
                transform: face.transform,
                backfaceVisibility: 'hidden',
                padding: 22,
                boxShadow: 'inset 0 0 0 1px rgba(251,113,133,0.12), inset 0 6px 14px rgba(251,113,133,0.06)',
              }}
            >
              <DiceFace value={face.value} pipColor="#fb7185" />
            </div>
          ))}
        </motion.div>

        {/* Floor shadow */}
        <motion.div
          className="mt-6 h-3 rounded-[50%] bg-[#fda4af]/35 blur-md"
          animate={{
            width: state === 'rolling' ? [96, 132, 96] : 116,
            opacity: state === 'rolling' ? [0.18, 0.32, 0.18] : 0.28,
          }}
          transition={state === 'rolling' ? { duration: 0.7, repeat: Infinity } : { duration: 0.3 }}
        />
      </div>

      {/* What each face wins */}
      {faceChart.length > 0 && (
        <div className="w-full rounded-2xl p-4 z-10 bg-white/90 border border-[#fecdd3] shadow-[0_8px_24px_rgba(251,113,133,0.08)]">
          <p className="text-[10px] text-[#fb7185] font-bold mb-3 text-center uppercase tracking-wide">What each face wins</p>
          <div className="grid grid-cols-3 gap-2">
            {faceChart.map(face => (
              <div
                key={face.value}
                className="rounded-xl px-2 py-2 flex flex-col items-center gap-1 text-center"
                style={{
                  background: face.win ? 'rgba(254,205,211,0.45)' : 'rgba(255,241,242,0.8)',
                  border: face.win ? '1px solid rgba(251,113,133,0.35)' : '1px solid rgba(254,205,211,0.5)',
                }}
              >
                <span className="size-6">
                  <DiceFace value={face.value} pipColor={face.win ? '#fb7185' : 'rgba(251,113,133,0.35)'} />
                </span>
                <span className={`text-[10px] font-semibold leading-tight truncate w-full ${face.win ? 'text-[#9f1239]/75' : 'text-[#fb7185]/45'}`}>
                  {face.win ? face.reward : 'No win'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <motion.button
        type="button"
        whileTap={{ scale: 0.94 }}
        onClick={roll}
        disabled={state !== 'idle' || !canPlay || isPlaying}
        className="w-full py-5 rounded-2xl text-xl font-extrabold border-0 cursor-pointer disabled:opacity-50 relative z-10"
        style={{
          background: 'linear-gradient(135deg, #fecdd3 0%, #fda4af 50%, #fb7185 100%)',
          color: '#9f1239',
          boxShadow: '0 12px 28px rgba(251,113,133,0.25)',
        }}
      >
        {state === 'idle' ? '🎲 ROLL' : state === 'landed' ? '🎲 Revealing…' : '🎲 Rolling…'}
      </motion.button>
    </div>
  )
}
