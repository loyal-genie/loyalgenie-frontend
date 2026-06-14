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
  return `/${slug}`
}

export function displayJoinPath(slug: string) {
  const host = typeof window !== 'undefined' ? window.location.host : 'loyalgenie.in'
  return `${host}/${slug}`
}
