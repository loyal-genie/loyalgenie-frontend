import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  claimLotteryTicket,
  fetchLotteryState,
  fetchPublicCampaign,
  getApiErrorMessage,
} from '@/lib/api'
import { getCampaignIdFromSearch, getPlaySession } from '@/lib/customer-game'
import { getUser } from '@/lib/auth'

export type LotteryClaimResult = Awaited<ReturnType<typeof claimLotteryTicket>>

export function useLotteryPlay() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { search } = useLocation()
  const campaignId = getCampaignIdFromSearch(search)
  const playSession = campaignId ? getPlaySession(campaignId) : null
  const customerId = getUser('customer')?.userId

  const [claimResult, setClaimResult] = useState<LotteryClaimResult | null>(null)
  const [claimError, setClaimError] = useState('')

  const { data: campaign, isLoading: campaignLoading } = useQuery({
    queryKey: ['public-campaign', campaignId],
    queryFn: () => fetchPublicCampaign(campaignId!),
    enabled: Boolean(campaignId),
    staleTime: 60_000,
  })

  const { data: lotteryState, isLoading: stateLoading } = useQuery({
    queryKey: ['lottery-state', campaignId, customerId],
    queryFn: () => fetchLotteryState(campaignId!),
    enabled: Boolean(campaignId) && Boolean(customerId),
    staleTime: 0,
  })

  useEffect(() => {
    if (claimResult) return
    if (!campaignId) {
      navigate('/customer')
      return
    }
    if (!playSession && !lotteryState?.canClaimTicket) {
      if (lotteryState?.hasTicket) {
        navigate(`/customer/campaigns/${campaignId}/lottery-status`, { replace: true })
      } else {
        navigate(`/customer/campaigns/${campaignId}`)
      }
    }
  }, [campaignId, playSession, navigate, claimResult, lotteryState?.canClaimTicket, lotteryState?.hasTicket])

  const claimMutation = useMutation({
    mutationFn: () => claimLotteryTicket(campaignId!, playSession!),
    onSuccess: result => {
      setClaimResult(result)
      setClaimError('')
      void queryClient.invalidateQueries({ queryKey: ['lottery-state', campaignId] })
      void queryClient.invalidateQueries({ queryKey: ['business-campaign-states'] })
    },
    onError: err => {
      setClaimError(getApiErrorMessage(err, 'Could not claim ticket. Try again.'))
    },
  })

  const loading = campaignLoading || stateLoading
  const canClaim = Boolean(
    lotteryState?.canClaimTicket && playSession && !claimMutation.isPending,
  )

  const jackpot = useMemo(
    () => lotteryState?.prizes.find(p => p.tier === 'jackpot') ?? campaign?.lotteryConfig?.prizes.find(p => p.tier === 'jackpot'),
    [lotteryState, campaign],
  )

  return {
    campaignId,
    campaign,
    lotteryState,
    businessId: campaign?.businessId,
    businessName: campaign?.businessName ?? lotteryState?.businessName,
    campaignName: campaign?.name ?? lotteryState?.campaignName,
    drawDate: lotteryState?.drawDate ?? campaign?.drawDate ?? campaign?.endDate,
    prizes: lotteryState?.prizes ?? campaign?.lotteryConfig?.prizes ?? [],
    jackpot,
    playSession,
    loading,
    canClaim,
    hasTicket: Boolean(lotteryState?.hasTicket || claimResult),
    claimResult,
    claimError,
    isClaiming: claimMutation.isPending,
    walletRewardId: null as string | null,
    claimTicket: () => {
      if (!canClaim || !campaignId || !playSession) return
      setClaimError('')
      claimMutation.mutate()
    },
  }
}
