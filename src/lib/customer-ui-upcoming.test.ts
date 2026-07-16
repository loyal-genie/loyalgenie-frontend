import { describe, expect, it } from 'vitest'
import { formatCampaignLiveOnLabel, isCampaignUpcoming } from './customer-ui'

describe('upcoming campaign listing helpers', () => {
  it('detects future start dates', () => {
    expect(isCampaignUpcoming('2099-01-15', undefined, '2099-01-14')).toBe(true)
    expect(isCampaignUpcoming('2099-01-15', '00:00', '2099-01-15')).toBe(false)
    expect(isCampaignUpcoming('2099-01-15', undefined, '2099-01-16')).toBe(false)
  })

  it('treats start day before start_time as upcoming (Live on, not Active Hours)', () => {
    expect(isCampaignUpcoming('2099-01-15', '16:00', '2099-01-15', '15:59')).toBe(true)
    expect(isCampaignUpcoming('2099-01-15', '16:00', '2099-01-15', '16:00')).toBe(false)
    expect(isCampaignUpcoming('2099-01-15', '16:00', '2099-01-16', '10:00')).toBe(false)
  })

  it('formats Live on day month with optional start time', () => {
    expect(formatCampaignLiveOnLabel('2026-07-16', '00:00', '23:59')).toBe('Live on 16 Jul')
    expect(formatCampaignLiveOnLabel('2026-07-16', '16:00', '21:00')).toBe('Live on 16 Jul · 4PM')
  })
})
