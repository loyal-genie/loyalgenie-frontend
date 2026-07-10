import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { MechanicType, CampaignStatus } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generatePIN(): string {
  return String(Math.floor(100 + Math.random() * 900))
}

export function getMechanicLabel(mechanic: MechanicType): string {
  const map: Record<MechanicType, string> = {
    shake: 'Shake & Win',
    stamp: 'Stamp Card',
    'check-in-loyalty': 'Check-in Loyalty',
    spin: 'Spin a Wheel',
    dice: 'Roll a Dice',
    lottery: 'Lottery',
    'buy-x-get-y': 'Buy X Get Y',
  }
  return map[mechanic]
}

export function getMechanicEmoji(mechanic: MechanicType | string): string {
  const map: Record<string, string> = {
    shake: '🤳',
    stamp: '🎯',
    'check-in-loyalty': '⭐',
    spin: '🎡',
    dice: '🎲',
    lottery: '🎟️',
    'buy-x-get-y': '💰',
    scratch: '🎴',
  }
  return map[mechanic] ?? '🎮'
}

export function getMechanicColor(mechanic: MechanicType): string {
  const map: Record<MechanicType, string> = {
    shake: '#EC4899',
    stamp: '#F59E0B',
    'check-in-loyalty': '#7C3AED',
    spin: '#06B6D4',
    dice: '#22C55E',
    lottery: '#8B5CF6',
    'buy-x-get-y': '#F97316',
  }
  return map[mechanic]
}

export function getStatusColor(status: CampaignStatus): string {
  const map: Record<CampaignStatus, string> = {
    active: '#22C55E',
    draft: '#9B93C8',
    ended: '#5B5897',
    paused: '#F59E0B',
  }
  return map[status]
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function capPercent(current: number, cap: number): number {
  return Math.min(100, Math.round((current / cap) * 100))
}

export const MECHANIC_META: Record<MechanicType, { label: string; badgeBg: string; badgeText: string; cardFrom: string; cardTo: string; emoji: string }> = {
  stamp: { label: 'STAMP', badgeBg: '#FEF3C7', badgeText: '#92400E', cardFrom: '#F59E0B', cardTo: '#D97706', emoji: '🧾' },
  'check-in-loyalty': { label: 'LOYALTY', badgeBg: '#EDE9FE', badgeText: '#5B21B6', cardFrom: '#7C3AED', cardTo: '#4C1D95', emoji: '⭐' },
  spin: { label: 'SPIN A WHEEL', badgeBg: '#EDE9FE', badgeText: '#5B21B6', cardFrom: '#7C3AED', cardTo: '#4C1D95', emoji: '🎡' },
  shake: { label: 'SCRATCH', badgeBg: '#DBEAFE', badgeText: '#1E40AF', cardFrom: '#3B82F6', cardTo: '#1D4ED8', emoji: '🃏' },
  dice: { label: 'ROLL A DICE', badgeBg: '#FFF1F2', badgeText: '#BE123C', cardFrom: '#FB7185', cardTo: '#F43F5E', emoji: '🎲' },
  lottery: { label: 'LOTTERY', badgeBg: '#FEF9C3', badgeText: '#854D0E', cardFrom: '#EAB308', cardTo: '#A16207', emoji: '🎟️' },
  'buy-x-get-y': { label: 'BUY X GET Y', badgeBg: '#FFEDD5', badgeText: '#9A3412', cardFrom: '#F97316', cardTo: '#C2410C', emoji: '💰' },
}
