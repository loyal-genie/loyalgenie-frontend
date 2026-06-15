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

export function isCustomerAuthenticated() {
  const user = getUser()
  return Boolean(getToken() && user?.role === 'customer')
}

export function isBusinessAuthenticated() {
  const user = getUser()
  return Boolean(getToken() && user?.role === 'business')
}
