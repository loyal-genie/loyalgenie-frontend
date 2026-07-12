export type LiveCampaignMechanic = 'stamp' | 'shake' | 'check-in-loyalty' | 'spin' | 'dice' | 'lottery' | 'buy-x-get-y' | 'coupon' | 'flash' | 'combo' | 'friend' | 'groupunlock'

export interface CampaignTheme {
  gradient: string
  /** Solid cover color for PIN detail pages (stamp/check-in style). */
  cover: string
  badgeBg: string
  badgeText: string
  accent: string
  chipLabel: string
}

export const CAMPAIGN_THEMES: Record<string, CampaignTheme> = {
  stamp: {
    gradient: 'linear-gradient(135deg, #fde68a 0%, #fbbf24 45%, #d97706 100%)',
    cover: '#43036d',
    badgeBg: 'bg-white/95',
    badgeText: 'text-amber-900',
    accent: '#b45309',
    chipLabel: 'Stamp Card',
  },
  shake: {
    gradient: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 45%, #5b21b6 100%)',
    cover: '#5b21b6',
    badgeBg: 'bg-[#ede9fe]',
    badgeText: 'text-[#5b21b6]',
    accent: '#6d28d9',
    chipLabel: 'Shake & Win',
  },
  'check-in-loyalty': {
    gradient: 'linear-gradient(135deg, #6ee7b7 0%, #10b981 45%, #047857 100%)',
    cover: '#43036d',
    badgeBg: 'bg-white/95',
    badgeText: 'text-emerald-900',
    accent: '#047857',
    chipLabel: 'Check-in Loyalty',
  },
  spin: {
    gradient: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 45%, #1e3a8a 100%)',
    cover: '#1e40af',
    badgeBg: 'bg-[#dbeafe]',
    badgeText: 'text-[#1e40af]',
    accent: '#2563eb',
    chipLabel: 'Spin a Wheel',
  },
  dice: {
    gradient: 'linear-gradient(135deg, #fda4af 0%, #fb7185 50%, #f43f5e 100%)',
    cover: '#e11d48',
    badgeBg: 'bg-[#fff1f2]',
    badgeText: 'text-[#be123c]',
    accent: '#f43f5e',
    chipLabel: 'Roll a Dice',
  },
  lottery: {
    gradient: 'linear-gradient(135deg, #fefce8 0%, #fef9c3 50%, #fde68a 100%)',
    cover: '#ca8a04',
    badgeBg: 'bg-[#fefce8]',
    badgeText: 'text-[#854d0e]',
    accent: '#ca8a04',
    chipLabel: 'Lottery',
  },
  'buy-x-get-y': {
    gradient: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fed7aa 100%)',
    cover: '#ea580c',
    badgeBg: 'bg-[#fff7ed]',
    badgeText: 'text-[#9a3412]',
    accent: '#f97316',
    chipLabel: 'Buy X Get Y',
  },
  coupon: {
    gradient: 'linear-gradient(135deg, #5eead4 0%, #14b8a6 50%, #0f766e 100%)',
    cover: '#0f766e',
    badgeBg: 'bg-[#ccfbf1]',
    badgeText: 'text-[#115e59]',
    accent: '#0d9488',
    chipLabel: 'Coupon Codes',
  },
  flash: {
    gradient: 'linear-gradient(135deg, #bae6fd 0%, #7dd3fc 45%, #38bdf8 100%)',
    cover: '#0284c7',
    badgeBg: 'bg-[#e0f2fe]',
    badgeText: 'text-[#0369a1]',
    accent: '#0ea5e9',
    chipLabel: 'Flash Deal',
  },
  combo: {
    gradient: 'linear-gradient(135deg, #f7fee7 0%, #ecfccb 50%, #d9f99d 100%)',
    cover: '#65a30d',
    badgeBg: 'bg-[#f7fee7]',
    badgeText: 'text-[#3f6212]',
    accent: '#84cc16',
    chipLabel: 'Package/Combo Deal',
  },
  friend: {
    gradient: 'linear-gradient(135deg, #fce7f3 0%, #f9a8d4 50%, #f472b6 100%)',
    cover: '#db2777',
    badgeBg: 'bg-[#fce7f3]',
    badgeText: 'text-[#9d174d]',
    accent: '#ec4899',
    chipLabel: 'Bring a Friend',
  },
  groupunlock: {
    gradient: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 45%, #c7d2fe 100%)',
    cover: '#4f46e5',
    badgeBg: 'bg-[#eef2ff]',
    badgeText: 'text-[#3730a3]',
    accent: '#6366f1',
    chipLabel: 'Community Offer',
  },
}

export function getCampaignTheme(mechanic: string): CampaignTheme {
  return CAMPAIGN_THEMES[mechanic] ?? CAMPAIGN_THEMES.shake!
}
