import { isRedeemBeforeValid, type RedeemBeforeValue } from '@/components/vendor/RedeemBeforeField'

export type GroupUnlockRewardKind = 'flat' | 'percent' | 'item'

export interface GroupUnlockConfigUi {
  targetParticipants: number
  rewardKind: GroupUnlockRewardKind
  rewardValue: string
}

export function defaultGroupUnlockConfig(): GroupUnlockConfigUi {
  return {
    targetParticipants: 20,
    rewardKind: 'percent',
    rewardValue: '',
  }
}

export function defaultGroupUnlockRedeem(): RedeemBeforeValue {
  return {
    redeemExpiryMode: 'relative',
    redeemFixedDate: '',
    redeemRelativeAmount: 14,
    redeemRelativeUnit: 'day',
  }
}

export function formatGroupUnlockRewardLabel(config: GroupUnlockConfigUi): string {
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

export function formatGroupUnlockSentence(config: GroupUnlockConfigUi): string {
  const n = config.targetParticipants
  const v = config.rewardValue.trim()
  const reward =
    config.rewardKind === 'flat'
      ? `Get ₹${v || 0} Off`
      : config.rewardKind === 'percent'
        ? `Get ${v || 0}% Off`
        : `Get ${v || 'Free Item'}`
  return `${n} People → ${reward}`
}

export function isGroupUnlockConfigValid(config: GroupUnlockConfigUi, redeem: RedeemBeforeValue): boolean {
  if (config.targetParticipants < 1) return false
  if (!config.rewardValue.trim()) return false
  if (config.rewardKind === 'percent') {
    const n = Number(config.rewardValue)
    if (!Number.isFinite(n) || n < 1 || n > 100) return false
  }
  return isRedeemBeforeValid(redeem)
}

export function buildGroupUnlockCampaignPayload(config: GroupUnlockConfigUi, redeem: RedeemBeforeValue) {
  return {
    groupUnlockConfig: {
      targetParticipants: config.targetParticipants,
      rewardKind: config.rewardKind,
      rewardValue: config.rewardValue.trim(),
      redeemExpiryMode: redeem.redeemExpiryMode,
      redeemFixedDate: redeem.redeemExpiryMode === 'fixed' ? redeem.redeemFixedDate : undefined,
      redeemRelativeAmount: redeem.redeemExpiryMode === 'relative' ? redeem.redeemRelativeAmount : undefined,
      redeemRelativeUnit: redeem.redeemExpiryMode === 'relative' ? redeem.redeemRelativeUnit : undefined,
    },
  }
}

export function groupUnlockFromApi(
  apiConfig:
    | {
        targetParticipants: number
        rewardKind: 'flat' | 'percent' | 'item'
        rewardValue: string
        redeemExpiryMode?: 'fixed' | 'relative'
        redeemFixedDate?: string | null
        redeemRelativeAmount?: number
        redeemRelativeUnit?: 'day' | 'week' | 'month'
      }
    | null
    | undefined,
): { config: GroupUnlockConfigUi; redeem: RedeemBeforeValue } {
  if (!apiConfig) {
    return { config: defaultGroupUnlockConfig(), redeem: defaultGroupUnlockRedeem() }
  }
  return {
    config: {
      targetParticipants: apiConfig.targetParticipants,
      rewardKind: apiConfig.rewardKind,
      rewardValue: apiConfig.rewardValue,
    },
    redeem: {
      redeemExpiryMode: apiConfig.redeemExpiryMode ?? 'relative',
      redeemFixedDate: apiConfig.redeemFixedDate ?? '',
      redeemRelativeAmount: apiConfig.redeemRelativeAmount ?? 14,
      redeemRelativeUnit: apiConfig.redeemRelativeUnit ?? 'day',
    },
  }
}
