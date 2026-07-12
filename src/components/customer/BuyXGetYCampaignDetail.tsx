import { Gift } from 'lucide-react'
import { CampaignPinDetailShell, CampaignDetailCoverChip } from '@/components/customer/CampaignPinDetailShell'
import { PinKeypad } from '@/components/customer/PinKeypad'
import { getCampaignTheme } from '@/lib/campaign-themes'
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
  const theme = getCampaignTheme('buy-x-get-y')
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
    <CampaignPinDetailShell
      mechanic="buy-x-get-y"
      title={campaign.name}
      subtitle="Buy or spend to unlock a reward."
      onBack={onBack}
      loading={loading && !hasClaimed}
      coverExtra={
        spotsRemaining != null ? (
          <CampaignDetailCoverChip>{spotsRemaining} spots remaining</CampaignDetailCoverChip>
        ) : undefined
      }
      footer={
        hasClaimed ? (
          <div className="rounded-2xl bg-white p-4 text-center">
            <p className="text-sm font-semibold" style={{ color: theme.accent }}>Already claimed</p>
            <p className="mt-1 text-xs text-[#6a7282]">Check your wallet to redeem.</p>
          </div>
        ) : (
          <PinKeypad
            pin={pin}
            error={error}
            loading={loading}
            compact
            onKey={onKey}
            onDelete={onDelete}
            onSubmit={onSubmit}
            submitLabel="Claim offer"
            submitColor={theme.accent}
          />
        )
      }
    >
      <div className="rounded-2xl border border-orange-100 bg-orange-50/80 p-4">
        <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-orange-800/70">
          <Gift className="size-3.5" /> Your reward
        </p>
        <p className="text-lg font-bold text-[#101828]">{rewardName}</p>
        {description && (
          <p className="mt-1.5 text-sm leading-relaxed text-[#6a7282]">{description}</p>
        )}
      </div>
    </CampaignPinDetailShell>
  )
}
