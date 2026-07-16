import type { SpinSegment } from '@/lib/types'

const SEGMENT_COLORS = ['#7C3AED', '#EC4899', '#F59E0B', '#06B6D4', '#22C55E', '#631cbb', '#2A2660', '#1A1840']

export function spinConfigToSegments(
  segments: {
    id?: string
    label: string
    color: string
    isWin: boolean
    probability?: number
    reward: string | null
  }[],
): SpinSegment[] {
  const total = segments.reduce((s, seg) => s + (seg.probability ?? 0), 0) || segments.length * 100 / Math.max(segments.length, 1)
  return segments.map(seg => ({
    id: seg.id,
    label: seg.label.length > 10 ? seg.label.slice(0, 9) + '…' : seg.label,
    reward: seg.isWin ? (seg.reward ?? seg.label) : null,
    probability: seg.probability != null
      ? seg.probability / (total || 100)
      : 1 / segments.length,
    color: seg.color,
    isWin: seg.isWin,
  }))
}

export function segmentSliceAngle(seg: SpinSegment, totalProbability: number): number {
  const weight = seg.probability > 1 ? seg.probability : seg.probability * 100
  const total = totalProbability > 1 ? totalProbability : totalProbability * 100
  return (weight / (total || 100)) * 360
}

export function segmentAngles(segments: SpinSegment[]): number[] {
  const total = segments.reduce((s, seg) => s + (seg.probability > 1 ? seg.probability : seg.probability * 100), 0) || 100
  return segments.map(seg => segmentSliceAngle(seg, total))
}

export function landingAngleForIndex(segments: SpinSegment[], index: number): number {
  const angles = segmentAngles(segments)
  let start = -90
  for (let i = 0; i < index; i++) start += angles[i] ?? 0
  const slice = angles[index] ?? 360 / segments.length
  return start + slice / 2
}

/** Wheel rotation (deg, clockwise) so segment `index` midpoint sits under the top pointer. */
export function spinRotationForLanding(segments: SpinSegment[], index: number): number {
  const mid = landingAngleForIndex(segments, index)
  return ((270 - mid) % 360 + 360) % 360
}

/**
 * Absolute CSS rotation to animate to, so segment `index` lands under the pointer.
 * Must account for the wheel's current rotation (e.g. idle drift) — adding an absolute
 * target on top of the current angle mis-lands by exactly that offset.
 */
export function spinFinalRotation(
  currentRotation: number,
  segments: SpinSegment[],
  index: number,
  extraSpins = 6,
): number {
  const target = spinRotationForLanding(segments, index)
  const startMod = ((currentRotation % 360) + 360) % 360
  const delta = ((target - startMod) % 360 + 360) % 360
  return currentRotation + extraSpins * 360 + delta
}

function normalizeRewardKey(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase()
}

function segmentMatchesReward(seg: SpinSegment, reward?: { id?: string; name?: string | null } | null): boolean {
  if (!reward) return false
  if (reward.id && seg.id && reward.id === seg.id) return true
  const rewardName = normalizeRewardKey(reward.name)
  if (!rewardName) return false
  return normalizeRewardKey(seg.reward) === rewardName
    || normalizeRewardKey(seg.label) === rewardName
    || normalizeRewardKey(seg.label.replace(/…$/, '')) === rewardName
    || rewardName.startsWith(normalizeRewardKey(seg.label.replace(/…$/, '')))
}

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
  reward?: { id?: string; name?: string | null } | null,
): number {
  const indexed = segments.map((s, i) => ({ ...s, i }))
  const winSegs = indexed.filter(s => s.isWin)
  const noWinSegs = indexed.filter(s => !s.isWin)

  if (won && reward) {
    const match = winSegs.find(s => segmentMatchesReward(s, reward))
    if (match) return match.i
    if (winSegs.length) return winSegs[0]!.i
  }
  if (!won && noWinSegs.length) {
    return noWinSegs[Math.floor(Math.random() * noWinSegs.length)]!.i
  }
  return 0
}

/** Dice faces that win vs lose for visual landing (fallback when no config) */
export const DICE_WIN_FACES = [3, 4, 6] as const
export const DICE_LOSE_FACES = [1, 2, 5] as const

export interface DicePlayOutcome {
  value: number
  isWin: boolean
  reward: string | null
}

/**
 * Choose which dice face the visual roll lands on so it matches the server's result.
 * Prefers the face whose reward matches the awarded reward; falls back to any winning/losing face.
 */
export function pickDiceLandingValue(
  outcomes: DicePlayOutcome[] | null | undefined,
  won: boolean,
  reward?: { id?: string; name?: string | null } | null,
): number {
  if (!outcomes || outcomes.length === 0) {
    return pickDiceFace(won)
  }

  const winFaces = outcomes.filter(o => o.isWin && (o.reward ?? '').trim())
  const loseFaces = outcomes.filter(o => !o.isWin || !(o.reward ?? '').trim())

  if (won) {
    const rewardName = normalizeRewardKey(reward?.name)
    if (rewardName) {
      const match = winFaces.find(o => normalizeRewardKey(o.reward) === rewardName)
      if (match) return match.value
    }
    if (winFaces.length) {
      return winFaces[Math.floor(Math.random() * winFaces.length)]!.value
    }
  }
  if (loseFaces.length) {
    return loseFaces[Math.floor(Math.random() * loseFaces.length)]!.value
  }
  return pickDiceFace(won)
}

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
