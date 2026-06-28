import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchCampaigns,
  fetchCampaign,
  fetchCampaignPin,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  type CreateCampaignPayload,
  type UpdateCampaignPayload,
  type CampaignPin,
} from '@/lib/api'
import { isBusinessAuthenticated } from '@/lib/auth'
import { isSupabaseConfigured } from '@/lib/supabase'
import { useSupabaseRealtime } from '@/hooks/useSupabaseRealtime'
import { useBusinessProfile } from '@/hooks/useBusinessProfile'
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback'

function secondsUntilExpiry(expiresAt: string | null | undefined): number {
  if (!expiresAt) return 0
  return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000))
}

/** Poll based on live clock vs expiresAt — not stale secondsRemaining from last fetch. */
function pinPollingInterval(query: { state: { data?: CampaignPin } }): number | false {
  const pin = query.state.data
  if (!pin?.expiresAt) return 15_000

  const remaining = secondsUntilExpiry(pin.expiresAt)
  if (remaining <= 0) return 400
  if (remaining <= 10) return 1000
  if (remaining <= 15) return 2000
  if (remaining <= 30) return 5000
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

  const forcePinRefresh = useCallback(() => {
    if (!id) return
    void queryClient.invalidateQueries({ queryKey: ['campaigns', id, 'pin'], refetchType: 'active' })
    void queryClient.refetchQueries({
      queryKey: ['campaigns', id, 'pin'],
      type: 'active',
    })
  }, [id, queryClient])

  const onRealtimePin = useDebouncedCallback(forcePinRefresh, 150)

  useSupabaseRealtime({
    table: 'campaigns',
    event: 'UPDATE',
    filter: id ? `id=eq.${id}` : undefined,
    enabled: pinEnabled && isSupabaseConfigured(),
    onChange: onRealtimePin,
  })

  return useQuery({
    queryKey: ['campaigns', id, 'pin'],
    queryFn: () => fetchCampaignPin(id!),
    enabled: pinEnabled,
    staleTime: 0,
    gcTime: 0,
    structuralSharing: false,
    refetchInterval: pinPollingInterval,
    refetchIntervalInBackground: true,
  })
}

/** Vendor-wide: any campaign PIN update for this business refetches all active pin queries. */
export function useVendorPinRealtime() {
  const queryClient = useQueryClient()
  const { data: profile } = useBusinessProfile()
  const businessId = profile?.id

  const onBusinessCampaignChange = useDebouncedCallback(() => {
    refetchActivePinQueries(queryClient)
  }, 150)

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
      queryClient.invalidateQueries({ queryKey: ['vendor-dashboard-stats'] })
    },
  })
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (campaignId: string) => deleteCampaign(campaignId),
    onSuccess: (_data, campaignId) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      queryClient.removeQueries({ queryKey: ['campaigns', campaignId] })
      queryClient.removeQueries({ queryKey: ['campaigns', campaignId, 'pin'] })
      queryClient.invalidateQueries({ queryKey: ['vendor-dashboard-stats'] })
      queryClient.invalidateQueries({ queryKey: ['vendor-redemptions'] })
      queryClient.invalidateQueries({ queryKey: ['vendor-customers'] })
    },
  })
}
