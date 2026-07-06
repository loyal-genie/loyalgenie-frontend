import axios from 'axios'
import { clearSession, getActiveAuthRole, getToken } from './auth'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

function attachAuthHeader(config: import('axios').InternalAxiosRequestConfig) {
  const role = getActiveAuthRole()
  const token = role ? getToken(role) : getToken()
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
      const onAuthPage = path.startsWith('/signin') || path.startsWith('/signup') || path.startsWith('/forgot-password') || path.startsWith('/business/')
      if (!onAuthPage) {
        handling401 = true
        const role = getActiveAuthRole(path)
        const isCustomerRoute = role === 'customer'
        clearSession(role ?? undefined)
        const params = new URLSearchParams({ reason: 'session_expired' })
        window.location.assign(isCustomerRoute ? `/signin?${params.toString()}` : `/business/signin?${params.toString()}`)
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
  profileComplete?: boolean
}

export interface CustomerProfileDto {
  id: string
  name: string
  phone: string
  email: string
  dateOfBirth?: string
  gender?: string
  profileComplete: boolean
  missingFields: Array<'dateOfBirth' | 'gender' | 'email'>
}

export interface CustomerNotificationDto {
  id: string
  type: 'profile_incomplete'
  title: string
  body: string
  actionUrl: string
  createdAt: string
}

export type BusinessAuthIntent = 'signin' | 'signup'

export async function sendBusinessEmailOtp(email: string, intent: BusinessAuthIntent = 'signin') {
  await api.post('/auth/business/otp/send', { email, intent })
}

export interface BusinessOtpLoginResult {
  token?: string
  userId?: string
  email?: string
  role?: 'business'
  onboarded?: boolean
  isNewUser?: boolean
  businessId?: string
}

export async function loginBusinessWithEmailOtp(email: string, otp: string, intent: BusinessAuthIntent = 'signin') {
  const { data } = await api.post<{ success: boolean; data: BusinessOtpLoginResult }>(
    '/auth/business/otp-login',
    { email, otp, intent },
  )
  return data.data
}

/** @deprecated use loginBusinessWithEmailOtp */
export async function signInBusiness(_email: string, _password: string) {
  throw new Error('Password sign in is no longer supported. Use email OTP.')
}

/** @deprecated use loginBusinessWithEmailOtp */
export async function signUpBusiness(_email: string, _password: string) {
  throw new Error('Password sign up is no longer supported. Use email OTP.')
}

export async function sendOtp(phone: string) {
  await api.post('/auth/otp/send', { phone })
}

export interface CustomerOtpLoginResult {
  isNewUser: boolean
  profileToken?: string
  phone?: string
  token?: string
  userId?: string
  email?: string
  name?: string
  role?: 'customer'
  profileComplete?: boolean
}

export async function loginCustomerWithOtp(phone: string, otp: string) {
  const { data } = await api.post<{ success: boolean; data: CustomerOtpLoginResult }>(
    '/auth/customer/otp-login',
    { phone, otp },
  )
  return data.data
}

export async function completeCustomerProfile(payload: {
  profileToken: string
  name: string
}) {
  const { data } = await api.post<{ success: boolean; data: AuthUser & { isNewUser: boolean; profileComplete?: boolean } }>(
    '/auth/customer/complete-profile',
    payload,
  )
  return data.data
}

export async function fetchCustomerProfile() {
  const { data } = await api.get<{ success: boolean; data: CustomerProfileDto }>('/customer/profile')
  return data.data
}

export async function updateCustomerProfile(payload: {
  name?: string
  gender?: 'male' | 'female' | 'other' | null
  dateOfBirth?: string | null
  email?: string | null
}) {
  const { data } = await api.patch<{
    success: boolean
    data: AuthUser & { profile: CustomerProfileDto; profileComplete: boolean }
  }>('/customer/profile', payload)
  return data.data
}

export async function fetchCustomerNotifications() {
  const { data } = await api.get<{
    success: boolean
    data: { notifications: CustomerNotificationDto[]; unreadCount: number }
  }>('/customer/notifications')
  return data.data
}

/** @deprecated use loginCustomerWithOtp */
export async function signInCustomer(phone: string, otp: string) {
  const result = await loginCustomerWithOtp(phone, otp)
  if (result.isNewUser || !result.token) {
    throw new Error('Account not found. Complete your profile to continue.')
  }
  return {
    token: result.token,
    userId: result.userId!,
    email: result.email ?? '',
    name: result.name,
    phone: result.phone,
    role: 'customer' as const,
  }
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

/** @deprecated password reset replaced by email OTP sign in */
export async function resetPasswordByEmail(_email: string, _password: string) {
  throw new Error('Password reset is no longer supported. Sign in with email OTP.')
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
      id: string
      name: string
      qr_slug: string
      joinUrl: string
      qrCodeDataUrl: string
    }
  }>(`/onboarding/qr/${slug}`)
  return data.data
}

export interface ApiErrorDetail {
  message: string
  status?: number
  details?: Record<string, string[]>
  code?: string
}

export function parseApiError(err: unknown, fallback: string): ApiErrorDetail {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status
    const body = err.response?.data as { error?: string; details?: Record<string, string[]> } | undefined
    const details = body?.details
    const code = body?.error

    if (details) {
      const lines = Object.entries(details).flatMap(([field, msgs]) =>
        msgs.map(m => (field === 'server' ? m : `${field}: ${m}`)),
      )
      if (lines.length > 0) {
        return { message: lines.join(' · '), status, details, code }
      }
    }

    if (code) {
      const isGenericSession401 =
        status === 401 &&
        ['Authentication required', 'Invalid or expired token'].includes(code)
      if (!isGenericSession401) {
        return { message: code, status, details, code }
      }
    }

    if (status === 401) {
      return { message: 'Your session expired. Please sign in again.', status, code }
    }
    if (status === 404) {
      return { message: '404: Service endpoint not found', status, code }
    }
    if (status === 500) {
      return {
        message: code ?? 'Server error — please try again in a moment',
        status,
        code,
      }
    }
    if (err.code === 'ECONNABORTED') {
      return { message: 'Request timed out. The server may be waking up — please try again.', status }
    }
    if (err.message === 'Network Error') {
      return { message: 'Network error — check your connection and try again.', status }
    }
  }

  if (err instanceof Error && err.message) {
    return { message: err.message }
  }

  return { message: fallback }
}

export function getApiErrorMessage(err: unknown, fallback: string) {
  return parseApiError(err, fallback).message
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
  rating?: number | null
  latitude?: number | null
  longitude?: number | null
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
  rewardTier?: string | null
  redeemExpiryMode?: 'fixed' | 'relative'
  redeemFixedDate?: string | null
  redeemRelativeAmount?: number | null
  redeemRelativeUnit?: 'day' | 'week' | 'month' | null
}

export interface StampCampaignStatsDto {
  enrolled: number
  active: number
  completed: number
  expired: number
  completionRate: number
  surpriseAwards: number
  bigAwards: number
  totalRewardsIssued: number
  avgStampsCollected: number
  claimDeadline: string
  enrollmentCloseDate: string
  claimPeriodDays: number
  pinActive: boolean
  enrollmentOpen: boolean
  stampConfig: {
    totalStamps: number
    prefillStamps: number
    surpriseDrops: { id: string; label: string; from: number; to: number; mode: 'single' | 'pool'; color: string }[]
    bigRewards: { id: string; label: string; from: number; to: number; mode: 'single' | 'pool'; color: string }[]
    surpriseRange?: [number, number]
    bigRange?: [number, number]
  } | null
}

export interface LoyaltyCampaignStatsDto {
  enrolled: number
  totalCheckIns: number
  avgLoyaltyPoints: number
  totalRewardsIssued: number
  milestones: { name: string; pointsThreshold: number; unlockCount: number }[]
  checkInConfig: { pointsPerCheckIn: number } | null
}

export interface CampaignDto {
  id: string
  businessId: string
  name: string
  mechanic: string
  status: string
  startDate: string
  endDate: string
  startTime?: string
  endTime?: string
  userCap: number
  perDayUserLimit: number
  playsPerDay: number
  overallWinners: number
  /** Derived display hint */
  winRatePercent: number
  pin: string | null
  pinExpiresAt: string | null
  claimPeriodDays?: number
  capFilledAt?: string | null
  createdAt: string
  rewards: CampaignRewardDto[]
  currentUsers: number
  participations: number
  rewardsClaimed: number
  redeemedCount: number
  stampStats?: StampCampaignStatsDto | null
  loyaltyStats?: LoyaltyCampaignStatsDto | null
}

export interface CreateShakeCampaignPayload {
  name: string
  mechanic: 'shake'
  startDate: string
  endDate: string
  startTime?: string
  endTime?: string
  userCap: number
  perDayUserLimit: number
  playsPerDay: number
  overallWinners: number
  rewards: {
    name: string
    description?: string
    icon: string
    sharePercent: number
    redeemExpiryMode: 'fixed' | 'relative'
    redeemFixedDate?: string
    redeemRelativeAmount?: number
    redeemRelativeUnit?: 'day' | 'week' | 'month'
  }[]
}

export interface CreateStampCampaignPayload {
  name: string
  mechanic: 'stamp'
  startDate: string
  endDate: string
  startTime?: string
  endTime?: string
  userCap: number
  claimPeriodDays: number
  stampConfig: {
    totalStamps: number
    prefillStamps: number
    surpriseDrops: { id: string; label: string; from: number; to: number; mode: 'single' | 'pool'; color: string }[]
    bigRewards: { id: string; label: string; from: number; to: number; mode: 'single' | 'pool'; color: string }[]
  }
  rewards: {
    surprise: Record<string, {
      name: string
      description?: string
      icon: string
      winPercent: number
      redeemExpiryMode: 'fixed' | 'relative'
      redeemFixedDate?: string
      redeemRelativeAmount?: number
      redeemRelativeUnit?: 'day' | 'week' | 'month'
    }[]>
    big: Record<string, {
      name: string
      description?: string
      icon: string
      winPercent: number
      redeemExpiryMode: 'fixed' | 'relative'
      redeemFixedDate?: string
      redeemRelativeAmount?: number
      redeemRelativeUnit?: 'day' | 'week' | 'month'
    }[]>
  }
}

export type CreateCampaignPayload = CreateShakeCampaignPayload | CreateStampCampaignPayload | CreateCheckInLoyaltyCampaignPayload

export interface CreateCheckInLoyaltyCampaignPayload {
  name: string
  mechanic: 'check-in-loyalty'
  startDate: string
  endDate: string
  startTime?: string
  endTime?: string
  userCap: number
  checkInConfig: { pointsPerCheckIn: number }
  milestones?: { name: string; description?: string; icon: string; pointsThreshold: number }[]
}

export interface BusinessWithCampaigns {
  id: string
  name: string
  tagline: string
  businessType: string
  city: string
  brandColor: string
  logoData?: string
  coverBannerData?: string
  address?: string
  landmark?: string
  mobile?: string
  operatingHours?: string
  googleReview?: string
  interiorPhotosData?: string[]
  branchAddress?: string
  branchCity?: string
  rating?: number | null
  latitude?: number | null
  longitude?: number | null
  displayDistanceKm?: number | null
  mechanicTags?: string[]
  campaigns: {
    id: string
    name: string
    mechanic: string
    startDate: string
    endDate: string
    overallWinners?: number
    userCap?: number
    winRatePercent?: number
    playsPerDay: number
  }[]
}

export interface PublicCampaign {
  id: string
  businessId: string
  businessName?: string
  name: string
  mechanic: string
  startDate: string
  endDate: string
  playsPerDay?: number
  overallWinners?: number
  winRatePercent?: number
  userCap?: number
  currentUsers?: number
  claimPeriodDays?: number
  stampConfig?: {
    totalStamps: number
    prefillStamps: number
    surpriseRange: [number, number]
    bigRange: [number, number]
  } | null
  rewards: { id: string; name: string; description: string; icon: string; tier?: string | null }[]
}

export interface StampDropConfig {
  id: string
  label: string
  from: number
  to: number
  mode: 'single' | 'pool'
  color: string
}

export interface StampDropTrigger {
  dropId: string
  tier: 'surprise' | 'big'
  triggerAt: number
  awarded: boolean
}

export interface StampState {
  campaignId: string
  mechanic: 'stamp'
  enrolled: boolean
  enrollmentOpen: boolean
  stampsCollected: number
  totalStamps: number
  prefillStamps: number
  surpriseDrops: StampDropConfig[]
  bigRewards: StampDropConfig[]
  dropTriggers: StampDropTrigger[]
  surpriseRange: [number, number]
  bigRange: [number, number]
  surpriseAwarded: boolean
  bigAwarded: boolean
  surpriseTriggerAt: number | null
  bigTriggerAt: number | null
  status: 'active' | 'completed' | 'expired' | null
  claimDeadline: string | null
  enrollmentCloseDate: string | null
  canCollectToday: boolean
  cardComplete: boolean
  userCap: number
  currentUsers: number
}

export interface StampCollectResult {
  enrolled: boolean
  stampsCollected: number
  totalStamps: number
  stampEarned: boolean
  cardComplete: boolean
  canCollectTomorrow: boolean
  trigger: 'surprise' | 'big' | null
  won: boolean
  reward: { name: string; icon: string } | null
  code: string | null
}

export interface PlayState {
  campaignId: string
  playsRemaining: number
  playsUsedToday: number
  playsPerDay: number
  canPlay: boolean
  message: string
  blockReason?: 'campaign_inactive' | 'user_cap' | 'daily_participant_limit' | 'no_plays_remaining' | null
  overallWinners?: number
  winRatePercent?: number
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
  campaignId: string | null
  campaignName: string
  mechanic: string
  reward: string
  icon: string
  earnedAt: string
  status: 'earned' | 'pending' | 'redeemed'
  requestedAt?: string
  redeemedAt?: string
  code: string
}

export interface CampaignPin {
  pin: string
  expiresAt: string
  secondsRemaining: number
  cycleSeconds: number
  verifyGraceSeconds?: number
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
  endTime?: string
  userCap?: number
  perDayUserLimit?: number
  playsPerDay?: number
  overallWinners?: number
  winRatePercent?: number
  status?: 'active' | 'paused' | 'ended'
  rewards?:
    | {
        id?: string
        name: string
        description?: string
        icon: string
        sharePercent: number
        redeemExpiryMode: 'fixed' | 'relative'
        redeemFixedDate?: string
        redeemRelativeAmount?: number
        redeemRelativeUnit?: 'day' | 'week' | 'month'
      }[]
    | {
        surprise: Record<string, {
          id?: string
          name: string
          description?: string
          icon: string
          winPercent: number
          redeemExpiryMode: 'fixed' | 'relative'
          redeemFixedDate?: string
          redeemRelativeAmount?: number
          redeemRelativeUnit?: 'day' | 'week' | 'month'
        }[]>
        big: Record<string, {
          id?: string
          name: string
          description?: string
          icon: string
          winPercent: number
          redeemExpiryMode: 'fixed' | 'relative'
          redeemFixedDate?: string
          redeemRelativeAmount?: number
          redeemRelativeUnit?: 'day' | 'week' | 'month'
        }[]>
      }
  claimPeriodDays?: number
  stampConfig?: {
    totalStamps: number
    prefillStamps: number
    surpriseDrops: StampDropConfig[]
    bigRewards: StampDropConfig[]
  }
  checkInConfig?: { pointsPerCheckIn: number }
  milestones?: { id?: string; name: string; description?: string; icon: string; pointsThreshold: number }[]
}

export async function updateCampaign(id: string, payload: UpdateCampaignPayload) {
  const { data } = await api.patch<{ success: boolean; data: CampaignDto }>(`/campaigns/${id}`, payload)
  return data.data
}

export interface CampaignDeletionSummary {
  id: string
  name: string
  participations: number
  gamePlays: number
  customerRewards: number
  stampCards: number
  loyaltyCards: number
}

export async function deleteCampaign(id: string) {
  const { data } = await api.delete<{ success: boolean; data: CampaignDeletionSummary }>(`/campaigns/${id}`)
  return data.data
}

export async function fetchCampaignPin(id: string) {
  const { data } = await api.get<{ success: boolean; data: CampaignPin }>(
    `/campaigns/${id}/pin`,
    { params: { _t: Date.now() } },
  )
  return data.data
}

export async function fetchBusinessesWithCampaigns() {
  const { data } = await api.get<{ success: boolean; data: BusinessWithCampaigns[] }>('/campaigns/public/businesses')
  return data.data
}

export type BusinessCampaignStateItem = {
  campaignId: string
  mechanic: string
  state: PlayState | StampState | LoyaltyState | null
}

export async function fetchBusinessCampaignStates(businessId: string) {
  const { data } = await api.get<{ success: boolean; data: BusinessCampaignStateItem[] }>(
    `/campaigns/public/businesses/${businessId}/states`,
  )
  return data.data
}

export async function fetchPublicCampaign(id: string) {
  const { data } = await api.get<{ success: boolean; data: PublicCampaign }>(`/campaigns/public/${id}`)
  return data.data
}

export async function verifyCampaignPin(campaignId: string, pin: string) {
  const token = getToken('customer')
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

export async function fetchStampState(campaignId: string) {
  const { data } = await api.get<{ success: boolean; data: StampState }>(`/campaigns/${campaignId}/stamp-state`)
  return data.data
}

export async function executeStamp(campaignId: string, playSessionToken: string) {
  const { data } = await api.post<{ success: boolean; data: StampCollectResult }>(
    `/campaigns/${campaignId}/stamp`,
    { playSessionToken },
  )
  return data.data
}

export async function executeStampWithPin(campaignId: string, pin: string) {
  const { data } = await api.post<{ success: boolean; data: StampCollectResult }>(
    `/campaigns/${campaignId}/stamp`,
    { pin },
  )
  return data.data
}

export async function fetchCustomerRewards() {
  const { data } = await api.get<{ success: boolean; data: CustomerRewardDto[] }>('/campaigns/customer/rewards')
  return data.data
}

export async function requestRewardRedemption(rewardId: string) {
  await api.post(`/campaigns/customer/rewards/${rewardId}/request-redemption`)
}

export interface LoyaltyState {
  campaignId: string
  mechanic: 'check-in-loyalty'
  enrolled: boolean
  loyaltyPoints: number
  totalCheckIns: number
  pointsPerCheckIn: number
  canCheckInToday: boolean
  checkedInToday: boolean
  milestones: { id: string; name: string; icon: string; pointsThreshold: number; unlocked: boolean; redeemed: boolean }[]
  nextMilestone: { name: string; pointsThreshold: number; pointsNeeded: number } | null
  userCap: number
  currentUsers: number
  campaignName: string
  businessId: string
  businessName: string
}

export interface CheckInResult {
  enrolled: boolean
  pointsEarned: number
  loyaltyPoints: number
  totalCheckIns: number
  checkedInToday: boolean
  milestonesUnlocked: { name: string; icon: string; code: string }[]
}

export interface CheckInPrompt {
  hasPendingCheckIn: boolean
  campaignId?: string
  campaignName?: string
  businessId?: string
  businessName?: string
  loyaltyPoints?: number
  pointsPerCheckIn?: number
  enrolled?: boolean
}

export interface CustomerLoyaltyProfile {
  campaignId: string
  campaignName: string
  businessId: string
  businessName: string
  loyaltyPoints: number
  totalCheckIns: number
  milestones: { name: string; icon: string; pointsThreshold: number; unlocked: boolean; awarded: boolean }[]
}

export async function fetchCheckInPrompt() {
  const { data } = await api.get<{ success: boolean; data: CheckInPrompt }>('/campaigns/customer/check-in-prompt')
  return data.data
}

export async function fetchCustomerLoyaltyProfile() {
  const { data } = await api.get<{ success: boolean; data: CustomerLoyaltyProfile[] }>('/campaigns/customer/loyalty-profile')
  return data.data
}

export async function fetchLoyaltyState(campaignId: string) {
  const { data } = await api.get<{ success: boolean; data: LoyaltyState }>(`/campaigns/${campaignId}/loyalty-state`)
  return data.data
}

export async function executeCheckIn(campaignId: string, playSessionToken: string) {
  const { data } = await api.post<{ success: boolean; data: CheckInResult }>(
    `/campaigns/${campaignId}/check-in`,
    { playSessionToken },
  )
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
  totalLoyaltyPoints: number
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
    status: 'earned' | 'pending' | 'redeemed'
    requestedAt?: string
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
  requestedAt?: string
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

// ── Standalone Rewards module ────────────────────────────────────────────────

export interface RewardCategoryDto {
  id: string
  name: string
  createdAt?: string
}

export interface BusinessRewardDto {
  id: string
  name: string
  description: string
  icon: string
  categoryId: string | null
  categoryName: string | null
  pointsRequired: number
  maxClaims: number | null
  claimsCount: number
  claimBefore: string | null
  redeemExpiryMode: 'fixed' | 'relative'
  redeemFixedDate: string | null
  redeemRelativeAmount: number | null
  redeemRelativeUnit: 'day' | 'week' | 'month' | null
  redemptionInstructions: string
  status: 'active' | 'expired' | 'depleted'
  createdAt: string
}

export interface VendorRewardsOverviewDto {
  totalRewards: number
  activeRewards: number
  totalRedeemed: number
  expiredRewards: number
}

export interface VendorRedeemedRewardDto {
  id: string
  customerName: string
  customerPhone: string
  rewardName: string
  icon: string
  source: string
  claimedAt: string | null
  earnedAt: string
  redeemedAt: string | null
}

export interface CustomerBusinessRewardsDto {
  points: number
  rewards: {
    id: string
    name: string
    description: string
    icon: string
    category: string
    pointsRequired: number
    availableCount: number | null
    maxClaims: number | null
    claimsCount: number
    claimBefore: string | null
    redeemBefore: string | null
    redemptionInstructions: string
    status: 'active' | 'expired' | 'depleted'
    claimable: boolean
    lockedByPoints: boolean
  }[]
}

export async function fetchRewardCategories() {
  const { data } = await api.get<{ success: boolean; data: RewardCategoryDto[] }>('/rewards/categories')
  return data.data
}

export async function createRewardCategory(name: string) {
  const { data } = await api.post<{ success: boolean; data: RewardCategoryDto }>('/rewards/categories', { name })
  return data.data
}

export async function fetchBusinessReward(id: string) {
  const { data } = await api.get<{ success: boolean; data: BusinessRewardDto }>(`/rewards/${id}`)
  return data.data
}

export async function fetchBusinessRewards(status?: 'active' | 'expired' | 'depleted') {
  const { data } = await api.get<{ success: boolean; data: BusinessRewardDto[] }>('/rewards', {
    params: status ? { status } : undefined,
  })
  return data.data
}

export async function fetchRewardsOverview() {
  const { data } = await api.get<{ success: boolean; data: VendorRewardsOverviewDto }>('/rewards/overview')
  return data.data
}

export async function createBusinessReward(payload: {
  name: string
  description?: string
  icon: string
  categoryId?: string
  categoryName?: string
  pointsRequired: number
  maxClaims?: number
  claimBefore?: string
  redeemExpiryMode: 'fixed' | 'relative'
  redeemFixedDate?: string
  redeemRelativeAmount?: number
  redeemRelativeUnit?: 'day' | 'week' | 'month'
  redemptionInstructions?: string
}) {
  const { data } = await api.post<{ success: boolean; data: BusinessRewardDto }>('/rewards', payload)
  return data.data
}

export async function updateBusinessReward(id: string, payload: Partial<{
  name: string
  description: string
  icon: string
  categoryId: string
  categoryName: string
  pointsRequired: number
  maxClaims: number
  claimBefore: string
  redeemExpiryMode: 'fixed' | 'relative'
  redeemFixedDate: string
  redeemRelativeAmount: number
  redeemRelativeUnit: 'day' | 'week' | 'month'
  redemptionInstructions: string
  status: 'active' | 'expired' | 'depleted'
}>) {
  const { data } = await api.patch<{ success: boolean; data: BusinessRewardDto }>(`/rewards/${id}`, payload)
  return data.data
}

export async function deleteBusinessReward(id: string) {
  await api.delete(`/rewards/${id}`)
}

export async function fetchRedeemedRewards(params?: { fromDate?: string; toDate?: string }) {
  const { data } = await api.get<{ success: boolean; data: VendorRedeemedRewardDto[] }>('/rewards/redeemed', {
    params,
  })
  return data.data
}

export async function fetchCustomerBusinessRewards(businessId: string) {
  const { data } = await api.get<{ success: boolean; data: CustomerBusinessRewardsDto }>(
    `/rewards/customer/business/${businessId}`,
  )
  return data.data
}

export async function claimCustomerBusinessReward(rewardId: string) {
  const { data } = await api.post<{ success: boolean; data: { success: boolean; code: string; rewardName: string; icon: string } }>(
    `/rewards/customer/${rewardId}/claim`,
  )
  return data.data
}
