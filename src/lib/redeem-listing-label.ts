export type RedeemRelativeUnit = 'day' | 'week' | 'month'

export type ListingRedeemConfig = {
  redeemExpiryMode?: 'fixed' | 'relative'
  redeemFixedDate?: string | null
  redeemRelativeAmount?: number | null
  redeemRelativeUnit?: RedeemRelativeUnit | null
}

/** e.g. "7 Days", "14 Days", "1 Month" */
export function formatRedeemRelativePeriodLabel(
  amount: number,
  unit: RedeemRelativeUnit,
): string {
  const base = unit === 'day' ? 'Day' : unit === 'week' ? 'Week' : 'Month'
  return `${amount} ${amount === 1 ? base : `${base}s`}`
}

export function isIsoDateString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}/.test(value.trim())
}

/**
 * Listing "Redeem by" value:
 * - fixed → calendar ISO date (UI formats as day/month)
 * - relative → period label (7 Days, 1 Month) — not a materialized absolute date
 */
export function formatListingRedeemBefore(config: ListingRedeemConfig): string | null {
  const mode = config.redeemExpiryMode ?? 'relative'
  if (mode === 'fixed') {
    const date = config.redeemFixedDate?.trim()
    return date || null
  }
  const amount = config.redeemRelativeAmount ?? 0
  const unit = config.redeemRelativeUnit
  if (!amount || amount < 1 || !unit) return null
  return formatRedeemRelativePeriodLabel(amount, unit)
}
