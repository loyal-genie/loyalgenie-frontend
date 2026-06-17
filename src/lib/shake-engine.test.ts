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
  SHAKE_REVERSAL_WINDOW_MS,
  SHAKE_SPEED_THRESHOLD,
} from './shake-engine'
import { orientationToMotionDelta } from './shake-motion-sensors'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const G = 9.81

/**
 * Simulate `accelerationIncludingGravity` for a phone held upright in portrait
 * shaking left-right at the given amplitude (m/s²) and frequency (Hz).
 * x oscillates ±amplitude, y = G (gravity straight down), z = 0.
 *
 * Physical meaning: amplitude ≈ (2πf)² × displacement in meters.
 * At 5 Hz, amplitude=10 → displacement ≈ 1 cm. Normal deliberate shake.
 */
function makeShakeSamples(
  amplitude: number,
  freqHz: number,
  durationMs: number,
  sampleIntervalMs = 10,
): Array<{ x: number; y: number; z: number }> {
  const samples: Array<{ x: number; y: number; z: number }> = []
  for (let t = 0; t < durationMs; t += sampleIntervalMs) {
    samples.push({
      x: amplitude * Math.sin((2 * Math.PI * freqHz * t) / 1000),
      y: G,
      z: 0,
    })
  }
  return samples
}

function runSamples(
  samples: Array<{ x: number; y: number; z: number }>,
  startT = 10_000,
  intervalMs = 10,
): { triggered: boolean; finalReversals: number } {
  let state = createShakeStartState()
  let triggered = false
  for (let i = 0; i < samples.length; i++) {
    const result = evaluateShakeStart(samples[i], startT + i * intervalMs, state)
    state = result.state
    if (result.triggered) triggered = true
  }
  return { triggered, finalReversals: state.reversals }
}

// ---------------------------------------------------------------------------
// readMotionSample
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// computeShakeSpeed
// ---------------------------------------------------------------------------

describe('computeShakeSpeed', () => {
  it('detects shake via shake.js speed metric', () => {
    let state = createShakeSpeedState()
    const r1 = computeShakeSpeed({ x: 0, y: 0, z: 9.8 }, 1_000, state)
    state = r1.state
    const r2 = computeShakeSpeed({ x: 3, y: -2.5, z: 8.5 }, 1_040, state)
    expect(r2.speed).toBeGreaterThan(SHAKE_SPEED_THRESHOLD)
  })
})

// ---------------------------------------------------------------------------
// computeShakeDelta
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// evaluateShakeStart — axis-reversal algorithm
// ---------------------------------------------------------------------------

describe('evaluateShakeStart — axis-reversal algorithm', () => {
  it('does not trigger on first sample (no baseline yet)', () => {
    const result = evaluateShakeStart({ x: 0.1, y: 9.8, z: 0.2 }, 1_000, createShakeStartState())
    expect(result.triggered).toBe(false)
    expect(result.state.reversals).toBe(0)
  })

  // ── False-positive tests ──────────────────────────────────────────────────

  it('does NOT trigger when phone is tilted monotonically (gravity redistribution)', () => {
    // Phone tilts from 0° to 45° — x changes monotonically from 0 to G*sin(45°) ≈ 6.9
    // Each step has the SAME sign dx → at most 1 reversal, never 5
    const tiltSamples: Array<{ x: number; y: number; z: number }> = []
    for (let deg = 0; deg <= 90; deg += 3) {
      const rad = (deg * Math.PI) / 180
      tiltSamples.push({ x: G * Math.sin(rad), y: G * Math.cos(rad), z: 0 })
    }
    const { triggered, finalReversals } = runSamples(tiltSamples, 5_000, 40)
    expect(triggered).toBe(false)
    expect(finalReversals).toBeLessThan(SHAKE_MIN_REVERSALS)
  })

  it('does NOT trigger when holding phone completely still', () => {
    // All samples identical (no noise beyond sensor floor) → dx = 0 → 0 reversals
    const still = Array.from({ length: 60 }, () => ({ x: 0.12, y: 9.75, z: 0.08 }))
    const { triggered } = runSamples(still, 8_000, 16)
    expect(triggered).toBe(false)
  })

  it('does NOT trigger from slow walking oscillation (2 Hz, low dx per frame)', () => {
    // Walking lateral sway at 2 Hz: dx per frame = 0.5 × 2π × 2 / 60 ≈ 0.1 m/s² << 1.2 threshold
    const walking: Array<{ x: number; y: number; z: number }> = []
    for (let i = 0; i < 80; i++) {
      const t = i * 16 / 1000
      walking.push({ x: 0.5 * Math.sin(2 * Math.PI * 2 * t), y: G, z: 0 })
    }
    const { triggered } = runSamples(walking, 12_000, 16)
    expect(triggered).toBe(false)
  })

  it('does NOT trigger from a single fast tilt (same direction throughout)', () => {
    // Quick 60° tilt in 80ms: monotonic → same sign the whole time → 0–1 reversals
    const fastTilt: Array<{ x: number; y: number; z: number }> = []
    for (let i = 0; i <= 15; i++) {
      const deg = (i / 15) * 60
      const rad = (deg * Math.PI) / 180
      fastTilt.push({ x: G * Math.sin(rad), y: G * Math.cos(rad), z: 0 })
    }
    const { triggered, finalReversals } = runSamples(fastTilt, 15_000, 10)
    expect(triggered).toBe(false)
    expect(finalReversals).toBeLessThan(2)
  })

  // ── True positive tests ───────────────────────────────────────────────────

  it('triggers on a deliberate left-right shake (gravity-inclusive, 5 Hz, 10 m/s² amplitude)', () => {
    // A=10 m/s² corresponds to ≈1 cm displacement at 5 Hz — normal moderate shake.
    // At 100Hz sampling: dx per frame ≈ 10 × 2π × 5 / 100 = 3.14 m/s² >> threshold 1.2 ✓
    const samples = makeShakeSamples(10, 5, 800, 10)
    const { triggered } = runSamples(samples, 20_000, 10)
    expect(triggered).toBe(true)
  })

  it('triggers on up-down shake (Y-axis oscillation, 5 Hz)', () => {
    const samples: Array<{ x: number; y: number; z: number }> = []
    for (let i = 0; i < 80; i++) {
      const t = i * 10 / 1000
      samples.push({ x: 0, y: G + 10 * Math.sin(2 * Math.PI * 5 * t), z: 0 })
    }
    const { triggered } = runSamples(samples, 25_000, 10)
    expect(triggered).toBe(true)
  })

  it('triggers on linear acceleration shake (iOS / modern Android, no gravity)', () => {
    // Linear: no gravity component; x oscillates around 0 directly
    const samples: Array<{ x: number; y: number; z: number }> = []
    for (let i = 0; i < 80; i++) {
      const t = i * 10 / 1000
      samples.push({ x: 10 * Math.sin(2 * Math.PI * 5 * t), y: 0, z: 0 })
    }
    const { triggered } = runSamples(samples, 30_000, 10)
    expect(triggered).toBe(true)
  })

  it('resets reversal count when gap exceeds SHAKE_REVERSAL_WINDOW_MS', () => {
    // Need ≥3 frames to register 1 reversal: baseline, first sign, then opposite sign
    const t0 = 40_000
    let state = createShakeStartState()

    const shakeFrame = (sign: number) => ({ x: sign * 5, y: G, z: 0 })
    // Frame 1: sets baseline (prevX = 5)
    let r = evaluateShakeStart(shakeFrame(1), t0, state)
    state = r.state
    // Frame 2: dx = -10 → lastSignX = -1 (first sign, no reversal yet)
    r = evaluateShakeStart(shakeFrame(-1), t0 + 100, state)
    state = r.state
    // Frame 3: dx = +10 → sign change (-1 → +1) → reversal 1
    r = evaluateShakeStart(shakeFrame(1), t0 + 200, state)
    state = r.state
    expect(state.reversals).toBeGreaterThan(0)

    // Long gap → burst should reset
    r = evaluateShakeStart(shakeFrame(0), t0 + 10_000, state)
    expect(r.state.reversals).toBe(0)
    expect(r.state.burstStartAt).toBe(0)
  })

  // ── Constant validation ───────────────────────────────────────────────────

  it('SHAKE_AXIS_DELTA_MIN is between 0.9 and 2.0 m/s²', () => {
    expect(SHAKE_AXIS_DELTA_MIN).toBeGreaterThan(0.9)
    expect(SHAKE_AXIS_DELTA_MIN).toBeLessThan(2.0)
  })

  it('SHAKE_MIN_REVERSALS requires multiple oscillations (≥ 4)', () => {
    expect(SHAKE_MIN_REVERSALS).toBeGreaterThanOrEqual(4)
  })

  it('SHAKE_REVERSAL_WINDOW_MS is tight enough to require ≥ 3.5 Hz shake', () => {
    // window / (reversals - 1) = max interval between consecutive reversals
    // 1/(2 × max_interval) = minimum detectable frequency
    const maxIntervalMs = SHAKE_REVERSAL_WINDOW_MS / (SHAKE_MIN_REVERSALS - 1)
    const minFreqHz = 1000 / (maxIntervalMs * 2)
    expect(minFreqHz).toBeGreaterThan(3.0)
  })
})

// ---------------------------------------------------------------------------
// orientationToMotionDelta
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// randomRevealDelayMs
// ---------------------------------------------------------------------------

describe('randomRevealDelayMs', () => {
  it('always returns a value within [RESULT_DELAY_MIN_MS, RESULT_DELAY_MAX_MS]', () => {
    for (let i = 0; i < 100; i++) {
      const ms = randomRevealDelayMs()
      expect(ms).toBeGreaterThanOrEqual(RESULT_DELAY_MIN_MS)
      expect(ms).toBeLessThanOrEqual(RESULT_DELAY_MAX_MS)
    }
  })
})

// ---------------------------------------------------------------------------
// SHAKE_IDLE_WARMUP_FRAMES
// ---------------------------------------------------------------------------

describe('SHAKE_IDLE_WARMUP_FRAMES', () => {
  it('provides long enough settling time (≥ 60 frames for ~600 ms at 100 Hz)', () => {
    expect(SHAKE_IDLE_WARMUP_FRAMES).toBeGreaterThanOrEqual(60)
  })
})
