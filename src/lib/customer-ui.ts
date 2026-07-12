import type { MechanicType } from './types'
import { isMechanicComingSoon } from './live-mechanics'
import {
  formatBusinessCategory,
  categoryMatches,
  CUSTOMER_CATEGORIES,
  type CustomerCategory,
} from './business-display'
import { campaignDaysLeft, fmtCampaignDate, todayInCampaignTz } from '@/lib/campaign-dates'
import { inferDurationMode } from '@/lib/campaign-duration'

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
    'buy-x-get-y': `/customer/games/buy-x-get-y?campaign=${campaignId}`,
    coupon: `/customer/games/coupon?campaign=${campaignId}`,
    flash: `/customer/games/flash?campaign=${campaignId}`,
    friend: `/customer/games/friend?campaign=${campaignId}`,
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
  'buy-x-get-y': 'Buy X Get Y',
  coupon: 'Coupon Codes',
  flash: 'Flash Deal',
  friend: 'Bring a Friend',
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
  'buy-x-get-y': 'BUY X GET Y',
  coupon: 'COUPON',
  flash: 'FLASH DEAL',
  friend: 'BRING A FRIEND',
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
  lottery: { from: '#FEF9C3', to: '#FDE68A', emoji: '🎟️' },
  'buy-x-get-y': { from: '#FFEDD5', to: '#FED7AA', emoji: '💰' },
  coupon: { from: '#14B8A6', to: '#0F766E', emoji: '🎫' },
  flash: { from: '#7DD3FC', to: '#38BDF8', emoji: '⚡' },
  friend: { from: '#F9A8D4', to: '#F472B6', emoji: '👫' },
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

/** Calendar day as "10 Jul" (no year) for campaign cards. */
export function formatCampaignDayMonth(iso: string): string {
  const day = iso.slice(0, 10)
  const [y, mo, d] = day.split('-').map(Number)
  if (!y || !mo || !d) return iso
  return new Date(Date.UTC(y, mo - 1, d)).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  })
}

/** "10AM" / "10:30AM" from HH:mm. */
export function formatCampaignTimeShort(hhmm: string): string {
  const [hRaw, mRaw] = hhmm.split(':')
  const h = Number(hRaw)
  const m = Number(mRaw ?? 0)
  if (!Number.isFinite(h)) return hhmm
  const ap = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  if (!m) return `${hour}${ap}`
  return `${hour}:${String(m).padStart(2, '0')}${ap}`
}

function isFullDayWindow(startTime?: string | null, endTime?: string | null): boolean {
  const start = (startTime ?? '00:00').slice(0, 5)
  const end = (endTime ?? '23:59').slice(0, 5)
  return (start === '00:00' || start === '0:00') && (end === '23:59' || end === '24:00')
}

/**
 * Customer card schedule line:
 * - full day: "10 Jul - 15 Aug"
 * - active hours (preset duration + daily window): "10 Jul - 15 Aug · 10AM - 12PM"
 * - custom dated window: "10 Jul 10AM - 12 Jul 12PM"
 */
export function formatCampaignCardSchedule(
  startDate: string,
  endDate: string,
  startTime?: string | null,
  endTime?: string | null,
): string {
  const start = startDate.slice(0, 10)
  const end = endDate.slice(0, 10)
  const startD = formatCampaignDayMonth(start)
  const endD = formatCampaignDayMonth(end)
  const dateRange = start === end ? startD : `${startD} - ${endD}`

  if (isFullDayWindow(startTime, endTime)) return dateRange

  const startT = formatCampaignTimeShort((startTime ?? '00:00').slice(0, 5))
  const endT = formatCampaignTimeShort((endTime ?? '23:59').slice(0, 5))

  if (start === end) return `${startD} · ${startT} - ${endT}`

  // Preset multi-day ranges with a time window → active-hours style.
  // Non-preset ranges → custom bookend style.
  const mode = inferDurationMode(start, end)
  if (mode === 'custom') return `${startD} ${startT} - ${endD} ${endT}`
  return `${dateRange} · ${startT} - ${endT}`
}

export function formatExpiry(end: string): string {
  return `Expires on ${new Date(end).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
}

export function walletDaysUntil(iso: string, now = new Date()) {
  return campaignDaysLeft(iso.slice(0, 10), todayInCampaignTz(now))
}

/** True when redeem-before calendar day has passed (matches backend expiry — valid through that day). */
export function isWalletRewardPastRedeem(expiresAt: string | null | undefined, now = new Date()) {
  if (!expiresAt) return false
  return todayInCampaignTz(now) > expiresAt.slice(0, 10)
}

export function walletExpiryChip(expiresAt: string | null | undefined) {
  if (!expiresAt) return null
  const d = walletDaysUntil(expiresAt)
  if (d < 0) return { text: 'Expired', style: { background: '#FEE2E2', color: '#DC2626' } }
  if (d === 0) return { text: 'Expires today!', style: { background: '#FEE2E2', color: '#DC2626' } }
  if (d === 1) return { text: 'Expires tomorrow!', style: { background: '#FEE2E2', color: '#DC2626' } }
  if (d <= 3) return { text: `Expires in ${d} days`, style: { background: '#FEE2E2', color: '#DC2626' } }
  if (d <= 7) return { text: `Expires in ${d} days`, style: { background: '#FEF3C7', color: '#D97706' } }
  return {
    text: `Expires ${fmtCampaignDate(expiresAt.slice(0, 10)).replace(/ \d{4}$/, '')}`,
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
    'buy-x-get-y': 'BUY X GET Y',
    coupon: 'COUPON',
    flash: 'FLASH',
    friend: 'FRIEND',
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
    'buy-x-get-y': 'Buy or spend to unlock a reward.',
    coupon: 'Claim a limited coupon and redeem at the counter.',
    flash: 'Grab a limited flash deal before spots run out.',
    friend: 'Bring friends along and unlock a reward together.',
  }
  return subtitles[mechanic] ?? name
}
