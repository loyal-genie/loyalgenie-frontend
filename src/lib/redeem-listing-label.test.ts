import { describe, expect, it } from 'vitest'
import {
  formatListingRedeemBefore,
  formatRedeemRelativePeriodLabel,
  isIsoDateString,
} from './redeem-listing-label'

describe('formatRedeemRelativePeriodLabel', () => {
  it('formats rolling periods like the listing UX', () => {
    expect(formatRedeemRelativePeriodLabel(7, 'day')).toBe('7 Days')
    expect(formatRedeemRelativePeriodLabel(14, 'day')).toBe('14 Days')
    expect(formatRedeemRelativePeriodLabel(1, 'month')).toBe('1 Month')
    expect(formatRedeemRelativePeriodLabel(2, 'week')).toBe('2 Weeks')
  })
})

describe('formatListingRedeemBefore', () => {
  it('shows the fixed calendar date as-is (ISO)', () => {
    expect(formatListingRedeemBefore({
      redeemExpiryMode: 'fixed',
      redeemFixedDate: '2026-08-15',
      redeemRelativeAmount: null,
      redeemRelativeUnit: null,
    })).toBe('2026-08-15')
  })

  it('shows rolling period text instead of materializing a date', () => {
    expect(formatListingRedeemBefore({
      redeemExpiryMode: 'relative',
      redeemFixedDate: null,
      redeemRelativeAmount: 7,
      redeemRelativeUnit: 'day',
    })).toBe('7 Days')
  })
})

describe('isIsoDateString', () => {
  it('detects YYYY-MM-DD for card formatting', () => {
    expect(isIsoDateString('2026-08-15')).toBe(true)
    expect(isIsoDateString('7 Days')).toBe(false)
  })
})
