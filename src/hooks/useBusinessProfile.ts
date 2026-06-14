import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchBusinessProfile, updateBusinessProfile, fetchBusinessQr, type BusinessProfileUpdate } from '@/lib/api'

export const businessProfileKey = ['business', 'profile'] as const
export const businessQrKey = ['business', 'qr'] as const

export function useBusinessProfile() {
  return useQuery({
    queryKey: businessProfileKey,
    queryFn: fetchBusinessProfile,
  })
}

export function useBusinessQr() {
  return useQuery({
    queryKey: businessQrKey,
    queryFn: fetchBusinessQr,
  })
}

export function useUpdateBusinessProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: BusinessProfileUpdate) => updateBusinessProfile(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(businessProfileKey, data)
    },
  })
}
