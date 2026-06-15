import type { VendorCustomerSummary } from '@/lib/api'

export type CustomerSegment = 'loyalist' | 'regular' | 'at-risk' | 'inactive'

const VALUE_PER_VISIT = 300

export function daysSince(iso: string | null | undefined): number {
  if (!iso) return 999
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
}

export function getCustomerSegment(c: Pick<VendorCustomerSummary, 'lastVisit' | 'totalVisits'>): CustomerSegment {
  const days = daysSince(c.lastVisit)
  if (days > 45) return 'inactive'
  if (days > 14) return 'at-risk'
  if (c.totalVisits >= 15) return 'loyalist'
  return 'regular'
}

export function estimateLifetimeValue(totalVisits: number): number {
  return totalVisits * VALUE_PER_VISIT
}

export { VALUE_PER_VISIT }
