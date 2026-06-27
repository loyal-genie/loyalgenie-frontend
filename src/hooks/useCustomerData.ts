import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchBusinessesWithCampaigns,
  fetchCustomerLoyaltyProfile,
  fetchCustomerNotifications,
  fetchCustomerProfile,
  fetchCustomerRewards,
  requestRewardRedemption,
  updateCustomerProfile,
} from '@/lib/api'
import { getUser } from '@/lib/auth'
import { isSupabaseConfigured } from '@/lib/supabase'
import { useSupabaseRealtime } from '@/hooks/useSupabaseRealtime'

export function useBusinessesWithCampaigns() {
  const queryClient = useQueryClient()

  const refreshDiscover = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ['businesses-with-campaigns'] })
  }, [queryClient])

  useSupabaseRealtime({
    table: 'campaigns',
    event: 'UPDATE',
    enabled: isSupabaseConfigured(),
    onChange: refreshDiscover,
  })

  return useQuery({
    queryKey: ['businesses-with-campaigns'],
    queryFn: fetchBusinessesWithCampaigns,
    staleTime: 30_000,
    refetchInterval: 60_000,
  })
}

export function useCustomerRewards() {
  const session = getUser('customer')
  const customerId = session?.userId
  const queryClient = useQueryClient()

  const invalidateRewards = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ['customer-rewards'] })
  }, [queryClient])

  useSupabaseRealtime({
    table: 'customer_rewards',
    filter: customerId ? `customer_id=eq.${customerId}` : undefined,
    enabled: Boolean(customerId) && isSupabaseConfigured(),
    onChange: invalidateRewards,
  })

  return useQuery({
    queryKey: ['customer-rewards'],
    queryFn: fetchCustomerRewards,
    enabled: session?.role === 'customer',
    refetchInterval: query => {
      const hasPending = query.state.data?.some(r => r.status === 'pending')
      if (!hasPending) return false
      return isSupabaseConfigured() ? 5000 : 3000
    },
  })
}

/** Live campaign row updates (status, dates) while customer is on a campaign screen. */
export function usePublicCampaignRealtime(campaignId: string | undefined) {
  const queryClient = useQueryClient()

  const invalidateCampaign = useCallback(() => {
    if (!campaignId) return
    void queryClient.invalidateQueries({ queryKey: ['public-campaign', campaignId] })
    void queryClient.refetchQueries({
      predicate: (q) => {
        const key = q.queryKey
        return (
          Array.isArray(key) &&
          key[1] === campaignId &&
          ['public-campaign', 'play-state', 'stamp-state', 'loyalty-state'].includes(
            key[0] as string,
          )
        )
      },
      type: 'active',
    })
  }, [campaignId, queryClient])

  useSupabaseRealtime({
    table: 'campaigns',
    event: 'UPDATE',
    filter: campaignId ? `id=eq.${campaignId}` : undefined,
    enabled: Boolean(campaignId) && isSupabaseConfigured(),
    onChange: invalidateCampaign,
  })
}

/** Customer-wide realtime: plays, stamps, loyalty, rewards without hard refresh. */
export function useCustomerSessionRealtime() {
  const session = getUser('customer')
  const customerId = session?.userId
  const queryClient = useQueryClient()
  const enabled = Boolean(customerId) && session?.role === 'customer' && isSupabaseConfigured()

  const refreshGameplay = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ['customer-rewards'] })
    void queryClient.refetchQueries({
      predicate: (q) => {
        const key = q.queryKey[0]
        return (
          typeof key === 'string' &&
          [
            'play-state',
            'stamp-state',
            'loyalty-state',
            'business-campaign-states',
            'businesses-with-campaigns',
            'public-campaign',
          ].includes(key)
        )
      },
      type: 'active',
    })
  }, [queryClient])

  const customerFilter = customerId ? `customer_id=eq.${customerId}` : undefined

  useSupabaseRealtime({ table: 'game_plays', filter: customerFilter, enabled, onChange: refreshGameplay })
  useSupabaseRealtime({ table: 'stamp_cards', filter: customerFilter, enabled, onChange: refreshGameplay })
  useSupabaseRealtime({ table: 'loyalty_cards', filter: customerFilter, enabled, onChange: refreshGameplay })
}

/** Live campaign states on a business detail page. */
export function useBusinessCampaignStatesRealtime(businessId: string | undefined) {
  const queryClient = useQueryClient()

  const refreshStates = useCallback(() => {
    if (!businessId) return
    void queryClient.invalidateQueries({ queryKey: ['business-campaign-states', businessId] })
    void queryClient.invalidateQueries({ queryKey: ['businesses-with-campaigns'] })
  }, [businessId, queryClient])

  useSupabaseRealtime({
    table: 'campaigns',
    event: 'UPDATE',
    filter: businessId ? `business_id=eq.${businessId}` : undefined,
    enabled: Boolean(businessId) && isSupabaseConfigured(),
    onChange: refreshStates,
  })
}

export function useCustomerLoyaltyProfiles() {
  const session = getUser('customer')
  return useQuery({
    queryKey: ['customer-loyalty-profile'],
    queryFn: fetchCustomerLoyaltyProfile,
    enabled: session?.role === 'customer',
  })
}

export function useRequestRedemption() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: requestRewardRedemption,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-rewards'] })
    },
  })
}

export function useCustomerProfile() {
  const session = getUser('customer')
  return useQuery({
    queryKey: ['customer-profile'],
    queryFn: fetchCustomerProfile,
    enabled: session?.role === 'customer',
  })
}

export function useCustomerNotifications() {
  const session = getUser('customer')
  return useQuery({
    queryKey: ['customer-notifications'],
    queryFn: fetchCustomerNotifications,
    enabled: session?.role === 'customer',
    refetchInterval: 60_000,
  })
}

export function useUpdateCustomerProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateCustomerProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-profile'] })
      queryClient.invalidateQueries({ queryKey: ['customer-notifications'] })
    },
  })
}
