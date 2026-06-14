import axios from 'axios'
import { getToken } from './auth'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export interface AuthUser {
  token: string
  userId: string
  email: string
  role?: 'business' | 'customer'
  name?: string
  phone?: string
  onboarded?: boolean
}

export async function signInBusiness(email: string, password: string) {
  const { data } = await api.post<{ success: boolean; data: AuthUser }>(
    '/auth/business/signin',
    { email, password },
  )
  return data.data
}

export async function signUpBusiness(email: string, password: string) {
  const { data } = await api.post<{ success: boolean; data: AuthUser }>(
    '/auth/business/signup',
    { email, password },
  )
  return data.data
}

export async function signInCustomer(email: string, password: string) {
  const { data } = await api.post<{ success: boolean; data: AuthUser }>(
    '/auth/customer/signin',
    { email, password },
  )
  return data.data
}

export async function signUpCustomer(payload: {
  name: string
  phone: string
  email: string
  password: string
}) {
  const { data } = await api.post<{ success: boolean; data: AuthUser }>(
    '/auth/customer/signup',
    payload,
  )
  return data.data
}

/** Matches backend `onboardingSchema` in backend/src/services/onboarding.ts */
export interface OnboardingPayload {
  name: string
  tagline?: string
  description?: string
  businessType: string
  ownerName: string
  mobile: string
  whatsapp?: string
  email: string
  password?: string
  city: string
  pincode?: string
  landmark?: string
  address?: string
  mapLink?: string
  operatingHours?: string
  weeklyOff?: string
  branchName?: string
  branchCity?: string
  branchAddress?: string
  brandColor?: string
  instagram?: string
  facebook?: string
  website?: string
  googleReview?: string
  logoData?: string
  coverBannerData?: string
  interiorPhotosData?: string[]
  exteriorPhotosData?: string[]
}

export interface OnboardingResult {
  businessId: string
  qrSlug: string
  joinUrl: string
  qrCodeDataUrl: string
  token?: string
}

export async function completeOnboarding(payload: OnboardingPayload) {
  const { data } = await api.post<{ success: boolean; data: OnboardingResult & { token?: string } }>(
    '/onboarding/complete',
    payload,
  )
  return data.data
}

export async function fetchBusinessBySlug(slug: string) {
  const { data } = await api.get<{
    data: {
      name: string
      qr_slug: string
      joinUrl: string
      qrCodeDataUrl: string
    }
  }>(`/onboarding/qr/${slug}`)
  return data.data
}

export function getApiErrorMessage(err: unknown, fallback: string) {
  if (axios.isAxiosError(err)) {
    const body = err.response?.data as { error?: string; details?: Record<string, string[]> } | undefined
    if (body?.details) {
      const first = Object.values(body.details).flat()[0]
      if (first) return first
    }
    if (body?.error) return body.error
  }
  return fallback
}

export interface BusinessProfile {
  id: string
  name: string
  tagline: string
  description: string
  businessType: string
  ownerName: string
  mobile: string
  whatsapp: string
  email: string
  city: string
  pincode: string
  landmark: string
  address: string
  mapLink: string
  operatingHours: string
  weeklyOff: string
  brandColor: string
  instagram: string
  facebook: string
  website: string
  googleReview: string
  qrSlug: string
  branchName: string
  branchCity: string
  branchAddress: string
  logoData: string
  coverBannerData: string
  interiorPhotosData: string[]
  exteriorPhotosData: string[]
}

export type BusinessProfileUpdate = Partial<Omit<BusinessProfile, 'id' | 'qrSlug'>>

export interface BusinessQr {
  businessId: string
  businessName: string
  qrSlug: string
  joinUrl: string
  qrCodeDataUrl: string
}

export async function fetchBusinessProfile() {
  const { data } = await api.get<{ success: boolean; data: BusinessProfile }>('/business/me')
  return data.data
}

export async function updateBusinessProfile(payload: BusinessProfileUpdate) {
  const { data } = await api.patch<{ success: boolean; data: BusinessProfile }>('/business/me', payload)
  return data.data
}

export async function fetchBusinessQr() {
  const { data } = await api.get<{ success: boolean; data: BusinessQr }>('/business/me/qr')
  return data.data
}
