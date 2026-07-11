import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Handshake, Loader2, Users } from 'lucide-react'
import { fetchGroupUnlockState, getApiErrorMessage } from '@/lib/api'
import { getUser } from '@/lib/auth'
import { getCustomerBusinessPath } from '@/lib/customer-ui'

export function CustomerGroupUnlockStatusPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const customerId = getUser('customer')?.userId

  const { data: state, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['groupunlock-state', id, customerId],
    queryFn: () => fetchGroupUnlockState(id!),
    enabled: Boolean(id) && Boolean(customerId),
    refetchInterval: data => (data.state.data?.unlocked ? false : 3000),
  })

  const goToVendor = () => {
    navigate(getCustomerBusinessPath(state?.businessId), { replace: true })
  }

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-indigo-50">
        <Loader2 className="size-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  if (isError || !state) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-3 px-6 bg-indigo-50">
        <p className="text-sm text-v-text-2 text-center">
          {getApiErrorMessage(error, 'Could not load offer status.')}
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="px-4 py-2 rounded-full bg-indigo-600 text-white text-sm font-bold border-0 cursor-pointer"
        >
          Retry
        </button>
        <button
          type="button"
          onClick={() => navigate('/customer', { replace: true })}
          className="text-sm font-semibold text-indigo-700 border-0 bg-transparent cursor-pointer"
        >
          ← Back
        </button>
      </div>
    )
  }

  const joined = state.groupJoined ?? state.claimedCount ?? 0
  const target = state.targetParticipants
  const remaining = state.spotsRemaining ?? Math.max(0, target - joined)
  const progress = target > 0 ? Math.min(100, Math.round((joined / target) * 100)) : 0
  const walletStatus = state.walletReward?.status
  const inWallet = walletStatus === 'earned' || walletStatus === 'pending' || walletStatus === 'redeemed'
  const unlocked = state.unlocked

  return (
    <div className="min-h-dvh bg-[#eef2ff] max-w-[440px] mx-auto flex flex-col">
      <div
        className="relative px-4 pt-[max(3rem,env(safe-area-inset-top))] pb-5"
        style={{ background: 'linear-gradient(135deg, #c7d2fe 0%, #818cf8 100%)' }}
      >
        <button
          type="button"
          onClick={goToVendor}
          className="absolute top-[max(3rem,env(safe-area-inset-top))] left-4 size-9 rounded-full bg-white/30 flex items-center justify-center border-0 cursor-pointer"
          aria-label="Back to vendor"
        >
          <ArrowLeft className="size-4 text-indigo-950" />
        </button>
        <div className="pt-10 text-center text-indigo-950">
          <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-900/70">Check Status</p>
          <h1 className="text-xl font-bold mt-1">{state.campaignName}</h1>
          <p className="text-sm text-indigo-900/75 mt-1">{state.businessName}</p>
        </div>
      </div>

      <div className="flex-1 px-4 py-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] space-y-4">
        <div className="rounded-2xl bg-white border border-indigo-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
              <Handshake className="size-6 text-indigo-500" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-black text-indigo-950 truncate">{state.rewardLabel}</p>
              {state.offerSentence ? (
                <p className="text-xs text-indigo-800/70 mt-0.5">{state.offerSentence}</p>
              ) : null}
            </div>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between text-xs font-bold text-indigo-900 mb-2">
              <span className="inline-flex items-center gap-1.5">
                <Users className="size-3.5" />
                {joined} claimed
              </span>
              <span>{remaining} remaining</span>
            </div>
            <div className="h-2.5 rounded-full bg-indigo-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-indigo-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-center text-sm font-extrabold text-indigo-950">
              {joined} / {target} people
            </p>
          </div>

          <div
            className="mt-4 rounded-xl px-3 py-2.5 text-center text-xs font-semibold"
            style={{
              background: unlocked ? '#ecfdf5' : '#eef2ff',
              color: unlocked ? '#065f46' : '#3730a3',
            }}
          >
            {unlocked
              ? '🎉 Target reached — reward unlocked!'
              : state.hasClaimed
                ? `Spot reserved. Need ${remaining} more to unlock.`
                : `Need ${remaining} more people to unlock.`}
          </div>
        </div>

        {!state.hasClaimed && state.canClaim && (
          <Link
            to={`/customer/campaigns/${state.campaignId}`}
            className="flex w-full items-center justify-center py-3 rounded-full bg-gradient-to-r from-[#c7d2fe] to-[#818cf8] text-indigo-950 text-xs font-bold no-underline"
          >
            Enter PIN & Reserve
          </Link>
        )}

        {state.hasClaimed && !unlocked && (
          <p className="text-center text-xs text-indigo-800/70 px-2">
            Your spot is saved. Come back here anytime — we&apos;ll unlock the reward when the group fills.
          </p>
        )}

        {state.hasClaimed && unlocked && (
          <Link
            to="/customer/wallet"
            state={{ highlightRewardId: state.walletReward?.id }}
            className="flex w-full items-center justify-center py-3 rounded-full bg-emerald-600 text-white text-xs font-bold no-underline"
          >
            {inWallet ? 'Open Wallet to Redeem →' : 'Claim to Wallet →'}
          </Link>
        )}
      </div>
    </div>
  )
}
