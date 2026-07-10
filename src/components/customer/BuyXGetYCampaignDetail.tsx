import { ArrowLeft, Gift, Loader2 } from 'lucide-react'
import { PinKeypad } from '@/components/customer/PinKeypad'
import { getCustomerMechanicChipLabel } from '@/lib/customer-ui'
import type { PublicCampaign } from '@/lib/api'
import { formatBuyXGetYRewardLabel, formatBuyXGetYSentence } from '@/lib/buy-x-get-y-campaign-config'

interface BuyXGetYCampaignDetailProps {
  campaign: PublicCampaign
  pin: string
  error?: string
  loading?: boolean
  hasClaimed?: boolean
  spotsRemaining?: number
  onBack: () => void
  onKey: (digit: string) => void
  onDelete: () => void
  onSubmit: () => void
}

export function BuyXGetYCampaignDetail({
  campaign,
  pin,
  error,
  loading,
  hasClaimed,
  spotsRemaining,
  onBack,
  onKey,
  onDelete,
  onSubmit,
}: BuyXGetYCampaignDetailProps) {
  const config = campaign.buyXGetYConfig
  const rewardName = config
    ? formatBuyXGetYRewardLabel({
        condition: config.condition,
        buyQuantity: config.buyQuantity,
        spendAmount: config.spendAmount,
        rewardKind: config.rewardKind,
        rewardValue: config.rewardValue,
      })
    : campaign.rewards[0]?.name ?? 'Reward'
  const description =
    campaign.rewards[0]?.description ||
    (config
      ? formatBuyXGetYSentence({
          condition: config.condition,
          buyQuantity: config.buyQuantity,
          spendAmount: config.spendAmount,
          rewardKind: config.rewardKind,
          rewardValue: config.rewardValue,
        })
      : '')

  return (
    <div
      className="min-h-dvh flex flex-col relative max-w-[440px] mx-auto"
      style={{ background: 'linear-gradient(180deg, #f97316 0%, #9a3412 100%)' }}
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
          <span className="text-[10px] font-bold text-orange-900">
            {getCustomerMechanicChipLabel('buy-x-get-y')}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center px-5 pt-2 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="relative flex size-[88px] items-center justify-center rounded-[22px] bg-white/10 border border-white/20 shadow-[0_0_24px_rgba(249,115,22,0.4)]">
          <span className="text-4xl" aria-hidden>💰</span>
        </div>

        <h1 className="mt-5 text-center text-xl font-bold text-white">{campaign.name}</h1>
        <p className="mt-1 text-center text-sm font-medium text-orange-100">Enter PIN to claim your offer</p>

        <div className="mt-5 w-full rounded-2xl bg-white/10 border border-white/15 p-4 backdrop-blur-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-orange-100/80 mb-2 flex items-center gap-1.5">
            <Gift className="size-3.5" /> Your reward
          </p>
          <p className="text-lg font-bold text-white">{rewardName}</p>
          {description && <p className="text-sm text-orange-100/90 mt-1.5 leading-relaxed">{description}</p>}
          {spotsRemaining != null && (
            <p className="text-xs text-orange-200/70 mt-3">{spotsRemaining} spots remaining</p>
          )}
        </div>

        <div className="mt-8 w-full">
          {hasClaimed ? (
            <div className="rounded-2xl bg-white/95 p-5 text-center">
              <p className="text-sm font-semibold text-orange-900">Already claimed</p>
              <p className="text-xs text-v-text-3 mt-1">Check your wallet to redeem.</p>
            </div>
          ) : (
            <>
              {error && <p className="mb-3 text-center text-sm text-red-100">{error}</p>}
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="size-7 animate-spin text-white" />
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
