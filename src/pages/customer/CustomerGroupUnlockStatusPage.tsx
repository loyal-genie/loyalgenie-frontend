import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowLeft, CalendarDays, Gift, Handshake, Loader2 } from 'lucide-react'
import { fetchGroupUnlockState, getApiErrorMessage } from '@/lib/api'
import { fmtCampaignDate } from '@/lib/campaign-dates'
import { getUser } from '@/lib/auth'
import { CampaignLampClaim } from '@/components/customer/CampaignLampClaim'
import { getMechanicEmoji } from '@/lib/utils'

const RING_R = 80
const RING_CIRC = 2 * Math.PI * RING_R

function formatMaybeDate(value?: string | null) {
  if (!value) return null
  try {
    return fmtCampaignDate(value)
  } catch {
    return value
  }
}

export function CustomerGroupUnlockStatusPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const customerId = getUser('customer')?.userId
  const [showLampClaim, setShowLampClaim] = useState(false)

  const { data: state, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['groupunlock-state', id, customerId],
    queryFn: () => fetchGroupUnlockState(id!),
    enabled: Boolean(id) && Boolean(customerId),
    refetchInterval: showLampClaim ? false : 5_000,
  })

  const target = state?.targetParticipants ?? 0
  const joined = state?.groupJoined ?? 0
  const remaining = Math.max(0, target - joined)
  const pct = useMemo(
    () => (target > 0 ? Math.min(100, Math.round((joined / target) * 100)) : 0),
    [joined, target],
  )
  const filled = (pct / 100) * RING_CIRC

  if (isLoading) {
    return (
      <div
        className="min-h-dvh flex items-center justify-center"
        style={{ background: 'linear-gradient(160deg, #115E59 0%, #0D9488 55%, #042F2E 100%)' }}
      >
        <Loader2 className="size-8 animate-spin text-teal-200" />
      </div>
    )
  }

  if (isError || !state) {
    return (
      <div
        className="min-h-dvh flex flex-col items-center justify-center gap-3 px-6"
        style={{ background: 'linear-gradient(160deg, #115E59 0%, #0D9488 55%, #042F2E 100%)' }}
      >
        <p className="text-sm text-white/80 text-center">
          {getApiErrorMessage(error, 'Could not load community offer status.')}
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="px-4 py-2 rounded-full text-white text-sm font-bold border-0 cursor-pointer bg-white/15"
        >
          Retry
        </button>
      </div>
    )
  }

  const unlocked = state.unlocked
  const hasSpot = state.hasClaimed
  const walletStatus = state.walletReward?.status
  const canClaimReward =
    hasSpot && unlocked && (walletStatus === 'earned' || walletStatus === 'group_pending' || walletStatus === 'pending')
  const reserveBefore = formatMaybeDate(state.endDate)
  const redeemBefore = formatMaybeDate(state.walletReward?.redeemBefore)
  const emoji = getMechanicEmoji('groupunlock')

  if (showLampClaim && canClaimReward) {
    return (
      <CampaignLampClaim
        mechanic="groupunlock"
        businessName={state.businessName}
        claimedHeadline="Here's Your Community Reward ✨"
        onBack={() => setShowLampClaim(false)}
        preview={{
          sectionLabel: 'Your reward',
          badgeLabel: state.rewardLabel,
          rewardTitle: state.rewardLabel,
          description: state.offerSentence || state.rewardDescription || undefined,
          highlight: `${joined} / ${target} joined — unlocked`,
          claimBefore: state.endDate,
          redeemBefore: state.walletReward?.redeemBefore,
        }}
        onClaim={async () => ({
          reward: state.rewardLabel,
          code: state.walletReward?.code,
          icon: '🤝',
          redeemBefore: state.walletReward?.redeemBefore,
        })}
      />
    )
  }

  return (
    <div
      className="min-h-dvh max-w-[440px] mx-auto flex flex-col relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #115E59 0%, #0D9488 55%, #042F2E 100%)' }}
    >
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="absolute top-12 left-4 size-9 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center z-20 border-0 cursor-pointer"
        aria-label="Go back"
      >
        <ArrowLeft className="size-4 text-white" />
      </button>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-10">
        <p className="text-white/70 text-base font-semibold mb-1 text-center">
          Community Offer — {state.businessName}
        </p>
        <h1 className="text-2xl font-extrabold text-white mb-8 text-center">
          {!hasSpot
            ? 'Join the community'
            : unlocked
              ? 'Group complete! ✓'
              : "You're in! ✓"}
        </h1>

        {/* Circular progress */}
        <div className="relative flex items-center justify-center mb-6" style={{ width: 200, height: 200 }}>
          <svg viewBox="0 0 180 180" className="absolute inset-0 w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={90} cy={90} r={RING_R} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="12" />
            <motion.circle
              cx={90}
              cy={90}
              r={RING_R}
              fill="none"
              stroke="#5EEAD4"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${RING_CIRC} ${RING_CIRC}`}
              initial={{ strokeDashoffset: RING_CIRC }}
              animate={{ strokeDashoffset: RING_CIRC - filled }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>
          <div className="flex flex-col items-center">
            <Handshake className="size-7 text-white/70 mb-1" />
            <p className="text-3xl font-black text-white leading-none">
              {joined}
              <span className="text-base font-semibold text-white/40">/{target}</span>
            </p>
            <p className="text-[11px] text-white/50 mt-1">joined</p>
          </div>
        </div>

        {!hasSpot ? (
          <>
            <p className="text-sm font-semibold text-white/80 mb-1 text-center">
              Reserve a spot to join this community unlock
            </p>
            <p className="text-xs text-white/40 mb-6 text-center">
              The reward unlocks for everyone once {target} people join
            </p>
          </>
        ) : unlocked ? (
          <>
            <p className="text-sm font-semibold text-white/80 mb-1 text-center">
              Target met — claim your community reward
            </p>
            <p className="text-xs text-white/40 mb-6 text-center">
              Everyone who reserved a spot can claim now
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold text-white/80 mb-1 text-center">
              {remaining} more {remaining === 1 ? 'person' : 'people'} needed to unlock this reward
            </p>
            <p className="text-xs text-white/40 mb-6 text-center">
              We&apos;ll let you know right here once the group is complete
            </p>
          </>
        )}

        {/* Reward card */}
        <div
          className="w-full max-w-xs rounded-2xl p-4 mb-3"
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-teal-300/20 text-teal-100">
              {state.rewardLabel}
            </span>
            {unlocked ? (
              <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-wide">Unlocked</span>
            ) : (
              <span className="text-[10px] font-bold text-white/45 uppercase tracking-wide">Locked</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-full bg-white/15 flex items-center justify-center text-2xl shrink-0 border border-white/20">
              {emoji}
            </div>
            <div className="min-w-0">
              <p className="text-white font-bold text-[15px] leading-tight">
                {state.rewardLabel} at {state.businessName}
              </p>
              {(state.offerSentence || state.rewardDescription) && (
                <p className="text-[11px] text-white/55 mt-1 leading-snug">
                  {state.offerSentence || state.rewardDescription}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Dates card */}
        {(reserveBefore || redeemBefore) && (
          <div
            className="w-full max-w-xs rounded-2xl px-4 py-3.5 mb-4"
            style={{ background: 'rgba(0,0,0,0.18)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            {reserveBefore && (
              <div className="flex items-center gap-2 text-xs text-white/70 mb-2">
                <CalendarDays className="size-3.5 text-white/50 shrink-0" />
                <span>
                  Reserve before <span className="font-bold text-white">{reserveBefore}</span>
                </span>
              </div>
            )}
            {redeemBefore && (
              <div className="flex items-center gap-2 text-xs text-white/70">
                <Gift className="size-3.5 text-white/50 shrink-0" />
                <span>
                  Redeem before <span className="font-bold text-white">{redeemBefore}</span>
                </span>
              </div>
            )}
            {!redeemBefore && (
              <div className="flex items-center gap-2 text-xs text-white/50">
                <Gift className="size-3.5 shrink-0" />
                <span>Redeem window opens when the group unlocks</span>
              </div>
            )}
          </div>
        )}

        {!hasSpot && state.canClaim && (
          <Link
            to={`/customer/campaigns/${state.campaignId}`}
            className="w-full max-w-xs flex items-center justify-center py-3.5 rounded-2xl font-bold text-sm text-teal-950 no-underline"
            style={{ background: '#5EEAD4', boxShadow: '0 10px 28px rgba(45,212,191,0.35)' }}
          >
            Reserve Spot
          </Link>
        )}

        {canClaimReward && walletStatus !== 'redeemed' && (
          <button
            type="button"
            onClick={() => setShowLampClaim(true)}
            className="w-full max-w-xs flex items-center justify-center py-3.5 rounded-2xl font-bold text-sm text-teal-950 border-0 cursor-pointer"
            style={{ background: '#5EEAD4', boxShadow: '0 10px 28px rgba(45,212,191,0.35)' }}
          >
            Claim Reward →
          </button>
        )}

        {walletStatus === 'redeemed' && (
          <Link
            to="/customer/wallet"
            className="w-full max-w-xs flex items-center justify-center py-3.5 rounded-2xl font-bold text-sm text-white no-underline bg-white/15"
          >
            Open Wallet
          </Link>
        )}
      </div>
    </div>
  )
}
