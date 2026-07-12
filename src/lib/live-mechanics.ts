import type { MechanicType } from './types'
import { getMechanicLabel } from './utils'

/** Mechanics with full customer + vendor + API support in this release. */
export const LIVE_MECHANICS = ['shake', 'stamp', 'check-in-loyalty', 'spin', 'dice', 'lottery', 'buy-x-get-y', 'coupon', 'flash', 'friend'] as const satisfies readonly MechanicType[]

export type LiveMechanic = (typeof LIVE_MECHANICS)[number]

const LIVE_SET = new Set<string>(LIVE_MECHANICS)

export function isMechanicLive(mechanic: string): mechanic is LiveMechanic {
  return LIVE_SET.has(mechanic)
}

export function isMechanicComingSoon(mechanic: string): boolean {
  return !isMechanicLive(mechanic)
}

export function getMechanicComingSoonLabel(mechanic: string): string {
  return `${getMechanicLabel(mechanic as MechanicType)} — live soon`
}
