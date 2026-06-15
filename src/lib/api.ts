import axios from 'axios'
import { clearSession, getToken } from './auth'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

function attachAuthHeader(config: import('axios').InternalAxiosRequestConfig) {
  const token = getToken()
  if (token) {
    if (typeof config.headers.set === 'function') {
      config.headers.set('Authorization', `Bearer ${token}`)
    } else {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
}

api.interceptors.request.use(attachAuthHeader)

let handling401 = false

const AUTH_401_MESSAGES = new Set([
  'Authentication required',
  'Invalid or expired token',
])

function isAuthFailure401(error: unknown): boolean {
  if (!axios.isAxiosError(error) || error.response?.status !== 401) return false
  const body = error.response.data as { error?: string } | undefined
  const message = body?.error?.trim()
  if (!message) return true
  return AUTH_401_MESSAGES.has(message)
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isAuthFailure401(error) && !handling401) {
      const path = window.location.pathname
      const onAuthPage = path.startsWith('/signin') || path.startsWith('/signup') || path.startsWith('/forgot-password')
      if (!onAuthPage) {
        handling401 = true
        const isCustomerRoute = path.startsWith('/customer')
        clearSession()
        const params = new URLSearchParams({ reason: 'session_expired' })
        if (isCustomerRoute) params.set('role', 'customer')
        window.location.assign(`/signin?${params.toString()}`)
      }
    }
    return Promise.reject(error)
  },
)

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

export interface AuthSession {
  userId: string
  email: string
  role: 'business' | 'customer'
  name?: string
  phone?: string
}

/** Validates JWT with the server (not just local decode). */
export async function fetchAuthSession() {
  const { data } = await api.get<{ success: boolean; data: AuthSession }>('/auth/session')
  return data.data
}

export async function resetPasswordByEmail(role: 'business' | 'customer', email: string, password: string) {
  await api.post(`/auth/${role}/forgot-password`, { email, password })
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
    if (err.response?.status === 401) {
      const body = err.response.data as { error?: string } | undefined
      if (body?.error && !['Authentication required', 'Invalid or expired token'].includes(body.error)) {
        return body.error
      }
      return 'Your session expired. Please sign in again.'
    }
    if (err.response?.status === 404) {
      return '404: Service endpoint not found'
    }
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

// ── Campaigns ─────────────────────────────────────────────────────────────────

export interface CampaignRewardDto {
  id: string
  name: string
  description: string
  icon: string
  sharePercent: number
}

export interface CampaignDto {
  id: string
  businessId: string
  name: string
  mechanic: string
  status: string
  startDate: string
  endDate: string
  userCap: number
  perDayUserLimit: number
  playsPerDay: number
  winRatePercent: number
  pin: string | null
  pinExpiresAt: string | null
  createdAt: string
  rewards: CampaignRewardDto[]
  currentUsers: number
  participations: number
  rewardsClaimed: number
  redeemedCount: number
}

export interface CreateCampaignPayload {
  name: string
  mechanic: 'shake'
  startDate: string
  endDate: string
  userCap: number
  perDayUserLimit: number
  playsPerDay: number
  winRatePercent: number
  rewards: { name: string; description?: string; icon: string; sharePercent: number }[]
}

export interface BusinessWithCampaigns {
  id: string
  name: string
  tagline: string
  businessType: string
  city: string
  brandColor: string
  campaigns: {
    id: string
    name: string
    mechanic: string
    startDate: string
    endDate: string
    winRatePercent: number
    playsPerDay: number
  }[]
}

export interface PublicCampaign {
  id: string
  businessId: string
  name: string
  mechanic: string
  startDate: string
  endDate: string
  playsPerDay: number
  winRatePercent: number
  rewards: { id: string; name: string; description: string; icon: string }[]
}

export interface PlayState {
  campaignId: string
  playsRemaining: number
  playsUsedToday: number
  playsPerDay: number
  canPlay: boolean
  message: string
  winRatePercent: number
}

export interface ShakeResult {
  won: boolean
  reward: { id: string; name: string; description: string; icon: string } | null
  code: string | null
  playsRemaining: number
  playsUsedToday: number
  playsPerDay: number
  playId: string
}

export interface CustomerRewardDto {
  id: string
  campaignId: string
  campaignName: string
  mechanic: string
  reward: string
  icon: string
  earnedAt: string
  status: string
  redeemedAt?: string
  code: string
}

export interface CampaignPin {
  pin: string
  expiresAt: string
  secondsRemaining: number
  cycleSeconds: number
}

export async function fetchCampaigns() {
  const { data } = await api.get<{ success: boolean; data: CampaignDto[] }>('/campaigns')
  return data.data
}

export async function createCampaign(payload: CreateCampaignPayload) {
  const { data } = await api.post<{ success: boolean; data: CampaignDto }>('/campaigns', payload)
  return data.data
}

export async function fetchCampaign(id: string) {
  const { data } = await api.get<{ success: boolean; data: CampaignDto }>(`/campaigns/${id}`)
  return data.data
}

export interface UpdateCampaignPayload {
  name?: string
  endDate?: string
  userCap?: number
  perDayUserLimit?: number
  playsPerDay?: number
  winRatePercent?: number
  status?: 'active' | 'paused' | 'ended'
  rewards?: { id?: string; name: string; description?: string; icon: string; sharePercent: number }[]
}

export async function updateCampaign(id: string, payload: UpdateCampaignPayload) {
  const { data } = await api.patch<{ success: boolean; data: CampaignDto }>(`/campaigns/${id}`, payload)
  return data.data
}

export async function fetchCampaignPin(id: string) {
  const { data } = await api.get<{ success: boolean; data: CampaignPin }>(`/campaigns/${id}/pin`)
  return data.data
}

export async function fetchBusinessesWithCampaigns() {
  const { data } = await api.get<{ success: boolean; data: BusinessWithCampaigns[] }>('/campaigns/public/businesses')
  return data.data
}

export async function fetchPublicCampaign(id: string) {
  const { data } = await api.get<{ success: boolean; data: PublicCampaign }>(`/campaigns/public/${id}`)
  return data.data
}

export async function verifyCampaignPin(campaignId: string, pin: string) {
  const token = getToken()
  if (!token) {
    const err = new Error('NOT_AUTHENTICATED')
    throw err
  }
  const { data } = await api.post<{ success: boolean; data: { valid: boolean; playSessionToken: string } }>(
    `/campaigns/${campaignId}/verify-pin`,
    { pin },
    { headers: { Authorization: `Bearer ${token}` } },
  )
  return data.data
}

export async function fetchPlayState(campaignId: string) {
  const { data } = await api.get<{ success: boolean; data: PlayState }>(`/campaigns/${campaignId}/play-state`)
  return data.data
}

export async function executeShake(campaignId: string, playSessionToken: string) {
  const { data } = await api.post<{ success: boolean; data: ShakeResult }>(
    `/campaigns/${campaignId}/shake`,
    { playSessionToken },
  )
  return data.data
}

export async function fetchCustomerRewards() {
  const { data } = await api.get<{ success: boolean; data: CustomerRewardDto[] }>('/campaigns/customer/rewards')
  return data.data
}

// ── Vendor analytics ──────────────────────────────────────────────────────────

export interface VendorCustomerSummary {
  id: string
  name: string
  phone: string
  email: string
  joinedAt: string
  lastVisit: string | null
  totalVisits: number
  gamesPlayed: number
  rewardsEarned: number
  redeemedCount: number
  status: 'active' | 'inactive'
}

export interface VendorCustomerDetail extends VendorCustomerSummary {
  rewards: {
    id: string
    campaignId: string
    campaignName: string
    mechanic: string
    reward: string
    icon: string
    earnedAt: string
    status: 'pending' | 'redeemed'
    redeemedAt?: string
    code: string
  }[]
  gameHistory: {
    id: string
    campaignId: string
    campaignName: string
    mechanic: string
    playedAt: string
    won: boolean
    reward?: string
  }[]
  campaignActivity: {
    id: string
    name: string
    mechanic: string
    status: string
    plays: number
    wins: number
  }[]
}

export interface VendorDashboardStats {
  totalCustomers: number
  activeCustomers30d: number
  repeatVisitRate: number
  retentionRate: number
  segmentCounts: {
    loyalist: number
    regular: number
    atRisk: number
    inactive: number
  }
  atRiskCustomers: VendorCustomerSummary[]
  pendingRedemptions: number
  totalPlays: number
  totalWins: number
  totalRedeemed: number
  playsLast30d: number
  returningCustomers30d: number
}

export interface VendorRedemptionItem {
  id: string
  customerId: string
  customerName: string
  phone: string
  reward: string
  campaignName: string
  mechanic: string
  earnedAt: string
  code: string
}

export async function fetchVendorDashboardStats() {
  const { data } = await api.get<{ success: boolean; data: VendorDashboardStats }>('/business/dashboard/stats')
  return data.data
}

export async function fetchVendorCustomers() {
  const { data } = await api.get<{ success: boolean; data: VendorCustomerSummary[] }>('/business/customers')
  return data.data
}

export async function fetchVendorCustomer(id: string) {
  const { data } = await api.get<{ success: boolean; data: VendorCustomerDetail }>(`/business/customers/${id}`)
  return data.data
}

export async function fetchPendingRedemptions() {
  const { data } = await api.get<{ success: boolean; data: VendorRedemptionItem[] }>('/business/redemptions/pending')
  return data.data
}

export async function markRedemptionRedeemed(rewardId: string) {
  await api.patch(`/business/redemptions/${rewardId}/redeem`)
}
