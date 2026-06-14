import type { CSSProperties } from 'react'

export interface HeroRewardCard {
  emoji: string
  reward: string
  rewardColor: string
  borderColor: string
  iconGradient: string
  position: CSSProperties
  animationDelay: string
}

export const HERO_REWARD_CARDS: HeroRewardCard[] = [
  {
    emoji: '⭐',
    reward: 'Double Points',
    rewardColor: '#f0c040',
    borderColor: 'rgba(240,192,64,0.25)',
    iconGradient: 'linear-gradient(135deg,#f0c040,#e9a820)',
    position: { top: '30px', left: '-88px' },
    animationDelay: '0.3s',
  },
  {
    emoji: '💆',
    reward: 'Complimentary Service',
    rewardColor: '#4dd4ac',
    borderColor: 'rgba(22,160,133,0.35)',
    iconGradient: 'linear-gradient(135deg,#16a085,#0d3b27)',
    position: { top: '240px', left: '-83px' },
    animationDelay: '2.5s',
  },
  {
    emoji: '🎁',
    reward: '₹50 off your next visit',
    rewardColor: '#f0c040',
    borderColor: 'rgba(240,192,64,0.25)',
    iconGradient: 'linear-gradient(135deg,#f0c040,#e9a820)',
    position: { bottom: '100px', left: '-88px' },
    animationDelay: '0s',
  },
  {
    emoji: '☕',
    reward: 'Free Coffee',
    rewardColor: '#a78bfa',
    borderColor: 'rgba(107,63,212,0.35)',
    iconGradient: 'linear-gradient(135deg,#6b3fd4,#3d1f8a)',
    position: { top: '60px', right: '-10px' },
    animationDelay: '1.2s',
  },
  {
    emoji: '🍕',
    reward: 'Free Snack',
    rewardColor: '#fca5a5',
    borderColor: 'rgba(239,68,68,0.35)',
    iconGradient: 'linear-gradient(135deg,#ef4444,#991b1b)',
    position: { top: '240px', right: '-20px' },
    animationDelay: '1.8s',
  },
  {
    emoji: '🏷️',
    reward: '10% Off Today',
    rewardColor: '#fdba74',
    borderColor: 'rgba(251,146,60,0.35)',
    iconGradient: 'linear-gradient(135deg,#f97316,#c2410c)',
    position: { bottom: '80px', right: '-15px' },
    animationDelay: '3.2s',
  },
]
