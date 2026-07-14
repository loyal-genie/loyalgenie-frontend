import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Handshake, Loader2, Users } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  claimGroupUnlockReward,
  fetchGroupUnlockState,
  fetchPublicCampaign,
  getApiErrorMessage,
} from '@/lib/api'
import { getCampaignIdFromSearch, getPlaySession } from '@/lib/customer-game'
import { getUser } from '@/lib/auth'
import { getCustomerBusinessPath } from '@/lib/customer-ui'
import { getCampaignTheme, getPlayScreenBackground } from '@/lib/campaign-themes'

type Phase = 'ready' | 'claiming' | 'reserved'

export function CustomerGroupUnlockPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { search } = useLocation()
  const campaignId = getCampaignIdFromSearch(search)
  const playSession = campaignId ? getPlaySession(campaignId) : null
  const customerId = getUser('customer')?.userId
  const theme = getCampaignTheme('groupunlock')

  const [phase, setPhase] = useState<Phase>('ready')
  const [claimError, setClaimError] = useState('')

  const { data: campaign, isLoading: campaignLoading } = useQuery({
    queryKey: ['public-campaign', campaignId],
    queryFn: () => fetchPublicCampaign(campaignId!),
    enabled: Boolean(campaignId),
  })

  const { data: state, isLoading: stateLoading } = useQuery({
    queryKey: ['groupunlock-state', campaignId, customerId],
    queryFn: () => fetchGroupUnlockState(campaignId!),
    enabled: Boolean(campaignId) && Boolean(customerId),
  })

  useEffect(() => {
    if (phase !== 'ready') return
    if (!campaignId) {
      navigate('/customer')
      return
    }
    if (!playSession && !state?.hasClaimed) {
      navigate(`/customer/campaigns/${campaignId}`)
    }
  }, [campaignId, playSession, navigate, state?.hasClaimed, phase])

  const claimMutation = useMutation({
    mutationFn: () => claimGroupUnlockReward(campaignId!, playSession!),
    onSuccess: () => {
      setClaimError('')
      setPhase('claiming')
      void queryClient.invalidateQueries({ queryKey: ['groupunlock-state', campaignId] })
      void queryClient.refetchQueries({ queryKey: ['customer-rewards'] })
      void queryClient.invalidateQueries({ queryKey: ['business-campaign-states'] })
      window.setTimeout(() => setPhase('reserved'), 1100)
    },
    onError: err => {
      setPhase('ready')
      setClaimError(getApiErrorMessage(err, 'Could not reserve spot. Try again.'))
    },
  })

  const goBack = () => {
    const businessId = campaign?.businessId
    if (businessId) navigate(getCustomerBusinessPath(businessId), { replace: true })
    else navigate('/customer', { replace: true })
  }

  const goToStatus = () => {
    if (campaignId) navigate(`/customer/campaigns/${campaignId}/groupunlock-status`, { replace: true })
  }

  if (campaignLoading || stateLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center" style={{ background: getPlayScreenBackground('groupunlock') }}>
        <Loader2 className="size-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  const rewardLabel = state?.rewardLabel ?? campaign?.rewards[0]?.name ?? 'Community Offer'
  const offerSentence = state?.offerSentence ?? ''
  const target = state?.targetParticipants ?? campaign?.groupUnlockConfig?.targetParticipants ?? 0
  const joined = state?.groupJoined ?? state?.claimedCount ?? 0
  const remaining = state?.spotsRemaining ?? Math.max(0, target - joined)
  const ctaStyle = {
    background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accentTo} 100%)`,
    boxShadow: `0 10px 28px ${theme.accent}55`,
  }

  if (phase === 'reserved' || (state?.hasClaimed && phase !== 'claiming')) {
    return (
      <div
        className="min-h-dvh flex flex-col items-center justify-center px-5 py-12 gap-5 max-w-[440px] mx-auto"
        style={{ background: getPlayScreenBackground('groupunlock') }}
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="text-6xl mb-4">🤝</div>
          <p className="text-2xl font-black text-gray-900">Spot reserved!</p>
          <p className="text-sm text-gray-500 mt-2">
            Reward unlocks when {target} people join. Check Status anytime.
          </p>
        </motion.div>

        <div
          className="w-full rounded-2xl bg-white p-4 text-center"
          style={{ border: `1px solid ${theme.accent}22` }}
        >
          <p className="text-sm font-bold text-gray-900">{rewardLabel}</p>
          <p className="text-xs text-gray-500 mt-1">
            {joined} / {target} spots filled
          </p>
        </div>

        <motion.button
          type="button"
          onClick={goToStatus}
          whileTap={{ scale: 0.97 }}
          className="w-full py-4 rounded-full font-bold text-base text-white border-0 cursor-pointer"
          style={ctaStyle}
        >
          Check Status →
        </motion.button>

        <button
          type="button"
          onClick={goBack}
          className="w-full py-4 rounded-full font-bold text-base text-white border-0 cursor-pointer"
          style={{
            background: theme.accentTo,
            boxShadow: `0 6px 20px ${theme.accentTo}40`,
          }}
        >
          Back to Business
        </button>
      </div>
    )
  }

  return (
    <div
      className="min-h-dvh flex flex-col px-5 pt-12 pb-8 relative overflow-hidden max-w-[440px] mx-auto"
      style={{ background: getPlayScreenBackground('groupunlock') }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.1]"
        style={{
          backgroundImage: 'radial-gradient(circle, white 1.2px, transparent 1.2px)',
          backgroundSize: '22px 22px',
        }}
      />
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[320px] h-[320px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(199,210,254,0.6) 0%, transparent 70%)' }}
      />

      <button
        type="button"
        onClick={goBack}
        className="absolute top-12 left-4 w-9 h-9 rounded-full bg-white/50 backdrop-blur-md flex items-center justify-center z-20 border-0 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 text-gray-700" />
      </button>

      <AnimatePresence mode="wait">
        {phase === 'claiming' ? (
          <motion.div
            key="claiming"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="flex-1 flex flex-col items-center justify-center relative z-10"
          >
            <motion.div
              animate={{ rotate: [0, -8, 8, -4, 0], scale: [1, 1.08, 1] }}
              transition={{ duration: 1.1, ease: 'easeInOut' }}
              className="text-7xl mb-5"
            >
              🤝
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-black text-gray-900 tracking-tight"
            >
              Reserving…
            </motion.p>
            <p className="text-sm text-gray-500 mt-2">Holding your community spot</p>
          </motion.div>
        ) : (
          <motion.div
            key="ready"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col justify-center relative z-10 gap-6 mt-8"
          >
            <div className="text-center">
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                className="inline-flex items-center justify-center size-[72px] rounded-[20px] mb-4"
                style={{
                  background: `linear-gradient(145deg, #ffffff 0%, ${theme.accent}22 100%)`,
                  boxShadow: `0 12px 32px ${theme.accent}40`,
                }}
              >
                <Handshake className="size-8" style={{ color: theme.accent }} strokeWidth={2.2} />
              </motion.div>
              <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
                {campaign?.name ?? state?.campaignName}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {campaign?.businessName ?? state?.businessName}
              </p>
            </div>

            <div
              className="relative overflow-hidden rounded-[22px]"
              style={{
                background: `linear-gradient(160deg, #ffffff 0%, ${theme.accent}12 55%, ${theme.accent}22 100%)`,
                boxShadow: `0 18px 40px ${theme.accent}2e`,
              }}
            >
              <div
                className="absolute inset-y-0 left-[18px] w-px opacity-40"
                style={{
                  backgroundImage: `repeating-linear-gradient(to bottom, ${theme.accent} 0 6px, transparent 6px 12px)`,
                }}
              />
              <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 size-5 rounded-full" style={{ background: theme.accent }} />
              <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 size-5 rounded-full" style={{ background: theme.accent }} />

              <div className="relative px-6 pt-5 pb-4 pl-8">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                    Community reward
                  </p>
                  <span
                    className="text-[10px] font-extrabold px-2 py-0.5 rounded-full text-white"
                    style={{ background: theme.accent }}
                  >
                    GROUP
                  </span>
                </div>

                <p className="text-[34px] leading-none font-black text-gray-900 tracking-tight">
                  {rewardLabel}
                </p>
                {offerSentence ? (
                  <p className="text-sm font-semibold text-gray-700 mt-2">{offerSentence}</p>
                ) : null}

                <div
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5"
                  style={{ background: `${theme.accent}18` }}
                >
                  <Users className="size-3.5" style={{ color: theme.accent }} />
                  <span className="text-xs font-bold" style={{ color: theme.accentTo }}>
                    {joined} / {target} people reserved
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Spots left</p>
                    <p className="text-sm font-extrabold text-gray-900">{remaining}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Target</p>
                    <p className="text-sm font-extrabold text-gray-900">{target}</p>
                  </div>
                </div>
              </div>
            </div>

            {claimError && <p className="text-center text-sm text-red-600">{claimError}</p>}

            <motion.button
              type="button"
              onClick={() => {
                if (!playSession || claimMutation.isPending || !state?.canClaim) return
                setClaimError('')
                claimMutation.mutate()
              }}
              disabled={!state?.canClaim || claimMutation.isPending || !playSession}
              whileTap={{ scale: 0.97 }}
              className="w-full py-4 rounded-2xl font-extrabold text-base disabled:opacity-50 border-0 cursor-pointer text-white"
              style={ctaStyle}
            >
              {claimMutation.isPending ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" /> Reserving…
                </span>
              ) : (
                'Reserve Spot'
              )}
            </motion.button>

            <p className="text-center text-[11px] text-gray-500">
              Reserving a spot does not unlock the reward yet — that happens when the community target is met.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
