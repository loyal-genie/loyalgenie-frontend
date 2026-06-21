import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  executeShake,
  fetchPlayState,
  fetchPublicCampaign,
  getApiErrorMessage,
  type ShakeResult,
} from '@/lib/api'
import { getCampaignIdFromSearch, getPlaySession } from '@/lib/customer-game'
import { getUser } from '@/lib/auth'
import { useBusinessesWithCampaigns } from '@/hooks/useCustomerData'
import { findBusinessForCampaign } from '@/lib/customer-ui'

export function useInstantWinPlay() {
  const navigate = useNavigate()
  const { search } = useLocation()
  const campaignId = getCampaignIdFromSearch(search)
  const playSession = campaignId ? getPlaySession(campaignId) : null
  const customerId = getUser('customer')?.userId

  const [playResult, setPlayResult] = useState<ShakeResult | null>(null)
  const [playError, setPlayError] = useState('')

  const { data: campaign, isLoading: campaignLoading } = useQuery({
    queryKey: ['public-campaign', campaignId],
    queryFn: () => fetchPublicCampaign(campaignId!),
    enabled: Boolean(campaignId),
  })

  const { data: businesses } = useBusinessesWithCampaigns()
  const businessName = findBusinessForCampaign(businesses, campaignId ?? '', campaign?.businessId)?.name

  const { data: playState, isLoading: stateLoading } = useQuery({
    queryKey: ['play-state', campaignId, customerId],
    queryFn: () => fetchPlayState(campaignId!),
    enabled: Boolean(campaignId) && Boolean(playSession) && Boolean(customerId),
    staleTime: 0,
  })

  useEffect(() => {
    if (!campaignId) {
      navigate('/customer')
      return
    }
    if (!playSession) {
      navigate(`/customer/campaigns/${campaignId}`)
    }
  }, [campaignId, playSession, navigate])

  const playMutation = useMutation({
    mutationFn: () => executeShake(campaignId!, playSession!),
    onSuccess: result => {
      setPlayResult(result)
      setPlayError('')
    },
    onError: err => {
      setPlayError(getApiErrorMessage(err, 'Could not complete play. Try again.'))
    },
  })

  const loading = campaignLoading || stateLoading
  const canPlay = Boolean(playState?.canPlay && playSession && !playMutation.isPending)

  return {
    campaignId,
    campaign,
    businessName,
    playState,
    playSession,
    loading,
    canPlay,
    playResult,
    playError,
    isPlaying: playMutation.isPending,
    startPlay: () => {
      if (!canPlay || !campaignId || !playSession) return
      setPlayResult(null)
      setPlayError('')
      playMutation.mutate()
    },
    resetPlay: () => {
      setPlayResult(null)
      setPlayError('')
    },
  }
}
