export type LiveCampaignMechanic = 'stamp' | 'shake' | 'check-in-loyalty' | 'spin'

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
    gradient: 'linear-gradient(135deg, #c4b5fd 0%, #7c3aed 45%, #4c1d95 100%)',
    badgeBg: 'bg-[#ede9fe]',
    badgeText: 'text-[#5b21b6]',
    accent: '#6d28d9',
    chipLabel: 'Spin a Wheel',
  },
}

export function getCampaignTheme(mechanic: string): CampaignTheme {
  return CAMPAIGN_THEMES[mechanic] ?? CAMPAIGN_THEMES.shake!
}
