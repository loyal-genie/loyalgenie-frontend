import type { SpinSegment } from '@/lib/types'

const SEGMENT_COLORS = ['#7C3AED', '#EC4899', '#F59E0B', '#06B6D4', '#22C55E', '#631cbb', '#2A2660', '#1A1840']

export function buildSpinSegmentsFromRewards(
  rewards: { name: string; icon?: string }[],
): SpinSegment[] {
  if (rewards.length === 0) {
    return [
      { label: 'Try Again', reward: null, probability: 0.5, color: '#2A2660', isWin: false },
      { label: 'Prize', reward: 'Prize', probability: 0.5, color: '#7C3AED', isWin: true },
    ]
  }

  const winSegments: SpinSegment[] = rewards.map((r, i) => ({
    label: r.name.length > 10 ? r.name.slice(0, 9) + '…' : r.name,
    reward: r.name,
    probability: 1 / rewards.length,
    color: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
    isWin: true,
  }))

  const noWin: SpinSegment = {
    label: 'Try Again',
    reward: null,
    probability: 0.25,
    color: '#1A1840',
    isWin: false,
  }

  return [...winSegments, noWin, { ...noWin, label: 'Better Luck', color: '#2A2660' }]
}

export function pickSpinLandingIndex(
  segments: SpinSegment[],
  won: boolean,
  rewardName?: string | null,
): number {
  const winSegs = segments.map((s, i) => ({ ...s, i })).filter(s => s.isWin)
  const noWinSegs = segments.map((s, i) => ({ ...s, i })).filter(s => !s.isWin)

  if (won && rewardName) {
    const match = winSegs.find(s => s.reward === rewardName)
    if (match) return match.i
    if (winSegs.length) return winSegs[0].i
  }
  if (!won && noWinSegs.length) return noWinSegs[Math.floor(Math.random() * noWinSegs.length)].i
  return 0
}

/** Dice faces that win vs lose for visual landing */
export const DICE_WIN_FACES = [3, 4, 6] as const
export const DICE_LOSE_FACES = [1, 2, 5] as const

export function pickDiceFace(won: boolean): number {
  const pool = won ? DICE_WIN_FACES : DICE_LOSE_FACES
  return pool[Math.floor(Math.random() * pool.length)]
}

export type LotteryCell = { emoji: string; reward: string; color: string }

export function buildLotteryGrid(won: boolean, reward?: { name: string; icon: string } | null): LotteryCell[] {
  const NO_WIN: LotteryCell = { emoji: '❌', reward: 'No Win', color: 'rgba(255,255,255,0.15)' }
  const WIN: LotteryCell = won && reward
    ? { emoji: reward.icon || '🎁', reward: reward.name, color: '#F5C518' }
    : { emoji: '👑', reward: 'Prize', color: '#F5C518' }

  const grid: LotteryCell[] = Array(9).fill(null).map(() => ({ ...NO_WIN }))

  if (won) {
    const positions = [0, 1, 2, 3, 4, 5, 6, 7, 8]
    const pick = () => positions.splice(Math.floor(Math.random() * positions.length), 1)[0]
    grid[pick()] = { ...WIN }
    grid[pick()] = { ...WIN }
    grid[pick()] = { ...WIN }
  }

  return grid
}
