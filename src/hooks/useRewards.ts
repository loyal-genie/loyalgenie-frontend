import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  claimCustomerBusinessReward,
  createBusinessReward,
  createRewardCategory,
  deleteBusinessReward,
  fetchBusinessReward,
  fetchBusinessRewards,
  fetchCustomerBusinessRewards,
  fetchRedeemedRewards,
  fetchRewardCategories,
  fetchRewardsOverview,
  updateBusinessReward,
} from '@/lib/api'

export function useRewardCategories() {
  return useQuery({
    queryKey: ['reward-categories'],
    queryFn: fetchRewardCategories,
    staleTime: 60_000,
  })
}

export function useCreateRewardCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createRewardCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reward-categories'] })
    },
  })
}

export function useBusinessRewards(status?: 'active' | 'expired' | 'depleted') {
  return useQuery({
    queryKey: ['business-rewards', status ?? 'all'],
    queryFn: () => fetchBusinessRewards(status),
    staleTime: 15_000,
  })
}

export function useRewardsOverview() {
  return useQuery({
    queryKey: ['rewards-overview'],
    queryFn: fetchRewardsOverview,
    staleTime: 15_000,
    refetchInterval: 30_000,
  })
}

export function useBusinessReward(id: string | undefined) {
  return useQuery({
    queryKey: ['business-reward', id],
    queryFn: () => fetchBusinessReward(id!),
    enabled: Boolean(id),
    staleTime: 15_000,
  })
}

export function useCreateBusinessReward() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createBusinessReward,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-rewards'] })
      queryClient.invalidateQueries({ queryKey: ['rewards-overview'] })
      queryClient.invalidateQueries({ queryKey: ['reward-categories'] })
    },
  })
}

export function useUpdateBusinessReward() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateBusinessReward>[1] }) => updateBusinessReward(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['business-rewards'] })
      queryClient.invalidateQueries({ queryKey: ['rewards-overview'] })
      queryClient.invalidateQueries({ queryKey: ['business-reward', variables.id] })
    },
  })
}

export function useDeleteBusinessReward() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteBusinessReward,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-rewards'] })
      queryClient.invalidateQueries({ queryKey: ['rewards-overview'] })
    },
  })
}

export function useRedeemedRewards(filters?: { fromDate?: string; toDate?: string }) {
  return useQuery({
    queryKey: ['vendor-redeemed-rewards', filters?.fromDate ?? null, filters?.toDate ?? null],
    queryFn: () => fetchRedeemedRewards(filters),
    staleTime: 10_000,
    refetchInterval: 20_000,
  })
}

export function useCustomerBusinessRewards(businessId: string | undefined) {
  return useQuery({
    queryKey: ['customer-business-rewards', businessId],
    queryFn: () => fetchCustomerBusinessRewards(businessId!),
    enabled: Boolean(businessId),
  })
}

export function useClaimCustomerBusinessReward() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: claimCustomerBusinessReward,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-business-rewards'] })
      queryClient.invalidateQueries({ queryKey: ['customer-rewards'] })
      queryClient.invalidateQueries({ queryKey: ['customer-loyalty-profile'] })
    },
  })
}
