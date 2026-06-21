import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { WinCelebration, NoWin } from '@/components/customer/win-celebration'
import { useInstantWinPlay } from '@/hooks/useInstantWinPlay'
import { getCustomerBusinessPath } from '@/lib/customer-ui'
import { pickDiceFace } from '@/lib/instant-win-ui'

type State = 'idle' | 'rolling' | 'result'

const STAR_POSITIONS = [
  { top: '8%', left: '12%' }, { top: '15%', left: '88%' },
  { top: '35%', left: '5%' }, { top: '50%', left: '92%' },
  { top: '70%', left: '8%' }, { top: '78%', left: '85%' },
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
        <circle key={i} cx={cx} cy={cy} r="9" fill="#43036d" />
      ))}
    </svg>
  )
}

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

  const goToCafe = () => navigate(getCustomerBusinessPath(businessId), { replace: true })

  const tryAgain = () => {
    resetPlay()
    setState('idle')
    setDisplayValue(1)
  }

  const [state, setState] = useState<State>('idle')
  const [displayValue, setDisplayValue] = useState(1)

  const roll = () => {
    if (state !== 'idle' || !canPlay || isPlaying) return
    setState('rolling')
    startPlay()
  }

  useEffect(() => {
    if (state !== 'rolling' || !playResult) return

    const final = pickDiceFace(playResult.won)
    let count = 0
    const interval = setInterval(() => {
      setDisplayValue(Math.floor(1 + Math.random() * 6))
      count++
      if (count > 14) {
        clearInterval(interval)
        setDisplayValue(final)
        setTimeout(() => setState('result'), 800)
      }
    }, 120)
    return () => clearInterval(interval)
  }, [state, playResult])

  useEffect(() => {
    if (playError && state === 'rolling') {
      setState('idle')
      resetPlay()
    }
  }, [playError, state, resetPlay])

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#1c0038]">
        <Loader2 className="size-10 text-[#d4a8ff] animate-spin" />
      </div>
    )
  }

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

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-between px-5 pt-12 pb-10 relative overflow-hidden"
      style={{ background: 'linear-gradient(165deg, #43036d 0%, #2d110e 38%, #1c0038 100%)' }}
    >
      {STAR_POSITIONS.map((pos, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-white/30 pointer-events-none"
          style={{ top: pos.top, left: pos.left }}
          animate={{ opacity: [0.2, 0.7, 0.2] }}
          transition={{ duration: 2 + i * 0.3, repeat: Infinity }}
        />
      ))}

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="self-start flex items-center gap-1.5 text-white/50 text-sm bg-transparent border-0 cursor-pointer"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="text-center relative z-10">
        <h1 className="text-2xl font-extrabold text-white mb-1">{campaign?.name ?? 'Mystery Box'}</h1>
        <p className="text-sm text-white/60">
          {playError || (state === 'rolling' ? 'Rolling…' : canPlay ? 'Roll 3, 4, or 6 to win!' : playState?.message ?? 'Cannot play')}
        </p>
      </div>

      <motion.div
        className="relative z-10 w-36 h-36 rounded-3xl bg-white shadow-[0_20px_60px_rgba(91,14,129,0.5)] flex items-center justify-center p-4"
        animate={state === 'rolling' ? { rotate: [0, 360, 720], scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 1.8, ease: 'easeOut' }}
      >
        <DiceFaceSVG value={displayValue} />
      </motion.div>

      <motion.button
        type="button"
        whileTap={{ scale: 0.94 }}
        onClick={roll}
        disabled={state === 'rolling' || !canPlay || isPlaying}
        className="w-full py-5 rounded-2xl text-xl font-extrabold text-white border-0 cursor-pointer disabled:opacity-50 relative z-10"
        style={{ background: 'linear-gradient(135deg, #631cbb, #5b0e81)' }}
      >
        {state === 'rolling' ? '🎲 Rolling…' : '🎲 ROLL'}
      </motion.button>
    </div>
  )
}
