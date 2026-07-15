import { describe, expect, it } from 'vitest'
import {
  pickSpinLandingIndex,
  spinFinalRotation,
  spinRotationForLanding,
} from './instant-win-ui'
import type { SpinSegment } from '@/lib/types'

const segments: SpinSegment[] = [
  { label: 'Coffee', reward: 'Free Coffee', probability: 0.2, color: '#7C3AED', isWin: true },
  { label: 'Cookie', reward: 'Cookie', probability: 0.2, color: '#EC4899', isWin: true },
  { label: 'Try Again', reward: null, probability: 0.3, color: '#1A1840', isWin: false },
  { label: 'Better Luck', reward: null, probability: 0.3, color: '#2A2660', isWin: false },
]

describe('spinFinalRotation', () => {
  it('lands on the awarded segment even when the wheel already has idle drift', () => {
    const idx = pickSpinLandingIndex(segments, true, { name: 'Cookie' })
    expect(idx).toBe(1)
    const target = spinRotationForLanding(segments, idx)

    const idle = 47.3
    const finalRotation = spinFinalRotation(idle, segments, idx, 6)
    const landedMod = ((finalRotation % 360) + 360) % 360

    expect(landedMod).toBeCloseTo(target, 6)
    // Legacy bug: idle + target (absolute) offsets landing by idle degrees
    const legacyBug = ((idle + 6 * 360 + target) % 360 + 360) % 360
    expect(Math.abs(legacyBug - target)).toBeCloseTo(idle, 6)
  })

  it('still ends on target when current rotation is already aligned', () => {
    const idx = 0
    const target = spinRotationForLanding(segments, idx)
    const finalRotation = spinFinalRotation(target + 720, segments, idx, 5)
    expect(((finalRotation % 360) + 360) % 360).toBeCloseTo(target, 6)
  })
})

describe('pickSpinLandingIndex', () => {
  it('matches the win segment by reward name, not the first win slice', () => {
    expect(pickSpinLandingIndex(segments, true, { name: 'Cookie' })).toBe(1)
    expect(pickSpinLandingIndex(segments, true, { name: 'Free Coffee' })).toBe(0)
  })
})
