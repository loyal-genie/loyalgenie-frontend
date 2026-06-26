import { clearAllPlaySessions } from '@/lib/customer-game'

const LEGACY_TOKEN_KEY = 'lg_token'
const LEGACY_USER_KEY = 'lg_user'

export type UserRole = 'business' | 'customer'

export interface StoredUser {
  userId: string
  email: string
  role: UserRole
  onboarded?: boolean
  name?: string
  phone?: string
  profileComplete?: boolean
}

function tokenKey(role: UserRole) {
  return `lg_token_${role}`
}

function userKey(role: UserRole) {
  return `lg_user_${role}`
}

let legacyMigrated = false

/** Move single-key sessions to per-role storage (one-time). */
function migrateLegacySession() {
  if (legacyMigrated) return
  legacyMigrated = true

  const legacyToken = localStorage.getItem(LEGACY_TOKEN_KEY)
  const legacyUserRaw = localStorage.getItem(LEGACY_USER_KEY)
  if (!legacyToken || !legacyUserRaw) return

  try {
    const parsed = JSON.parse(legacyUserRaw) as StoredUser
    const role: UserRole = parsed.role === 'customer' ? 'customer' : 'business'
    if (!localStorage.getItem(tokenKey(role))) {
      localStorage.setItem(tokenKey(role), legacyToken)
      localStorage.setItem(userKey(role), legacyUserRaw)
    }
  } catch {
    /* ignore corrupt legacy data */
  }

  localStorage.removeItem(LEGACY_TOKEN_KEY)
  localStorage.removeItem(LEGACY_USER_KEY)
}

export function getActiveAuthRole(pathname = window.location.pathname): UserRole | null {
  if (pathname.startsWith('/customer')) return 'customer'
  if (
    pathname.startsWith('/vendor') ||
    pathname.startsWith('/onboarding') ||
    pathname.startsWith('/business')
  ) {
    return 'business'
  }
  return null
}

export function getToken(role?: UserRole): string | null {
  migrateLegacySession()
  if (role) return localStorage.getItem(tokenKey(role))
  const activeRole = getActiveAuthRole()
  if (activeRole) return localStorage.getItem(tokenKey(activeRole))
  return (
    localStorage.getItem(tokenKey('customer')) ??
    localStorage.getItem(tokenKey('business'))
  )
}

export function getUser(role?: UserRole): StoredUser | null {
  migrateLegacySession()

  const readRole = (r: UserRole): StoredUser | null => {
    const raw = localStorage.getItem(userKey(r))
    if (!raw) return null
    try {
      const parsed = JSON.parse(raw) as StoredUser
      if (!parsed.role) parsed.role = r
      return parsed
    } catch {
      return null
    }
  }

  if (role) return readRole(role)

  const activeRole = getActiveAuthRole()
  if (activeRole) return readRole(activeRole)

  return readRole('customer') ?? readRole('business')
}

export function setSession(token: string, user: StoredUser) {
  migrateLegacySession()
  if (user.role === 'customer') {
    clearAllPlaySessions()
  }
  localStorage.setItem(tokenKey(user.role), token)
  localStorage.setItem(userKey(user.role), JSON.stringify(user))
}

export function clearSession(role?: UserRole) {
  migrateLegacySession()
  const roles: UserRole[] = role ? [role] : ['customer', 'business']
  for (const r of roles) {
    if (r === 'customer') clearAllPlaySessions()
    localStorage.removeItem(tokenKey(r))
    localStorage.removeItem(userKey(r))
  }
}

export function isAuthenticated(role?: UserRole) {
  return Boolean(getToken(role))
}

interface TokenClaims {
  role: UserRole
  exp: number
  sub: string
}

function decodeTokenClaims(token: string): TokenClaims | null {
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

/** Decode JWT payload (client-side only — server still verifies signature). */
export function getTokenClaims(role?: UserRole): TokenClaims | null {
  const token = getToken(role)
  if (!token) return null
  return decodeTokenClaims(token)
}

/** True when token exists, is not expired, and matches the expected app role. */
export function isSessionValidForRole(role: UserRole): boolean {
  const user = getUser(role)
  const token = getToken(role)
  if (!user || !token) return false
  const claims = decodeTokenClaims(token)
  if (!claims) return false
  if (user.role !== role || claims.role !== role) return false
  return Date.now() < claims.exp * 1000
}

export function isCustomerAuthenticated() {
  return isSessionValidForRole('customer')
}

export function isBusinessAuthenticated() {
  return isSessionValidForRole('business')
}
