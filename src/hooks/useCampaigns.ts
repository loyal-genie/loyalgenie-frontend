import { useCallback } from 'react'
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
import { isSupabaseConfigured } from '@/lib/supabase'
import { useSupabaseRealtime } from '@/hooks/useSupabaseRealtime'
import { useBusinessProfile } from '@/hooks/useBusinessProfile'

function pinPollingInterval(query: { state: { data?: { secondsRemaining?: number } } }): number | false {
  const remaining = query.state.data?.secondsRemaining
  // Before first fetch, poll moderately so countdown never stalls without Realtime
  if (remaining == null) return 15_000
  if (remaining <= 0) return 1000
  if (remaining <= 10) return 1000
  if (remaining <= 15) return 2000
  if (remaining <= 30) return 5000
  // Baseline safety net even when Supabase Realtime is connected
  return 30_000
}

function refetchActivePinQueries(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.refetchQueries({
    predicate: (q) =>
      Array.isArray(q.queryKey) &&
      q.queryKey[0] === 'campaigns' &&
      q.queryKey[2] === 'pin',
    type: 'active',
  })
}

export function useCampaigns() {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: fetchCampaigns,
    enabled: isBusinessAuthenticated(),
    staleTime: 30_000,
  })
}

export function useCampaign(id: string | undefined) {
  return useQuery({
    queryKey: ['campaigns', id],
    queryFn: () => fetchCampaign(id!),
    enabled: Boolean(id) && isBusinessAuthenticated(),
    staleTime: 30_000,
  })
}

export function useCampaignPin(id: string | undefined, enabled = true) {
  const queryClient = useQueryClient()
  const pinEnabled = Boolean(id) && enabled && isBusinessAuthenticated()

  const invalidatePin = useCallback(() => {
    if (!id) return
    void queryClient.invalidateQueries({ queryKey: ['campaigns', id, 'pin'] })
    void queryClient.refetchQueries({ queryKey: ['campaigns', id, 'pin'], type: 'active' })
  }, [id, queryClient])

  useSupabaseRealtime({
    table: 'campaigns',
    event: 'UPDATE',
    filter: id ? `id=eq.${id}` : undefined,
    enabled: pinEnabled && isSupabaseConfigured(),
    onChange: invalidatePin,
  })

  return useQuery({
    queryKey: ['campaigns', id, 'pin'],
    queryFn: () => fetchCampaignPin(id!),
    enabled: pinEnabled,
    staleTime: 0,
    refetchInterval: pinPollingInterval,
  })
}

/** Vendor-wide: any campaign PIN update for this business refetches all active pin queries. */
export function useVendorPinRealtime() {
  const queryClient = useQueryClient()
  const { data: profile } = useBusinessProfile()
  const businessId = profile?.id

  const onBusinessCampaignChange = useCallback(() => {
    refetchActivePinQueries(queryClient)
  }, [queryClient])

  useSupabaseRealtime({
    table: 'campaigns',
    event: 'UPDATE',
    filter: businessId ? `business_id=eq.${businessId}` : undefined,
    enabled: Boolean(businessId) && isBusinessAuthenticated() && isSupabaseConfigured(),
    onChange: onBusinessCampaignChange,
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
