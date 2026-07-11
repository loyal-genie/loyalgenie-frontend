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

type Phase = 'ready' | 'claiming' | 'reserved'

export function CustomerGroupUnlockPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { search } = useLocation()
  const campaignId = getCampaignIdFromSearch(search)
  const playSession = campaignId ? getPlaySession(campaignId) : null
  const customerId = getUser('customer')?.userId

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
    if (!playSession && state?.hasClaimed) {
      navigate(`/customer/campaigns/${campaignId}/groupunlock-status`, { replace: true })
      return
    }
    if (!playSession && !state?.hasClaimed && state) {
      navigate(`/customer/campaigns/${campaignId}`)
    }
  }, [campaignId, playSession, navigate, state, phase])

  const claimMutation = useMutation({
    mutationFn: () => claimGroupUnlockReward(campaignId!, playSession!),
    onSuccess: () => {
      setClaimError('')
      setPhase('claiming')
      void queryClient.invalidateQueries({ queryKey: ['groupunlock-state', campaignId] })
      void queryClient.invalidateQueries({ queryKey: ['business-campaign-states'] })
      window.setTimeout(() => {
        setPhase('reserved')
        navigate(`/customer/campaigns/${campaignId}/groupunlock-status`, { replace: true })
      }, 1100)
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

  if (campaignLoading || stateLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center" style={{ background: 'linear-gradient(145deg, #eef2ff, #c7d2fe)' }}>
        <Loader2 className="size-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  const rewardLabel = state?.rewardLabel ?? campaign?.rewards[0]?.name ?? 'Community Offer'
  const offerSentence = state?.offerSentence ?? ''
  const target = state?.targetParticipants ?? campaign?.groupUnlockConfig?.targetParticipants ?? 0
  const joined = state?.groupJoined ?? state?.claimedCount ?? 0
  const remaining = state?.spotsRemaining ?? Math.max(0, target - joined)

  return (
    <div
      className="min-h-dvh flex flex-col px-5 pt-12 pb-8 relative overflow-hidden max-w-[440px] mx-auto"
      style={{ background: 'linear-gradient(160deg, #f5f3ff 0%, #eef2ff 42%, #c7d2fe 100%)' }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.1]"
        style={{
          backgroundImage: 'radial-gradient(circle, white 1.2px, transparent 1.2px)',
          backgroundSize: '22px 22px',
        }}
      />

      <button
        type="button"
        onClick={goBack}
        className="absolute top-12 left-4 w-9 h-9 rounded-full bg-white/50 backdrop-blur-md flex items-center justify-center z-20 border-0 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 text-indigo-900" />
      </button>

      <AnimatePresence mode="wait">
        {phase === 'claiming' || phase === 'reserved' ? (
          <motion.div
            key="claiming"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center relative z-10"
          >
            <motion.div
              animate={{ rotate: [0, -8, 8, -4, 0], scale: [1, 1.08, 1] }}
              transition={{ duration: 1.1, ease: 'easeInOut' }}
              className="text-7xl mb-5"
            >
              🤝
            </motion.div>
            <p className="text-2xl font-black text-indigo-950 tracking-tight">Spot reserved!</p>
            <p className="text-sm text-indigo-800/80 mt-2">Opening Check Status…</p>
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
                  background: 'linear-gradient(145deg, #ffffff 0%, #e0e7ff 100%)',
                  boxShadow: '0 12px 32px rgba(129,140,248,0.25)',
                }}
              >
                <Handshake className="size-8 text-indigo-500" strokeWidth={2.2} />
              </motion.div>
              <h1 className="text-xl font-extrabold text-indigo-950 tracking-tight">
                {campaign?.name ?? state?.campaignName}
              </h1>
              <p className="text-sm text-indigo-800/75 mt-1">
                {campaign?.businessName ?? state?.businessName}
              </p>
            </div>

            <div
              className="relative overflow-hidden rounded-[22px]"
              style={{
                background: 'linear-gradient(160deg, #ffffff 0%, #f5f3ff 55%, #eef2ff 100%)',
                boxShadow: '0 18px 40px rgba(99,102,241,0.16)',
              }}
            >
              <div className="relative px-6 pt-5 pb-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-700/70 mb-3">
                  Community reward
                </p>
                <p className="text-[34px] leading-none font-black text-indigo-950 tracking-tight">
                  {rewardLabel}
                </p>
                {offerSentence ? (
                  <p className="text-sm font-semibold text-indigo-800/80 mt-2">{offerSentence}</p>
                ) : null}

                <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1.5">
                  <Users className="size-3.5 text-indigo-600" />
                  <span className="text-xs font-bold text-indigo-800">
                    {joined} / {target} people reserved
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-700/50">Spots left</p>
                    <p className="text-sm font-extrabold text-indigo-900">{remaining}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-700/50">Target</p>
                    <p className="text-sm font-extrabold text-indigo-900">{target}</p>
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
              className="w-full py-4 rounded-2xl font-extrabold text-base disabled:opacity-50 border-0 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #c7d2fe 0%, #a5b4fc 45%, #818cf8 100%)',
                color: '#312e81',
                boxShadow: '0 10px 28px rgba(129,140,248,0.4)',
              }}
            >
              {claimMutation.isPending ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" /> Reserving…
                </span>
              ) : (
                'Claim Spot'
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
