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
import { campaignIdsRealtimeFilter } from '@/lib/supabase-realtime-filters'
import { useSupabaseRealtime } from '@/hooks/useSupabaseRealtime'
import { useCampaigns } from '@/hooks/useCampaigns'
import { isBusinessAuthenticated } from '@/lib/auth'
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback'

function refreshVendorRedemptions(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.refetchQueries({ queryKey: ['vendor-redemptions'], type: 'active' })
  void queryClient.invalidateQueries({ queryKey: ['vendor-dashboard-stats'] })
}

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
  const filter = campaignIdsRealtimeFilter(campaignIds)
  const vendorAuthed = isBusinessAuthenticated()

  const onRedemptionChange = useCallback(() => {
    refreshVendorRedemptions(queryClient)
  }, [queryClient])

  useSupabaseRealtime({
    table: 'customer_rewards',
    event: 'UPDATE',
    filter,
    enabled: vendorAuthed && isSupabaseConfigured(),
    onChange: onRedemptionChange,
  })

  useSupabaseRealtime({
    table: 'customer_rewards',
    event: 'INSERT',
    filter,
    enabled: vendorAuthed && isSupabaseConfigured(),
    onChange: onRedemptionChange,
  })

  return useQuery({
    queryKey: ['vendor-redemptions'],
    queryFn: fetchPendingRedemptions,
    enabled: vendorAuthed,
    staleTime: isSupabaseConfigured() ? 5_000 : 0,
    // Always poll while vendor portal is open — empty queue used to disable polling (bug)
    refetchInterval: vendorAuthed ? (isSupabaseConfigured() ? 8_000 : 4_000) : false,
    refetchIntervalInBackground: true,
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
  const filter = campaignIdsRealtimeFilter(campaignIds)
  const enabled = isBusinessAuthenticated() && isSupabaseConfigured()

  const refreshVendor = useDebouncedCallback(() => {
    refreshVendorRedemptions(queryClient)
    void queryClient.invalidateQueries({ queryKey: ['vendor-customers'] })
    void queryClient.invalidateQueries({ queryKey: ['vendor-dashboard-stats'] })
    void queryClient.invalidateQueries({ queryKey: ['campaigns'] })
  }, 300)

  useSupabaseRealtime({
    table: 'customer_rewards',
    event: 'UPDATE',
    filter,
    enabled,
    onChange: refreshVendor,
  })
  useSupabaseRealtime({
    table: 'customer_rewards',
    event: 'INSERT',
    filter,
    enabled,
    onChange: refreshVendor,
  })
  useSupabaseRealtime({ table: 'game_plays', filter, enabled: enabled && Boolean(filter), onChange: refreshVendor })
  useSupabaseRealtime({ table: 'stamp_cards', filter, enabled: enabled && Boolean(filter), onChange: refreshVendor })
}
