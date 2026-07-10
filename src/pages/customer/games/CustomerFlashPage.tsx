import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Loader2, Zap } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  claimFlashReward,
  fetchFlashState,
  fetchPublicCampaign,
  getApiErrorMessage,
} from '@/lib/api'
import { getCampaignIdFromSearch, getPlaySession } from '@/lib/customer-game'
import { getUser } from '@/lib/auth'
import { getCustomerBusinessPath } from '@/lib/customer-ui'
import { WinCelebration } from '@/components/customer/win-celebration'

type Phase = 'ready' | 'claiming' | 'won'

export function CustomerFlashPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { search } = useLocation()
  const campaignId = getCampaignIdFromSearch(search)
  const playSession = campaignId ? getPlaySession(campaignId) : null
  const customerId = getUser('customer')?.userId

  const [phase, setPhase] = useState<Phase>('ready')
  const [claimed, setClaimed] = useState<{
    reward: string
    code: string
    icon: string
  } | null>(null)
  const [claimError, setClaimError] = useState('')

  const { data: campaign, isLoading: campaignLoading } = useQuery({
    queryKey: ['public-campaign', campaignId],
    queryFn: () => fetchPublicCampaign(campaignId!),
    enabled: Boolean(campaignId),
  })

  const { data: state, isLoading: stateLoading } = useQuery({
    queryKey: ['flash-state', campaignId, customerId],
    queryFn: () => fetchFlashState(campaignId!),
    enabled: Boolean(campaignId) && Boolean(customerId),
  })

  useEffect(() => {
    if (claimed || phase !== 'ready') return
    if (!campaignId) {
      navigate('/customer')
      return
    }
    if (!playSession && !state?.hasClaimed) {
      navigate(`/customer/campaigns/${campaignId}`)
    }
  }, [campaignId, playSession, navigate, claimed, state?.hasClaimed, phase])

  const claimMutation = useMutation({
    mutationFn: () => claimFlashReward(campaignId!, playSession!),
    onSuccess: result => {
      setClaimError('')
      setPhase('claiming')
      setClaimed({ reward: result.reward, code: result.code, icon: result.icon })
      void queryClient.invalidateQueries({ queryKey: ['flash-state', campaignId] })
      void queryClient.refetchQueries({ queryKey: ['customer-rewards'] })
      void queryClient.invalidateQueries({ queryKey: ['business-campaign-states'] })
      window.setTimeout(() => setPhase('won'), 1400)
    },
    onError: err => {
      setPhase('ready')
      setClaimError(getApiErrorMessage(err, 'Could not claim flash deal. Try again.'))
    },
  })

  const goBack = () => {
    const businessId = campaign?.businessId
    if (businessId) navigate(getCustomerBusinessPath(businessId), { replace: true })
    else navigate('/customer', { replace: true })
  }

  if (campaignLoading || stateLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center" style={{ background: 'linear-gradient(145deg, #bae6fd, #7dd3fc)' }}>
        <Loader2 className="size-8 animate-spin text-sky-600" />
      </div>
    )
  }

  if (phase === 'won' && claimed) {
    return (
      <WinCelebration
        reward={claimed.reward}
        emoji={claimed.icon || '⚡'}
        code={claimed.code}
        businessName={campaign?.businessName ?? state?.businessName}
        onBackToCafe={goBack}
      />
    )
  }

  const rewardLabel = state?.rewardLabel ?? campaign?.rewards[0]?.name ?? 'Flash Deal'
  const terms = state?.termsAndConditions?.trim() || campaign?.flashConfig?.termsAndConditions?.trim() || ''
  const total = state?.totalSlots ?? campaign?.flashConfig?.totalSlots ?? 0
  const remaining = state?.spotsRemaining ?? total
  const claimedCount = state?.claimedCount ?? Math.max(0, total - remaining)

  return (
    <div
      className="min-h-dvh flex flex-col px-5 pt-12 pb-8 relative overflow-hidden max-w-[440px] mx-auto"
      style={{ background: 'linear-gradient(160deg, #e0f2fe 0%, #bae6fd 42%, #7dd3fc 100%)' }}
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
        style={{ background: 'radial-gradient(circle, rgba(125,211,252,0.55) 0%, transparent 70%)' }}
      />

      <button
        type="button"
        onClick={goBack}
        className="absolute top-12 left-4 w-9 h-9 rounded-full bg-white/50 backdrop-blur-md flex items-center justify-center z-20 border-0 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 text-sky-900" />
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
              ⚡
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-black text-sky-950 tracking-tight"
            >
              Claiming…
            </motion.p>
            <p className="text-sm text-sky-800/80 mt-2">Adding flash deal to your wallet</p>
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
                  background: 'linear-gradient(145deg, #ffffff 0%, #e0f2fe 100%)',
                  boxShadow: '0 12px 32px rgba(14,165,233,0.22)',
                }}
              >
                <Zap className="size-8 text-sky-500" strokeWidth={2.2} fill="currentColor" />
              </motion.div>
              <h1 className="text-xl font-extrabold text-sky-950 tracking-tight">
                {campaign?.name ?? state?.campaignName}
              </h1>
              <p className="text-sm text-sky-800/75 mt-1">
                {campaign?.businessName ?? state?.businessName}
              </p>
            </div>

            <div
              className="relative overflow-hidden rounded-[22px]"
              style={{
                background: 'linear-gradient(160deg, #ffffff 0%, #f0f9ff 55%, #e0f2fe 100%)',
                boxShadow: '0 18px 40px rgba(14,165,233,0.2)',
              }}
            >
              <div
                className="absolute inset-y-0 left-[18px] w-px opacity-40"
                style={{
                  backgroundImage: 'repeating-linear-gradient(to bottom, #0ea5e9 0 6px, transparent 6px 12px)',
                }}
              />
              <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 size-5 rounded-full" style={{ background: '#7dd3fc' }} />
              <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 size-5 rounded-full" style={{ background: '#7dd3fc' }} />

              <div className="relative px-6 pt-5 pb-4 pl-8">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-700/70">
                    Your flash deal
                  </p>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-sky-400 text-white">
                    FLASH
                  </span>
                </div>

                <p className="text-[34px] leading-none font-black text-sky-950 tracking-tight">
                  {rewardLabel}
                </p>

                {terms ? (
                  <div className="mt-4 rounded-xl bg-sky-50/90 border border-sky-200/60 px-3.5 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-sky-700/55 mb-1">
                      Terms & conditions
                    </p>
                    <p className="text-sm text-sky-950/85 leading-relaxed whitespace-pre-wrap">{terms}</p>
                  </div>
                ) : null}

                <div className="mt-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-sky-700/50">Spots left</p>
                    <p className="text-sm font-extrabold text-sky-900">
                      {remaining} of {total}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-sky-700/50">Claimed</p>
                    <p className="text-sm font-extrabold text-sky-900">{claimedCount}</p>
                  </div>
                </div>
              </div>
            </div>

            {claimError && <p className="text-center text-sm text-red-600">{claimError}</p>}

            {state?.hasClaimed ? (
              <div className="rounded-2xl bg-white/95 p-5 text-center">
                <p className="text-sm font-semibold text-sky-900">Already in your wallet</p>
                <button
                  type="button"
                  onClick={() => navigate('/customer/wallet')}
                  className="mt-3 text-sm font-bold text-v-purple border-0 bg-transparent cursor-pointer"
                >
                  View in Wallet →
                </button>
              </div>
            ) : (
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
                  background: 'linear-gradient(135deg, #7dd3fc 0%, #38bdf8 45%, #0ea5e9 100%)',
                  color: '#0c4a6e',
                  boxShadow: '0 10px 28px rgba(56,189,248,0.4)',
                }}
              >
                {claimMutation.isPending ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" /> Claiming…
                  </span>
                ) : (
                  'Claim Flash Deal'
                )}
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
