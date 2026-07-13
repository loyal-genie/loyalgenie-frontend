import { Gift, Package } from 'lucide-react'
import { CampaignPinDetailShell, CampaignDetailCoverChip } from '@/components/customer/CampaignPinDetailShell'
import { PinKeypad } from '@/components/customer/PinKeypad'
import { getCampaignTheme } from '@/lib/campaign-themes'
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
  const theme = getCampaignTheme('combo')
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
    <CampaignPinDetailShell
      mechanic="combo"
      title={campaign.name}
      subtitle="Claim a bundled package deal before spots run out."
      onBack={onBack}
      loading={loading && !hasClaimed}
      coverExtra={
        remaining != null && total != null ? (
          <CampaignDetailCoverChip>{remaining} of {total} spots left</CampaignDetailCoverChip>
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
            submitLabel="Claim combo"
            submitColor={theme.accent}
          />
        )
      }
    >
      <div className="rounded-2xl border border-lime-100 bg-lime-50/90 p-4">
        <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-lime-700/70">
          <Gift className="size-3.5" /> Your combo
        </p>
        <p className="text-2xl font-black tracking-tight text-lime-950">{rewardName}</p>
        <p className="mt-1.5 text-sm font-semibold text-lime-800/80">{offerSentence}</p>
        {terms ? (
          <div className="mt-3 rounded-xl border border-lime-200/60 bg-white/80 px-3 py-2.5">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-lime-700/55">Terms</p>
            <p className="whitespace-pre-wrap text-xs leading-relaxed text-lime-950/85">{terms}</p>
          </div>
        ) : null}
        {remaining != null && total != null && (
          <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-lime-800/70">
            <Package className="size-3.5" /> {remaining} of {total} spots left
          </p>
        )}
      </div>
    </CampaignPinDetailShell>
  )
}
