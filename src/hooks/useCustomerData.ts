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

export function useBusinessesWithCampaigns() {
  return useQuery({
    queryKey: ['businesses-with-campaigns'],
    queryFn: fetchBusinessesWithCampaigns,
  })
}

export function useCustomerRewards() {
  const session = getUser('customer')
  return useQuery({
    queryKey: ['customer-rewards'],
    queryFn: fetchCustomerRewards,
    enabled: session?.role === 'customer',
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
