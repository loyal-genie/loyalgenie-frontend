import { useQuery } from '@tanstack/react-query'
import { fetchBusinessesWithCampaigns, fetchCustomerRewards } from '@/lib/api'
import { getUser } from '@/lib/auth'

export function useBusinessesWithCampaigns() {
  return useQuery({
    queryKey: ['businesses-with-campaigns'],
    queryFn: fetchBusinessesWithCampaigns,
  })
}

export function useCustomerRewards() {
  const session = getUser()
  return useQuery({
    queryKey: ['customer-rewards'],
    queryFn: fetchCustomerRewards,
    enabled: session?.role === 'customer',
  })
}
