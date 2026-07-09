import type { MechanicType } from './types'
import { isMechanicComingSoon } from './live-mechanics'
import {
  formatBusinessCategory,
  categoryMatches,
  CUSTOMER_CATEGORIES,
  type CustomerCategory,
} from './business-display'

export { formatBusinessCategory, categoryMatches, CUSTOMER_CATEGORIES, type CustomerCategory }

export function getGameRouteForMechanic(mechanic: MechanicType | string, campaignId: string): string {
  if (isMechanicComingSoon(mechanic)) {
    return `/customer/games/coming-soon?mechanic=${encodeURIComponent(mechanic)}`
  }
  const routes: Record<string, string> = {
    stamp: `/customer/campaigns/${campaignId}`,
    shake: `/customer/games/shake?campaign=${campaignId}`,
    spin: `/customer/games/spin?campaign=${campaignId}`,
    dice: `/customer/games/dice?campaign=${campaignId}`,
    lottery: `/customer/games/lottery?campaign=${campaignId}`,
    'check-in-loyalty': `/customer/campaigns/${campaignId}`,
    scratch: `/customer/games/dice?campaign=${campaignId}`,
  }
  return routes[mechanic] ?? routes.shake!
}

export function getCustomerBusinessPath(businessId?: string | null): string {
  return businessId ? `/customer/business/${businessId}` : '/customer'
}

export function findBusinessForCampaign(
  businesses: { id: string; name: string; campaigns: { id: string }[] }[] | undefined,
  campaignId: string,
  businessId?: string,
) {
  if (!businesses?.length) return undefined
  if (businessId) return businesses.find(b => b.id === businessId)
  return businesses.find(b => b.campaigns.some(c => c.id === campaignId))
}

const MECHANIC_CHIP_LABELS: Record<string, string> = {
  stamp: 'Stamp Card',
  shake: 'Shake & Win',
  spin: 'Spin the Wheel',
  'check-in-loyalty': 'Check-in',
  dice: 'Roll a Dice',
  lottery: 'Lottery',
  scratch: 'Scratch Card',
}

export function getCustomerMechanicChipLabel(mechanic: string): string {
  return MECHANIC_CHIP_LABELS[mechanic] ?? mechanic
}

const MECHANIC_HEADER_CHIP: Record<string, string> = {
  stamp: 'STAMP',
  shake: 'SHAKE',
  spin: 'SPIN A WHEEL',
  'check-in-loyalty': 'CHECK-IN',
  dice: 'ROLL A DICE',
  lottery: 'LOTTERY',
  scratch: 'SCRATCH',
}

export function getMechanicHeaderChip(mechanic: string): string {
  return MECHANIC_HEADER_CHIP[mechanic] ?? mechanic.toUpperCase()
}

export const CAMPAIGN_CARD_GRADIENTS: Record<string, { from: string; to: string; emoji: string }> = {
  stamp: { from: '#FBBF24', to: '#D97706', emoji: '🎯' },
  shake: { from: '#8B5CF6', to: '#5B21B6', emoji: '🤳' },
  spin: { from: '#7C3AED', to: '#4C1D95', emoji: '🎡' },
  'check-in-loyalty': { from: '#34D399', to: '#047857', emoji: '📅' },
  dice: { from: '#FB7185', to: '#F43F5E', emoji: '🎲' },
  lottery: { from: '#F59E0B', to: '#B45309', emoji: '🎟️' },
  scratch: { from: '#3B82F6', to: '#1D4ED8', emoji: '🎴' },
}

export function getCampaignGradient(mechanic: string) {
  return CAMPAIGN_CARD_GRADIENTS[mechanic] ?? CAMPAIGN_CARD_GRADIENTS.shake
}

export function formatCampaignDateRange(start: string, end: string): string {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  return `${fmt(start)} – ${fmt(end)}`
}

export function formatExpiry(end: string): string {
  return `Expires on ${new Date(end).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
}

export function walletDaysUntil(iso: string, now = Date.now()) {
  return Math.ceil((new Date(iso).getTime() - now) / 86400000)
}

export function walletExpiryChip(expiresAt: string | null | undefined) {
  if (!expiresAt) return null
  const d = walletDaysUntil(expiresAt)
  if (d <= 0) return { text: 'Expired', style: { background: '#FEE2E2', color: '#DC2626' } }
  if (d === 1) return { text: 'Expires tomorrow!', style: { background: '#FEE2E2', color: '#DC2626' } }
  if (d <= 3) return { text: `Expires in ${d} days`, style: { background: '#FEE2E2', color: '#DC2626' } }
  if (d <= 7) return { text: `Expires in ${d} days`, style: { background: '#FEF3C7', color: '#D97706' } }
  const dt = new Date(expiresAt)
  return {
    text: `Expires ${dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`,
    style: { background: '#F3F4F6', color: '#6B7280' },
  }
}

export function walletTimeAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (d === 0) return 'Today'
  if (d === 1) return 'Yesterday'
  if (d < 30) return `${d} days ago`
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export function walletFmtDateTime(iso: string) {
  const d = new Date(iso)
  return (
    d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
  )
}

export function getMechanicHeaderChipShort(mechanic: string): string {
  const short: Record<string, string> = {
    stamp: 'STAMP',
    shake: 'SHAKE',
    spin: 'SPIN',
    'check-in-loyalty': 'CHECK-IN',
    dice: 'DICE',
    lottery: 'LOTTERY',
    scratch: 'SCRATCH',
  }
  return short[mechanic] ?? getMechanicHeaderChip(mechanic)
}

export function getCampaignSubtitle(mechanic: MechanicType | string, name: string): string {
  const subtitles: Record<string, string> = {
    stamp: "Open me. You'll like what's inside.",
    shake: 'Shake your phone to win a reward',
    spin: 'A flick of fortune at every checkout.',
    'check-in-loyalty': 'Check in every day and earn points per visit.',
    lottery: 'Enter for a chance at big rewards.',
    dice: 'Roll the dice for surprise perks.',
  }
  return subtitles[mechanic] ?? name
}
