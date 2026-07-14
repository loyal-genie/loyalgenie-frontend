import { Gift, Users } from 'lucide-react'
import { CampaignPinDetailShell, CampaignDetailCoverChip } from '@/components/customer/CampaignPinDetailShell'
import { PinKeypad } from '@/components/customer/PinKeypad'
import { getCampaignTheme } from '@/lib/campaign-themes'
import type { PublicCampaign } from '@/lib/api'
import { formatFriendRewardLabel, formatFriendSentence } from '@/lib/friend-campaign-config'

interface FriendCampaignDetailProps {
  campaign: PublicCampaign
  pin: string
  error?: string
  loading?: boolean
  hasClaimed?: boolean
  spotsRemaining?: number
  userCap?: number
  businessName?: string
  onBack: () => void
  onKey: (digit: string) => void
  onDelete: () => void
  onSubmit: () => void
}

export function FriendCampaignDetail({
  campaign,
  pin,
  error,
  loading,
  hasClaimed,
  spotsRemaining,
  userCap,
  businessName,
  onBack,
  onKey,
  onDelete,
  onSubmit,
}: FriendCampaignDetailProps) {
  const theme = getCampaignTheme('friend')
  const config = campaign.friendConfig
  const rewardName = config
    ? formatFriendRewardLabel({
        minFriends: config.minFriends,
        rewardKind: config.rewardKind,
        rewardValue: config.rewardValue,
      })
    : campaign.rewards[0]?.name ?? 'Bring a Friend'
  const offerSentence = config
    ? formatFriendSentence({
        minFriends: config.minFriends,
        rewardKind: config.rewardKind,
        rewardValue: config.rewardValue,
      })
    : rewardName
  const minFriends = config?.minFriends
  const total = userCap
  const remaining = spotsRemaining

  return (
    <CampaignPinDetailShell
      mechanic="friend"
      title={campaign.name}
      subtitle="Bring friends along and unlock a reward together."
      businessName={businessName}
      onBack={onBack}
      loading={loading && !hasClaimed}
      coverExtra={
        <>
          {minFriends != null && (
            <CampaignDetailCoverChip>
              <Users className="mr-1 size-3" />
              Bring {minFriends} friend{minFriends !== 1 ? 's' : ''}
            </CampaignDetailCoverChip>
          )}
          {remaining != null && total != null && (
            <CampaignDetailCoverChip>{remaining} of {total} claims left</CampaignDetailCoverChip>
          )}
        </>
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
            submitLabel="Claim Now"
            submitColor={theme.accent}
            submitColorTo={theme.accentTo}
          />
        )
      }
    >
      <div
        className="rounded-2xl p-4"
        style={{ background: `${theme.accent}0C`, border: `1px solid ${theme.accent}22` }}
      >
        <p
          className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em]"
          style={{ color: theme.accent }}
        >
          <Gift className="size-3.5" /> Your reward
        </p>
        <p className="text-2xl font-black tracking-tight text-gray-900">{rewardName}</p>
        <p className="mt-1.5 text-sm font-semibold text-gray-600">{offerSentence}</p>
      </div>
    </CampaignPinDetailShell>
  )
}
