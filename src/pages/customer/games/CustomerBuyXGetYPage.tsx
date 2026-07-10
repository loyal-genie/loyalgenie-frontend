import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  claimBuyXGetYReward,
  fetchBuyXGetYState,
  fetchPublicCampaign,
  getApiErrorMessage,
} from '@/lib/api'
import { getCampaignIdFromSearch, getPlaySession } from '@/lib/customer-game'
import { getUser } from '@/lib/auth'
import { getCustomerBusinessPath } from '@/lib/customer-ui'
import { WinCelebration } from '@/components/customer/win-celebration'

export function CustomerBuyXGetYPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { search } = useLocation()
  const campaignId = getCampaignIdFromSearch(search)
  const playSession = campaignId ? getPlaySession(campaignId) : null
  const customerId = getUser('customer')?.userId

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
    queryKey: ['buy-x-get-y-state', campaignId, customerId],
    queryFn: () => fetchBuyXGetYState(campaignId!),
    enabled: Boolean(campaignId) && Boolean(customerId),
  })

  useEffect(() => {
    if (claimed) return
    if (!campaignId) {
      navigate('/customer')
      return
    }
    if (!playSession && !state?.hasClaimed) {
      navigate(`/customer/campaigns/${campaignId}`)
    }
  }, [campaignId, playSession, navigate, claimed, state?.hasClaimed])

  const claimMutation = useMutation({
    mutationFn: () => claimBuyXGetYReward(campaignId!, playSession!),
    onSuccess: result => {
      setClaimed({ reward: result.reward, code: result.code, icon: result.icon })
      setClaimError('')
      void queryClient.invalidateQueries({ queryKey: ['buy-x-get-y-state', campaignId] })
      void queryClient.refetchQueries({ queryKey: ['customer-rewards'] })
      void queryClient.invalidateQueries({ queryKey: ['business-campaign-states'] })
    },
    onError: err => {
      setClaimError(getApiErrorMessage(err, 'Could not claim reward. Try again.'))
    },
  })

  const goBack = () => {
    const businessId = campaign?.businessId
    if (businessId) navigate(getCustomerBusinessPath(businessId), { replace: true })
    else navigate('/customer', { replace: true })
  }

  if (campaignLoading || stateLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center" style={{ background: 'linear-gradient(145deg, #7c2d12, #431407)' }}>
        <Loader2 className="size-8 animate-spin text-orange-200" />
      </div>
    )
  }

  if (claimed) {
    return (
      <WinCelebration
        reward={claimed.reward}
        emoji={claimed.icon}
        code={claimed.code}
        businessName={campaign?.businessName ?? state?.businessName}
        onBackToCafe={goBack}
      />
    )
  }

  const rewardLabel = state?.rewardLabel ?? campaign?.rewards[0]?.name ?? 'Reward'
  const description = state?.rewardDescription ?? campaign?.rewards[0]?.description ?? state?.offerSentence

  return (
    <div
      className="min-h-dvh flex flex-col px-5 pt-12 pb-8 relative overflow-hidden max-w-[440px] mx-auto"
      style={{ background: 'linear-gradient(145deg, #7c2d12 0%, #c2410c 45%, #431407 100%)' }}
    >
      <button
        type="button"
        onClick={goBack}
        className="absolute top-12 left-4 w-9 h-9 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center z-20 border-0 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 text-white" />
      </button>

      <div className="flex-1 flex flex-col justify-center relative z-10 gap-6 mt-8">
        <div className="text-center">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="text-6xl mb-3"
          >
            💰
          </motion.div>
          <h1 className="text-xl font-bold text-orange-50">{campaign?.name ?? state?.campaignName}</h1>
          <p className="text-sm text-orange-200/80 mt-1">{campaign?.businessName ?? state?.businessName}</p>
        </div>

        <div className="rounded-2xl border border-orange-300/30 bg-white/10 p-5 backdrop-blur-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-orange-200/70 mb-2">Your reward</p>
          <p className="text-2xl font-black text-white">{rewardLabel}</p>
          {description && <p className="text-sm text-orange-100/80 mt-2 leading-relaxed">{description}</p>}
          {state?.offerSentence && (
            <p className="text-xs font-semibold text-orange-200 mt-3">{state.offerSentence}</p>
          )}
        </div>

        {claimError && <p className="text-center text-sm text-red-200">{claimError}</p>}

        {state?.hasClaimed ? (
          <div className="rounded-2xl bg-white/95 p-5 text-center">
            <p className="text-sm font-semibold text-orange-900">Already in your wallet</p>
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
            className="w-full py-4 rounded-2xl font-bold text-base disabled:opacity-50 border-0 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)',
              color: '#431407',
              boxShadow: '0 8px 32px rgba(249,115,22,0.35)',
            }}
          >
            {claimMutation.isPending ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" /> Claiming…
              </span>
            ) : (
              'Claim Reward'
            )}
          </motion.button>
        )}
      </div>
    </div>
  )
}
