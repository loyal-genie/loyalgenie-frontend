import type { CampaignStatus } from '@/lib/types'

/** Business campaign calendar uses Asia/Kolkata per shake-and-win spec (v1). */
export const CAMPAIGN_TIMEZONE = 'Asia/Kolkata'

export function todayInCampaignTz(date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: CAMPAIGN_TIMEZONE }).format(date)
}

export function currentTimeInCampaignTz(date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: CAMPAIGN_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date)
  const hour = parts.find(p => p.type === 'hour')?.value ?? '00'
  const minute = parts.find(p => p.type === 'minute')?.value ?? '00'
  return `${hour}:${minute}`
}

/** Calendar-safe day arithmetic for YYYY-MM-DD strings (IST calendar). */
export function addCampaignDays(from: string, days: number): string {
  const [y, mo, d] = from.split('-').map(Number)
  const dt = new Date(Date.UTC(y, mo - 1, d + days))
  return formatCampaignDateParts(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate())
}

export function addCampaignMonths(from: string, months: number): string {
  const [y, mo, d] = from.split('-').map(Number)
  const dt = new Date(Date.UTC(y, mo - 1 + months, d))
  return formatCampaignDateParts(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate())
}

function formatCampaignDateParts(y: number, mo: number, d: number): string {
  return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

export function fmtCampaignDate(iso: string): string {
  if (!iso) return ''
  const [y, mo, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, mo - 1, d)).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export function campaignDaysLeft(endDate: string, today = todayInCampaignTz()): number {
  if (today > endDate) return -1
  if (today === endDate) return 0
  const start = new Date(`${today}T12:00:00`)
  const end = new Date(`${endDate}T12:00:00`)
  return Math.round((end.getTime() - start.getTime()) / 86400000)
}

export function campaignDaysLeftLabel(endDate: string, today = todayInCampaignTz()): string {
  const d = campaignDaysLeft(endDate, today)
  if (d < 0) return 'Ended'
  if (d === 0) return 'Last day'
  if (d === 1) return '1d left'
  return `${d}d left`
}

export function effectiveCampaignStatus(
  status: CampaignStatus,
  endDate: string,
  today = todayInCampaignTz(),
): CampaignStatus {
  if (status === 'ended') return 'ended'
  if ((status === 'active' || status === 'paused') && today > endDate) return 'ended'
  return status
}

export function singleDayDurationLabel(startDate: string, today = todayInCampaignTz()): string {
  const prefix = startDate === today ? 'Today' : 'Single day'
  return `${prefix} · ${fmtCampaignDate(startDate)}`
}
