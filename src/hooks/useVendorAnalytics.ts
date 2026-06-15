import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchVendorDashboardStats,
  fetchVendorCustomers,
  fetchVendorCustomer,
  fetchPendingRedemptions,
  markRedemptionRedeemed,
} from '@/lib/api'

export function useVendorDashboardStats() {
  return useQuery({
    queryKey: ['vendor-dashboard-stats'],
    queryFn: fetchVendorDashboardStats,
  })
}

export function useVendorCustomers() {
  return useQuery({
    queryKey: ['vendor-customers'],
    queryFn: fetchVendorCustomers,
  })
}

export function useVendorCustomer(id: string | undefined) {
  return useQuery({
    queryKey: ['vendor-customers', id],
    queryFn: () => fetchVendorCustomer(id!),
    enabled: Boolean(id),
  })
}

export function usePendingRedemptions() {
  return useQuery({
    queryKey: ['vendor-redemptions'],
    queryFn: fetchPendingRedemptions,
    refetchInterval: 15000,
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
