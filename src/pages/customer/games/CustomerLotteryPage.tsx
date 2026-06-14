import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { WinCelebration, NoWin } from '@/components/customer/win-celebration'

const TIERS = [
  { name: 'Jackpot', emoji: '👑', reward: 'Free Month', color: '#F5C518', probability: 0.02 },
  { name: 'Gold',    emoji: '🍳', reward: 'Free Breakfast', color: '#F59E0B', probability: 0.08 },
  { name: 'Silver',  emoji: '☕', reward: 'Free Coffee', color: '#9B93C8', probability: 0.25 },
  { name: 'Bronze',  emoji: '🏷️', reward: '₹50 Off', color: '#CD7F32', probability: 0.35 },
] as const

const NO_WIN_TIER = { emoji: '❌', reward: 'No Win', color: 'rgba(255,255,255,0.15)' }

const ROWS = 3
const COLS = 3
const TOTAL = ROWS * COLS

type CellValue = { emoji: string; reward: string; color: string }
type State = 'idle' | 'scratching' | 'done'

function generateTicket(): CellValue[] {
  const r = Math.random()
  let cumulative = 0
  let winTier: typeof TIERS[number] | null = null
  for (const tier of TIERS) {
    cumulative += tier.probability
    if (r < cumulative) { winTier = tier; break }
  }

  const grid: CellValue[] = Array(TOTAL).fill(null).map(() => ({
    emoji: NO_WIN_TIER.emoji,
    reward: NO_WIN_TIER.reward,
    color: NO_WIN_TIER.color,
  }))

  if (winTier) {
    const positions = [0, 1, 2, 3, 4, 5, 6, 7, 8]
    const pos1 = positions.splice(Math.floor(Math.random() * positions.length), 1)[0]
    const pos2 = positions.splice(Math.floor(Math.random() * positions.length), 1)[0]
    const pos3 = positions.splice(Math.floor(Math.random() * positions.length), 1)[0]
    const cell: CellValue = { emoji: winTier.emoji, reward: winTier.reward, color: winTier.color }
    grid[pos1] = cell
    grid[pos2] = cell
    grid[pos3] = cell
  }

  return grid
}

interface ScratchCellProps {
  revealed: boolean
  cell: CellValue | null
  onReveal: () => void
  disabled: boolean
}

function ScratchCell({ revealed, cell, onReveal, disabled }: ScratchCellProps) {
  return (
    <motion.button
      onClick={onReveal}
      disabled={revealed || disabled}
      whileTap={!revealed && !disabled ? { scale: 0.85 } : {}}
      className="aspect-square rounded-2xl flex items-center justify-center relative overflow-hidden cursor-pointer select-none"
      style={{
        background: revealed
          ? (cell ? `${cell.color}20` : 'rgba(255,255,255,0.06)')
          : 'linear-gradient(145deg, #2D1B69, #4C1D95)',
        border: `1px solid ${revealed ? (cell?.color ?? 'rgba(255,255,255,0.1)') + '60' : 'rgba(255,255,255,0.12)'}`,
        boxShadow: revealed && cell && cell.color !== NO_WIN_TIER.color
          ? `0 0 12px ${cell.color}40`
          : 'none',
      }}
    >
      <AnimatePresence mode="wait">
        {!revealed ? (
          <motion.div
            key="hidden"
            exit={{ scale: 0, opacity: 0 }}
            className="text-2xl"
          >
            ?
          </motion.div>
        ) : (
          <motion.div
            key="revealed"
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 18 }}
            className="flex flex-col items-center gap-0.5"
          >
            <span className="text-xl">{cell?.emoji ?? '❌'}</span>
            <span
              className="text-[7px] font-bold leading-tight text-center px-1"
              style={{ color: cell?.color ?? 'rgba(255,255,255,0.3)' }}
            >
              {cell?.reward ?? 'No Win'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

export function CustomerLotteryPage() {
  const navigate = useNavigate()
  const [state, setState] = useState<State>('idle')
  const [cells, setCells] = useState<CellValue[]>([])
  const [revealed, setRevealed] = useState<boolean[]>(Array(TOTAL).fill(false))
  const [won, setWon] = useState(false)
  const [wonReward, setWonReward] = useState('')
  const [wonEmoji, setWonEmoji] = useState('')
  const serialNo = `LG-2026-${Math.floor(10000 + Math.random() * 90000)}`

  const initTicket = () => {
    const ticket = generateTicket()
    setCells(ticket)
    setRevealed(Array(TOTAL).fill(false))
    setState('scratching')
    return ticket
  }

  const checkWin = (revealedCells: CellValue[], allRevealed: boolean[]) => {
    const allDone = allRevealed.every(Boolean)
    if (!allDone) return

    const valueCounts: Record<string, { count: number; cell: CellValue }> = {}
    revealedCells.forEach(c => {
      if (!valueCounts[c.reward]) valueCounts[c.reward] = { count: 0, cell: c }
      valueCounts[c.reward].count++
    })
    const winEntry = Object.values(valueCounts).find(v => v.cell.reward !== NO_WIN_TIER.reward && v.count >= 3)
    setTimeout(() => {
      if (winEntry) {
        setWon(true)
        setWonReward(winEntry.cell.reward)
        // find emoji from TIERS
        const tier = TIERS.find(t => t.reward === winEntry.cell.reward)
        setWonEmoji(tier?.emoji ?? '🎟️')
      } else {
        setWon(false)
      }
      setState('done')
    }, 800)
  }

  const revealCell = (idx: number) => {
    let ticket = cells
    if (state === 'idle') {
      ticket = initTicket()
    }
    if (state === 'done') return
    if (revealed[idx]) return

    const newRevealed = revealed.map((v, i) => (i === idx ? true : v))
    setRevealed(newRevealed)
    checkWin(ticket, newRevealed)
  }

  const revealAll = () => {
    let ticket = cells
    if (state === 'idle') {
      ticket = initTicket()
    }
    if (state === 'done') return

    const allTrue = Array(TOTAL).fill(true)
    ticket.forEach((_, i) => {
      setTimeout(() => {
        setRevealed(prev => prev.map((v, j) => (j <= i ? true : v)))
      }, i * 150)
    })
    setTimeout(() => {
      setRevealed(allTrue)
      checkWin(ticket, allTrue)
    }, TOTAL * 150 + 50)
  }

  if (state === 'done' && won) return <WinCelebration reward={wonReward} emoji={wonEmoji} />
  if (state === 'done' && !won) return <NoWin />

  const revealedCount = revealed.filter(Boolean).length

  return (
    <div
      className="min-h-screen flex flex-col px-5 pt-12 pb-8"
      style={{ background: 'linear-gradient(145deg, #1A0545 0%, #2D1B69 45%, #0D0B1E 100%)' }}
    >
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-white/50 hover:text-white/70 transition-colors text-sm mb-6 self-start"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="text-center mb-6">
        <h1 className="text-2xl font-extrabold text-white mb-1">Lottery!</h1>
        <p className="text-sm text-white/60">Tap cells to reveal · Match 3 to Win</p>
      </div>

      {/* Ticket */}
      <div
        className="rounded-3xl overflow-hidden mb-5"
        style={{
          border: '2px solid rgba(245,197,24,0.5)',
          boxShadow: '0 0 40px rgba(245,197,24,0.15), 0 20px 60px rgba(0,0,0,0.6)',
          background: 'linear-gradient(180deg, #1E0A5C 0%, #0D0B1E 100%)',
        }}
      >
        {/* Ticket header */}
        <div
          className="px-5 py-3 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, #F5C518, #D97706)' }}
        >
          <div>
            <p className="text-[10px] font-black text-black/60 uppercase tracking-widest">Lucky Draw</p>
            <p className="text-base font-extrabold text-black">🎟️ LUCKY DRAW</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-black/60">Amber Cafe</p>
            <p className="text-[10px] font-bold text-black/80">Match 3 to Win</p>
          </div>
        </div>

        {/* Grid */}
        <div className="p-5">
          <div className="grid grid-cols-3 gap-2.5 max-w-[240px] mx-auto">
            {Array.from({ length: TOTAL }, (_, i) => (
              <ScratchCell
                key={i}
                revealed={revealed[i]}
                cell={cells[i] ?? null}
                onReveal={() => revealCell(i)}
                disabled={state === 'done'}
              />
            ))}
          </div>
        </div>

        {/* Ticket footer */}
        <div
          className="px-5 py-2.5 flex items-center justify-between"
          style={{ borderTop: '1px dashed rgba(245,197,24,0.3)' }}
        >
          <p className="font-mono text-[10px] text-white/30 tracking-wider">{serialNo}</p>
          <p className="text-[9px] text-white/20">Terms apply</p>
        </div>
      </div>

      {/* Progress */}
      {state === 'scratching' && (
        <p className="text-center text-xs text-white/40 mb-4">
          {revealedCount} / {TOTAL} revealed
        </p>
      )}

      {/* Prize legend */}
      <div className="glass rounded-2xl p-4 mb-5">
        <p className="text-xs text-white/50 font-semibold mb-2.5 uppercase tracking-wide text-center">Prize Tiers</p>
        <div className="grid grid-cols-2 gap-2">
          {TIERS.map(t => (
            <div
              key={t.name}
              className="flex items-center gap-2 rounded-xl px-3 py-2"
              style={{ background: `${t.color}15`, border: `1px solid ${t.color}30` }}
            >
              <span className="text-base">{t.emoji}</span>
              <div>
                <p className="text-[10px] font-bold" style={{ color: t.color }}>{t.name}</p>
                <p className="text-[9px] text-white/50">{t.reward}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA buttons */}
      <div className="space-y-3">
        {state === 'scratching' && revealedCount < TOTAL && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={revealAll}
            className="w-full py-3.5 rounded-2xl glass text-white text-sm font-semibold"
          >
            Reveal All
          </motion.button>
        )}
        {state === 'idle' && (
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => revealAll()}
            className="w-full py-5 rounded-2xl text-base font-extrabold transition-all"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(139,92,246,0.4)',
            }}
          >
            🎟️ Reveal Ticket
          </motion.button>
        )}
      </div>
    </div>
  )
}
