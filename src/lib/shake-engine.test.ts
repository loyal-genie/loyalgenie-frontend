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
  SHAKE_IDLE_DELTA_THRESHOLD,
  SHAKE_IDLE_SETTLING_FRAMES,
  SHAKE_IDLE_WARMUP_FRAMES,
  SHAKE_SCORE_DECAY,
  SHAKE_SCORE_INCREMENT,
  SHAKE_SCORE_TARGET,
  SHAKE_SPEED_THRESHOLD,
  MIN_SHAKE_ACCUMULATION_MS,
} from './shake-engine'
import { orientationToMotionDelta } from './shake-motion-sensors'

const G = 9.81
const INTERVAL_MS = 16

function makeShakeSamples(
  amplitude: number,
  freqHz: number,
  durationMs: number,
  intervalMs = INTERVAL_MS,
): Array<{ x: number; y: number; z: number }> {
  const samples: Array<{ x: number; y: number; z: number }> = []
  for (let t = 0; t < durationMs; t += intervalMs) {
    samples.push({
      x: amplitude * Math.sin((2 * Math.PI * freqHz * t) / 1000),
      y: G,
      z: 0,
    })
  }
  return samples
}

/** Prime the high-pass baseline with still / baseline-only frames. */
function primeBaseline(
  state: ReturnType<typeof createShakeStartState>,
  sample: { x: number; y: number; z: number },
  frames: number,
  startT = 0,
): ReturnType<typeof createShakeStartState> {
  let s = state
  for (let i = 0; i < frames; i++) {
    s = evaluateShakeStart(sample, startT + i * INTERVAL_MS, s, { baselineOnly: true }).state
  }
  return s
}

function runSamples(
  samples: Array<{ x: number; y: number; z: number }>,
  startT = 10_000,
  intervalMs = INTERVAL_MS,
  primeFrames = 20,
): { triggered: boolean; finalScore: number } {
  const still = samples[0] ?? { x: 0, y: G, z: 0 }
  let state = primeBaseline(createShakeStartState(), still, primeFrames, startT - primeFrames * intervalMs)
  let triggered = false
  for (let i = 0; i < samples.length; i++) {
    const result = evaluateShakeStart(samples[i], startT + i * intervalMs, state)
    state = result.state
    if (result.triggered) triggered = true
  }
  return { triggered, finalScore: state.score }
}

describe('readMotionSample', () => {
  it('falls back to accelerationIncludingGravity when linear axes are null', () => {
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
    const r1 = computeShakeSpeed({ x: 0, y: 0, z: 9.8 }, 1_000, state)
    state = r1.state
    const r2 = computeShakeSpeed({ x: 3, y: -2.5, z: 8.5 }, 1_040, state)
    expect(r2.speed).toBeGreaterThan(SHAKE_SPEED_THRESHOLD)
  })
})

describe('computeShakeDelta', () => {
  it('computes non-zero delta from consecutive gravity-inclusive samples', () => {
    let prev: { x: number; y: number; z: number } | null = null
    const positions = [{ x: 0, y: 0, z: 9.8 }, { x: 0.5, y: -0.4, z: 9.55 }]
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
    expect(deltas[1]).toBeGreaterThan(0.3)
  })
})

describe('evaluateShakeStart — high-pass leaky bucket', () => {
  it('does not trigger on first sample (initializes baseline only)', () => {
    const result = evaluateShakeStart({ x: 0.1, y: 9.8, z: 0.2 }, 1_000, createShakeStartState())
    expect(result.triggered).toBe(false)
    expect(result.state.initialized).toBe(true)
    expect(result.state.score).toBe(0)
  })

  it('does NOT trigger when phone is completely still', () => {
    const still = Array.from({ length: 120 }, () => ({ x: 0.12, y: 9.75, z: 0.08 }))
    const { triggered, finalScore } = runSamples(still, 8_000)
    expect(triggered).toBe(false)
    expect(finalScore).toBe(0)
  })

  it('does NOT trigger on monotonic phone tilt (gravity redistribution)', () => {
    const tiltSamples: Array<{ x: number; y: number; z: number }> = []
    for (let deg = 0; deg <= 90; deg += 3) {
      const rad = (deg * Math.PI) / 180
      tiltSamples.push({ x: G * Math.sin(rad), y: G * Math.cos(rad), z: 0 })
    }
    const { triggered } = runSamples(tiltSamples, 5_000, 40)
    expect(triggered).toBe(false)
  })

  it('does NOT trigger from slow walking lateral sway', () => {
    const walking: Array<{ x: number; y: number; z: number }> = []
    for (let i = 0; i < 100; i++) {
      const t = (i * INTERVAL_MS) / 1000
      walking.push({ x: 0.5 * Math.sin(2 * Math.PI * 2 * t), y: G, z: 0 })
    }
    const { triggered } = runSamples(walking, 12_000)
    expect(triggered).toBe(false)
  })

  it('does NOT trigger from a brief jolt (score drains before MIN_SHAKE_ACCUMULATION_MS)', () => {
    const t0 = 15_000
    let state = primeBaseline(createShakeStartState(), { x: 0, y: G, z: 0 }, 20, t0 - 320)
    const jolt = [
      { x: 0, y: G, z: 0 },
      { x: 15, y: G - 5, z: 3 },
      { x: -15, y: G + 5, z: -3 },
      { x: 0, y: G, z: 0 },
    ]
    let triggered = false
    for (let i = 0; i < jolt.length; i++) {
      const r = evaluateShakeStart(jolt[i], t0 + i * INTERVAL_MS, state)
      state = r.state
      if (r.triggered) triggered = true
    }
    expect(triggered).toBe(false)
  })

  it('requires MIN_SHAKE_ACCUMULATION_MS of sustained motion', () => {
    const t0 = 20_000
    let state = primeBaseline(createShakeStartState(), { x: 0, y: G, z: 0 }, 20, t0 - 320)
    // 5 high-delta frames within 80ms — score hits target but burst too short
    for (let i = 0; i < 8; i++) {
      const sign = i % 2 === 0 ? 1 : -1
      state = evaluateShakeStart({ x: sign * 10, y: G, z: 0 }, t0 + i * INTERVAL_MS, state).state
    }
    const r = evaluateShakeStart({ x: 10, y: G, z: 0 }, t0 + 8 * INTERVAL_MS, state)
    expect(r.triggered).toBe(false)
    expect(r.state.score).toBeGreaterThanOrEqual(SHAKE_SCORE_TARGET)
  })

  it('triggers on deliberate left-right shake (1 cm, 5 Hz, sustained ≥ 600 ms)', () => {
    const samples = makeShakeSamples(9.87, 5, 1200)
    const { triggered } = runSamples(samples, 25_000)
    expect(triggered).toBe(true)
  })

  it('triggers on up-down shake (Y-axis oscillation, 5 Hz)', () => {
    const samples: Array<{ x: number; y: number; z: number }> = []
    for (let i = 0; i < 100; i++) {
      const t = (i * INTERVAL_MS) / 1000
      samples.push({ x: 0, y: G + 9.87 * Math.sin(2 * Math.PI * 5 * t), z: 0 })
    }
    const { triggered } = runSamples(samples, 30_000)
    expect(triggered).toBe(true)
  })

  it('triggers on linear-acceleration shake (iOS, no gravity)', () => {
    const samples: Array<{ x: number; y: number; z: number }> = []
    for (let i = 0; i < 100; i++) {
      const t = (i * INTERVAL_MS) / 1000
      samples.push({ x: 9.87 * Math.sin(2 * Math.PI * 5 * t), y: 0, z: 0 })
    }
    const { triggered } = runSamples(samples, 35_000)
    expect(triggered).toBe(true)
  })

  it('score decays to zero after motion stops', () => {
    const t0 = 40_000
    let state = primeBaseline(createShakeStartState(), { x: 0, y: G, z: 0 }, 20, t0 - 320)
    for (let i = 0; i < 6; i++) {
      state = evaluateShakeStart({ x: (i % 2 ? -1 : 1) * 10, y: G, z: 0 }, t0 + i * INTERVAL_MS, state).state
    }
    expect(state.score).toBeGreaterThan(0)
    for (let i = 0; i < 80; i++) {
      state = evaluateShakeStart({ x: 0, y: G, z: 0 }, t0 + 200 + i * INTERVAL_MS, state).state
    }
    expect(state.score).toBe(0)
  })

  it('SHAKE_SCORE_INCREMENT > SHAKE_SCORE_DECAY', () => {
    expect(SHAKE_SCORE_INCREMENT).toBeGreaterThan(SHAKE_SCORE_DECAY)
  })

  it('MIN_SHAKE_ACCUMULATION_MS requires at least 500 ms burst', () => {
    expect(MIN_SHAKE_ACCUMULATION_MS).toBeGreaterThanOrEqual(500)
  })
})

describe('orientationToMotionDelta', () => {
  it('returns non-zero delta on orientation change', () => {
    const e1 = { beta: 45, gamma: 2, alpha: 10 } as DeviceOrientationEvent
    const e2 = { beta: 48, gamma: 5, alpha: 14 } as DeviceOrientationEvent
    const r1 = orientationToMotionDelta(e1, null)
    expect(r1.delta).toBe(0)
    const r2 = orientationToMotionDelta(e2, r1.sample)
    expect(r2.delta).toBeGreaterThan(0.4)
  })
})

describe('randomRevealDelayMs', () => {
  it('always returns a value within [12000, 15000]', () => {
    for (let i = 0; i < 100; i++) {
      const ms = randomRevealDelayMs()
      expect(ms).toBeGreaterThanOrEqual(RESULT_DELAY_MIN_MS)
      expect(ms).toBeLessThanOrEqual(RESULT_DELAY_MAX_MS)
    }
    expect(RESULT_DELAY_MIN_MS).toBe(12000)
    expect(RESULT_DELAY_MAX_MS).toBe(15000)
  })
})

describe('warmup and settling constants', () => {
  it('provides long warmup (≥ 100 frames) and settling (≥ 60 frames)', () => {
    expect(SHAKE_IDLE_WARMUP_FRAMES).toBeGreaterThanOrEqual(100)
    expect(SHAKE_IDLE_SETTLING_FRAMES).toBeGreaterThanOrEqual(60)
  })
})
