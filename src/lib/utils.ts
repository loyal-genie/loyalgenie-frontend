import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function capPercent(current: number, cap: number) {
  if (cap <= 0) return 0
  return Math.round((current / cap) * 100)
}

const MECHANIC_EMOJI: Record<string, string> = {
  stamp: '🏆',
  spin: '🎡',
  shake: '📱',
  lottery: '🎟️',
  dice: '🎲',
  scratch: '🎴',
}

export function getMechanicEmoji(mechanic: string) {
  return MECHANIC_EMOJI[mechanic] ?? '🎮'
}
