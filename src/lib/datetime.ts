import { CAMPAIGN_TIMEZONE } from '@/lib/campaign-dates'

/** Parse timestamps stored without timezone as IST (Asia/Kolkata). */
export function parseCampaignTimestamp(value: string): Date {
  const normalized = value.trim()
  if (/[Zz]$/.test(normalized) || /[+-]\d{2}:\d{2}$/.test(normalized)) {
    return new Date(normalized)
  }
  const iso = normalized.includes('T') ? normalized : normalized.replace(' ', 'T')
  return new Date(`${iso}+05:30`)
}

export function formatIstDate(value?: string | null): string {
  if (!value) return '-'
  const day = value.slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return '-'
  const [y, mo, d] = day.split('-').map(Number)
  return new Date(Date.UTC(y, mo - 1, d)).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export function formatIstDateTime(value?: string | null): string {
  if (!value) return '-'
  const d = parseCampaignTimestamp(value)
  if (Number.isNaN(d.getTime())) return '-'
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: CAMPAIGN_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(d)
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find(p => p.type === type)?.value ?? ''
  return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}`
}
