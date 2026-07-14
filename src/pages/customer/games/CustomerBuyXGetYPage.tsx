import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  claimBuyXGetYReward,
  fetchBuyXGetYState,
  fetchPublicCampaign,
  getApiErrorMessage,
} from '@/lib/api'
import { getCampaignIdFromSearch, getPlaySession } from '@/lib/customer-game'
import { getUser } from '@/lib/auth'
import { getCampaignTheme, getPlayScreenBackground } from '@/lib/campaign-themes'
import { getCustomerBusinessPath } from '@/lib/customer-ui'
import { CampaignLampClaim } from '@/components/customer/CampaignLampClaim'

export function CustomerBuyXGetYPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { search } = useLocation()
  const campaignId = getCampaignIdFromSearch(search)
  const playSession = campaignId ? getPlaySession(campaignId) : null
  const customerId = getUser('customer')?.userId
  const theme = getCampaignTheme('buy-x-get-y')

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
    if (!campaignId) {
      navigate('/customer')
      return
    }
    if (!playSession && !state?.hasClaimed && !stateLoading) {
      navigate(`/customer/campaigns/${campaignId}`)
    }
  }, [campaignId, playSession, navigate, state?.hasClaimed, stateLoading])

  const claimMutation = useMutation({
    mutationFn: () => claimBuyXGetYReward(campaignId!, playSession!),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['buy-x-get-y-state', campaignId] })
      void queryClient.refetchQueries({ queryKey: ['customer-rewards'] })
      void queryClient.invalidateQueries({ queryKey: ['business-campaign-states'] })
    },
  })

  const goBack = () => {
    const businessId = campaign?.businessId
    if (businessId) navigate(getCustomerBusinessPath(businessId), { replace: true })
    else navigate('/customer', { replace: true })
  }

  if (campaignLoading || stateLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center" style={{ background: getPlayScreenBackground('buy-x-get-y') }}>
        <Loader2 className="size-8 animate-spin" style={{ color: theme.accent }} />
      </div>
    )
  }

  const rewardLabel = state?.rewardLabel ?? campaign?.rewards[0]?.name ?? 'Reward'
  const description = state?.rewardDescription ?? campaign?.rewards[0]?.description ?? state?.offerSentence

  return (
    <CampaignLampClaim
      mechanic="buy-x-get-y"
      businessName={campaign?.businessName ?? state?.businessName ?? ''}
      alreadyClaimed={Boolean(state?.hasClaimed)}
      disabled={!state?.canClaim || !playSession}
      onBack={goBack}
      onAlreadyClaimedWallet={() => navigate('/customer/wallet')}
      preview={{
        sectionLabel: 'Your reward',
        rewardTitle: rewardLabel,
        description: description ?? undefined,
        highlight: state?.offerSentence ?? undefined,
      }}
      onClaim={async () => {
        if (!playSession) throw new Error('Session expired. Enter PIN again.')
        try {
          const result = await claimMutation.mutateAsync()
          return { reward: result.reward, code: result.code, icon: result.icon }
        } catch (err) {
          throw new Error(getApiErrorMessage(err, 'Could not claim reward. Try again.'))
        }
      }}
    />
  )
}
