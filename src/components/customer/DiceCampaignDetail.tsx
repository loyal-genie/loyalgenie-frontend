import { ArrowLeft, Gift, Loader2 } from 'lucide-react'
import { PinKeypad } from '@/components/customer/PinKeypad'
import { DiceFace } from '@/components/shared/DiceFace'
import { getCustomerMechanicChipLabel } from '@/lib/customer-ui'
import { formatShakeWinLabel } from '@/lib/campaign-impact'
import type { PublicCampaign } from '@/lib/api'

function DiceIcon() {
  return (
    <div className="relative flex size-[88px] items-center justify-center rounded-[22px] bg-white/10 border border-white/20 shadow-[0_0_24px_rgba(225,29,72,0.4)]">
      <div className="absolute inset-0 rounded-[22px] ring-2 ring-rose-400/40 ring-offset-2 ring-offset-transparent" />
      <div className="size-11">
        <DiceFace value={5} pipColor="#ffffff" />
      </div>
    </div>
  )
}

interface DiceCampaignDetailProps {
  campaign: PublicCampaign
  pin: string
  error?: string
  loading?: boolean
  winRatePercent?: number
  overallWinners?: number
  userCap?: number
  playsUsedToday?: number
  playsPerDay?: number
  onBack: () => void
  onKey: (digit: string) => void
  onDelete: () => void
  onSubmit: () => void
}

export function DiceCampaignDetail({
  campaign,
  pin,
  error,
  loading,
  winRatePercent,
  overallWinners,
  userCap,
  playsUsedToday,
  playsPerDay,
  onBack,
  onKey,
  onDelete,
  onSubmit,
}: DiceCampaignDetailProps) {
  const winFaces = campaign.diceConfig?.outcomes
    ?.filter(o => o.isWin && (o.reward ?? '').trim())
    .sort((a, b) => a.value - b.value) ?? []
  const prizeChips = winFaces.length > 0
    ? winFaces.map(o => ({ value: o.value, reward: o.reward ?? `Roll ${o.value}` }))
    : campaign.rewards.map((r, i) => ({ value: i + 1, reward: r.name }))

  return (
    <div
      className="min-h-dvh flex flex-col relative max-w-[440px] mx-auto"
      style={{ background: 'linear-gradient(180deg, #fb7185 0%, #be123c 100%)' }}
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
          <span className="text-[10px] font-bold text-[#be123c]">
            {getCustomerMechanicChipLabel('dice')}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center px-5 pt-2 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <DiceIcon />

        <h1 className="mt-5 text-center text-xl font-bold text-white">{campaign.name}</h1>
        <p className="mt-1 text-center text-sm font-medium text-white/85">Roll the Dice</p>

        {((overallWinners != null && userCap != null) || winRatePercent != null || (playsUsedToday != null && playsPerDay != null)) && (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {overallWinners != null && userCap != null && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/50 bg-amber-400/10 px-3 py-1.5 text-[11px] font-bold text-amber-200">
                ✨ {formatShakeWinLabel(overallWinners, userCap)}
              </span>
            )}
            {overallWinners == null && winRatePercent != null && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/50 bg-amber-400/10 px-3 py-1.5 text-[11px] font-bold text-amber-200">
                ✨ {winRatePercent}% of rolls win!
              </span>
            )}
            {playsUsedToday != null && playsPerDay != null && (
              <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-white/75">
                {playsUsedToday}/{playsPerDay} rolls today
              </span>
            )}
          </div>
        )}

        {prizeChips.length > 0 && (
          <div className="mt-5 w-full max-w-[340px] rounded-2xl border border-white/10 bg-white/[0.06] px-3.5 py-3 backdrop-blur-sm">
            <p className="text-center text-[10px] font-bold uppercase tracking-[0.14em] text-white/55 mb-2.5">
              Winning faces
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {prizeChips.map((chip, i) => (
                <span
                  key={`${chip.reward}-${i}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold leading-tight text-[#9f1239] shadow-[0_2px_8px_rgba(0,0,0,0.18)]"
                >
                  <span className="size-3.5 shrink-0" aria-hidden>
                    <DiceFace value={chip.value} pipColor="#9f1239" />
                  </span>
                  {chip.reward}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 w-full max-w-[340px] rounded-[24px] border border-white/10 bg-black/20 px-4 py-5 backdrop-blur-sm">
          <div className="mb-4 flex flex-col items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-white/90">
              <Gift className="size-3.5 shrink-0" aria-hidden />
              Ask staff for PIN
            </span>
            <p className="text-center text-xs text-white/45">Show this screen at the counter</p>
          </div>

          <div className="[&_button:not(:last-child)]:border-white/15 [&_button:not(:last-child)]:bg-white/10 [&_button:not(:last-child)]:text-white [&_.rounded-xl]:border-white/20 [&_.rounded-xl]:bg-white/5 [&_span]:text-white">
            <PinKeypad
              pin={pin}
              error={error}
              loading={loading}
              hideHeader
              onKey={onKey}
              onDelete={onDelete}
              onSubmit={onSubmit}
              submitLabel="Roll the dice"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="mt-4 py-2 text-sm text-white/50 bg-transparent border-0 cursor-pointer"
        >
          Cancel
        </button>
      </div>

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 max-w-[440px] mx-auto">
          <Loader2 className="size-10 text-white animate-spin" />
        </div>
      )}
    </div>
  )
}
