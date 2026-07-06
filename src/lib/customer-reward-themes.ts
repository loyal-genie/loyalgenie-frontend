export type RewardCardThemeKey = 'gold' | 'purple' | 'copper' | 'green' | 'lockedGold' | 'lockedPurple'

export type RewardCardTheme = {
  gradient: string
  border: string
  accent: string
  ptsBg: string
  claimedBg: string
  iconBg: string
  actionBg: string
  actionText: string
}

export const REWARD_CARD_THEMES: Record<RewardCardThemeKey, RewardCardTheme> = {
  gold: {
    gradient: 'linear-gradient(174deg, #fdfaf4 13%, #fdfdfd 89%)',
    border: '#f3e8c8',
    accent: '#92400e',
    ptsBg: '#fef3c7',
    claimedBg: '#fef3c7',
    iconBg: '#fef3c7',
    actionBg: '#92400e',
    actionText: '#ffffff',
  },
  purple: {
    gradient: 'linear-gradient(173deg, rgba(243,218,255,0.23) 13%, #fdfdfd 89%)',
    border: 'rgba(91,14,129,0.12)',
    accent: '#5b0e81',
    ptsBg: '#e9e0f9',
    claimedBg: 'rgba(233,224,249,0.55)',
    iconBg: '#efe8fb',
    actionBg: '#5b0e81',
    actionText: '#ffffff',
  },
  copper: {
    gradient: 'linear-gradient(173deg, rgba(193,163,136,0.07) 13%, #fdfdfd 89%)',
    border: 'rgba(168,67,0,0.12)',
    accent: '#a84300',
    ptsBg: 'rgba(248,233,203,0.49)',
    claimedBg: 'rgba(248,233,203,0.49)',
    iconBg: '#f3e8d8',
    actionBg: '#a84300',
    actionText: '#ffffff',
  },
  green: {
    gradient: 'linear-gradient(173deg, #e5e2db 13%, #fdfdfd 89%)',
    border: 'rgba(120,170,118,0.35)',
    accent: '#096304',
    ptsBg: 'rgba(125,172,122,0.2)',
    claimedBg: 'rgba(125,172,122,0.2)',
    iconBg: '#dfe8dc',
    actionBg: '#096304',
    actionText: '#ffffff',
  },
  lockedGold: {
    gradient: 'linear-gradient(173deg, rgba(252,245,236,0.43) 13%, #fdfdfd 89%)',
    border: 'rgba(174,139,68,0.28)',
    accent: '#ae8b44',
    ptsBg: 'rgba(248,233,203,0.49)',
    claimedBg: 'rgba(248,233,203,0.49)',
    iconBg: '#f3ead8',
    actionBg: '#d4c4a8',
    actionText: '#ffffff',
  },
  lockedPurple: {
    gradient: 'linear-gradient(173deg, rgba(243,218,255,0.15) 13%, #fdfdfd 89%)',
    border: 'rgba(91,14,129,0.18)',
    accent: '#7a5a9c',
    ptsBg: '#efe8f8',
    claimedBg: 'rgba(233,224,249,0.45)',
    iconBg: '#f0ebf8',
    actionBg: '#c9bdd8',
    actionText: '#ffffff',
  },
}

const CLAIMABLE_ROTATION: RewardCardThemeKey[] = ['gold', 'purple', 'copper', 'green']
const LOCKED_ROTATION: RewardCardThemeKey[] = ['lockedGold', 'lockedPurple']

export function getClaimableTheme(index: number): RewardCardTheme {
  return REWARD_CARD_THEMES[CLAIMABLE_ROTATION[index % CLAIMABLE_ROTATION.length]]
}

export function getLockedTheme(index: number): RewardCardTheme {
  return REWARD_CARD_THEMES[LOCKED_ROTATION[index % LOCKED_ROTATION.length]]
}

export function formatRewardDate(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}
