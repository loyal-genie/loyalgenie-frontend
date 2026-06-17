/** Haptics + motion helpers for Shake & Win */

/** Visual progress ring span — result timing uses RESULT_DELAY_* instead. */
export const SHAKE_DURATION_MS = 5000
export const CHARGE_MS = 300
/** After shake triggers, keep shaking this long before reveal. */
export const RESULT_DELAY_MIN_MS = 5000
export const RESULT_DELAY_MAX_MS = 7000

/**
 * devicemotion frames to skip after arming (tap) before evaluating shake-start.
 * At ~100 Hz: 25 frames ≈ 250ms. The tap itself provides a natural gesture boundary;
 * warmup just lets the sample baseline settle after the touch event.
 */
export const SHAKE_IDLE_WARMUP_FRAMES = 25

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
 * Oscillation-based shake detection constants.
 *
 * A real shake = rapid back-and-forth → multiple axis reversals in a short window.
 * Tilting or adjusting grip = phone moves one direction and settles → 0–1 reversals.
 *
 * This is fundamentally more reliable than energy/delta accumulation because
 * accelerationIncludingGravity shifts with gravity when you tilt, making any
 * energy-based threshold ambiguous between "tilt" and "shake".
 */

/** Min per-frame change on a single axis (m/s²) to register a directional sample.
 *  Filters sensor noise (<0.4) and slow drift, without requiring violent motion. */
export const SHAKE_AXIS_DELTA_MIN = 0.8
/** Number of axis direction-reversals required to confirm a shake.
 *  4 reversals ≈ 2 full oscillations — clearly intentional. */
export const SHAKE_MIN_REVERSALS = 4
/** All reversals must occur within this window (ms). Deliberate shake bursts
 *  happen in <500ms; idle handling / slow adjustment takes multiple seconds. */
export const SHAKE_REVERSAL_WINDOW_MS = 750
/** shake.js-style speed threshold — kept for active-phase intensity only. */
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
 * Oscillation-based shake start state.
 * Tracks per-axis direction history to detect rapid back-and-forth reversal patterns.
 */
export interface ShakeStartState {
  prevX: number | null
  prevY: number | null
  lastSignX: number       // direction of last significant x change: -1 | 0 | +1
  lastSignY: number       // direction of last significant y change: -1 | 0 | +1
  reversals: number       // accumulated direction-reversal count
  burstStartAt: number    // timestamp of first reversal in current burst (0 = none yet)
  lastMotionAt: number    // last frame with significant axis motion
  lastTriggeredAt: number
}

export function createShakeStartState(): ShakeStartState {
  return {
    prevX: null,
    prevY: null,
    lastSignX: 0,
    lastSignY: 0,
    reversals: 0,
    burstStartAt: 0,
    lastMotionAt: 0,
    lastTriggeredAt: 0,
  }
}

/**
 * Oscillation-based shake detector.
 *
 * Counts direction reversals on X and Y axes per sensor frame.
 * A deliberate shake produces 4+ reversals within ~750ms.
 * Tilting, picking up, or adjusting grip produces 0–1 reversals.
 *
 * @param sample  Current accelerometer sample (accelerationIncludingGravity preferred)
 * @param now     Current timestamp in ms
 * @param state   Accumulated detection state (mutated into next)
 */
export function evaluateShakeStart(
  sample: { x: number; y: number; z: number },
  now: number,
  state: ShakeStartState,
): { triggered: boolean; state: ShakeStartState } {
  const next: ShakeStartState = { ...state }

  // Burst expired — reset oscillation tracking
  if (next.lastMotionAt > 0 && now - next.lastMotionAt > SHAKE_REVERSAL_WINDOW_MS) {
    next.prevX = null
    next.prevY = null
    next.lastSignX = 0
    next.lastSignY = 0
    next.reversals = 0
    next.burstStartAt = 0
  }

  // First frame after arm/reset — record baseline, do not count
  if (next.prevX === null || next.prevY === null) {
    next.prevX = sample.x
    next.prevY = sample.y
    return { triggered: false, state: next }
  }

  const dx = sample.x - next.prevX
  const dy = sample.y - next.prevY

  // Check x-axis oscillation
  if (Math.abs(dx) >= SHAKE_AXIS_DELTA_MIN) {
    const signX = dx > 0 ? 1 : -1
    if (next.lastSignX !== 0 && signX !== next.lastSignX) {
      next.reversals += 1
      if (next.burstStartAt === 0) next.burstStartAt = now
    }
    next.lastSignX = signX
    next.lastMotionAt = now
  }

  // Check y-axis oscillation
  if (Math.abs(dy) >= SHAKE_AXIS_DELTA_MIN) {
    const signY = dy > 0 ? 1 : -1
    if (next.lastSignY !== 0 && signY !== next.lastSignY) {
      next.reversals += 1
      if (next.burstStartAt === 0) next.burstStartAt = now
    }
    next.lastSignY = signY
    next.lastMotionAt = now
  }

  next.prevX = sample.x
  next.prevY = sample.y

  const burstAge = next.burstStartAt > 0 ? now - next.burstStartAt : Infinity
  const triggered =
    next.reversals >= SHAKE_MIN_REVERSALS &&
    burstAge <= SHAKE_REVERSAL_WINDOW_MS &&
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
