import { isRedeemBeforeValid, type RedeemBeforeValue } from '@/components/vendor/RedeemBeforeField'

export type ComboVariant = 'discount' | 'freeitem'

export interface ComboConfigUi {
  variant: ComboVariant
  items: string[]
  originalPrice: number
  bundlePrice: number
  paidItems: string[]
  freeItems: string[]
  totalSpots: number
  termsAndConditions: string
}

export function defaultComboConfig(): ComboConfigUi {
  return {
    variant: 'discount',
    items: ['', ''],
    originalPrice: 500,
    bundlePrice: 350,
    paidItems: ['', '', ''],
    freeItems: [''],
    totalSpots: 100,
    termsAndConditions: '',
  }
}

export function defaultComboRedeem(): RedeemBeforeValue {
  return {
    redeemExpiryMode: 'relative',
    redeemFixedDate: '',
    redeemRelativeAmount: 14,
    redeemRelativeUnit: 'day',
  }
}

export function formatComboRewardLabel(config: ComboConfigUi): string {
  if (config.variant === 'freeitem') {
    const free = config.freeItems.map(i => i.trim()).filter(Boolean)
    return free.length ? `Get ${free.join(', ')} Free` : 'Combo Deal'
  }
  return `₹${config.bundlePrice || 0} Bundle`
}

export function formatComboSentence(config: ComboConfigUi): string {
  if (config.variant === 'freeitem') {
    const paid = config.paidItems.map(i => i.trim()).filter(Boolean)
    const free = config.freeItems.map(i => i.trim()).filter(Boolean)
    return `Take ${paid.join(', ') || '—'} → Get ${free.join(', ') || '—'} Free`
  }
  const itemCount = config.items.map(i => i.trim()).filter(Boolean).length
  return `${itemCount} Item${itemCount !== 1 ? 's' : ''} → ₹${config.bundlePrice || 0} (was ₹${config.originalPrice || 0})`
}

export function isComboConfigValid(config: ComboConfigUi, redeem: RedeemBeforeValue): boolean {
  if (config.totalSpots < 1) return false
  if (config.variant === 'discount') {
    if (!config.items.some(i => i.trim())) return false
    if (config.originalPrice <= 0 || config.bundlePrice <= 0) return false
    if (config.bundlePrice > config.originalPrice) return false
  } else {
    if (!config.paidItems.some(i => i.trim())) return false
    if (!config.freeItems.some(i => i.trim())) return false
  }
  return isRedeemBeforeValid(redeem)
}

export function buildComboCampaignPayload(config: ComboConfigUi, redeem: RedeemBeforeValue) {
  return {
    comboConfig: {
      variant: config.variant,
      items: config.items.map(i => i.trim()).filter(Boolean),
      originalPrice: config.originalPrice,
      bundlePrice: config.bundlePrice,
      paidItems: config.paidItems.map(i => i.trim()).filter(Boolean),
      freeItems: config.freeItems.map(i => i.trim()).filter(Boolean),
      totalSpots: config.totalSpots,
      termsAndConditions: config.termsAndConditions.trim(),
      redeemExpiryMode: redeem.redeemExpiryMode,
      redeemFixedDate: redeem.redeemExpiryMode === 'fixed' ? redeem.redeemFixedDate : undefined,
      redeemRelativeAmount: redeem.redeemExpiryMode === 'relative' ? redeem.redeemRelativeAmount : undefined,
      redeemRelativeUnit: redeem.redeemExpiryMode === 'relative' ? redeem.redeemRelativeUnit : undefined,
    },
  }
}

export function comboFromApi(
  apiConfig:
    | {
        variant: 'discount' | 'freeitem'
        items?: string[]
        originalPrice?: number
        bundlePrice?: number
        paidItems?: string[]
        freeItems?: string[]
        totalSpots: number
        termsAndConditions?: string
        redeemExpiryMode?: 'fixed' | 'relative'
        redeemFixedDate?: string | null
        redeemRelativeAmount?: number
        redeemRelativeUnit?: 'day' | 'week' | 'month'
      }
    | null
    | undefined,
): { config: ComboConfigUi; redeem: RedeemBeforeValue } {
  if (!apiConfig) {
    return { config: defaultComboConfig(), redeem: defaultComboRedeem() }
  }
  return {
    config: {
      variant: apiConfig.variant,
      items: apiConfig.items?.length ? [...apiConfig.items] : ['', ''],
      originalPrice: apiConfig.originalPrice ?? 0,
      bundlePrice: apiConfig.bundlePrice ?? 0,
      paidItems: apiConfig.paidItems?.length ? [...apiConfig.paidItems] : ['', '', ''],
      freeItems: apiConfig.freeItems?.length ? [...apiConfig.freeItems] : [''],
      totalSpots: apiConfig.totalSpots,
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
