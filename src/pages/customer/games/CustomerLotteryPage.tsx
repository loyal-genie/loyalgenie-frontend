import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { WinCelebration, NoWin } from '@/components/customer/win-celebration'
import { useInstantWinPlay } from '@/hooks/useInstantWinPlay'
import { getCustomerBusinessPath } from '@/lib/customer-ui'
import { buildLotteryGrid, type LotteryCell } from '@/lib/instant-win-ui'

const TOTAL = 9
const NO_WIN_COLOR = 'rgba(255,255,255,0.15)'

type State = 'idle' | 'loading' | 'scratching' | 'done'

function ScratchCell({
  revealed,
  cell,
  onReveal,
  disabled,
}: {
  revealed: boolean
  cell: LotteryCell | null
  onReveal: () => void
  disabled: boolean
}) {
  return (
    <motion.button
      type="button"
      onClick={onReveal}
      disabled={revealed || disabled}
      whileTap={!revealed && !disabled ? { scale: 0.85 } : {}}
      className="aspect-square rounded-2xl flex items-center justify-center relative overflow-hidden cursor-pointer select-none border-0"
      style={{
        background: revealed
          ? `${cell?.color ?? NO_WIN_COLOR}20`
          : 'linear-gradient(145deg, #631cbb, #43036d)',
        border: `1px solid ${revealed ? (cell?.color ?? NO_WIN_COLOR) + '60' : 'rgba(255,255,255,0.12)'}`,
      }}
    >
      <AnimatePresence mode="wait">
        {!revealed ? (
          <motion.span key="hidden" exit={{ scale: 0, opacity: 0 }} className="text-2xl text-white/40">?</motion.span>
        ) : (
          <motion.div
            key="revealed"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex flex-col items-center"
          >
            <span className="text-xl">{cell?.emoji ?? '❌'}</span>
            <span className="text-[7px] font-bold text-white/70 text-center px-1">{cell?.reward ?? 'No Win'}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

export function CustomerLotteryPage() {
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
    setCells([])
    setRevealed(Array(TOTAL).fill(false))
  }

  const [state, setState] = useState<State>('idle')
  const [cells, setCells] = useState<LotteryCell[]>([])
  const [revealed, setRevealed] = useState<boolean[]>(Array(TOTAL).fill(false))

  const beginPlay = () => {
    if (!canPlay || isPlaying) return
    setState('loading')
    startPlay()
  }

  useEffect(() => {
    if (state !== 'loading' || !playResult) return
    const grid = buildLotteryGrid(playResult.won, playResult.reward)
    setCells(grid)
    setRevealed(Array(TOTAL).fill(false))
    setState('scratching')

    grid.forEach((_, i) => {
      setTimeout(() => {
        setRevealed(prev => prev.map((v, j) => (j <= i ? true : v)))
      }, i * 120)
    })
    const doneTimer = setTimeout(() => {
      setRevealed(Array(TOTAL).fill(true))
      setState('done')
    }, TOTAL * 120 + 400)
    return () => clearTimeout(doneTimer)
  }, [state, playResult])

  useEffect(() => {
    if (playError && state === 'loading') setState('idle')
  }, [playError, state])

  if (state === 'done' && playResult?.won && playResult.reward) {
    return (
      <WinCelebration
        reward={playResult.reward.name}
        emoji={playResult.reward.icon || '🎟️'}
        code={playResult.code ?? undefined}
        businessName={businessName}
        onBackToCafe={goToCafe}
      />
    )
  }

  if (state === 'done' && playResult && !playResult.won) {
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

  const revealedCount = revealed.filter(Boolean).length

  return (
    <div
      className="min-h-dvh flex flex-col px-5 pt-12 pb-8"
      style={{ background: 'linear-gradient(165deg, #43036d 0%, #2d110e 38%, #1c0038 100%)' }}
    >
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-white/50 text-sm mb-6 self-start bg-transparent border-0 cursor-pointer"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="text-center mb-6">
        <h1 className="text-2xl font-extrabold text-white mb-1">{campaign?.name ?? 'Lottery'}</h1>
        <p className="text-sm text-white/60">
          {playError || (state === 'scratching' ? `Revealing… ${revealedCount}/${TOTAL}` : 'Scratch to reveal · Match 3 to win')}
        </p>
      </div>

      <div
        className="rounded-3xl overflow-hidden mb-5"
        style={{
          border: '2px solid rgba(245,197,24,0.5)',
          boxShadow: '0 0 40px rgba(245,197,24,0.15)',
        }}
      >
        <div className="px-5 py-3 flex items-center justify-between bg-gradient-to-r from-[#F5C518] to-[#D97706]">
          <p className="text-base font-extrabold text-black">🎟️ LUCKY DRAW</p>
          <p className="text-[10px] font-bold text-black/70">Match 3 to Win</p>
        </div>

        <div className="p-5 bg-[#1E0A5C]">
          <div className="grid grid-cols-3 gap-2.5 max-w-[240px] mx-auto">
            {Array.from({ length: TOTAL }, (_, i) => (
              <ScratchCell
                key={i}
                revealed={revealed[i]}
                cell={cells[i] ?? null}
                onReveal={() => {
                  if (state !== 'scratching') return
                  setRevealed(prev => prev.map((v, j) => (j === i ? true : v)))
                }}
                disabled={state !== 'scratching'}
              />
            ))}
          </div>
        </div>
      </div>

      {state === 'idle' && (
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={beginPlay}
          disabled={!canPlay || isPlaying}
          className="w-full py-5 rounded-2xl text-base font-extrabold text-white border-0 cursor-pointer disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}
        >
          {isPlaying ? 'Loading ticket…' : '🎟️ Scratch & Play'}
        </motion.button>
      )}

      {playState && state === 'idle' && (
        <p className="text-center text-[10px] text-white/40 mt-3">
          {playState.playsUsedToday}/{playState.playsPerDay} attempts today
        </p>
      )}
    </div>
  )
}
