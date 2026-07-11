import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useLotteryPlay } from '@/hooks/useLotteryPlay'
import { getCustomerBusinessPath } from '@/lib/customer-ui'
import { fmtCampaignDate } from '@/lib/campaign-dates'

type State = 'idle' | 'claiming' | 'claimed'

const SPARKLE_POS = [
  { top: '10%', left: '6%' }, { top: '16%', right: '7%' },
  { top: '42%', left: '3%' }, { top: '38%', right: '4%' },
  { bottom: '38%', left: '8%' }, { bottom: '30%', right: '7%' },
]

function padTicketNo(n: number) {
  return String(n).padStart(4, '0')
}

function daysUntilDraw(drawDate: string): number {
  const end = new Date(`${drawDate}T12:00:00`)
  const now = new Date()
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86400000))
}

export function CustomerLotteryPage() {
  const navigate = useNavigate()
  const {
    businessId,
    businessName,
    campaignName,
    drawDate,
    prizes,
    jackpot,
    loading,
    canClaim,
    claimResult,
    claimError,
    isClaiming,
    claimTicket,
    lotteryState,
    campaignId,
  } = useLotteryPlay()

  const [uiState, setUiState] = useState<State>('idle')

  useEffect(() => {
    if (claimResult) setUiState('claimed')
  }, [claimResult])

  useEffect(() => {
    if (claimError && uiState === 'claiming') setUiState('idle')
  }, [claimError, uiState])

  const ticketNumber = claimResult?.ticketNumber ?? lotteryState?.ticket?.ticketNumber
  const serialCode = claimResult?.serialCode ?? lotteryState?.ticket?.serialCode
  const displayPrizes = claimResult?.prizes ?? prizes

  const daysLeft = useMemo(() => (drawDate ? daysUntilDraw(drawDate) : 0), [drawDate])

  const goBack = () => {
    if (businessId) navigate(getCustomerBusinessPath(businessId), { replace: true })
    else navigate('/customer', { replace: true })
  }

  const goToStatus = () => {
    if (campaignId) {
      navigate(`/customer/campaigns/${campaignId}/lottery-status`)
      return
    }
    goBack()
  }

  const handleClaim = () => {
    if (!canClaim || uiState !== 'idle') return
    setUiState('claiming')
    claimTicket()
  }

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center" style={{ background: 'linear-gradient(145deg, #1A0A00, #2C1600, #0D0B1E)' }}>
        <Loader2 className="size-8 animate-spin text-amber-300" />
      </div>
    )
  }

  const showClaimed = uiState === 'claimed' || Boolean(claimResult)

  return (
    <div
      className="min-h-dvh flex flex-col px-5 pt-12 pb-8 relative overflow-hidden max-w-[440px] mx-auto"
      style={{ background: 'linear-gradient(145deg, #1A0A00 0%, #2C1600 40%, #0D0B1E 100%)' }}
    >
      <div className="absolute top-20 -left-20 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(245,197,24,0.2) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <div className="absolute bottom-32 -right-20 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(217,119,6,0.18) 0%, transparent 70%)', filter: 'blur(48px)' }} />

      {!showClaimed && SPARKLE_POS.map((pos, i) => (
        <motion.div key={i} className="absolute text-yellow-300/20 pointer-events-none select-none" style={pos}
          animate={{ opacity: [0.15, 0.6, 0.15], scale: [0.8, 1.2, 0.8], rotate: [0, 12, 0] }}
          transition={{ duration: 2.5 + i * 0.35, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}>
          ✦
        </motion.div>
      ))}

      <button type="button" onClick={goBack}
        className="absolute top-12 left-4 w-9 h-9 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center z-20 border-0 cursor-pointer">
        <ArrowLeft className="w-4 h-4 text-white" />
      </button>
      <p className="absolute top-14 right-4 text-[10px] text-white/30 z-20">Lucky Draw</p>

      <div className="flex-1 flex flex-col justify-center relative z-10 gap-6 mt-8">
        <AnimatePresence mode="wait">
          {!showClaimed ? (
            <motion.div key="pre" className="flex flex-col gap-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="text-center">
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-6xl mb-3"
                >
                  🎟️
                </motion.div>
                <h1 className="text-xl font-bold text-amber-100">{campaignName}</h1>
                <p className="text-sm text-amber-200/70 mt-1">{businessName}</p>
                {jackpot && (
                  <p className="text-sm font-semibold text-amber-300 mt-2">
                    👑 {jackpot.reward}
                  </p>
                )}
              </div>

              {drawDate && (
                <div className="rounded-2xl border border-amber-400/25 bg-amber-400/10 px-5 py-4 text-center backdrop-blur-sm">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-amber-200/60">Draw in</p>
                  <p className="text-2xl font-black text-amber-300 mt-1">{daysLeft} day{daysLeft !== 1 ? 's' : ''}</p>
                  <p className="text-xs text-amber-200/50 mt-1">{fmtCampaignDate(drawDate)}</p>
                </div>
              )}

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-2">Prizes</p>
                <div className="space-y-1.5">
                  {displayPrizes.map((p, i) => (
                    <div key={`${p.name}-${i}`} className="flex justify-between text-xs">
                      <span className="text-white/80">{p.icon ?? '🎁'} {p.name}</span>
                      <span className="text-amber-200/80 font-medium">{p.reward}</span>
                    </div>
                  ))}
                </div>
              </div>

              {claimError && (
                <p className="text-center text-sm text-red-300">{claimError}</p>
              )}

              <motion.button
                type="button"
                onClick={handleClaim}
                disabled={!canClaim || isClaiming || uiState === 'claiming'}
                whileTap={{ scale: 0.97 }}
                className="w-full py-4 rounded-2xl font-bold text-base disabled:opacity-50 border-0 cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #F5C518 0%, #D97706 100%)',
                  color: '#1A0A00',
                  boxShadow: '0 8px 32px rgba(245,197,24,0.35)',
                }}
              >
                {isClaiming || uiState === 'claiming' ? (
                  <span className="inline-flex items-center gap-2"><Loader2 className="size-4 animate-spin" /> Claiming…</span>
                ) : (
                  '🎟️ Claim My Ticket'
                )}
              </motion.button>
            </motion.div>
          ) : (
            <motion.div key="claimed" className="flex flex-col gap-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="text-center">
                <motion.p
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="text-2xl font-black text-amber-300"
                >
                  You&apos;re in! 🎉
                </motion.p>
                <p className="text-sm text-amber-200/70 mt-1">
                  Good luck on {drawDate ? fmtCampaignDate(drawDate) : 'draw day'}
                </p>
              </div>

              <motion.div
                initial={{ rotateX: 90, opacity: 0 }}
                animate={{ rotateX: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.1 }}
                className="rounded-2xl overflow-hidden shadow-2xl"
                style={{ perspective: 800 }}
              >
                <div className="px-4 py-3 text-center" style={{ background: 'linear-gradient(135deg, #F5C518, #D97706)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-amber-950/70">Lucky Draw Ticket</p>
                  <p className="text-sm font-bold text-amber-950">{campaignName}</p>
                  <p className="text-[10px] text-amber-950/60">{businessName}</p>
                </div>
                <div className="px-6 py-8 text-center relative" style={{ background: 'linear-gradient(180deg, #1E0A00, #120800)' }}>
                  <p className="text-[10px] text-amber-400/50 uppercase tracking-widest">Ticket Number</p>
                  <p className="text-5xl font-black mt-2" style={{ color: '#F5C518', textShadow: '0 0 24px rgba(245,197,24,0.4)' }}>
                    #{ticketNumber != null ? padTicketNo(ticketNumber) : '----'}
                  </p>
                  <div className="my-4 border-t border-dashed border-amber-400/20" />
                  <p className="text-[10px] text-amber-400/40">Serial {serialCode ?? '—'}</p>
                  {drawDate && <p className="text-xs text-amber-300/60 mt-2">Draw: {fmtCampaignDate(drawDate)}</p>}
                </div>
              </motion.div>

              <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-3 text-center">
                <p className="text-xs text-amber-200/70">
                  Ticket saved. Check Status anytime — winners move to your wallet after the draw.
                </p>
              </div>

              <motion.button
                type="button"
                onClick={goToStatus}
                whileTap={{ scale: 0.97 }}
                className="w-full py-4 rounded-2xl font-bold text-base border-0 cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #F5C518 0%, #D97706 100%)',
                  color: '#1A0A00',
                  boxShadow: '0 8px 32px rgba(245,197,24,0.35)',
                }}
              >
                Check Status →
              </motion.button>

              <button type="button" onClick={goBack}
                className="text-sm text-amber-300/80 hover:text-amber-200 transition-colors bg-transparent border-0 cursor-pointer">
                ← Back to {businessName}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
