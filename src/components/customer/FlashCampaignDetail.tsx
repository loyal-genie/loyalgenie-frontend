import { Gift, Zap } from 'lucide-react'
import { CampaignPinDetailShell, CampaignDetailCoverChip } from '@/components/customer/CampaignPinDetailShell'
import { PinKeypad } from '@/components/customer/PinKeypad'
import { getCampaignTheme } from '@/lib/campaign-themes'
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
  const theme = getCampaignTheme('flash')
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
    <CampaignPinDetailShell
      mechanic="flash"
      title={campaign.name}
      subtitle="Limited spots — claim before they run out."
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
            submitLabel="Claim flash deal"
            submitColor={theme.accent}
          />
        )
      }
    >
      <div className="rounded-2xl border border-sky-100 bg-sky-50/90 p-4">
        <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-sky-700/70">
          <Zap className="size-3.5" fill="currentColor" /> Your flash deal
        </p>
        <p className="text-2xl font-black tracking-tight text-sky-950">{rewardName}</p>
        {terms ? (
          <div className="mt-3 rounded-xl border border-sky-200/60 bg-white/80 px-3 py-2.5">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-sky-700/55">Terms</p>
            <p className="whitespace-pre-wrap text-xs leading-relaxed text-sky-950/85">{terms}</p>
          </div>
        ) : null}
        {remaining != null && total != null && (
          <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-sky-800/70">
            <Gift className="size-3.5" /> {remaining} of {total} spots left
          </p>
        )}
      </div>
    </CampaignPinDetailShell>
  )
}
