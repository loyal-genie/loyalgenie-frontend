import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchVendorDashboardStats,
  fetchVendorCustomers,
  fetchVendorCustomer,
  fetchPendingRedemptions,
  markRedemptionRedeemed,
} from '@/lib/api'
import { isSupabaseConfigured } from '@/lib/supabase'
import { useSupabaseRealtime } from '@/hooks/useSupabaseRealtime'
import { useCampaigns } from '@/hooks/useCampaigns'
import { isBusinessAuthenticated } from '@/lib/auth'

export function useVendorDashboardStats() {
  return useQuery({
    queryKey: ['vendor-dashboard-stats'],
    queryFn: fetchVendorDashboardStats,
    staleTime: 15_000,
    refetchInterval: 30_000,
  })
}

export function useVendorCustomers() {
  return useQuery({
    queryKey: ['vendor-customers'],
    queryFn: fetchVendorCustomers,
    staleTime: 15_000,
    refetchInterval: 30_000,
  })
}

export function useVendorCustomer(id: string | undefined) {
  return useQuery({
    queryKey: ['vendor-customers', id],
    queryFn: () => fetchVendorCustomer(id!),
    enabled: Boolean(id),
  })
}

export function usePendingRedemptions(campaignIds: string[] = []) {
  const queryClient = useQueryClient()
  const filter =
    campaignIds.length > 0
      ? `campaign_id=in.(${campaignIds.join(',')})`
      : undefined

  const invalidateRedemptions = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ['vendor-redemptions'] })
    void queryClient.invalidateQueries({ queryKey: ['vendor-dashboard-stats'] })
  }, [queryClient])

  useSupabaseRealtime({
    table: 'customer_rewards',
    filter,
    enabled: isSupabaseConfigured(),
    onChange: invalidateRedemptions,
  })

  return useQuery({
    queryKey: ['vendor-redemptions'],
    queryFn: fetchPendingRedemptions,
    staleTime: isSupabaseConfigured() ? 15_000 : 0,
    refetchInterval: query => {
      const hasPending = (query.state.data?.length ?? 0) > 0
      return hasPending ? 15_000 : false
    },
  })
}

export function useMarkRedeemed() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: markRedemptionRedeemed,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-redemptions'] })
      queryClient.invalidateQueries({ queryKey: ['vendor-dashboard-stats'] })
      queryClient.invalidateQueries({ queryKey: ['vendor-customers'] })
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    },
  })
}

/** Vendor-wide realtime for plays, redemptions, and dashboard stats. */
export function useVendorSessionRealtime() {
  const queryClient = useQueryClient()
  const { data: campaigns = [] } = useCampaigns()
  const campaignIds = campaigns.map(c => c.id)
  const filter =
    campaignIds.length > 0 ? `campaign_id=in.(${campaignIds.join(',')})` : undefined
  const enabled = isBusinessAuthenticated() && isSupabaseConfigured() && Boolean(filter)

  const refreshVendor = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ['vendor-dashboard-stats'] })
    void queryClient.invalidateQueries({ queryKey: ['vendor-customers'] })
    void queryClient.invalidateQueries({ queryKey: ['vendor-redemptions'] })
    void queryClient.invalidateQueries({ queryKey: ['campaigns'] })
  }, [queryClient])

  useSupabaseRealtime({ table: 'customer_rewards', filter, enabled, onChange: refreshVendor })
  useSupabaseRealtime({ table: 'game_plays', filter, enabled, onChange: refreshVendor })
  useSupabaseRealtime({ table: 'stamp_cards', filter, enabled, onChange: refreshVendor })
}
