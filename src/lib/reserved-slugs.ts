export const RESERVED_SLUGS = new Set([
  'signin',
  'signup',
  'onboarding',
  'vendor',
  'business',
  'customer',
  'api',
  'join',
  'admin',
  'login',
  'register',
  'dashboard',
  'settings',
  'campaigns',
  'customers',
  'qr-code',
])

export function isReservedSlug(slug: string) {
  return RESERVED_SLUGS.has(slug.toLowerCase())
}

export function slugPath(slug: string) {
  return customerSignInPath(slug)
}

export function customerSignInPath(slug: string) {
  return `/signin?b=${encodeURIComponent(slug)}`
}

export function displayJoinPath(slug: string) {
  const host = typeof window !== 'undefined' ? window.location.host : 'loyalgenie.in'
  return `${host}${customerSignInPath(slug)}`
}
