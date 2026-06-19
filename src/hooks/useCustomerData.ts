import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchBusinessesWithCampaigns, fetchCustomerRewards, requestRewardRedemption } from '@/lib/api'
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

export function useRequestRedemption() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: requestRewardRedemption,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-rewards'] })
    },
  })
}
