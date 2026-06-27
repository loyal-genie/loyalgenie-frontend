import type { BusinessWithCampaigns } from '@/lib/api'

export const CUSTOMER_CATEGORIES = ['All', 'Cafe', 'Salon', 'Gym', 'Restaurant', 'Jewellery'] as const
export type CustomerCategory = (typeof CUSTOMER_CATEGORIES)[number]

export function formatBusinessCategory(type: string): string {
  const t = type
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
  if (t.includes('cafe') || t.includes('coffee') || t.includes('bakery')) return 'Cafe'
  if (t.includes('salon') || t.includes('spa') || t.includes('beauty')) return 'Salon'
  if (t.includes('gym') || t.includes('fitness')) return 'Gym'
  if (t.includes('restaurant') || t.includes('quick service') || t.includes('dining')) return 'Restaurant'
  if (t.includes('jewel')) return 'Jewellery'
  return type.split(/[&,/]/)[0]?.trim() || type
}

export function categoryMatches(businessType: string, category: CustomerCategory): boolean {
  if (category === 'All') return true
  if (!businessType?.trim()) return false
  return formatBusinessCategory(businessType) === category
}

export function formatBusinessLocation(biz: Pick<
  BusinessWithCampaigns,
  'landmark' | 'address' | 'branchAddress' | 'branchCity' | 'city'
>): string {
  const area = biz.landmark?.trim() || biz.branchAddress?.trim() || biz.address?.trim()
  if (area && biz.city) return `${area}, ${biz.city}`
  return biz.city || area || ''
}

export function formatOpenStatus(hours?: string): string | null {
  if (!hours?.trim()) return null
  const h = hours.trim()
  if (/^open/i.test(h) || /until|–|-/i.test(h)) return h
  return `Open until ${h}`
}

export function formatPhoneDisplay(mobile?: string): string | null {
  if (!mobile?.trim()) return null
  const digits = mobile.replace(/\D/g, '')
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 2)} ${digits.slice(2, 6)} ${digits.slice(6)}`
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+91 ${digits.slice(2, 4)} ${digits.slice(4, 8)} ${digits.slice(8)}`
  }
  return mobile.trim()
}

export function getBusinessHeroPhotos(
  biz: Pick<BusinessWithCampaigns, 'coverBannerData' | 'interiorPhotosData'>,
): string[] {
  const photos = [
    biz.coverBannerData,
    ...(biz.interiorPhotosData ?? []),
  ].filter((p): p is string => Boolean(p?.trim()))
  return [...new Set(photos)]
}

export function formatDistanceKm(
  biz: Pick<BusinessWithCampaigns, 'latitude' | 'longitude' | 'displayDistanceKm'>,
  userLat?: number | null,
  userLng?: number | null,
): string | null {
  const km = getBusinessDistanceKm(biz, userLat, userLng)
  if (km == null) return null
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${km.toFixed(1)} km`
}

export function getBusinessDistanceKm(
  biz: Pick<BusinessWithCampaigns, 'latitude' | 'longitude' | 'displayDistanceKm'>,
  userLat?: number | null,
  userLng?: number | null,
): number | null {
  if (
    biz.latitude != null &&
    biz.longitude != null &&
    userLat != null &&
    userLng != null
  ) {
    const toRad = (d: number) => (d * Math.PI) / 180
    const R = 6371
    const dLat = toRad(biz.latitude - userLat)
    const dLng = toRad(biz.longitude - userLng)
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(userLat)) * Math.cos(toRad(biz.latitude)) * Math.sin(dLng / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  if (biz.displayDistanceKm != null && !Number.isNaN(biz.displayDistanceKm)) {
    return biz.displayDistanceKm
  }

  return null
}

export function sortBusinessesByDistance<T extends Pick<
  BusinessWithCampaigns,
  'latitude' | 'longitude' | 'displayDistanceKm' | 'name'
>>(
  businesses: T[],
  userLat?: number | null,
  userLng?: number | null,
): T[] {
  return [...businesses].sort((a, b) => {
    const da = getBusinessDistanceKm(a, userLat, userLng)
    const db = getBusinessDistanceKm(b, userLat, userLng)
    if (da == null && db == null) return a.name.localeCompare(b.name)
    if (da == null) return 1
    if (db == null) return -1
    if (da !== db) return da - db
    return a.name.localeCompare(b.name)
  })
}

export function formatRating(rating?: number | null): string | null {
  if (rating == null || Number.isNaN(rating)) return null
  return rating.toFixed(1)
}
