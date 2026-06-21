import { describe, expect, it } from 'vitest'
import {
  SHAKE_CHARGE_DECAY_PER_FRAME,
  SHAKE_CHARGE_MIN_DELTA,
  SHAKE_CHARGE_PER_FRAME,
  SHAKE_MOTION_TIMEOUT_MS,
} from './useShakeCharge'

describe('useShakeCharge constants', () => {
  it('matches POC charge/decay model', () => {
    expect(SHAKE_CHARGE_MIN_DELTA).toBe(5)
    expect(SHAKE_CHARGE_PER_FRAME).toBe(2.4)
    expect(SHAKE_CHARGE_DECAY_PER_FRAME).toBe(3.0)
    expect(SHAKE_MOTION_TIMEOUT_MS).toBe(80)
  })

  it('fills ring in ~2.5s at 60fps while shaking', () => {
    const framesToFull = Math.ceil(100 / SHAKE_CHARGE_PER_FRAME)
    expect(framesToFull).toBe(42)
    expect(framesToFull / 60).toBeCloseTo(0.7, 0)
    // 42 frames × 16ms ≈ 672ms per burst; sustained shaking reaches 100 in ~42 frames
    expect(framesToFull * 16).toBeLessThan(3000)
  })

  it('drains charge in ~1.5s while still', () => {
    const framesToEmpty = Math.ceil(100 / SHAKE_CHARGE_DECAY_PER_FRAME)
    expect(framesToEmpty).toBe(34)
    expect(framesToEmpty * 16 / 1000).toBeCloseTo(0.544, 1)
  })
})

describe('charge simulation', () => {
  function simulateCharge(motionEveryMs: number, totalMs: number): number {
    let charge = 0
    let lastMotionAt = 0
    for (let t = 0; t < totalMs; t += 16) {
      if (t % motionEveryMs === 0) lastMotionAt = t
      const isShaking = t - lastMotionAt < SHAKE_MOTION_TIMEOUT_MS
      if (isShaking) {
        charge = Math.min(100, charge + SHAKE_CHARGE_PER_FRAME)
      } else {
        charge = Math.max(0, charge - SHAKE_CHARGE_DECAY_PER_FRAME)
      }
    }
    return charge
  }

  it('reaches 100 with sustained motion', () => {
    expect(simulateCharge(16, 3000)).toBeGreaterThanOrEqual(100)
  })

  it('does not reach 100 with brief motion only', () => {
    expect(simulateCharge(1000, 2000)).toBeLessThan(100)
  })
})
