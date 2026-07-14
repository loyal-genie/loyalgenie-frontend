import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Handshake, Loader2, Users } from 'lucide-react'
import { fetchGroupUnlockState, getApiErrorMessage } from '@/lib/api'
import { getCampaignTheme, getPlayScreenBackground } from '@/lib/campaign-themes'
import { getUser } from '@/lib/auth'
import { CampaignLampClaim } from '@/components/customer/CampaignLampClaim'

function statusBadge(unlocked: boolean, walletStatus: string | undefined): { label: string; tone: string } {
  if (!walletStatus) {
    return { label: 'No spot yet', tone: 'bg-gray-100 text-gray-600' }
  }
  if (walletStatus === 'redeemed') {
    return { label: 'Redeemed', tone: 'bg-gray-100 text-gray-600' }
  }
  if (walletStatus === 'pending') {
    return { label: 'Redeem in progress', tone: 'bg-amber-50 text-amber-800' }
  }
  if (walletStatus === 'earned' || unlocked) {
    return { label: 'Reward unlocked', tone: 'bg-emerald-100 text-emerald-800' }
  }
  return { label: 'Spot reserved', tone: 'bg-[#CCFBF1] text-[#115E59]' }
}

export function CustomerGroupUnlockStatusPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const customerId = getUser('customer')?.userId
  const theme = getCampaignTheme('groupunlock')
  const [showLampClaim, setShowLampClaim] = useState(false)

  const { data: state, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['groupunlock-state', id, customerId],
    queryFn: () => fetchGroupUnlockState(id!),
    enabled: Boolean(id) && Boolean(customerId),
    refetchInterval: showLampClaim ? false : 5_000,
  })

  const target = state?.targetParticipants ?? 0
  const joined = state?.groupJoined ?? 0
  const progress = useMemo(
    () => (target > 0 ? Math.min(100, Math.round((joined / target) * 100)) : 0),
    [joined, target],
  )

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center" style={{ background: getPlayScreenBackground('groupunlock') }}>
        <Loader2 className="size-8 animate-spin" style={{ color: theme.accent }} />
      </div>
    )
  }

  if (isError || !state) {
    return (
      <div
        className="min-h-dvh flex flex-col items-center justify-center gap-3 px-6"
        style={{ background: getPlayScreenBackground('groupunlock') }}
      >
        <p className="text-sm text-v-text-2 text-center">
          {getApiErrorMessage(error, 'Could not load community offer status.')}
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="px-4 py-2 rounded-full text-white text-sm font-bold border-0 cursor-pointer"
          style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentTo})` }}
        >
          Retry
        </button>
      </div>
    )
  }

  const unlocked = state.unlocked
  const hasSpot = state.hasClaimed
  const walletStatus = state.walletReward?.status
  const badge = statusBadge(unlocked, walletStatus)
  const canClaimReward =
    hasSpot && unlocked && (walletStatus === 'earned' || walletStatus === 'group_pending' || walletStatus === 'pending')
  const waitingForCommunity = hasSpot && !unlocked && walletStatus === 'group_pending'

  if (showLampClaim && canClaimReward) {
    return (
      <CampaignLampClaim
        mechanic="groupunlock"
        businessName={state.businessName}
        claimedHeadline="Here's Your Community Reward ✨"
        onBack={() => setShowLampClaim(false)}
        preview={{
          sectionLabel: 'Your reward',
          rewardTitle: state.rewardLabel,
          description: state.offerSentence || state.rewardDescription || undefined,
          highlight: `${joined} / ${target} spots filled — unlocked`,
        }}
        onClaim={async () => ({
          reward: state.rewardLabel,
          code: state.walletReward?.code,
          icon: '🤝',
        })}
      />
    )
  }

  return (
    <div
      className="min-h-dvh max-w-[440px] mx-auto flex flex-col"
      style={{ background: getPlayScreenBackground('groupunlock') }}
    >
      <div
        className="relative px-4 pt-[max(3rem,env(safe-area-inset-top))] pb-5"
        style={{ background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accentTo} 100%)` }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute top-[max(3rem,env(safe-area-inset-top))] left-4 size-9 rounded-full bg-black/20 flex items-center justify-center border-0 cursor-pointer"
          aria-label="Go back"
        >
          <ArrowLeft className="size-4 text-white" />
        </button>
        <div className="pt-10 text-center text-white">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/75">Check Status</p>
          <h1 className="text-xl font-bold mt-1">{state.campaignName}</h1>
          <p className="text-sm text-white/80 mt-1">{state.businessName}</p>
          <p className="text-xs text-white/70 mt-2">
            {unlocked ? 'Community target met — reward unlocked' : `${joined} / ${target} spots reserved`}
          </p>
        </div>
      </div>

      <div className="flex-1 px-4 py-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] space-y-3">
        <div
          className="rounded-2xl bg-white p-4 shadow-sm"
          style={{ border: `1px solid ${theme.accent}22` }}
        >
          <div className="flex items-center justify-between gap-3 mb-3">
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: `${theme.accentTo}B3` }}>
              Community progress
            </p>
            <span className="inline-flex items-center gap-1 text-xs font-bold" style={{ color: theme.accentTo }}>
              <Users className="size-3.5" />
              {joined} / {target}
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${theme.accent}, ${theme.accentTo})` }}
            />
          </div>
          <p className="mt-2 text-xs text-v-text-3">
            {unlocked
              ? 'Everyone who reserved a spot can now claim the reward.'
              : `${Math.max(0, target - joined)} more spot${target - joined === 1 ? '' : 's'} needed to unlock the reward.`}
          </p>
        </div>

        {!hasSpot ? (
          <div
            className="rounded-2xl bg-white p-6 text-center shadow-sm"
            style={{ border: `1px solid ${theme.accent}22` }}
          >
            <Handshake className="size-8 mx-auto" style={{ color: theme.accent }} />
            <p className="mt-3 text-sm font-semibold text-v-text">No spot reserved yet</p>
            <p className="mt-1 text-xs text-v-text-3">
              Enter the staff PIN to reserve your spot. The reward unlocks only after the community target is met.
            </p>
            {state.canClaim && (
              <Link
                to={`/customer/campaigns/${state.campaignId}`}
                className="mt-4 inline-flex px-4 py-2.5 rounded-full text-white text-xs font-bold no-underline"
                style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentTo})` }}
              >
                Reserve Spot
              </Link>
            )}
          </div>
        ) : (
          <div
            className="rounded-2xl bg-white p-4 shadow-sm"
            style={{ border: `1px solid ${theme.accent}22` }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-black" style={{ color: theme.accentTo }}>
                  {state.rewardLabel}
                </p>
                <p className="text-[11px] text-v-text-3 mt-0.5">Your community spot</p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full shrink-0 ${badge.tone}`}>
                {badge.label}
              </span>
            </div>

            {waitingForCommunity && (
              <p className="mt-3 text-xs" style={{ color: `${theme.accentTo}CC` }}>
                Spot reserved. Reward stays locked until {target} people join.
              </p>
            )}

            {canClaimReward && walletStatus !== 'redeemed' && (
              <button
                type="button"
                onClick={() => setShowLampClaim(true)}
                className="mt-3 flex w-full items-center justify-center py-2.5 rounded-full text-white text-xs font-bold border-0 cursor-pointer"
                style={{
                  background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentTo})`,
                  boxShadow: `0 8px 20px ${theme.accent}4D`,
                }}
              >
                Claim Reward →
              </button>
            )}

            {walletStatus === 'redeemed' && (
              <Link
                to="/customer/wallet"
                className="mt-3 flex w-full items-center justify-center py-2.5 rounded-full text-white text-xs font-bold no-underline"
                style={{ background: theme.accentTo }}
              >
                Open Wallet
              </Link>
            )}
          </div>
        )}

        {hasSpot && !unlocked && state.active && (
          <p className="text-center text-[11px] text-v-text-3 px-2">
            Check back anytime — this page refreshes as more people reserve spots.
          </p>
        )}
      </div>
    </div>
  )
}
