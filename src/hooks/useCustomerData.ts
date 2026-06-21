import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchBusinessesWithCampaigns,
  fetchCustomerLoyaltyProfile,
  fetchCustomerRewards,
  requestRewardRedemption,
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
