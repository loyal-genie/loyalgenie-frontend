import { isRedeemBeforeValid, type RedeemBeforeValue } from '@/components/vendor/RedeemBeforeField'

export type CouponRewardKind = 'flat' | 'percent'

export interface CouponConfigUi {
  totalCoupons: number
  rewardKind: CouponRewardKind
  rewardValue: string
  termsAndConditions: string
}

export function defaultCouponConfig(): CouponConfigUi {
  return {
    totalCoupons: 200,
    rewardKind: 'percent',
    rewardValue: '',
    termsAndConditions: '',
  }
}

export function defaultCouponRedeem(): RedeemBeforeValue {
  return {
    redeemExpiryMode: 'relative',
    redeemFixedDate: '',
    redeemRelativeAmount: 14,
    redeemRelativeUnit: 'day',
  }
}

export function formatCouponRewardLabel(config: CouponConfigUi): string {
  const v = config.rewardValue.trim()
  switch (config.rewardKind) {
    case 'flat':
      return v ? `₹${v} Off` : '₹ Off'
    case 'percent':
      return v ? `${v}% Off` : '% Off'
    default:
      return v || 'Coupon'
  }
}

export function formatCouponSentence(config: CouponConfigUi): string {
  return `${config.totalCoupons || 0} Coupons → ${formatCouponRewardLabel(config)}`
}

export function isCouponConfigValid(config: CouponConfigUi, redeem: RedeemBeforeValue): boolean {
  if (config.totalCoupons < 1) return false
  if (!config.rewardValue.trim()) return false
  if (config.rewardKind === 'percent') {
    const n = Number(config.rewardValue)
    if (!Number.isFinite(n) || n < 1 || n > 100) return false
  }
  return isRedeemBeforeValid(redeem)
}

export function buildCouponCampaignPayload(config: CouponConfigUi, redeem: RedeemBeforeValue) {
  return {
    couponConfig: {
      totalCoupons: config.totalCoupons,
      rewardKind: config.rewardKind,
      rewardValue: config.rewardValue.trim(),
      termsAndConditions: config.termsAndConditions.trim(),
      redeemExpiryMode: redeem.redeemExpiryMode,
      redeemFixedDate: redeem.redeemExpiryMode === 'fixed' ? redeem.redeemFixedDate : undefined,
      redeemRelativeAmount: redeem.redeemExpiryMode === 'relative' ? redeem.redeemRelativeAmount : undefined,
      redeemRelativeUnit: redeem.redeemExpiryMode === 'relative' ? redeem.redeemRelativeUnit : undefined,
    },
  }
}

export function couponFromApi(
  apiConfig:
    | {
        totalCoupons: number
        rewardKind: 'flat' | 'percent'
        rewardValue: string
        termsAndConditions?: string
        redeemExpiryMode?: 'fixed' | 'relative'
        redeemFixedDate?: string | null
        redeemRelativeAmount?: number
        redeemRelativeUnit?: 'day' | 'week' | 'month'
      }
    | null
    | undefined,
): { config: CouponConfigUi; redeem: RedeemBeforeValue } {
  if (!apiConfig) {
    return { config: defaultCouponConfig(), redeem: defaultCouponRedeem() }
  }
  return {
    config: {
      totalCoupons: apiConfig.totalCoupons,
      rewardKind: apiConfig.rewardKind,
      rewardValue: apiConfig.rewardValue,
      termsAndConditions: apiConfig.termsAndConditions ?? '',
    },
    redeem: {
      redeemExpiryMode: apiConfig.redeemExpiryMode ?? 'relative',
      redeemFixedDate: apiConfig.redeemFixedDate ?? '',
      redeemRelativeAmount: apiConfig.redeemRelativeAmount ?? 14,
      redeemRelativeUnit: apiConfig.redeemRelativeUnit ?? 'day',
    },
  }
}
