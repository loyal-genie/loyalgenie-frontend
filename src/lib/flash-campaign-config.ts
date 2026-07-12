import { isRedeemBeforeValid, type RedeemBeforeValue } from '@/components/vendor/RedeemBeforeField'

export type FlashRewardKind = 'flat' | 'percent' | 'item'

export interface FlashConfigUi {
  totalSlots: number
  rewardKind: FlashRewardKind
  rewardValue: string
  termsAndConditions: string
}

export function defaultFlashConfig(): FlashConfigUi {
  return {
    totalSlots: 50,
    rewardKind: 'percent',
    rewardValue: '',
    termsAndConditions: '',
  }
}

export function defaultFlashRedeem(): RedeemBeforeValue {
  return {
    redeemExpiryMode: 'relative',
    redeemFixedDate: '',
    redeemRelativeAmount: 3,
    redeemRelativeUnit: 'day',
  }
}

export function formatFlashRewardLabel(config: FlashConfigUi): string {
  const v = config.rewardValue.trim()
  switch (config.rewardKind) {
    case 'flat':
      return v ? `₹${v} Off` : '₹ Off'
    case 'percent':
      return v ? `${v}% Off` : '% Off'
    case 'item':
    default:
      return v || 'Flash Deal'
  }
}

export function formatFlashSentence(config: FlashConfigUi): string {
  return `${config.totalSlots || 0} Spots → ${formatFlashRewardLabel(config)}`
}

export function isFlashConfigValid(config: FlashConfigUi, redeem: RedeemBeforeValue): boolean {
  if (config.totalSlots < 1) return false
  if (!config.rewardValue.trim()) return false
  if (config.rewardKind === 'percent') {
    const n = Number(config.rewardValue)
    if (!Number.isFinite(n) || n < 1 || n > 100) return false
  }
  return isRedeemBeforeValid(redeem)
}

export function buildFlashCampaignPayload(config: FlashConfigUi, redeem: RedeemBeforeValue) {
  return {
    flashConfig: {
      totalSlots: config.totalSlots,
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

export function flashFromApi(
  apiConfig:
    | {
        totalSlots: number
        rewardKind: 'flat' | 'percent' | 'item'
        rewardValue: string
        termsAndConditions?: string
        redeemExpiryMode?: 'fixed' | 'relative'
        redeemFixedDate?: string | null
        redeemRelativeAmount?: number
        redeemRelativeUnit?: 'day' | 'week' | 'month'
      }
    | null
    | undefined,
): { config: FlashConfigUi; redeem: RedeemBeforeValue } {
  if (!apiConfig) {
    return { config: defaultFlashConfig(), redeem: defaultFlashRedeem() }
  }
  return {
    config: {
      totalSlots: apiConfig.totalSlots,
      rewardKind: apiConfig.rewardKind,
      rewardValue: apiConfig.rewardValue,
      termsAndConditions: apiConfig.termsAndConditions ?? '',
    },
    redeem: {
      redeemExpiryMode: apiConfig.redeemExpiryMode ?? 'relative',
      redeemFixedDate: apiConfig.redeemFixedDate ?? '',
      redeemRelativeAmount: apiConfig.redeemRelativeAmount ?? 3,
      redeemRelativeUnit: apiConfig.redeemRelativeUnit ?? 'day',
    },
  }
}
