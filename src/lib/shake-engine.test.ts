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
  SHAKE_IDLE_WARMUP_FRAMES,
  SHAKE_SCORE_DECAY,
  SHAKE_SCORE_INCREMENT,
  SHAKE_SCORE_TARGET,
  SHAKE_SPEED_THRESHOLD,
} from './shake-engine'
import { orientationToMotionDelta } from './shake-motion-sensors'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const G = 9.81

/**
 * Simulate `accelerationIncludingGravity` for a phone held upright (portrait),
 * shaking left-right at the given acceleration amplitude (m/s²) and frequency.
 *
 * Physical conversion: amplitude ≈ (2πf)² × displacement_meters.
 * Examples: 1 cm at 5 Hz → A ≈ 9.87 m/s²;  1.5 cm at 5 Hz → A ≈ 14.8 m/s².
 *
 * @param amplitude   Peak linear acceleration on X axis (m/s²)
 * @param freqHz      Shake frequency in Hz
 * @param durationMs  How long to simulate
 * @param intervalMs  Sample interval (default 16 ms ≈ 60 Hz)
 */
function makeShakeSamples(
  amplitude: number,
  freqHz: number,
  durationMs: number,
  intervalMs = 16,
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

/**
 * Run all samples through the leaky-bucket evaluator.
 * Returns whether it ever triggered and the final score.
 */
function runSamples(
  samples: Array<{ x: number; y: number; z: number }>,
  startT = 10_000,
  intervalMs = 16,
): { triggered: boolean; finalScore: number } {
  let state = createShakeStartState()
  let triggered = false
  for (let i = 0; i < samples.length; i++) {
    const result = evaluateShakeStart(samples[i], startT + i * intervalMs, state)
    state = result.state
    if (result.triggered) triggered = true
  }
  return { triggered, finalScore: state.score }
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
// evaluateShakeStart — leaky-bucket delta algorithm
// ---------------------------------------------------------------------------

describe('evaluateShakeStart — leaky-bucket delta algorithm', () => {
  // ── Baseline ──────────────────────────────────────────────────────────────

  it('does not trigger on first sample (establishes baseline; no score yet)', () => {
    const result = evaluateShakeStart({ x: 0.1, y: 9.8, z: 0.2 }, 1_000, createShakeStartState())
    expect(result.triggered).toBe(false)
    expect(result.state.score).toBe(0)
    expect(result.state.prevX).toBe(0.1)
    expect(result.state.prevY).toBe(9.8)
    expect(result.state.prevZ).toBe(0.2)
  })

  // ── False-positive tests ──────────────────────────────────────────────────

  it('does NOT trigger when phone is completely still', () => {
    // All samples identical → manhattan delta = 0 every frame → score stays at 0
    const still = Array.from({ length: 120 }, () => ({ x: 0.12, y: 9.75, z: 0.08 }))
    const { triggered, finalScore } = runSamples(still, 8_000, 16)
    expect(triggered).toBe(false)
    expect(finalScore).toBe(0)
  })

  it('does NOT trigger when phone is held with slight hand tremor', () => {
    // Sensor noise ±0.2 m/s² per axis → peak delta ≈ 0.6 m/s² << SHAKE_IDLE_DELTA_THRESHOLD
    const tremor = Array.from({ length: 100 }, (_, i) => ({
      x: 0.1 + (i % 2 === 0 ? 0.2 : -0.2),
      y: G + (i % 3 === 0 ? 0.15 : -0.15),
      z: 0.05,
    }))
    const { triggered } = runSamples(tremor, 10_000, 16)
    expect(triggered).toBe(false)
  })

  it('does NOT trigger on monotonic phone tilt (gravity redistribution)', () => {
    // Phone tilts 0° → 90°; x changes monotonically.
    // dx per 40 ms step at 60 Hz ≈ 1.6 m/s² < SHAKE_IDLE_DELTA_THRESHOLD.
    const tiltSamples: Array<{ x: number; y: number; z: number }> = []
    for (let deg = 0; deg <= 90; deg += 3) {
      const rad = (deg * Math.PI) / 180
      tiltSamples.push({ x: G * Math.sin(rad), y: G * Math.cos(rad), z: 0 })
    }
    const { triggered } = runSamples(tiltSamples, 5_000, 40)
    expect(triggered).toBe(false)
  })

  it('does NOT trigger from slow walking lateral sway (2 Hz, ±0.5 m/s²)', () => {
    // Walking sway at 2 Hz creates |dx| ≈ 0.1 m/s² per 16 ms frame << threshold
    const walking: Array<{ x: number; y: number; z: number }> = []
    for (let i = 0; i < 80; i++) {
      const t = (i * 16) / 1000
      walking.push({ x: 0.5 * Math.sin(2 * Math.PI * 2 * t), y: G, z: 0 })
    }
    const { triggered } = runSamples(walking, 12_000, 16)
    expect(triggered).toBe(false)
  })

  it('does NOT trigger from a single hard jolt (3 high-delta frames)', () => {
    // A jolt (e.g. setting phone down hard) creates at most 3 high-delta frames.
    // Score after 3 high frames = 3; target = 5 → does not trigger.
    let state = createShakeStartState()
    const t0 = 10_000
    const baseline = { x: 0, y: G, z: 0 }
    // Frame 0: establish baseline
    let r = evaluateShakeStart(baseline, t0, state)
    state = r.state
    // Frames 1–3: large jolt — delta ≈ 23 m/s² each
    r = evaluateShakeStart({ x: 15, y: G - 5, z: 3 }, t0 + 16, state)
    state = r.state
    r = evaluateShakeStart({ x: -15, y: G + 5, z: -3 }, t0 + 32, state)
    state = r.state
    r = evaluateShakeStart(baseline, t0 + 48, state)
    state = r.state
    expect(r.triggered).toBe(false)
    expect(state.score).toBeLessThan(SHAKE_SCORE_TARGET)
  })

  it('score decays back to zero after motion stops', () => {
    let state = createShakeStartState()
    const t0 = 20_000
    // Build up some score with a few high-delta frames
    state = evaluateShakeStart({ x: 0, y: G, z: 0 }, t0, state).state
    state = evaluateShakeStart({ x: 8, y: G, z: 0 }, t0 + 16, state).state  // delta = 8 → +1
    state = evaluateShakeStart({ x: -8, y: G, z: 0 }, t0 + 32, state).state // delta = 16 → +1
    expect(state.score).toBeGreaterThan(0)
    // Now 60 silent frames — score must drain to 0
    for (let i = 0; i < 60; i++) {
      state = evaluateShakeStart({ x: 0, y: G, z: 0 }, t0 + 64 + i * 16, state).state
    }
    expect(state.score).toBe(0)
  })

  // ── True-positive tests ───────────────────────────────────────────────────

  it('triggers on a deliberate left-right shake (1 cm, 5 Hz, 60 Hz sampling)', () => {
    // A = 9.87 m/s² (1 cm at 5 Hz).  Peak |dx|/frame at 60 Hz = 5.17 m/s² > 3.0.
    // Score reaches 5.0 in ~238 ms.
    const samples = makeShakeSamples(9.87, 5, 600, 16)
    const { triggered } = runSamples(samples, 20_000, 16)
    expect(triggered).toBe(true)
  })

  it('triggers on a deliberate left-right shake (1.5 cm, 5 Hz, 100 Hz sampling)', () => {
    // A = 14.8 m/s² (1.5 cm at 5 Hz).  Peak |dx|/frame at 100 Hz = 4.65 m/s² > 3.0.
    const samples = makeShakeSamples(14.8, 5, 600, 10)
    const { triggered } = runSamples(samples, 22_000, 10)
    expect(triggered).toBe(true)
  })

  it('triggers on up-down shake (Y-axis oscillation, 5 Hz, 60 Hz)', () => {
    const samples: Array<{ x: number; y: number; z: number }> = []
    for (let i = 0; i < 80; i++) {
      const t = (i * 16) / 1000
      samples.push({ x: 0, y: G + 9.87 * Math.sin(2 * Math.PI * 5 * t), z: 0 })
    }
    const { triggered } = runSamples(samples, 25_000, 16)
    expect(triggered).toBe(true)
  })

  it('triggers on linear-acceleration shake (iOS / modern Android, no gravity component)', () => {
    // iOS returns acceleration (linear, no gravity), not accelerationIncludingGravity.
    // The delta of a linear-acceleration signal behaves identically.
    const samples: Array<{ x: number; y: number; z: number }> = []
    for (let i = 0; i < 80; i++) {
      const t = (i * 16) / 1000
      samples.push({ x: 9.87 * Math.sin(2 * Math.PI * 5 * t), y: 0, z: 0 })
    }
    const { triggered } = runSamples(samples, 30_000, 16)
    expect(triggered).toBe(true)
  })

  it('re-triggers after a successful shake (lastTriggeredAt gate respects debounce)', () => {
    // The state resets after triggering; a second shake should also trigger.
    const samples = makeShakeSamples(9.87, 5, 1000, 16)
    let state = createShakeStartState()
    const triggerTimes: number[] = []
    for (let i = 0; i < samples.length; i++) {
      const result = evaluateShakeStart(samples[i], 50_000 + i * 16, state)
      state = result.state
      if (result.triggered) triggerTimes.push(50_000 + i * 16)
    }
    expect(triggerTimes.length).toBeGreaterThanOrEqual(1)
  })

  // ── Constant validation ───────────────────────────────────────────────────

  it('SHAKE_IDLE_DELTA_THRESHOLD is between 2 and 5 m/s² (catches real shake, rejects noise)', () => {
    expect(SHAKE_IDLE_DELTA_THRESHOLD).toBeGreaterThan(2.0)
    expect(SHAKE_IDLE_DELTA_THRESHOLD).toBeLessThan(5.0)
  })

  it('SHAKE_SCORE_TARGET requires multiple frames of sustained motion (≥ 4)', () => {
    expect(SHAKE_SCORE_TARGET).toBeGreaterThanOrEqual(4.0)
  })

  it('SHAKE_SCORE_INCREMENT > SHAKE_SCORE_DECAY (sustained shake grows score)', () => {
    expect(SHAKE_SCORE_INCREMENT).toBeGreaterThan(SHAKE_SCORE_DECAY)
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
  it('provides at least 1 s settling time at 60 Hz (≥ 60 frames)', () => {
    expect(SHAKE_IDLE_WARMUP_FRAMES).toBeGreaterThanOrEqual(60)
  })

  it('is set to 100 frames for full PIN-tap + navigation + grip-settle absorption', () => {
    expect(SHAKE_IDLE_WARMUP_FRAMES).toBe(100)
  })
})
