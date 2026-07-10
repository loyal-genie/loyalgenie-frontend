import { isRedeemBeforeValid, type RedeemBeforeValue } from '@/components/vendor/RedeemBeforeField'

export type FriendRewardKind = 'flat' | 'percent' | 'item'

export interface FriendConfigUi {
  minFriends: number
  rewardKind: FriendRewardKind
  rewardValue: string
}

export function defaultFriendConfig(): FriendConfigUi {
  return {
    minFriends: 2,
    rewardKind: 'item',
    rewardValue: '',
  }
}

export function defaultFriendRedeem(): RedeemBeforeValue {
  return {
    redeemExpiryMode: 'relative',
    redeemFixedDate: '',
    redeemRelativeAmount: 7,
    redeemRelativeUnit: 'day',
  }
}

export function formatFriendRewardLabel(config: FriendConfigUi): string {
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

export function formatFriendSentence(config: FriendConfigUi): string {
  const n = config.minFriends
  const v = config.rewardValue.trim()
  const reward =
    config.rewardKind === 'flat'
      ? `Get ₹${v || 0} Off`
      : config.rewardKind === 'percent'
        ? `Get ${v || 0}% Off`
        : `Get ${v || 'Free Item'}`
  return `Bring ${n} Friend${n !== 1 ? 's' : ''} → ${reward}`
}

export function isFriendConfigValid(config: FriendConfigUi, redeem: RedeemBeforeValue): boolean {
  if (config.minFriends < 1) return false
  if (!config.rewardValue.trim()) return false
  if (config.rewardKind === 'percent') {
    const n = Number(config.rewardValue)
    if (!Number.isFinite(n) || n < 1 || n > 100) return false
  }
  return isRedeemBeforeValid(redeem)
}

export function buildFriendCampaignPayload(config: FriendConfigUi, redeem: RedeemBeforeValue) {
  return {
    friendConfig: {
      minFriends: config.minFriends,
      rewardKind: config.rewardKind,
      rewardValue: config.rewardValue.trim(),
      redeemExpiryMode: redeem.redeemExpiryMode,
      redeemFixedDate: redeem.redeemExpiryMode === 'fixed' ? redeem.redeemFixedDate : undefined,
      redeemRelativeAmount: redeem.redeemExpiryMode === 'relative' ? redeem.redeemRelativeAmount : undefined,
      redeemRelativeUnit: redeem.redeemExpiryMode === 'relative' ? redeem.redeemRelativeUnit : undefined,
    },
  }
}

export function friendFromApi(
  apiConfig:
    | {
        minFriends: number
        rewardKind: 'flat' | 'percent' | 'item'
        rewardValue: string
        redeemExpiryMode?: 'fixed' | 'relative'
        redeemFixedDate?: string | null
        redeemRelativeAmount?: number
        redeemRelativeUnit?: 'day' | 'week' | 'month'
      }
    | null
    | undefined,
): { config: FriendConfigUi; redeem: RedeemBeforeValue } {
  if (!apiConfig) {
    return { config: defaultFriendConfig(), redeem: defaultFriendRedeem() }
  }
  return {
    config: {
      minFriends: apiConfig.minFriends,
      rewardKind: apiConfig.rewardKind,
      rewardValue: apiConfig.rewardValue,
    },
    redeem: {
      redeemExpiryMode: apiConfig.redeemExpiryMode ?? 'relative',
      redeemFixedDate: apiConfig.redeemFixedDate ?? '',
      redeemRelativeAmount: apiConfig.redeemRelativeAmount ?? 7,
      redeemRelativeUnit: apiConfig.redeemRelativeUnit ?? 'day',
    },
  }
}
