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
  SHAKE_SPEED_THRESHOLD,
  SHAKE_START_ENERGY,
  SHAKE_START_MIN_DELTA,
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

describe('evaluateShakeStart', () => {
  it('does not trigger on a single tiny jitter', () => {
    const result = evaluateShakeStart(SHAKE_START_MIN_DELTA - 0.2, 1_000, createShakeStartState())
    expect(result.triggered).toBe(false)
    expect(result.state.energy).toBe(0)
  })

  it('triggers on a light shake (small deltas over a few frames)', () => {
    let state = createShakeStartState()
    let triggered = false
    const frames = [0, 1.8, 2.4, 2.6, 2.1, 1.7, 1.3]
    const t0 = 5_000

    for (let i = 0; i < frames.length; i++) {
      const result = evaluateShakeStart(frames[i], t0 + i * 20, state)
      state = result.state
      if (result.triggered) triggered = true
    }

    expect(triggered).toBe(true)
  })

  it('triggers on one firm shake spike', () => {
    const result = evaluateShakeStart(SHAKE_START_ENERGY + 2, 10_000, createShakeStartState())
    expect(result.triggered).toBe(true)
  })

  it('simulates Android slight shake with gravity-inclusive samples', () => {
    let prev: { x: number; y: number; z: number } | null = null
    let state = createShakeStartState()
    let triggered = false
    const t0 = 30_000

    const positions = [
      { x: 0.1, y: 0.2, z: 9.8 },
      { x: 0.6, y: -0.3, z: 9.6 },
      { x: 1.1, y: -0.9, z: 9.2 },
      { x: 0.4, y: 0.5, z: 9.7 },
      { x: -0.2, y: 0.8, z: 9.9 },
      { x: -0.7, y: 0.2, z: 9.85 },
    ]

    for (let i = 0; i < positions.length; i++) {
      const event = mockMotionEvent({
        acceleration: { x: 0, y: 0, z: 0 },
        accelerationIncludingGravity: positions[i],
      })
      const { delta, sample } = computeShakeDelta(event, prev)
      prev = sample

      const result = evaluateShakeStart(delta, t0 + i * 25, state)
      state = result.state
      if (result.triggered) triggered = true
    }

    expect(triggered).toBe(true)
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
