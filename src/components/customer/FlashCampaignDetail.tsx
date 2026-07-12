import { ArrowLeft, Gift, Loader2, Zap } from 'lucide-react'
import { PinKeypad } from '@/components/customer/PinKeypad'
import { getCustomerMechanicChipLabel } from '@/lib/customer-ui'
import type { PublicCampaign } from '@/lib/api'
import { formatFlashRewardLabel } from '@/lib/flash-campaign-config'

interface FlashCampaignDetailProps {
  campaign: PublicCampaign
  pin: string
  error?: string
  loading?: boolean
  hasClaimed?: boolean
  spotsRemaining?: number
  totalSlots?: number
  onBack: () => void
  onKey: (digit: string) => void
  onDelete: () => void
  onSubmit: () => void
}

export function FlashCampaignDetail({
  campaign,
  pin,
  error,
  loading,
  hasClaimed,
  spotsRemaining,
  totalSlots,
  onBack,
  onKey,
  onDelete,
  onSubmit,
}: FlashCampaignDetailProps) {
  const config = campaign.flashConfig
  const rewardName = config
    ? formatFlashRewardLabel({
        totalSlots: config.totalSlots,
        rewardKind: config.rewardKind,
        rewardValue: config.rewardValue,
        termsAndConditions: config.termsAndConditions ?? '',
      })
    : campaign.rewards[0]?.name ?? 'Flash Deal'
  const terms = config?.termsAndConditions?.trim() || ''
  const total = totalSlots ?? config?.totalSlots
  const remaining = spotsRemaining

  return (
    <div
      className="min-h-dvh flex flex-col relative max-w-[440px] mx-auto overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #bae6fd 0%, #7dd3fc 48%, #38bdf8 100%)' }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: 'radial-gradient(circle, white 1.2px, transparent 1.2px)',
          backgroundSize: '20px 20px',
        }}
      />

      <div className="relative shrink-0 px-4 pt-[max(3rem,env(safe-area-inset-top))] pb-2">
        <button
          type="button"
          onClick={onBack}
          className="absolute top-[max(3rem,env(safe-area-inset-top))] left-4 size-9 rounded-full bg-white/40 backdrop-blur-sm flex items-center justify-center border-0 cursor-pointer"
          aria-label="Go back"
        >
          <ArrowLeft className="size-4 text-sky-900" />
        </button>
        <div className="absolute top-[max(3rem,env(safe-area-inset-top))] right-4 bg-white/95 px-2.5 py-0.5 rounded-full">
          <span className="text-[10px] font-bold text-sky-800">
            {getCustomerMechanicChipLabel('flash')}
          </span>
        </div>
      </div>

      <div className="relative flex flex-col items-center px-5 pt-2 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div
          className="relative flex size-[84px] items-center justify-center rounded-[22px]"
          style={{
            background: 'linear-gradient(145deg, #ffffff 0%, #e0f2fe 100%)',
            boxShadow: '0 10px 28px rgba(14,165,233,0.25)',
          }}
        >
          <Zap className="size-9 text-sky-500" strokeWidth={2.2} fill="currentColor" />
        </div>

        <h1 className="mt-5 text-center text-xl font-extrabold text-sky-950 tracking-tight">{campaign.name}</h1>
        <p className="mt-1 text-center text-sm font-medium text-sky-800/80">Enter PIN to claim your flash deal</p>

        <div
          className="relative mt-5 w-full overflow-hidden rounded-[22px]"
          style={{
            background: 'linear-gradient(160deg, #ffffff 0%, #f0f9ff 60%, #e0f2fe 100%)',
            boxShadow: '0 14px 32px rgba(14,165,233,0.18)',
          }}
        >
          <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 size-5 rounded-full bg-sky-400" />
          <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 size-5 rounded-full bg-sky-400" />

          <div className="relative px-5 py-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-700/70 mb-2 flex items-center gap-1.5">
              <Gift className="size-3.5" /> Your flash deal
            </p>
            <p className="text-2xl font-black text-sky-950 tracking-tight">{rewardName}</p>

            {terms ? (
              <div className="mt-3 rounded-xl bg-sky-50/80 border border-sky-200/60 px-3 py-2.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-sky-700/55 mb-1">Terms</p>
                <p className="text-xs text-sky-950/85 leading-relaxed whitespace-pre-wrap">{terms}</p>
              </div>
            ) : null}

            {remaining != null && total != null && (
              <p className="text-xs font-semibold text-sky-800/70 mt-3">
                {remaining} of {total} spots left
              </p>
            )}
          </div>
        </div>

        <div className="mt-8 w-full">
          {hasClaimed ? (
            <div className="rounded-2xl bg-white/95 p-5 text-center">
              <p className="text-sm font-semibold text-sky-900">Already claimed</p>
              <p className="text-xs text-v-text-3 mt-1">Check your wallet to redeem.</p>
            </div>
          ) : (
            <>
              {error && <p className="mb-3 text-center text-sm text-red-600">{error}</p>}
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="size-7 animate-spin text-sky-700" />
                </div>
              ) : (
                <PinKeypad pin={pin} onKey={onKey} onDelete={onDelete} onSubmit={onSubmit} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
