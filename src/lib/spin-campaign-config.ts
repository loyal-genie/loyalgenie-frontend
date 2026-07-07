import { isRedeemBeforeValid } from '@/components/vendor/RedeemBeforeField'
import { SPIN_SOLID_COLORS } from '@/lib/spin-segment-colors'

export { SPIN_COLORS, SPIN_ALL_COLORS, SPIN_SOLID_COLORS, SPIN_GRADIENT_COLORS } from '@/lib/spin-segment-colors'

export function segmentDisplayName(seg: SpinSegmentUi): string {
  return seg.label.trim() || seg.name.trim()
}

export interface SpinSegmentUi {
  id: string
  label: string
  color: string
  isWin: boolean
  probability: number
  name: string
  description: string
  icon: string
  redeemExpiryMode: 'fixed' | 'relative'
  redeemFixedDate: string
  redeemRelativeAmount: number
  redeemRelativeUnit: 'day' | 'week' | 'month'
}

export function equalSplitProbabilities(count: number): number[] {
  if (count < 1) return []
  const base = Math.floor(100 / count)
  return Array.from({ length: count }, (_, i) =>
    i === count - 1 ? 100 - base * (count - 1) : base,
  )
}

export function applyEqualProbabilities(segments: SpinSegmentUi[]): SpinSegmentUi[] {
  const shares = equalSplitProbabilities(segments.length)
  return segments.map((s, i) => ({ ...s, probability: shares[i] ?? 1 }))
}

/** When one segment share changes, redistribute the remainder equally across others (always sums to 100). */
export function setSegmentProbability(
  segments: SpinSegmentUi[],
  segmentId: string,
  newProbability: number,
): SpinSegmentUi[] {
  const n = segments.length
  if (n < 1) return segments
  if (n === 1) {
    return segments.map(s => (s.id === segmentId ? { ...s, probability: 100 } : s))
  }

  const minPerSegment = 1
  const maxForChanged = 100 - minPerSegment * (n - 1)
  const clamped = Math.max(minPerSegment, Math.min(maxForChanged, Math.round(newProbability)))

  const others = segments.filter(s => s.id !== segmentId)
  const remainder = 100 - clamped
  const base = Math.floor(remainder / others.length)
  const lastExtra = remainder - base * others.length

  let otherIdx = 0
  return segments.map(s => {
    if (s.id === segmentId) return { ...s, probability: clamped }
    const isLastOther = otherIdx === others.length - 1
    const prob = isLastOther ? base + lastExtra : base
    otherIdx++
    return { ...s, probability: prob }
  })
}

export function addSpinSegment(
  segments: SpinSegmentUi[],
  partial?: Partial<SpinSegmentUi>,
): SpinSegmentUi[] {
  return applyEqualProbabilities([...segments, newSpinSegment(partial)])
}

export function removeSpinSegment(segments: SpinSegmentUi[], segmentId: string): SpinSegmentUi[] {
  const next = segments.filter(s => s.id !== segmentId)
  return next.length >= 2 ? applyEqualProbabilities(next) : next
}

export function newSpinSegment(partial?: Partial<SpinSegmentUi>): SpinSegmentUi {
  return {
    id: Math.random().toString(36).slice(2),
    label: 'New Segment',
    color: '#7C3AED',
    isWin: false,
    probability: 1,
    name: '',
    description: '',
    icon: '🎁',
    redeemExpiryMode: 'relative',
    redeemFixedDate: '',
    redeemRelativeAmount: 7,
    redeemRelativeUnit: 'day',
    ...partial,
  }
}

export function defaultSpinSegments(): SpinSegmentUi[] {
  return applyEqualProbabilities([
    newSpinSegment({ label: 'Free Coffee', color: '#7C3AED', isWin: true }),
    newSpinSegment({ label: 'Try Again', color: '#E5E1F8', isWin: false }),
    newSpinSegment({ label: '20% Off', color: 'linear-gradient(135deg, #f9a8d4 0%, #be185d 100%)', isWin: true }),
    newSpinSegment({ label: 'Better Luck', color: '#EDE9FF', isWin: false }),
    newSpinSegment({ label: 'Free Muffin', color: 'linear-gradient(135deg, #fcd34d 0%, #d97706 100%)', isWin: true }),
    newSpinSegment({ label: '₹50 Off', color: '#06B6D4', isWin: true }),
  ])
}

export function spinSegmentProbabilityTotal(segments: SpinSegmentUi[]): number {
  return segments.reduce((s, seg) => s + seg.probability, 0)
}

export function spinWinRateFromSegments(segments: SpinSegmentUi[]): number {
  return segments.filter(s => s.isWin).reduce((s, seg) => s + seg.probability, 0)
}

export function isSpinSegmentRedeemValid(seg: SpinSegmentUi): boolean {
  if (!seg.isWin) return true
  return isRedeemBeforeValid({
    redeemExpiryMode: seg.redeemExpiryMode,
    redeemFixedDate: seg.redeemFixedDate,
    redeemRelativeAmount: seg.redeemRelativeAmount,
    redeemRelativeUnit: seg.redeemRelativeUnit,
  })
}

export function isSpinSegmentConfigValid(segments: SpinSegmentUi[]): boolean {
  if (segments.length < 2) return false
  if (spinSegmentProbabilityTotal(segments) !== 100) return false
  const winSegments = segments.filter(s => s.isWin)
  if (!winSegments.some(s => segmentDisplayName(s))) return false
  return winSegments.every(s => !segmentDisplayName(s) || isSpinSegmentRedeemValid(s))
}

export function buildSpinCampaignPayload(segments: SpinSegmentUi[]) {
  return {
    spinConfig: {
      segments: segments.map(s => {
        const label = s.label.trim() || 'Segment'
        return {
        id: s.id,
        label,
        color: s.color,
        isWin: s.isWin,
        probability: s.probability,
        reward: s.isWin ? label : null,
        description: '',
        icon: '🎁',
        redeemExpiryMode: s.isWin ? s.redeemExpiryMode : undefined,
        redeemFixedDate: s.isWin && s.redeemExpiryMode === 'fixed' ? s.redeemFixedDate : undefined,
        redeemRelativeAmount: s.isWin && s.redeemExpiryMode === 'relative' ? s.redeemRelativeAmount : undefined,
        redeemRelativeUnit: s.isWin && s.redeemExpiryMode === 'relative' ? s.redeemRelativeUnit : undefined,
      }}),
    },
  }
}

export function spinSegmentsFromApi(
  spinConfig: {
    segments: {
      id?: string
      label: string
      color: string
      isWin: boolean
      probability?: number
      reward: string | null
      description?: string
      icon?: string
      redeemExpiryMode?: 'fixed' | 'relative'
      redeemFixedDate?: string | null
      redeemRelativeAmount?: number
      redeemRelativeUnit?: 'day' | 'week' | 'month'
    }[]
  } | null | undefined,
  rewards?: { id: string; name: string; description?: string; icon?: string; sharePercent?: number }[],
): SpinSegmentUi[] {
  if (spinConfig?.segments?.length) {
    const mapped = spinConfig.segments.map((s, i) => ({
      id: s.id ?? `seg-${i}`,
      label: s.label,
      color: s.color,
      isWin: s.isWin,
      probability: s.probability ?? Math.floor(100 / spinConfig.segments.length),
      name: s.reward ?? s.label,
      description: s.description ?? '',
      icon: s.icon ?? '🎁',
      redeemExpiryMode: s.redeemExpiryMode ?? 'relative',
      redeemFixedDate: s.redeemFixedDate ?? '',
      redeemRelativeAmount: s.redeemRelativeAmount ?? 7,
      redeemRelativeUnit: s.redeemRelativeUnit ?? 'day',
    }))
    const total = spinSegmentProbabilityTotal(mapped)
    return total === 100 ? mapped : applyEqualProbabilities(mapped)
  }

  if (rewards?.length) {
    const winSegs = rewards.map((r, i) =>
      newSpinSegment({
        id: r.id,
        label: r.name,
        color: SPIN_SOLID_COLORS[i % SPIN_SOLID_COLORS.length]!.value,
        isWin: true,
        probability: r.sharePercent ?? Math.floor(100 / rewards.length),
        name: r.name,
        description: r.description ?? '',
        icon: r.icon ?? '🎁',
      }),
    )
    const loseProb = Math.max(10, 100 - spinSegmentProbabilityTotal(winSegs))
    return [
      ...winSegs,
      newSpinSegment({ label: 'Try Again', color: '#E5E1F8', isWin: false, probability: loseProb }),
    ]
  }

  return defaultSpinSegments()
}

export function spinSegmentsEqual(a: SpinSegmentUi[], b: SpinSegmentUi[]): boolean {
  if (a.length !== b.length) return false
  return a.every((seg, i) => {
    const o = b[i]!
    return seg.id === o.id
      && seg.label === o.label
      && seg.color === o.color
      && seg.isWin === o.isWin
      && seg.probability === o.probability
      && seg.name === o.name
      && seg.description === o.description
      && seg.icon === o.icon
      && seg.redeemExpiryMode === o.redeemExpiryMode
      && seg.redeemFixedDate === o.redeemFixedDate
      && seg.redeemRelativeAmount === o.redeemRelativeAmount
      && seg.redeemRelativeUnit === o.redeemRelativeUnit
  })
}
