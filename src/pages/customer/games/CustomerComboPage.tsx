import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  claimComboReward,
  fetchComboState,
  fetchPublicCampaign,
  getApiErrorMessage,
} from '@/lib/api'
import { getCampaignIdFromSearch, getPlaySession } from '@/lib/customer-game'
import { getUser } from '@/lib/auth'
import { getCustomerBusinessPath } from '@/lib/customer-ui'
import { getCampaignTheme, getPlayScreenBackground } from '@/lib/campaign-themes'
import { CampaignLampClaim } from '@/components/customer/CampaignLampClaim'

export function CustomerComboPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { search } = useLocation()
  const campaignId = getCampaignIdFromSearch(search)
  const playSession = campaignId ? getPlaySession(campaignId) : null
  const customerId = getUser('customer')?.userId
  const theme = getCampaignTheme('combo')

  const { data: campaign, isLoading: campaignLoading } = useQuery({
    queryKey: ['public-campaign', campaignId],
    queryFn: () => fetchPublicCampaign(campaignId!),
    enabled: Boolean(campaignId),
  })

  const { data: state, isLoading: stateLoading } = useQuery({
    queryKey: ['combo-state', campaignId, customerId],
    queryFn: () => fetchComboState(campaignId!),
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
    mutationFn: () => claimComboReward(campaignId!, playSession!),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['combo-state', campaignId] })
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
      <div className="min-h-dvh flex items-center justify-center" style={{ background: getPlayScreenBackground('combo') }}>
        <Loader2 className="size-8 animate-spin" style={{ color: theme.accent }} />
      </div>
    )
  }

  const rewardLabel = state?.rewardLabel ?? campaign?.rewards[0]?.name ?? 'Combo Deal'
  const offerSentence = state?.offerSentence ?? ''
  const terms = state?.termsAndConditions?.trim() || campaign?.comboConfig?.termsAndConditions?.trim() || ''

  return (
    <CampaignLampClaim
      mechanic="combo"
      businessName={campaign?.businessName ?? state?.businessName ?? ''}
      claimedHeadline="Here's Your Bundle Reward ✨"
      alreadyClaimed={Boolean(state?.hasClaimed)}
      disabled={!state?.canClaim || !playSession}
      onBack={goBack}
      onAlreadyClaimedWallet={() => navigate('/customer/wallet')}
      preview={{
        sectionLabel: 'Your combo',
        badgeLabel: rewardLabel,
        rewardTitle: rewardLabel,
        description: terms || offerSentence || undefined,
        highlight: offerSentence || undefined,
        claimBefore: campaign?.endDate ?? state?.endDate,
        redeemBefore: state?.walletReward?.redeemBefore,
      }}
      onClaim={async () => {
        if (!playSession) throw new Error('Session expired. Enter PIN again.')
        try {
          const result = await claimMutation.mutateAsync()
          return {
            reward: result.reward,
            code: result.code,
            icon: result.icon,
            redeemBefore: result.redeemBefore,
          }
        } catch (err) {
          throw new Error(getApiErrorMessage(err, 'Could not claim combo. Try again.'))
        }
      }}
    />
  )
}
