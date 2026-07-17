import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchVendorDashboardStats,
  fetchVendorCustomers,
  fetchVendorCustomer,
  fetchPendingRedemptions,
  markRedemptionRedeemed,
  type VendorStatsPeriod,
} from '@/lib/api'
import { isSupabaseConfigured } from '@/lib/supabase'
import { campaignIdsRealtimeFilter } from '@/lib/supabase-realtime-filters'
import { useSupabaseRealtime } from '@/hooks/useSupabaseRealtime'
import { useCampaigns } from '@/hooks/useCampaigns'
import { isBusinessAuthenticated } from '@/lib/auth'
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback'

function refreshVendorAnalytics(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ['vendor-dashboard-stats'] })
  void queryClient.invalidateQueries({ queryKey: ['vendor-customers'] })
  void queryClient.invalidateQueries({ queryKey: ['vendor-redemptions'] })
  void queryClient.invalidateQueries({ queryKey: ['campaigns'] })
  void queryClient.invalidateQueries({ queryKey: ['business-rewards'] })
  void queryClient.invalidateQueries({ queryKey: ['rewards-overview'] })
  void queryClient.invalidateQueries({ queryKey: ['vendor-redeemed-rewards'] })
  // Force active queries to hit the API immediately (no wait for remount / hard refresh)
  void queryClient.refetchQueries({ queryKey: ['vendor-dashboard-stats'], type: 'active' })
  void queryClient.refetchQueries({ queryKey: ['vendor-customers'], type: 'active' })
  void queryClient.refetchQueries({ queryKey: ['vendor-redemptions'], type: 'active' })
  void queryClient.refetchQueries({ queryKey: ['campaigns'], type: 'active' })
}

export function useVendorDashboardStats(period: VendorStatsPeriod = 'all') {
  return useQuery({
    queryKey: ['vendor-dashboard-stats', period],
    queryFn: () => fetchVendorDashboardStats(period),
    staleTime: 0,
    refetchInterval: isSupabaseConfigured() ? 12_000 : 15_000,
    refetchIntervalInBackground: true,
  })
}

export function useVendorCustomers() {
  return useQuery({
    queryKey: ['vendor-customers'],
    queryFn: fetchVendorCustomers,
    staleTime: 0,
    refetchInterval: isSupabaseConfigured() ? 12_000 : 15_000,
    refetchIntervalInBackground: true,
  })
}

export function useVendorCustomer(id: string | undefined) {
  return useQuery({
    queryKey: ['vendor-customers', id],
    queryFn: () => fetchVendorCustomer(id!),
    enabled: Boolean(id),
    staleTime: 0,
    refetchInterval: isSupabaseConfigured() ? 12_000 : false,
  })
}

export function usePendingRedemptions(campaignIds: string[] = []) {
  const queryClient = useQueryClient()
  const filter = campaignIdsRealtimeFilter(campaignIds)
  const vendorAuthed = isBusinessAuthenticated()

  const onRedemptionChange = useCallback(() => {
    refreshVendorAnalytics(queryClient)
  }, [queryClient])

  // Filtered (campaign rewards) + unfiltered (points_claim with null campaign_id)
  useSupabaseRealtime({
    table: 'customer_rewards',
    event: 'UPDATE',
    filter,
    enabled: vendorAuthed && isSupabaseConfigured() && Boolean(filter),
    onChange: onRedemptionChange,
  })
  useSupabaseRealtime({
    table: 'customer_rewards',
    event: 'INSERT',
    filter,
    enabled: vendorAuthed && isSupabaseConfigured() && Boolean(filter),
    onChange: onRedemptionChange,
  })
  useSupabaseRealtime({
    table: 'customer_rewards',
    event: '*',
    enabled: vendorAuthed && isSupabaseConfigured(),
    onChange: onRedemptionChange,
  })

  return useQuery({
    queryKey: ['vendor-redemptions'],
    queryFn: fetchPendingRedemptions,
    enabled: vendorAuthed,
    staleTime: 0,
    refetchInterval: vendorAuthed ? (isSupabaseConfigured() ? 5_000 : 3_000) : false,
    refetchIntervalInBackground: true,
  })
}

export function useMarkRedeemed() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: markRedemptionRedeemed,
    onSuccess: () => {
      refreshVendorAnalytics(queryClient)
    },
  })
}

/**
 * Vendor-wide realtime: any play / reward / stamp / loyalty change
 * immediately refreshes dashboard, customers, campaigns, redemptions.
 */
export function useVendorSessionRealtime() {
  const queryClient = useQueryClient()
  const { data: campaigns = [] } = useCampaigns()
  const campaignIds = campaigns.map(c => c.id)
  const filter = campaignIdsRealtimeFilter(campaignIds)
  const enabled = isBusinessAuthenticated() && isSupabaseConfigured()

  const refreshVendor = useDebouncedCallback(() => {
    refreshVendorAnalytics(queryClient)
  }, 50)

  // Always listen unfiltered — catches every business event the vendor's RLS allows,
  // including points_claim (campaign_id null) and plays before campaigns list loads.
  useSupabaseRealtime({
    table: 'customer_rewards',
    event: '*',
    enabled,
    onChange: refreshVendor,
  })
  useSupabaseRealtime({
    table: 'game_plays',
    event: '*',
    enabled,
    onChange: refreshVendor,
  })
  useSupabaseRealtime({
    table: 'stamp_cards',
    event: '*',
    enabled,
    onChange: refreshVendor,
  })
  useSupabaseRealtime({
    table: 'loyalty_cards',
    event: '*',
    enabled,
    onChange: refreshVendor,
  })

  // Narrower campaign-scoped channels as a second path (when campaign IDs known)
  useSupabaseRealtime({
    table: 'game_plays',
    event: '*',
    filter,
    enabled: enabled && Boolean(filter),
    onChange: refreshVendor,
  })
  useSupabaseRealtime({
    table: 'customer_rewards',
    event: '*',
    filter,
    enabled: enabled && Boolean(filter),
    onChange: refreshVendor,
  })
}
