/** Haptics + motion helpers for Shake & Win */

/** Visual progress ring span — result timing uses RESULT_DELAY_* instead. */
export const SHAKE_DURATION_MS = 5000
export const CHARGE_MS = 300
/** After shake triggers, keep shaking this long before reveal. */
export const RESULT_DELAY_MIN_MS = 5000
export const RESULT_DELAY_MAX_MS = 7000

/**
 * Frames to skip after arming before evaluating shake-start.
 * At 100 Hz: 100 frames = 1 s.  At 60 Hz: 100 frames = 1.67 s.
 * Completely absorbs: PIN-tap vibration decay, SPA navigation animation, and grip-settling.
 */
export const SHAKE_IDLE_WARMUP_FRAMES = 100

/** Uniform random delay in [RESULT_DELAY_MIN_MS, RESULT_DELAY_MAX_MS]. */
export function randomRevealDelayMs(): number {
  const span = RESULT_DELAY_MAX_MS - RESULT_DELAY_MIN_MS
  return RESULT_DELAY_MIN_MS + Math.floor(Math.random() * (span + 1))
}

/** @deprecated use randomRevealDelayMs */
export const randomResultDelayMs = randomRevealDelayMs
/** Active-phase spike threshold (intensity + haptics). */
export const SHAKE_DELTA_THRESHOLD = 6
export const SHAKE_START_DEBOUNCE_MS = 450
export const INTENSITY_DECAY = 0.04

/**
 * Leaky-bucket delta detection — the production approach from shake.js.
 *
 * Each devicemotion frame: compute manhattan delta = |dx| + |dy| + |dz|.
 * If delta > THRESHOLD → increment score; otherwise decay score.
 * When score ≥ TARGET → deliberate shake confirmed.
 *
 * Why this is more robust than reversal counting:
 *  • Stateless per frame: score decays to 0 the moment motion stops.
 *    The reversal algorithm accumulated state from prior movements; this doesn't.
 *  • Immune to "stale state" bugs: single frames or brief jolts push score by 1
 *    and it immediately decays away — needs sustained motion to reach target.
 *  • No direction tracking: tilting (monotonic) only contributes 1–2 frames
 *    above threshold before it settles; score decays before reaching TARGET.
 *
 * False-positive analysis (accelerationIncludingGravity, worst case):
 *  • Still (noise ≤ 0.3 m/s²/axis):  delta ≤ 0.9 < 3.0 → score = 0           ✓
 *  • Tilt 90° in 100 ms at 60 Hz:    delta ≈ 1.6 < 3.0 → score = 0           ✓
 *  • Walking vertical bounce 3 cm 2 Hz: delta ≈ 0.4 < 3.0 → score = 0        ✓
 *  • Vigorous walk footfall (3 frames ≥ 3.0): score peaks at 3 → decays < 5   ✓
 *  • Single hard jolt (15 m/s² for 3 frames): score = 3 → decays — never fires ✓
 *
 * True-positive analysis:
 *  • 1 cm shake at 5 Hz / 60 Hz: peak |dx| = 5.17 m/s² > 3.0; ~6/12 frames
 *    above threshold/period; net score +4.2/period → reaches 5.0 in ~238 ms   ✓
 *  • 1 cm shake at 5 Hz / 100 Hz: peak |dx| = 3.1 m/s² ≈ 3.0; threshold met
 *    briefly each period → reaches 5.0 in ~300 ms                              ✓
 */

/** Minimum per-frame manhattan delta (m/s²) to increment the score.
 *  Derivation: peak |dx| for 1 cm at 5 Hz = A × 2πf / f_s.
 *  At 60 Hz = 5.17 m/s²; at 100 Hz = 3.10 m/s².
 *  Threshold 3.0 catches real shaking at both sample rates while staying above
 *  the tilt/walk noise floor (≤ 2 m/s²). */
export const SHAKE_IDLE_DELTA_THRESHOLD = 3.0

/** Score added per above-threshold frame. */
export const SHAKE_SCORE_INCREMENT = 1.0

/** Score removed per below-threshold frame (leaky part). */
export const SHAKE_SCORE_DECAY = 0.3

/** Score required to confirm a shake.
 *  5 = needs ~5 consecutive high-delta frames (83 ms at 60 Hz) OR ~238 ms of
 *  sustained shaking. Walking footfalls create at most 3–4 consecutive frames
 *  → score peaks at 3–4 < 5 → never fires. */
export const SHAKE_SCORE_TARGET = 5.0

/** shake.js-style speed threshold — kept for active-phase intensity feedback only. */
export const SHAKE_SPEED_THRESHOLD = 3

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function vibrate(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern)
  } catch {
    /* unsupported */
  }
}

/** Pulse haptics scaled to shake intensity (0–1). Debounced to avoid spam. */
let lastHapticAt = 0
export function hapticShakePulse(intensity: number) {
  const now = Date.now()
  if (now - lastHapticAt < 80) return
  lastHapticAt = now
  const strength = Math.round(15 + intensity * 45)
  vibrate(strength)
}

export function hapticCharge() {
  vibrate([20, 30, 20])
}

export function hapticStart() {
  vibrate(35)
}

export function hapticReveal(won: boolean) {
  vibrate(won ? [80, 40, 80, 40, 120, 60, 200] : [100, 50, 100])
}

export type MotionPermission = 'unknown' | 'granted' | 'denied' | 'unsupported'

export function hasDeviceMotionApi(): boolean {
  return typeof window !== 'undefined' && typeof DeviceMotionEvent !== 'undefined'
}

export function isSecureMotionContext(): boolean {
  if (typeof window === 'undefined') return false
  return window.isSecureContext === true
}

/** Motion sensors only work in secure contexts (HTTPS / localhost). */
export function canUseMotionSensors(): boolean {
  return hasDeviceMotionApi() && isSecureMotionContext()
}

/** iOS 13+ requires an explicit permission prompt before devicemotion events fire. */
export function needsMotionPermissionPrompt(): boolean {
  if (!hasDeviceMotionApi()) return false
  const dm = DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> }
  return typeof dm.requestPermission === 'function'
}

export function initialMotionPermission(): MotionPermission {
  if (!hasDeviceMotionApi()) return 'unsupported'
  return needsMotionPermissionPrompt() ? 'unknown' : 'granted'
}

export async function requestMotionPermission(): Promise<MotionPermission> {
  const dm = DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> }
  if (typeof dm.requestPermission !== 'function') {
    return typeof DeviceMotionEvent !== 'undefined' ? 'granted' : 'unsupported'
  }
  try {
    const result = await dm.requestPermission()
    return result === 'granted' ? 'granted' : 'denied'
  } catch {
    return 'denied'
  }
}

function axisMagnitude(x: number, y: number, z: number): number {
  return Math.abs(x) + Math.abs(y) + Math.abs(z)
}

function hasUsableAxis(
  v: { x: number | null; y: number | null; z: number | null } | null,
): v is { x: number | null; y: number | null; z: number | null } {
  if (!v) return false
  return v.x != null || v.y != null || v.z != null
}

/**
 * Read usable acceleration — Chrome Android often exposes acceleration as
 * null axes OR all-zero values; gravity-inclusive data is the reliable source.
 */
export function readMotionSample(e: DeviceMotionEvent): { x: number; y: number; z: number } | null {
  const linear = e.acceleration
  if (hasUsableAxis(linear)) {
    const sample = { x: linear.x ?? 0, y: linear.y ?? 0, z: linear.z ?? 0 }
    if (axisMagnitude(sample.x, sample.y, sample.z) > 0.08) {
      return sample
    }
  }

  const incl = e.accelerationIncludingGravity
  if (hasUsableAxis(incl)) {
    return { x: incl.x ?? 0, y: incl.y ?? 0, z: incl.z ?? 0 }
  }

  const rot = e.rotationRate
  if (rot && (rot.alpha != null || rot.beta != null || rot.gamma != null)) {
    const scale = 0.35
    return {
      x: (rot.alpha ?? 0) * scale,
      y: (rot.beta ?? 0) * scale,
      z: (rot.gamma ?? 0) * scale,
    }
  }

  return null
}

/** Magnitude of change between consecutive motion samples. */
export function computeShakeDelta(e: DeviceMotionEvent, prev: { x: number; y: number; z: number } | null) {
  const sample = readMotionSample(e)
  if (!sample) return { delta: 0, sample: prev }

  if (!prev) return { delta: 0, sample }

  const dx = sample.x - prev.x
  const dy = sample.y - prev.y
  const dz = sample.z - prev.z
  const delta = Math.sqrt(dx * dx + dy * dy + dz * dz)
  return { delta, sample }
}

export interface ShakeSpeedState {
  x: number
  y: number
  z: number
  time: number
}

export function createShakeSpeedState(): ShakeSpeedState {
  return { x: 0, y: 0, z: 0, time: 0 }
}

/** Classic shake.js speed metric — reliable on Chrome Android gravity-inclusive data. */
export function computeShakeSpeed(
  sample: { x: number; y: number; z: number },
  now: number,
  state: ShakeSpeedState,
): { speed: number; state: ShakeSpeedState } {
  if (state.time === 0) {
    return { speed: 0, state: { x: sample.x, y: sample.y, z: sample.z, time: now } }
  }

  const dt = now - state.time
  if (dt < 25) {
    return { speed: 0, state }
  }

  const delta =
    Math.abs(sample.x + sample.y + sample.z - (state.x + state.y + state.z))
  const speed = (delta / dt) * 1000

  return {
    speed,
    state: { x: sample.x, y: sample.y, z: sample.z, time: now },
  }
}

/**
 * Leaky-bucket shake detection state.
 * Score increments on high-delta frames, decays on low-delta frames.
 * Score reaching SHAKE_SCORE_TARGET means a deliberate sustained shake.
 */
export interface ShakeStartState {
  prevX: number | null
  prevY: number | null
  prevZ: number | null
  score: number           // leaky-bucket score: 0.0 → SHAKE_SCORE_TARGET
  lastTriggeredAt: number
}

export function createShakeStartState(): ShakeStartState {
  return {
    prevX: null,
    prevY: null,
    prevZ: null,
    score: 0,
    lastTriggeredAt: 0,
  }
}

/**
 * Leaky-bucket delta shake detector.
 *
 * Algorithm (identical to production shake.js + sustained-motion guard):
 *   1. delta = |x − prevX| + |y − prevY| + |z − prevZ|   (manhattan distance)
 *   2. if delta > SHAKE_IDLE_DELTA_THRESHOLD: score += INCREMENT
 *      else:                                               score -= DECAY
 *   3. score ≥ SHAKE_SCORE_TARGET → triggered
 *
 * The leaky-bucket means:
 *   • Score drains to 0 the instant motion stops — no stale state.
 *   • A single hard jolt (3 frames): score peaks at 3, immediately decays → never fires.
 *   • Sustained 1 cm shake at 5 Hz / 60 Hz: score reaches 5.0 in ~238 ms → fires.
 *
 * Works identically for both accelerationIncludingGravity (Android Chrome) and
 * acceleration/linear (iOS / modern Android) — the delta is always near zero
 * when the phone is truly still, regardless of orientation or gravity distribution.
 *
 * @param sample  Current accelerometer sample
 * @param now     Current timestamp in ms
 * @param state   Accumulated leaky-bucket state
 */
export function evaluateShakeStart(
  sample: { x: number; y: number; z: number },
  now: number,
  state: ShakeStartState,
): { triggered: boolean; state: ShakeStartState } {
  const next: ShakeStartState = { ...state }

  // First frame — establish prev baseline, do not score
  if (next.prevX === null || next.prevY === null || next.prevZ === null) {
    next.prevX = sample.x
    next.prevY = sample.y
    next.prevZ = sample.z
    return { triggered: false, state: next }
  }

  // Manhattan delta: total motion across all three axes per frame
  const delta =
    Math.abs(sample.x - next.prevX) +
    Math.abs(sample.y - next.prevY) +
    Math.abs(sample.z - next.prevZ)

  next.prevX = sample.x
  next.prevY = sample.y
  next.prevZ = sample.z

  // Leaky bucket: increment on real motion, decay on quiet frames
  if (delta > SHAKE_IDLE_DELTA_THRESHOLD) {
    next.score = Math.min(SHAKE_SCORE_TARGET + 1, next.score + SHAKE_SCORE_INCREMENT)
  } else {
    next.score = Math.max(0, next.score - SHAKE_SCORE_DECAY)
  }

  const triggered =
    next.score >= SHAKE_SCORE_TARGET &&
    now - next.lastTriggeredAt >= SHAKE_START_DEBOUNCE_MS

  if (triggered) {
    return {
      triggered: true,
      state: { ...createShakeStartState(), lastTriggeredAt: now },
    }
  }

  return { triggered: false, state: next }
}

/** Build a mock DeviceMotionEvent for tests. */
export function mockMotionEvent(
  partial: Partial<{
    acceleration: { x: number | null; y: number | null; z: number | null } | null
    accelerationIncludingGravity: { x: number; y: number; z: number } | null
    rotationRate: { alpha: number; beta: number; gamma: number } | null
  }>,
): DeviceMotionEvent {
  return partial as DeviceMotionEvent
}
