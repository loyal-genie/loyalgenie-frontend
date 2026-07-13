import { Gift, Handshake, Users } from 'lucide-react'
import { CampaignPinDetailShell, CampaignDetailCoverChip } from '@/components/customer/CampaignPinDetailShell'
import { PinKeypad } from '@/components/customer/PinKeypad'
import { getCampaignTheme } from '@/lib/campaign-themes'
import type { PublicCampaign } from '@/lib/api'
import { formatGroupUnlockRewardLabel, formatGroupUnlockSentence } from '@/lib/groupunlock-campaign-config'

interface GroupUnlockCampaignDetailProps {
  campaign: PublicCampaign
  pin: string
  error?: string
  loading?: boolean
  hasClaimed?: boolean
  groupJoined?: number
  targetParticipants?: number
  onBack: () => void
  onKey: (digit: string) => void
  onDelete: () => void
  onSubmit: () => void
}

export function GroupUnlockCampaignDetail({
  campaign,
  pin,
  error,
  loading,
  hasClaimed,
  groupJoined,
  targetParticipants,
  onBack,
  onKey,
  onDelete,
  onSubmit,
}: GroupUnlockCampaignDetailProps) {
  const theme = getCampaignTheme('groupunlock')
  const config = campaign.groupUnlockConfig
  const rewardName = config
    ? formatGroupUnlockRewardLabel({
        targetParticipants: config.targetParticipants,
        rewardKind: config.rewardKind,
        rewardValue: config.rewardValue,
      })
    : campaign.rewards[0]?.name ?? 'Community Offer'
  const offerSentence = config
    ? formatGroupUnlockSentence({
        targetParticipants: config.targetParticipants,
        rewardKind: config.rewardKind,
        rewardValue: config.rewardValue,
      })
    : rewardName
  const target = targetParticipants ?? config?.targetParticipants
  const joined = groupJoined ?? 0

  return (
    <CampaignPinDetailShell
      mechanic="groupunlock"
      title={campaign.name}
      subtitle="Reserve your spot — the reward unlocks when enough people join."
      onBack={onBack}
      loading={loading && !hasClaimed}
      coverExtra={
        <>
          {target != null && (
            <CampaignDetailCoverChip>
              <Users className="mr-1 size-3" />
              {joined} / {target} reserved
            </CampaignDetailCoverChip>
          )}
        </>
      }
      footer={
        hasClaimed ? (
          <div className="rounded-2xl bg-white p-4 text-center">
            <p className="text-sm font-semibold" style={{ color: theme.accent }}>Already reserved</p>
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
            submitLabel="Reserve spot"
            submitColor={theme.accent}
          />
        )
      }
    >
      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/90 p-4">
        <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-700/70">
          <Gift className="size-3.5" /> Community reward
        </p>
        <p className="text-2xl font-black tracking-tight text-indigo-950">{rewardName}</p>
        <p className="mt-1.5 text-sm font-semibold text-indigo-800/80">{offerSentence}</p>
        {target != null && (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1">
            <Handshake className="size-3.5 text-indigo-600" />
            <span className="text-xs font-bold text-indigo-800">
              {joined} / {target} reserved
            </span>
          </div>
        )}
      </div>
    </CampaignPinDetailShell>
  )
}
