import { getHeroCover } from '@/lib/hero-cover-data'

export type LiveCampaignMechanic =
  | 'stamp'
  | 'shake'
  | 'check-in-loyalty'
  | 'spin'
  | 'dice'
  | 'lottery'
  | 'buy-x-get-y'
  | 'coupon'
  | 'flash'
  | 'combo'
  | 'friend'
  | 'groupunlock'

export interface CampaignTheme {
  /** Listing/cover gradient (pastel hero). */
  gradient: string
  /** Brand CTA start color (MECHANIC_META.cardFrom). */
  accent: string
  /** Brand CTA end color (MECHANIC_META.cardTo). */
  accentTo: string
  badgeBg: string
  badgeText: string
  chipLabel: string
  /** Badge pill label on covers (uppercase). */
  coverBadgeLabel: string
  /** Whether CTA is Claim-style vs Play-style. */
  claimStyle: boolean
}

const CLAIM_STYLE = new Set([
  'buy-x-get-y',
  'coupon',
  'flash',
  'friend',
  'groupunlock',
  'combo',
  'lottery',
])

/** Brand colors aligned with the design prototype MECHANIC_META. */
export const CAMPAIGN_THEMES: Record<string, CampaignTheme> = {
  stamp: {
    gradient: 'linear-gradient(135deg, #FCD34D, #B45309)',
    accent: '#F59E0B',
    accentTo: '#D97706',
    badgeBg: 'bg-[#FEF3C7]',
    badgeText: 'text-[#92400E]',
    chipLabel: 'Stamp Card',
    coverBadgeLabel: 'STAMP',
    claimStyle: false,
  },
  shake: {
    gradient: 'linear-gradient(135deg, #A78BFA, #5B21B6)',
    accent: '#8B5CF6',
    accentTo: '#7C3AED',
    badgeBg: 'bg-[#F3E8FF]',
    badgeText: 'text-[#6B21A8]',
    chipLabel: 'Shake & Win',
    coverBadgeLabel: 'SHAKE & WIN',
    claimStyle: false,
  },
  'check-in-loyalty': {
    gradient: 'linear-gradient(135deg, #34D399, #047857)',
    accent: '#10B981',
    accentTo: '#047857',
    badgeBg: 'bg-[#D1FAE5]',
    badgeText: 'text-[#065F46]',
    chipLabel: 'Check-in Loyalty',
    coverBadgeLabel: 'CHECK-IN',
    claimStyle: false,
  },
  spin: {
    gradient: 'linear-gradient(135deg, #EDE9FE, #DDD6FE)',
    accent: '#7C3AED',
    accentTo: '#4C1D95',
    badgeBg: 'bg-[#EDE9FE]',
    badgeText: 'text-[#5B21B6]',
    chipLabel: 'Spin a Wheel',
    coverBadgeLabel: 'SPIN A WHEEL',
    claimStyle: false,
  },
  dice: {
    gradient: 'linear-gradient(135deg, #FCE7F3, #FBCFE8)',
    accent: '#BE185D',
    accentTo: '#831843',
    badgeBg: 'bg-[#FCE7F3]',
    badgeText: 'text-[#9D174D]',
    chipLabel: 'Roll a Dice',
    coverBadgeLabel: 'ROLL A DICE',
    claimStyle: false,
  },
  lottery: {
    gradient: 'linear-gradient(135deg, #F5F3FF, #EDE9FE)',
    accent: '#7C6EF0',
    accentTo: '#4C3FA8',
    badgeBg: 'bg-[#EDE9FE]',
    badgeText: 'text-[#4C3FA8]',
    chipLabel: 'Lottery',
    coverBadgeLabel: 'LOTTERY',
    claimStyle: true,
  },
  'buy-x-get-y': {
    gradient: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)',
    accent: '#16A34A',
    accentTo: '#15803D',
    badgeBg: 'bg-[#DCFCE7]',
    badgeText: 'text-[#166534]',
    chipLabel: 'Buy X Get Y',
    coverBadgeLabel: 'BUY X GET Y',
    claimStyle: true,
  },
  coupon: {
    gradient: 'linear-gradient(135deg, #ECFBFE, #B4E1EB)',
    accent: '#06B6D4',
    accentTo: '#0E7490',
    badgeBg: 'bg-[#CFFAFE]',
    badgeText: 'text-[#155E75]',
    chipLabel: 'Coupon Codes',
    coverBadgeLabel: 'COUPON CODES',
    claimStyle: true,
  },
  flash: {
    gradient: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
    accent: '#2563EB',
    accentTo: '#1E3A8A',
    badgeBg: 'bg-[#DBEAFE]',
    badgeText: 'text-[#1E40AF]',
    chipLabel: 'Flash Deal',
    coverBadgeLabel: 'FLASH DEAL',
    claimStyle: true,
  },
  combo: {
    gradient: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)',
    accent: '#4F46E5',
    accentTo: '#3730A3',
    badgeBg: 'bg-[#E0E7FF]',
    badgeText: 'text-[#3730A3]',
    chipLabel: 'Package/Combo Deal',
    coverBadgeLabel: 'COMBO DEAL',
    claimStyle: true,
  },
  friend: {
    gradient: 'linear-gradient(135deg, #FFE4E9, #FFC1CC)',
    accent: '#F43F5E',
    accentTo: '#9F1239',
    badgeBg: 'bg-[#FFE4E6]',
    badgeText: 'text-[#9F1239]',
    chipLabel: 'Bring a Friend',
    coverBadgeLabel: 'BRING A FRIEND',
    claimStyle: true,
  },
  groupunlock: {
    gradient: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)',
    accent: '#0D9488',
    accentTo: '#115E59',
    badgeBg: 'bg-[#CCFBF1]',
    badgeText: 'text-[#115E59]',
    chipLabel: 'Community Offer',
    coverBadgeLabel: 'COMMUNITY OFFER',
    claimStyle: true,
  },
}

export function getCampaignTheme(mechanic: string): CampaignTheme {
  return CAMPAIGN_THEMES[mechanic] ?? CAMPAIGN_THEMES.shake!
}

export function isClaimStyleMechanic(mechanic: string): boolean {
  return CLAIM_STYLE.has(mechanic) || getCampaignTheme(mechanic).claimStyle
}

/** Prototype play-screen tint: white → soft accent wash. */
export function getPlayScreenBackground(mechanic: string): string {
  const { accent } = getCampaignTheme(mechanic)
  if (mechanic === 'stamp') {
    return 'linear-gradient(145deg, #2A1605 0%, #3D2208 45%, #170D02 100%)'
  }
  if (mechanic === 'shake') {
    return 'linear-gradient(145deg, #050B1F 0%, #7C3AED 50%, #03050F 100%)'
  }
  if (mechanic === 'spin' || mechanic === 'dice') {
    return `linear-gradient(180deg, #FFFFFF 0%, ${accent}08 55%, ${accent}14 100%)`
  }
  return `linear-gradient(160deg, #FFFFFF 0%, ${accent}0F 55%, ${accent}1F 100%)`
}

/** Prototype reward-screen tint: white → soft accent wash. */
export function getRewardScreenBackground(mechanic?: string): string {
  const accent = mechanic ? getCampaignTheme(mechanic).accent : '#7C3AED'
  return `linear-gradient(160deg, #FFFFFF 0%, ${accent}0F 55%, ${accent}1F 100%)`
}

export function getHeroGradient(mechanic: string): string {
  const hero = getHeroCover(mechanic)
  return `linear-gradient(135deg, ${hero.bgFrom}, ${hero.bgTo})`
}
