import { Link } from 'react-router-dom'
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
  unlocked?: boolean
  canClaim?: boolean
  groupJoined?: number
  targetParticipants?: number
  businessName?: string
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
  unlocked,
  canClaim = true,
  groupJoined,
  targetParticipants,
  businessName,
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
  const showPin = Boolean(canClaim && !hasClaimed)

  return (
    <CampaignPinDetailShell
      mechanic="groupunlock"
      title={campaign.name}
      subtitle="Reserve your spot — the reward unlocks when enough people join."
      businessName={businessName}
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
          {hasClaimed && (
            <CampaignDetailCoverChip>
              {unlocked ? '✓ Reward unlocked' : '✓ Spot reserved'}
            </CampaignDetailCoverChip>
          )}
        </>
      }
      footer={
        showPin ? (
          <PinKeypad
            pin={pin}
            error={error}
            loading={loading}
            compact
            onKey={onKey}
            onDelete={onDelete}
            onSubmit={onSubmit}
            submitLabel="Reserve Now"
            submitColor={theme.accent}
            submitColorTo={theme.accentTo}
          />
        ) : (
          <div className="rounded-2xl bg-white p-4 text-center space-y-3">
            <div>
              <p className="text-sm font-semibold" style={{ color: theme.accent }}>
                {hasClaimed
                  ? unlocked
                    ? 'Reward unlocked'
                    : 'Spot reserved'
                  : 'Spots full'}
              </p>
              <p className="mt-1 text-xs text-[#6a7282]">
                {hasClaimed
                  ? unlocked
                    ? 'Open Check Status to claim your reward in the wallet.'
                    : 'Check Status until the community target is met — then claim the reward.'
                  : 'This community offer has no spots left.'}
              </p>
            </div>
            {hasClaimed && (
              <Link
                to={`/customer/campaigns/${campaign.id}/groupunlock-status`}
                className="flex w-full items-center justify-center rounded-full border py-2.5 text-xs font-bold no-underline"
                style={{
                  borderColor: `${theme.accent}44`,
                  background: `${theme.accent}0C`,
                  color: theme.accent,
                }}
              >
                Check Status
              </Link>
            )}
          </div>
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
          <Gift className="size-3.5" /> Community reward
        </p>
        <p className="text-2xl font-black tracking-tight text-gray-900">{rewardName}</p>
        <p className="mt-1.5 text-sm font-semibold text-gray-600">{offerSentence}</p>
        {target != null && (
          <div
            className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1"
            style={{ background: `${theme.accent}18` }}
          >
            <Handshake className="size-3.5" style={{ color: theme.accent }} />
            <span className="text-xs font-bold" style={{ color: theme.accent }}>
              {joined} / {target} reserved
            </span>
          </div>
        )}
      </div>
    </CampaignPinDetailShell>
  )
}
