import { clearAllPlaySessions } from '@/lib/customer-game'

const TOKEN_KEY = 'lg_token'
const USER_KEY = 'lg_user'

export type UserRole = 'business' | 'customer'

export interface StoredUser {
  userId: string
  email: string
  role: UserRole
  onboarded?: boolean
  name?: string
  phone?: string
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getUser(): StoredUser | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as StoredUser
    if (!parsed.role) parsed.role = 'business'
    return parsed
  } catch {
    return null
  }
}

export function setSession(token: string, user: StoredUser) {
  clearAllPlaySessions()
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession() {
  clearAllPlaySessions()
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function isAuthenticated() {
  return Boolean(getToken())
}

interface TokenClaims {
  role: UserRole
  exp: number
  sub: string
}

/** Decode JWT payload (client-side only — server still verifies signature). */
export function getTokenClaims(): TokenClaims | null {
  const token = getToken()
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split('.')[1] ?? '')) as {
      sub?: string
      type?: string
      exp?: number
    }
    if (!payload.sub || !payload.exp) return null
    return {
      sub: payload.sub,
      exp: payload.exp,
      role: payload.type === 'customer' ? 'customer' : 'business',
    }
  } catch {
    return null
  }
}

/** True when token exists, is not expired, and matches the expected app role. */
export function isSessionValidForRole(role: UserRole): boolean {
  const user = getUser()
  const claims = getTokenClaims()
  if (!user || !claims) return false
  if (user.role !== role || claims.role !== role) return false
  return Date.now() < claims.exp * 1000
}

export function isCustomerAuthenticated() {
  return isSessionValidForRole('customer')
}

export function isBusinessAuthenticated() {
  return isSessionValidForRole('business')
}
