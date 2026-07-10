export type LiveCampaignMechanic = 'stamp' | 'shake' | 'check-in-loyalty' | 'spin' | 'dice' | 'lottery' | 'buy-x-get-y' | 'coupon' | 'flash' | 'combo' | 'friend' | 'groupunlock'

export interface CampaignTheme {
  gradient: string
  badgeBg: string
  badgeText: string
  accent: string
  chipLabel: string
}

export const CAMPAIGN_THEMES: Record<string, CampaignTheme> = {
  stamp: {
    gradient: 'linear-gradient(135deg, #fde68a 0%, #fbbf24 45%, #d97706 100%)',
    badgeBg: 'bg-white/95',
    badgeText: 'text-amber-900',
    accent: '#b45309',
    chipLabel: 'Stamp Card',
  },
  shake: {
    gradient: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 45%, #5b21b6 100%)',
    badgeBg: 'bg-[#ede9fe]',
    badgeText: 'text-[#5b21b6]',
    accent: '#6d28d9',
    chipLabel: 'Shake & Win',
  },
  'check-in-loyalty': {
    gradient: 'linear-gradient(135deg, #6ee7b7 0%, #10b981 45%, #047857 100%)',
    badgeBg: 'bg-white/95',
    badgeText: 'text-emerald-900',
    accent: '#047857',
    chipLabel: 'Check-in Loyalty',
  },
  spin: {
    gradient: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 45%, #1e3a8a 100%)',
    badgeBg: 'bg-[#dbeafe]',
    badgeText: 'text-[#1e40af]',
    accent: '#2563eb',
    chipLabel: 'Spin a Wheel',
  },
  dice: {
    gradient: 'linear-gradient(135deg, #fda4af 0%, #fb7185 50%, #f43f5e 100%)',
    badgeBg: 'bg-[#fff1f2]',
    badgeText: 'text-[#be123c]',
    accent: '#f43f5e',
    chipLabel: 'Roll a Dice',
  },
  lottery: {
    gradient: 'linear-gradient(135deg, #fde68a 0%, #f59e0b 50%, #b45309 100%)',
    badgeBg: 'bg-[#fef9c3]',
    badgeText: 'text-[#854d0e]',
    accent: '#d97706',
    chipLabel: 'Lottery',
  },
  'buy-x-get-y': {
    gradient: 'linear-gradient(135deg, #fdba74 0%, #f97316 50%, #c2410c 100%)',
    badgeBg: 'bg-[#ffedd5]',
    badgeText: 'text-[#9a3412]',
    accent: '#ea580c',
    chipLabel: 'Buy X Get Y',
  },
  coupon: {
    gradient: 'linear-gradient(135deg, #5eead4 0%, #14b8a6 50%, #0f766e 100%)',
    badgeBg: 'bg-[#ccfbf1]',
    badgeText: 'text-[#115e59]',
    accent: '#0d9488',
    chipLabel: 'Coupon Codes',
  },
  flash: {
    gradient: 'linear-gradient(135deg, #bae6fd 0%, #7dd3fc 45%, #38bdf8 100%)',
    badgeBg: 'bg-[#e0f2fe]',
    badgeText: 'text-[#0369a1]',
    accent: '#0ea5e9',
    chipLabel: 'Flash Deal',
  },
  combo: {
    gradient: 'linear-gradient(135deg, #f7fee7 0%, #d9f99d 50%, #a3e635 100%)',
    badgeBg: 'bg-[#f7fee7]',
    badgeText: 'text-[#3f6212]',
    accent: '#84cc16',
    chipLabel: 'Package/Combo Deal',
  },
  friend: {
    gradient: 'linear-gradient(135deg, #fce7f3 0%, #f9a8d4 50%, #f472b6 100%)',
    badgeBg: 'bg-[#fce7f3]',
    badgeText: 'text-[#9d174d]',
    accent: '#ec4899',
    chipLabel: 'Bring a Friend',
  },
  groupunlock: {
    gradient: 'linear-gradient(135deg, #eef2ff 0%, #c7d2fe 45%, #818cf8 100%)',
    badgeBg: 'bg-[#eef2ff]',
    badgeText: 'text-[#3730a3]',
    accent: '#6366f1',
    chipLabel: 'Community Offer',
  },
}

export function getCampaignTheme(mechanic: string): CampaignTheme {
  return CAMPAIGN_THEMES[mechanic] ?? CAMPAIGN_THEMES.shake!
}
