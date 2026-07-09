import { ArrowLeft, Gift, Loader2, Ticket } from 'lucide-react'
import { PinKeypad } from '@/components/customer/PinKeypad'
import { getCustomerMechanicChipLabel } from '@/lib/customer-ui'
import { fmtCampaignDate } from '@/lib/campaign-dates'
import type { PublicCampaign } from '@/lib/api'

function LotteryIcon() {
  return (
    <div className="relative flex size-[88px] items-center justify-center rounded-[22px] bg-white/10 border border-white/20 shadow-[0_0_24px_rgba(245,197,24,0.35)]">
      <div className="absolute inset-0 rounded-[22px] ring-2 ring-amber-300/40 ring-offset-2 ring-offset-transparent" />
      <span className="text-4xl" aria-hidden>🎟️</span>
    </div>
  )
}

interface LotteryCampaignDetailProps {
  campaign: PublicCampaign
  pin: string
  error?: string
  loading?: boolean
  hasTicket?: boolean
  drawDate?: string
  totalTickets?: number
  onBack: () => void
  onKey: (digit: string) => void
  onDelete: () => void
  onSubmit: () => void
}

export function LotteryCampaignDetail({
  campaign,
  pin,
  error,
  loading,
  hasTicket,
  drawDate,
  totalTickets,
  onBack,
  onKey,
  onDelete,
  onSubmit,
}: LotteryCampaignDetailProps) {
  const prizes = campaign.lotteryConfig?.prizes ?? campaign.rewards.map((r, i) => ({
    tier: (r.tier === 'jackpot' ? 'jackpot' : 'prize') as 'jackpot' | 'prize',
    name: r.description || (r.tier === 'jackpot' ? 'Grand Prize' : `Prize ${i + 1}`),
    reward: r.name,
    icon: r.icon,
  }))
  const draw = drawDate ?? campaign.drawDate ?? campaign.endDate

  return (
    <div
      className="min-h-dvh flex flex-col relative max-w-[440px] mx-auto"
      style={{ background: 'linear-gradient(180deg, #f59e0b 0%, #92400e 100%)' }}
    >
      <div className="relative shrink-0 px-4 pt-[max(3rem,env(safe-area-inset-top))] pb-2">
        <button
          type="button"
          onClick={onBack}
          className="absolute top-[max(3rem,env(safe-area-inset-top))] left-4 size-9 rounded-full bg-black/25 backdrop-blur-sm flex items-center justify-center border-0 cursor-pointer"
          aria-label="Go back"
        >
          <ArrowLeft className="size-4 text-white" />
        </button>
        <div className="absolute top-[max(3rem,env(safe-area-inset-top))] right-4 bg-white/95 px-2.5 py-0.5 rounded-full">
          <span className="text-[10px] font-bold text-amber-900">
            {getCustomerMechanicChipLabel('lottery')}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center px-5 pt-2 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <LotteryIcon />

        <h1 className="mt-5 text-center text-xl font-bold text-white">{campaign.name}</h1>
        <p className="mt-1 text-center text-sm font-medium text-amber-100">Enter to win on draw day</p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-200/50 bg-amber-200/10 px-3 py-1.5 text-[11px] font-bold text-amber-100">
            <Ticket className="size-3" /> Draw {fmtCampaignDate(draw)}
          </span>
          {totalTickets != null && totalTickets > 0 && (
            <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-white/80">
              {totalTickets} tickets entered
            </span>
          )}
          {hasTicket && (
            <span className="inline-flex items-center rounded-full border border-emerald-300/40 bg-emerald-400/10 px-3 py-1.5 text-[11px] font-bold text-emerald-100">
              ✓ Ticket claimed
            </span>
          )}
        </div>

        {prizes.length > 0 && (
          <div className="mt-6 w-full rounded-2xl bg-white/10 border border-white/15 p-4 backdrop-blur-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-100/80 mb-3 flex items-center gap-1.5">
              <Gift className="size-3.5" /> Prizes up for grabs
            </p>
            <div className="space-y-2">
              {prizes.map((p, i) => (
                <div key={`${p.name}-${i}`} className="flex items-center justify-between gap-3 rounded-xl bg-black/15 px-3 py-2.5">
                  <span className="text-sm font-semibold text-white flex items-center gap-2 min-w-0">
                    <span>{p.icon ?? (p.tier === 'jackpot' ? '👑' : '🎁')}</span>
                    <span className="truncate">{p.name}</span>
                  </span>
                  <span className="text-xs font-medium text-amber-100 shrink-0">{p.reward}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 w-full">
          {hasTicket ? (
            <div className="rounded-2xl bg-white/95 p-5 text-center">
              <p className="text-sm font-semibold text-amber-900">You already have a ticket!</p>
              <p className="text-xs text-v-text-3 mt-1">Check your wallet for draw status.</p>
            </div>
          ) : (
            <>
              <p className="text-center text-xs text-white/70 mb-4">Enter staff PIN to claim your ticket</p>
              <PinKeypad
                pin={pin}
                onKey={onKey}
                onDelete={onDelete}
                onSubmit={onSubmit}
                submitLabel={loading ? undefined : 'Claim ticket 🎟️'}
                error={error}
                disabled={loading}
              />
              {loading && (
                <div className="flex justify-center mt-4">
                  <Loader2 className="size-6 animate-spin text-white/70" />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
