import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchCampaigns,
  fetchCampaign,
  fetchCampaignPin,
  createCampaign,
  type CreateCampaignPayload,
} from '@/lib/api'

export function useCampaigns() {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: fetchCampaigns,
  })
}

export function useCampaign(id: string | undefined) {
  return useQuery({
    queryKey: ['campaigns', id],
    queryFn: () => fetchCampaign(id!),
    enabled: Boolean(id),
  })
}

export function useCampaignPin(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['campaigns', id, 'pin'],
    queryFn: () => fetchCampaignPin(id!),
    enabled: Boolean(id) && enabled,
    refetchInterval: (query) => {
      const remaining = query.state.data?.secondsRemaining ?? 0
      return remaining <= 5 ? 2000 : 10000
    },
  })
}

export function useCreateCampaign() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateCampaignPayload) => createCampaign(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    },
  })
}
