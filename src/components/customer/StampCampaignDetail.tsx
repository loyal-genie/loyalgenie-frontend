import { CampaignPinDetailShell, CampaignDetailCoverChip } from '@/components/customer/CampaignPinDetailShell'
import { PinKeypad } from '@/components/customer/PinKeypad'
import { StampLoyaltyGrid } from '@/components/customer/StampLoyaltyGrid'
import { getCampaignTheme } from '@/lib/campaign-themes'
import type { PublicCampaign, StampState } from '@/lib/api'

interface StampCampaignDetailProps {
  campaign: PublicCampaign
  businessName: string
  stampState: StampState
  pin: string
  error?: string
  loading?: boolean
  onBack: () => void
  onKey: (digit: string) => void
  onDelete: () => void
  onSubmit: () => void
}

export function StampCampaignDetail({
  campaign,
  businessName,
  stampState,
  pin,
  error,
  loading,
  onBack,
  onKey,
  onDelete,
  onSubmit,
}: StampCampaignDetailProps) {
  const theme = getCampaignTheme('stamp')
  const collected = stampState.stampsCollected
  const total = stampState.totalStamps

  return (
    <CampaignPinDetailShell
      mechanic="stamp"
      title={campaign.name}
      subtitle="Collect stamps — your reward is waiting."
      businessName={businessName}
      onBack={onBack}
      loading={loading}
      coverExtra={
        <CampaignDetailCoverChip
          className="bg-[#FEF3C7] text-[#92400E]"
        >
          {collected}/{total} stamps
        </CampaignDetailCoverChip>
      }
      footer={
        <PinKeypad
          pin={pin}
          error={error}
          loading={loading}
          compact
          onKey={onKey}
          onDelete={onDelete}
          onSubmit={onSubmit}
          submitLabel="Play Now"
          submitColor={theme.accent}
          submitColorTo={theme.accentTo}
        />
      }
    >
      <div
        className="rounded-xl p-3 mb-3"
        style={{ background: `${theme.accent}0C`, border: `1px solid ${theme.accent}22` }}
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
              Stamps collected
            </p>
            <p className="text-2xl font-extrabold" style={{ color: theme.accent }}>
              {collected}
              <span className="text-gray-400 font-bold text-lg">/{total}</span>
            </p>
          </div>
        </div>
        <StampLoyaltyGrid
          total={total}
          collected={collected}
          surpriseDrops={stampState.surpriseDrops}
          bigRewards={stampState.bigRewards}
          dropTriggers={stampState.dropTriggers}
          variant="light"
        />
      </div>
    </CampaignPinDetailShell>
  )
}
