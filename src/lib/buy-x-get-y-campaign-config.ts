import { isRedeemBeforeValid, type RedeemBeforeValue } from '@/components/vendor/RedeemBeforeField'

export type BuyCondition = 'quantity' | 'spend'
export type RewardKind = 'flat' | 'percent' | 'item'

export interface BuyXGetYConfigUi {
  condition: BuyCondition
  buyQuantity: number
  spendAmount: number
  rewardKind: RewardKind
  rewardValue: string
  termsAndConditions: string
}

export function defaultBuyXGetYConfig(): BuyXGetYConfigUi {
  return {
    condition: 'quantity',
    buyQuantity: 3,
    spendAmount: 500,
    rewardKind: 'item',
    rewardValue: '',
    termsAndConditions: '',
  }
}

export function defaultBuyXGetYRedeem(): RedeemBeforeValue {
  return {
    redeemExpiryMode: 'relative',
    redeemFixedDate: '',
    redeemRelativeAmount: 7,
    redeemRelativeUnit: 'day',
  }
}

export function formatBuyXGetYRewardLabel(config: BuyXGetYConfigUi): string {
  const v = config.rewardValue.trim()
  switch (config.rewardKind) {
    case 'flat':
      return v ? `₹${v} Off` : '₹ Off'
    case 'percent':
      return v ? `${v}% Off` : '% Off'
    case 'item':
    default:
      return v || 'Free Item'
  }
}

export function formatBuyXGetYSentence(config: BuyXGetYConfigUi): string {
  const reward = formatBuyXGetYRewardLabel(config)
  if (config.condition === 'spend') {
    return `Spend ₹${config.spendAmount || 0} → Get ${reward}`
  }
  return `Buy ${config.buyQuantity || 0} purchases → Get ${reward}`
}

export function isBuyXGetYConfigValid(config: BuyXGetYConfigUi, redeem: RedeemBeforeValue): boolean {
  if (config.condition === 'quantity' && config.buyQuantity < 1) return false
  if (config.condition === 'spend' && config.spendAmount < 1) return false
  if (!config.rewardValue.trim()) return false
  if (config.rewardKind === 'percent') {
    const n = Number(config.rewardValue)
    if (!Number.isFinite(n) || n < 1 || n > 100) return false
  }
  return isRedeemBeforeValid(redeem)
}

export function buildBuyXGetYCampaignPayload(config: BuyXGetYConfigUi, redeem: RedeemBeforeValue) {
  return {
    buyXGetYConfig: {
      condition: config.condition,
      buyQuantity: config.buyQuantity,
      spendAmount: config.spendAmount,
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

export function buyXGetYFromApi(
  apiConfig:
    | {
        condition: 'quantity' | 'spend'
        buyQuantity: number
        spendAmount: number
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
): { config: BuyXGetYConfigUi; redeem: RedeemBeforeValue } {
  if (!apiConfig) {
    return { config: defaultBuyXGetYConfig(), redeem: defaultBuyXGetYRedeem() }
  }
  return {
    config: {
      condition: apiConfig.condition,
      buyQuantity: apiConfig.buyQuantity,
      spendAmount: apiConfig.spendAmount,
      rewardKind: apiConfig.rewardKind,
      rewardValue: apiConfig.rewardValue,
      termsAndConditions: apiConfig.termsAndConditions ?? '',
    },
    redeem: {
      redeemExpiryMode: apiConfig.redeemExpiryMode ?? 'relative',
      redeemFixedDate: apiConfig.redeemFixedDate ?? '',
      redeemRelativeAmount: apiConfig.redeemRelativeAmount ?? 7,
      redeemRelativeUnit: apiConfig.redeemRelativeUnit ?? 'day',
    },
  }
}
