import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchCampaigns,
  fetchCampaign,
  fetchCampaignPin,
  createCampaign,
  updateCampaign,
  type CreateCampaignPayload,
  type UpdateCampaignPayload,
} from '@/lib/api'
import { isBusinessAuthenticated } from '@/lib/auth'

export function useCampaigns() {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: fetchCampaigns,
    enabled: isBusinessAuthenticated(),
    refetchOnMount: 'always',
    staleTime: 10_000,
  })
}

export function useCampaign(id: string | undefined) {
  return useQuery({
    queryKey: ['campaigns', id],
    queryFn: () => fetchCampaign(id!),
    enabled: Boolean(id) && isBusinessAuthenticated(),
    refetchOnMount: 'always',
  })
}

export function useCampaignPin(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['campaigns', id, 'pin'],
    queryFn: () => fetchCampaignPin(id!),
    enabled: Boolean(id) && enabled && isBusinessAuthenticated(),
    staleTime: 0,
    refetchInterval: (query) => {
      const remaining = query.state.data?.secondsRemaining ?? 0
      if (remaining <= 0) return 1500
      if (remaining <= 5) return 2000
      if (remaining <= 20) return 5000
      return 10000
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

export function useUpdateCampaign(id: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateCampaignPayload) => updateCampaign(id!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      queryClient.invalidateQueries({ queryKey: ['campaigns', id] })
      queryClient.invalidateQueries({ queryKey: ['vendor-dashboard'] })
    },
  })
}
