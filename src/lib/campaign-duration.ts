import {
  addCampaignDays,
  addCampaignMonths,
  fmtCampaignDate,
  todayInCampaignTz,
} from '@/lib/campaign-dates'

export type DurationMode = 'today' | '7d' | '14d' | '1m' | '2m' | '3m' | 'custom'

export const DURATION_OPTIONS: { key: DurationMode; label: string; sub: string }[] = [
  { key: 'today', label: 'Today', sub: 'Right now' },
  { key: '7d', label: '7 Days', sub: '1 week' },
  { key: '14d', label: '14 Days', sub: '2 weeks' },
  { key: '1m', label: '1 Month', sub: '~30 days' },
  { key: '2m', label: '2 Months', sub: '~60 days' },
  { key: '3m', label: '3 Months', sub: '~90 days' },
  { key: 'custom', label: 'Custom', sub: 'Date range' },
]

export { fmtCampaignDate }

export function addDays(from: string, n: number) {
  return addCampaignDays(from, n)
}

export function addMonths(from: string, n: number) {
  return addCampaignMonths(from, n)
}

/** Create flow: duration anchored to today (IST). */
export function computeCreateDates(mode: DurationMode, customStart: string, customEnd: string) {
  const today = todayInCampaignTz()
  if (mode === 'custom') return { start: customStart, end: customEnd }
  if (mode === 'today') return { start: today, end: today }
  const start = today
  const end =
    mode === '7d' ? addDays(start, 7) :
    mode === '14d' ? addDays(start, 14) :
    mode === '1m' ? addMonths(start, 1) :
    mode === '2m' ? addMonths(start, 2) :
    addMonths(start, 3)
  return { start, end }
}

/** Edit flow: start date is fixed; pills set end date from campaign start. */
export function computeEndFromStart(mode: DurationMode, startDate: string, customEnd: string) {
  if (mode === 'custom') return customEnd
  if (mode === 'today') return startDate
  if (mode === '7d') return addDays(startDate, 7)
  if (mode === '14d') return addDays(startDate, 14)
  if (mode === '1m') return addMonths(startDate, 1)
  if (mode === '2m') return addMonths(startDate, 2)
  return addMonths(startDate, 3)
}

export function inferDurationMode(startDate: string, endDate: string): DurationMode {
  if (startDate === endDate) return 'today'
  for (const mode of ['7d', '14d', '1m', '2m', '3m'] as DurationMode[]) {
    if (computeEndFromStart(mode, startDate, '') === endDate) return mode
  }
  return 'custom'
}

export function campaignDayCount(startDate: string, endDate: string) {
  return Math.max(1, Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000) + 1)
}

/** Number of calendar days for a duration preset (claim period, etc.). */
export function durationModeToDays(mode: DurationMode): number {
  if (mode === 'today') return 1
  if (mode === '7d') return 7
  if (mode === '14d') return 14
  if (mode === '1m') return 30
  if (mode === '2m') return 60
  if (mode === '3m') return 90
  return 30
}
