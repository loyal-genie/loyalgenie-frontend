import { ArrowLeft, Gift, Handshake, Loader2, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PinKeypad } from '@/components/customer/PinKeypad'
import { getCustomerMechanicChipLabel } from '@/lib/customer-ui'
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
    <div
      className="min-h-dvh flex flex-col relative max-w-[440px] mx-auto overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #eef2ff 0%, #e0e7ff 48%, #c7d2fe 100%)' }}
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
          <ArrowLeft className="size-4 text-indigo-900" />
        </button>
        <div className="absolute top-[max(3rem,env(safe-area-inset-top))] right-4 bg-white/95 px-2.5 py-0.5 rounded-full">
          <span className="text-[10px] font-bold text-indigo-800">
            {getCustomerMechanicChipLabel('groupunlock')}
          </span>
        </div>
      </div>

      <div className="relative flex flex-col items-center px-5 pt-2 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div
          className="relative flex size-[84px] items-center justify-center rounded-[22px]"
          style={{
            background: 'linear-gradient(145deg, #ffffff 0%, #e0e7ff 100%)',
            boxShadow: '0 10px 28px rgba(129,140,248,0.28)',
          }}
        >
          <Handshake className="size-9 text-indigo-500" strokeWidth={2.2} />
        </div>

        <h1 className="mt-5 text-center text-xl font-extrabold text-indigo-950 tracking-tight">{campaign.name}</h1>
        <p className="mt-1 text-center text-sm font-medium text-indigo-800/80">Enter PIN to reserve your spot</p>

        <div
          className="relative mt-5 w-full overflow-hidden rounded-[22px]"
          style={{
            background: 'linear-gradient(160deg, #ffffff 0%, #f5f3ff 60%, #eef2ff 100%)',
            boxShadow: '0 14px 32px rgba(99,102,241,0.14)',
          }}
        >
          <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 size-5 rounded-full bg-indigo-300" />
          <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 size-5 rounded-full bg-indigo-300" />

          <div className="relative px-5 py-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-700/70 mb-2 flex items-center gap-1.5">
              <Gift className="size-3.5" /> Community reward
            </p>
            <p className="text-2xl font-black text-indigo-950 tracking-tight">{rewardName}</p>
            <p className="text-sm font-semibold text-indigo-800/80 mt-1.5">{offerSentence}</p>

            {target != null && (
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1">
                <Users className="size-3.5 text-indigo-600" />
                <span className="text-xs font-bold text-indigo-800">
                  {joined} / {target} reserved
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 w-full">
          {hasClaimed ? (
            <div className="rounded-2xl bg-white/95 p-5 text-center">
              <p className="text-sm font-semibold text-indigo-900">Already reserved</p>
              <p className="text-xs text-v-text-3 mt-1">Track group progress on Check Status.</p>
              <Link
                to={`/customer/campaigns/${campaign.id}/groupunlock-status`}
                className="mt-4 flex w-full items-center justify-center py-3 rounded-full bg-gradient-to-r from-[#c7d2fe] to-[#818cf8] text-indigo-950 text-xs font-bold no-underline"
              >
                Check Status
              </Link>
            </div>
          ) : (
            <>
              {error && <p className="mb-3 text-center text-sm text-red-600">{error}</p>}
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="size-7 animate-spin text-indigo-700" />
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
