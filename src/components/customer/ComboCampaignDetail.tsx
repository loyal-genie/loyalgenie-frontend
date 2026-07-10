import { ArrowLeft, Gift, Loader2, Package } from 'lucide-react'
import { PinKeypad } from '@/components/customer/PinKeypad'
import { getCustomerMechanicChipLabel } from '@/lib/customer-ui'
import type { PublicCampaign } from '@/lib/api'
import { formatComboRewardLabel, formatComboSentence } from '@/lib/combo-campaign-config'

interface ComboCampaignDetailProps {
  campaign: PublicCampaign
  pin: string
  error?: string
  loading?: boolean
  hasClaimed?: boolean
  spotsRemaining?: number
  totalSpots?: number
  onBack: () => void
  onKey: (digit: string) => void
  onDelete: () => void
  onSubmit: () => void
}

export function ComboCampaignDetail({
  campaign,
  pin,
  error,
  loading,
  hasClaimed,
  spotsRemaining,
  totalSpots,
  onBack,
  onKey,
  onDelete,
  onSubmit,
}: ComboCampaignDetailProps) {
  const config = campaign.comboConfig
  const rewardName = config
    ? formatComboRewardLabel({
        variant: config.variant,
        items: config.items ?? [],
        originalPrice: config.originalPrice ?? 0,
        bundlePrice: config.bundlePrice ?? 0,
        paidItems: config.paidItems ?? [],
        freeItems: config.freeItems ?? [],
        totalSpots: config.totalSpots,
        termsAndConditions: config.termsAndConditions ?? '',
      })
    : campaign.rewards[0]?.name ?? 'Combo Deal'
  const offerSentence = config
    ? formatComboSentence({
        variant: config.variant,
        items: config.items ?? [],
        originalPrice: config.originalPrice ?? 0,
        bundlePrice: config.bundlePrice ?? 0,
        paidItems: config.paidItems ?? [],
        freeItems: config.freeItems ?? [],
        totalSpots: config.totalSpots,
        termsAndConditions: config.termsAndConditions ?? '',
      })
    : rewardName
  const terms = config?.termsAndConditions?.trim() || ''
  const total = totalSpots ?? config?.totalSpots
  const remaining = spotsRemaining

  return (
    <div
      className="min-h-dvh flex flex-col relative max-w-[440px] mx-auto overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #f7fee7 0%, #ecfccb 48%, #d9f99d 100%)' }}
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
          className="absolute top-[max(3rem,env(safe-area-inset-top))] left-4 size-9 rounded-full bg-white/45 backdrop-blur-sm flex items-center justify-center border-0 cursor-pointer"
          aria-label="Go back"
        >
          <ArrowLeft className="size-4 text-lime-900" />
        </button>
        <div className="absolute top-[max(3rem,env(safe-area-inset-top))] right-4 bg-white/95 px-2.5 py-0.5 rounded-full">
          <span className="text-[10px] font-bold text-lime-800">
            {getCustomerMechanicChipLabel('combo')}
          </span>
        </div>
      </div>

      <div className="relative flex flex-col items-center px-5 pt-2 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div
          className="relative flex size-[84px] items-center justify-center rounded-[22px]"
          style={{
            background: 'linear-gradient(145deg, #ffffff 0%, #ecfccb 100%)',
            boxShadow: '0 10px 28px rgba(163,230,53,0.28)',
          }}
        >
          <Package className="size-9 text-lime-600" strokeWidth={2.2} />
        </div>

        <h1 className="mt-5 text-center text-xl font-extrabold text-lime-950 tracking-tight">{campaign.name}</h1>
        <p className="mt-1 text-center text-sm font-medium text-lime-800/80">Enter PIN to claim your combo</p>

        <div
          className="relative mt-5 w-full overflow-hidden rounded-[22px]"
          style={{
            background: 'linear-gradient(160deg, #ffffff 0%, #f7fee7 60%, #ecfccb 100%)',
            boxShadow: '0 14px 32px rgba(132,204,22,0.16)',
          }}
        >
          <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 size-5 rounded-full bg-lime-300" />
          <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 size-5 rounded-full bg-lime-300" />

          <div className="relative px-5 py-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-lime-700/70 mb-2 flex items-center gap-1.5">
              <Gift className="size-3.5" /> Your combo
            </p>
            <p className="text-2xl font-black text-lime-950 tracking-tight">{rewardName}</p>
            <p className="text-sm font-semibold text-lime-800/80 mt-1.5">{offerSentence}</p>

            {terms ? (
              <div className="mt-3 rounded-xl bg-lime-50/80 border border-lime-200/60 px-3 py-2.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-lime-700/55 mb-1">Terms</p>
                <p className="text-xs text-lime-950/85 leading-relaxed whitespace-pre-wrap">{terms}</p>
              </div>
            ) : null}

            {remaining != null && total != null && (
              <p className="text-xs font-semibold text-lime-800/70 mt-3">
                {remaining} of {total} spots left
              </p>
            )}
          </div>
        </div>

        <div className="mt-8 w-full">
          {hasClaimed ? (
            <div className="rounded-2xl bg-white/95 p-5 text-center">
              <p className="text-sm font-semibold text-lime-900">Already claimed</p>
              <p className="text-xs text-v-text-3 mt-1">Check your wallet to redeem.</p>
            </div>
          ) : (
            <>
              {error && <p className="mb-3 text-center text-sm text-red-600">{error}</p>}
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="size-7 animate-spin text-lime-700" />
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
