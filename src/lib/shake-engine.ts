/** Haptics + motion helpers for Shake & Win */

/** Visual progress ring span — result timing uses RESULT_DELAY_* instead. */
export const SHAKE_DURATION_MS = 12000
export const CHARGE_MS = 300
/** After shake triggers, keep shaking this long before reveal. */
export const RESULT_DELAY_MIN_MS = 12000
export const RESULT_DELAY_MAX_MS = 15000

/**
 * Frames to skip after arming before evaluating shake-start.
 * At 100 Hz: 120 frames = 1.2 s.  At 60 Hz: 120 frames = 2 s.
 * Absorbs PIN-tap vibration, navigation animation, and grip-settling.
 */
export const SHAKE_IDLE_WARMUP_FRAMES = 120

/**
 * After warmup, only update the gravity baseline — no scoring — for this many frames.
 * Ensures the high-pass filter has converged before detection goes live.
 */
export const SHAKE_IDLE_SETTLING_FRAMES = 60

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
 * High-pass + leaky-bucket shake detection (production approach).
 *
 * Problem with raw delta on accelerationIncludingGravity:
 *   Tilting or re-gripping after PIN entry redistributes gravity across X/Y/Z.
 *   Raw |dx|+|dy|+|dz| fires even when the phone is not being shaken.
 *
 * Fix — high-pass filter via exponential moving average baseline:
 *   baseline = EMA(sample)   tracks slow tilt / gravity drift
 *   hp       = sample − baseline   isolates rapid oscillation (actual shake)
 *   delta    = |hp − prevHp| manhattan sum across axes
 *
 * Then leaky-bucket: delta > threshold → score += 1; else score -= 0.3.
 * Trigger when score ≥ TARGET AND motion has persisted ≥ MIN_SHAKE_MS.
 */

/** EMA weight for gravity baseline — higher = slower baseline = stronger high-pass. */
export const SHAKE_BASELINE_ALPHA = 0.88

/** Minimum per-frame high-pass manhattan delta (m/s²) to increment score. */
export const SHAKE_IDLE_DELTA_THRESHOLD = 2.0

/** Score added per above-threshold frame. */
export const SHAKE_SCORE_INCREMENT = 1.0

/** Score removed per below-threshold frame (leaky part). */
export const SHAKE_SCORE_DECAY = 0.25

/** Score required to confirm a deliberate shake. */
export const SHAKE_SCORE_TARGET = 6.0

/** Motion must accumulate above threshold for at least this long before triggering. */
export const MIN_SHAKE_ACCUMULATION_MS = 600

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
 * High-pass leaky-bucket shake detection state.
 */
export interface ShakeStartState {
  baselineX: number
  baselineY: number
  baselineZ: number
  prevHpX: number | null
  prevHpY: number | null
  prevHpZ: number | null
  score: number
  burstStartAt: number
  lastTriggeredAt: number
  initialized: boolean
}

export function createShakeStartState(): ShakeStartState {
  return {
    baselineX: 0,
    baselineY: 0,
    baselineZ: 0,
    prevHpX: null,
    prevHpY: null,
    prevHpZ: null,
    score: 0,
    burstStartAt: 0,
    lastTriggeredAt: 0,
    initialized: false,
  }
}

export interface EvaluateShakeStartOptions {
  /** When true, only update the gravity baseline — no scoring (warmup / settling). */
  baselineOnly?: boolean
}

/**
 * High-pass leaky-bucket shake detector.
 *
 * 1. baseline = EMA(sample) — tracks slow gravity drift / tilt
 * 2. hp = sample − baseline — isolates rapid oscillation
 * 3. delta = |hp − prevHp| manhattan sum
 * 4. leaky bucket on delta
 * 5. score ≥ TARGET AND burst age ≥ MIN_SHAKE_ACCUMULATION_MS → triggered
 */
export function evaluateShakeStart(
  sample: { x: number; y: number; z: number },
  now: number,
  state: ShakeStartState,
  options: EvaluateShakeStartOptions = {},
): { triggered: boolean; state: ShakeStartState } {
  const next: ShakeStartState = { ...state }
  const alpha = SHAKE_BASELINE_ALPHA

  if (!next.initialized) {
    next.baselineX = sample.x
    next.baselineY = sample.y
    next.baselineZ = sample.z
    next.initialized = true
    return { triggered: false, state: next }
  }

  next.baselineX = alpha * next.baselineX + (1 - alpha) * sample.x
  next.baselineY = alpha * next.baselineY + (1 - alpha) * sample.y
  next.baselineZ = alpha * next.baselineZ + (1 - alpha) * sample.z

  const hpX = sample.x - next.baselineX
  const hpY = sample.y - next.baselineY
  const hpZ = sample.z - next.baselineZ

  if (next.prevHpX === null || next.prevHpY === null || next.prevHpZ === null) {
    next.prevHpX = hpX
    next.prevHpY = hpY
    next.prevHpZ = hpZ
    return { triggered: false, state: next }
  }

  const prevHpX = next.prevHpX
  const prevHpY = next.prevHpY
  const prevHpZ = next.prevHpZ

  const delta =
    Math.abs(hpX - prevHpX) +
    Math.abs(hpY - prevHpY) +
    Math.abs(hpZ - prevHpZ)

  next.prevHpX = hpX
  next.prevHpY = hpY
  next.prevHpZ = hpZ

  if (options.baselineOnly) {
    return { triggered: false, state: next }
  }

  if (delta > SHAKE_IDLE_DELTA_THRESHOLD) {
    if (next.score <= 0) next.burstStartAt = now
    next.score = Math.min(SHAKE_SCORE_TARGET + 1, next.score + SHAKE_SCORE_INCREMENT)
  } else {
    next.score = Math.max(0, next.score - SHAKE_SCORE_DECAY)
    if (next.score <= 0) next.burstStartAt = 0
  }

  const burstAge = next.burstStartAt > 0 ? now - next.burstStartAt : 0
  const triggered =
    next.score >= SHAKE_SCORE_TARGET &&
    burstAge >= MIN_SHAKE_ACCUMULATION_MS &&
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
