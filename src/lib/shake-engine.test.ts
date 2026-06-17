import { describe, expect, it } from 'vitest'
import {
  computeShakeDelta,
  computeShakeSpeed,
  createShakeSpeedState,
  createShakeStartState,
  evaluateShakeStart,
  mockMotionEvent,
  randomRevealDelayMs,
  readMotionSample,
  RESULT_DELAY_MAX_MS,
  RESULT_DELAY_MIN_MS,
  SHAKE_AXIS_DELTA_MIN,
  SHAKE_IDLE_WARMUP_FRAMES,
  SHAKE_MIN_REVERSALS,
  SHAKE_SPEED_THRESHOLD,
} from './shake-engine'
import { orientationToMotionDelta } from './shake-motion-sensors'

describe('readMotionSample', () => {
  it('falls back to accelerationIncludingGravity when linear axes are null (Android)', () => {
    const event = mockMotionEvent({
      acceleration: { x: null, y: null, z: null },
      accelerationIncludingGravity: { x: 1.2, y: -3.4, z: 9.1 },
    })
    expect(readMotionSample(event)).toEqual({ x: 1.2, y: -3.4, z: 9.1 })
  })

  it('falls back when Chrome Android returns all-zero linear acceleration', () => {
    const event = mockMotionEvent({
      acceleration: { x: 0, y: 0, z: 0 },
      accelerationIncludingGravity: { x: 0.3, y: -0.5, z: 9.7 },
    })
    expect(readMotionSample(event)).toEqual({ x: 0.3, y: -0.5, z: 9.7 })
  })

  it('prefers linear acceleration when it has real values', () => {
    const event = mockMotionEvent({
      acceleration: { x: 0.5, y: 0.2, z: -0.1 },
      accelerationIncludingGravity: { x: 1, y: 2, z: 9 },
    })
    expect(readMotionSample(event)).toEqual({ x: 0.5, y: 0.2, z: -0.1 })
  })
})

describe('computeShakeSpeed', () => {
  it('detects shake via shake.js speed metric', () => {
    let state = createShakeSpeedState()
    const t0 = 1_000
    const s1 = { x: 0, y: 0, z: 9.8 }
    const r1 = computeShakeSpeed(s1, t0, state)
    state = r1.state
    expect(r1.speed).toBe(0)

    const s2 = { x: 3, y: -2.5, z: 8.5 }
    const r2 = computeShakeSpeed(s2, t0 + 40, state)
    expect(r2.speed).toBeGreaterThan(SHAKE_SPEED_THRESHOLD)
  })
})

describe('computeShakeDelta', () => {
  it('detects shake via gravity-inclusive data when linear is zero (Chrome Android)', () => {
    let prev: { x: number; y: number; z: number } | null = null
    const positions = [
      { x: 0, y: 0, z: 0 },
      { x: 0.2, y: -0.1, z: 9.75 },
      { x: 0.5, y: -0.4, z: 9.55 },
    ]

    const deltas: number[] = []
    for (const pos of positions) {
      const event = mockMotionEvent({
        acceleration: { x: 0, y: 0, z: 0 },
        accelerationIncludingGravity: pos,
      })
      const { delta, sample } = computeShakeDelta(event, prev)
      prev = sample
      deltas.push(delta)
    }

    expect(deltas[0]).toBe(0)
    expect(deltas[1]).toBeGreaterThan(0.2)
    expect(deltas[2]).toBeGreaterThan(0.3)
  })
})

describe('evaluateShakeStart — oscillation/reversal algorithm', () => {
  it('does not trigger on a single sample (no history yet)', () => {
    const result = evaluateShakeStart({ x: 0, y: 0, z: 9.8 }, 1_000, createShakeStartState())
    expect(result.triggered).toBe(false)
    expect(result.state.reversals).toBe(0)
  })

  it('does not trigger on monotonic tilt — phone picked up from table', () => {
    // x goes 0 → 1 → 2 → 3 → 4 (no direction reversal, just tilting)
    let state = createShakeStartState()
    let triggered = false
    const t0 = 5_000
    const samples = [
      { x: 0, y: 0, z: 9.8 },
      { x: 1.2, y: 0, z: 9.7 },
      { x: 2.4, y: 0, z: 9.5 },
      { x: 3.5, y: 0, z: 9.3 },
      { x: 4.0, y: 0, z: 9.2 },
      { x: 4.0, y: 0, z: 9.2 },
    ]
    for (let i = 0; i < samples.length; i++) {
      const result = evaluateShakeStart(samples[i], t0 + i * 30, state)
      state = result.state
      if (result.triggered) triggered = true
    }
    expect(triggered).toBe(false)
    expect(state.reversals).toBeLessThan(SHAKE_MIN_REVERSALS)
  })

  it('does not trigger on slow idle drift / holding still', () => {
    let state = createShakeStartState()
    let triggered = false
    const t0 = 5_000
    // Tiny fluctuations below SHAKE_AXIS_DELTA_MIN threshold
    const samples = [
      { x: 0.1, y: 0.1, z: 9.8 },
      { x: 0.2, y: 0.2, z: 9.8 },
      { x: 0.1, y: 0.1, z: 9.8 },
      { x: 0.0, y: 0.0, z: 9.8 },
      { x: 0.1, y: 0.1, z: 9.8 },
    ]
    for (let i = 0; i < samples.length; i++) {
      const result = evaluateShakeStart(samples[i], t0 + i * 30, state)
      state = result.state
      if (result.triggered) triggered = true
    }
    expect(triggered).toBe(false)
  })

  it('triggers on deliberate left-right shake (clear x-axis oscillation)', () => {
    let state = createShakeStartState()
    let triggered = false
    const t0 = 10_000
    // x oscillates: right → left → right → left — 4 reversals
    const samples = [
      { x: 0.0, y: 0, z: 9.8 },   // baseline
      { x: 2.5, y: 0, z: 9.8 },   // right  → sign +
      { x: -2.5, y: 0, z: 9.8 },  // left   → sign - (reversal 1)
      { x: 2.5, y: 0, z: 9.8 },   // right  → sign + (reversal 2)
      { x: -2.5, y: 0, z: 9.8 },  // left   → sign - (reversal 3)
      { x: 2.5, y: 0, z: 9.8 },   // right  → sign + (reversal 4 → trigger)
    ]
    for (let i = 0; i < samples.length; i++) {
      const result = evaluateShakeStart(samples[i], t0 + i * 50, state)
      state = result.state
      if (result.triggered) triggered = true
    }
    expect(triggered).toBe(true)
  })

  it('triggers on up-down shake (y-axis oscillation)', () => {
    let state = createShakeStartState()
    let triggered = false
    const t0 = 15_000
    const samples = [
      { x: 0, y: 0.0, z: 9.8 },
      { x: 0, y: 2.5, z: 9.8 },
      { x: 0, y: -2.5, z: 9.8 },
      { x: 0, y: 2.5, z: 9.8 },
      { x: 0, y: -2.5, z: 9.8 },
      { x: 0, y: 2.5, z: 9.8 },
    ]
    for (let i = 0; i < samples.length; i++) {
      const result = evaluateShakeStart(samples[i], t0 + i * 50, state)
      state = result.state
      if (result.triggered) triggered = true
    }
    expect(triggered).toBe(true)
  })

  it('resets reversal count after gap exceeds window', () => {
    let state = createShakeStartState()
    const t0 = 20_000
    // 2 reversals
    const samples1 = [
      { x: 0, y: 0, z: 9.8 },
      { x: 2.5, y: 0, z: 9.8 },
      { x: -2.5, y: 0, z: 9.8 },
      { x: 2.5, y: 0, z: 9.8 },
    ]
    for (let i = 0; i < samples1.length; i++) {
      const result = evaluateShakeStart(samples1[i], t0 + i * 50, state)
      state = result.state
    }
    expect(state.reversals).toBeGreaterThan(0)

    // Big gap (>750ms) → state should reset
    const result = evaluateShakeStart({ x: 0, y: 0, z: 9.8 }, t0 + 5_000, state)
    expect(result.state.reversals).toBe(0)
  })

  it('SHAKE_AXIS_DELTA_MIN filters sensor noise below threshold', () => {
    expect(SHAKE_AXIS_DELTA_MIN).toBeGreaterThan(0.4)
    expect(SHAKE_AXIS_DELTA_MIN).toBeLessThan(2.0)
  })

  it('SHAKE_MIN_REVERSALS requires multiple direction changes', () => {
    expect(SHAKE_MIN_REVERSALS).toBeGreaterThanOrEqual(3)
  })
})

describe('orientationToMotionDelta', () => {
  it('returns non-zero delta on orientation change (Chrome fallback)', () => {
    const e1 = { beta: 45, gamma: 2, alpha: 10 } as DeviceOrientationEvent
    const e2 = { beta: 48, gamma: 5, alpha: 14 } as DeviceOrientationEvent

    const r1 = orientationToMotionDelta(e1, null)
    expect(r1.delta).toBe(0)

    const r2 = orientationToMotionDelta(e2, r1.sample)
    expect(r2.delta).toBeGreaterThan(0.4)
  })
})

describe('randomRevealDelayMs', () => {
  it('returns a value within 5–7 seconds', () => {
    for (let i = 0; i < 50; i++) {
      const ms = randomRevealDelayMs()
      expect(ms).toBeGreaterThanOrEqual(RESULT_DELAY_MIN_MS)
      expect(ms).toBeLessThanOrEqual(RESULT_DELAY_MAX_MS)
    }
  })
})

describe('SHAKE_IDLE_WARMUP_FRAMES', () => {
  it('skips enough frames for sensor baseline to settle after arming', () => {
    expect(SHAKE_IDLE_WARMUP_FRAMES).toBeGreaterThanOrEqual(15)
    expect(SHAKE_IDLE_WARMUP_FRAMES).toBeLessThanOrEqual(60)
  })
})
