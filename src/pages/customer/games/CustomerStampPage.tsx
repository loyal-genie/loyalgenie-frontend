import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { WinCelebration } from '@/components/customer/win-celebration'

const TOTAL = 8
const CURRENT_STAMPS = 2
const BIG_REWARD_POS = 8
const SURPRISE_POSITIONS = [3, 6]
const REWARDS: Record<number, string> = {
  3: 'Free Coffee ☕',
  6: '20% Off Your Bill',
  8: 'Free Signature Breakfast 🍳',
}

type State = 'card' | 'entering-code' | 'stamped' | 'surprise' | 'big-win'

export function CustomerStampPage() {
  const navigate = useNavigate()
  const [stamps, setStamps] = useState(CURRENT_STAMPS)
  const [state, setState] = useState<State>('card')
  const [lastStamp, setLastStamp] = useState<number | null>(null)
  const [surpriseReward, setSurpriseReward] = useState('')
  const [code, setCode] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const openCodeModal = () => {
    if (stamps >= TOTAL) return
    setState('entering-code')
    setTimeout(() => inputRef.current?.focus(), 300)
  }

  const redeemCode = () => {
    if (code.replace(/[^a-zA-Z0-9]/g, '').length < 4) return
    const newCount = stamps + 1
    setStamps(newCount)
    setLastStamp(newCount)
    setCode('')

    if (newCount === BIG_REWARD_POS) {
      setTimeout(() => setState('big-win'), 800)
    } else if (SURPRISE_POSITIONS.includes(newCount)) {
      setSurpriseReward(REWARDS[newCount] ?? 'Mystery Treat 🎁')
      setTimeout(() => setState('surprise'), 600)
    } else {
      setState('stamped')
      setTimeout(() => setState('card'), 1500)
    }
  }

  if (state === 'big-win') {
    return <WinCelebration reward="Free Signature Breakfast 🍳" emoji="🏆" />
  }
  if (state === 'surprise' && surpriseReward) {
    return <WinCelebration reward={surpriseReward} emoji="⭐" onClose={() => setState('card')} />
  }

  return (
    <div
      className="min-h-screen flex flex-col px-5 pt-12 pb-8"
      style={{ background: 'linear-gradient(145deg, #1A0545 0%, #2D1B69 45%, #0D0B1E 100%)' }}
    >
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-white/50 hover:text-white/70 transition-colors text-sm mb-6 self-start"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="text-center mb-6">
        <h1 className="text-2xl font-extrabold text-white mb-1">Stamp Card</h1>
        <p className="text-sm text-white/60">Collect all {TOTAL} stamps for the big reward!</p>
      </div>

      {/* Stamp card hero */}
      <motion.div
        className="rounded-3xl overflow-hidden mb-6 relative"
        style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}
        animate={{ scale: [1, 1.01, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Watermark coffee */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <span className="text-8xl opacity-10">☕</span>
        </div>

        <div className="relative p-5">
          {/* Top row */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold text-white bg-black/20 px-2 py-0.5 rounded-full uppercase tracking-wide">
              STAMP CARD
            </span>
            <span className="text-xs font-bold text-white/80">Amber Cafe</span>
          </div>

          {/* Stamp grid: 4×2 */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {Array.from({ length: TOTAL }, (_, i) => {
              const n = i + 1
              const isFilled = n <= stamps
              const isSurprise = SURPRISE_POSITIONS.includes(n)
              const isBig = n === BIG_REWARD_POS
              const isJustStamped = n === lastStamp && state === 'stamped'

              return (
                <div
                  key={n}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl border-2 relative overflow-hidden ${
                    isBig
                      ? isFilled
                        ? 'border-yellow-300/80 bg-yellow-300/20'
                        : 'border-yellow-300/80 bg-black/20'
                      : isSurprise
                      ? isFilled
                        ? 'border-white/60 bg-white/20'
                        : 'border-white/60 border-dashed bg-black/10'
                      : isFilled
                      ? 'border-white/60 bg-white/30'
                      : 'border-white/20 bg-black/20'
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {isFilled ? (
                      <motion.span
                        key={`filled-${n}`}
                        initial={isJustStamped ? { scale: 0, rotate: -20 } : { scale: 1 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                        className={isJustStamped ? 'stamp-animate' : ''}
                      >
                        {isBig ? '🏆' : isSurprise ? '⭐' : '☕'}
                      </motion.span>
                    ) : (
                      <motion.span
                        key={`empty-${n}`}
                        className="text-white/30 text-sm font-bold"
                      >
                        {n}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>

          {/* Bottom of card */}
          <div className="flex items-center justify-between">
            <p className="text-white font-bold text-lg">
              {stamps} <span className="text-white/60 text-sm font-medium">/ {TOTAL}</span>
            </p>
            <p className="text-white/70 text-xs">stamps collected</p>
          </div>
        </div>
      </motion.div>

      {/* Upcoming rewards */}
      <div className="glass rounded-2xl p-4 mb-6">
        <p className="text-xs text-white/50 font-semibold mb-3 uppercase tracking-wide">Upcoming Rewards</p>
        <div className="space-y-2.5">
          {Object.entries(REWARDS).map(([pos, reward]) => {
            const posNum = Number(pos)
            const earned = stamps >= posNum
            return (
              <div key={pos} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {earned ? (
                    <span className="text-sm text-green-400">✓</span>
                  ) : (
                    <div
                      className="w-5 h-5 rounded-full text-[9px] flex items-center justify-center font-bold text-white"
                      style={{ background: 'rgba(255,255,255,0.1)' }}
                    >
                      {posNum}
                    </div>
                  )}
                  <span className={`text-sm ${earned ? 'line-through text-white/30' : 'text-white/80'}`}>
                    {reward}
                  </span>
                </div>
                <span className="text-xs text-white/40">At Stamp {posNum}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* CTA */}
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={stamps >= TOTAL ? undefined : openCodeModal}
        disabled={stamps >= TOTAL}
        className="w-full py-5 rounded-2xl text-base font-bold transition-all disabled:opacity-60"
        style={{
          background: stamps >= TOTAL ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #F5C518, #F59E0B)',
          color: stamps >= TOTAL ? 'white' : '#08071A',
          boxShadow: stamps >= TOTAL ? 'none' : '0 8px 32px rgba(245,197,24,0.35)',
        }}
      >
        {stamps >= TOTAL ? 'Card Complete! 🎉' : 'Collect Stamp ✦'}
      </motion.button>

      {/* Code entry modal */}
      <AnimatePresence>
        {state === 'entering-code' && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/60 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setState('card')}
            />
            {/* Bottom sheet */}
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl p-6"
              style={{ background: 'linear-gradient(180deg, #2D1B69, #1A0545)' }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6" />
              <h3 className="text-lg font-extrabold text-white mb-1 text-center">Enter Staff Code</h3>
              <p className="text-sm text-white/50 text-center mb-6">Enter the code shared by the staff</p>

              <input
                ref={inputRef}
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && redeemCode()}
                maxLength={10}
                placeholder="e.g. ABC-123"
                className="w-full rounded-2xl px-4 py-4 text-center text-xl font-mono font-bold text-white placeholder:text-white/20 outline-none mb-4"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
              />

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={redeemCode}
                disabled={code.replace(/[^a-zA-Z0-9]/g, '').length < 4}
                className="w-full py-4 rounded-2xl font-bold text-white text-base disabled:opacity-40 transition-all"
                style={{ background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' }}
              >
                Redeem Code ✓
              </motion.button>

              <button
                onClick={() => setState('card')}
                className="w-full mt-3 py-3 text-white/40 text-sm hover:text-white/60 transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
