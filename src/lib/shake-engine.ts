/** Haptics + motion helpers for Shake & Win */

/** Visual progress ring span — result timing uses RESULT_DELAY_* instead. */
export const SHAKE_DURATION_MS = 5000
export const CHARGE_MS = 300
/** After shake triggers, keep shaking this long before reveal. */
export const RESULT_DELAY_MIN_MS = 5000
export const RESULT_DELAY_MAX_MS = 7000

/**
 * Frames to skip after arming before evaluating shake-start.
 * At 100 Hz: 50 frames = 500ms.  At 60 Hz: 50 frames = 833ms.
 * This absorbs PIN-tap vibration decay, navigation animation, and grip-settling.
 */
export const SHAKE_IDLE_WARMUP_FRAMES = 80

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
 * Axis-reversal shake detection.
 *
 * A deliberate shake = rapid back-and-forth → direction reverses on X or Y at high frequency.
 * Tilting the phone = monotonic movement on one axis → 0–1 reversals, never 5.
 * Walking = low-frequency oscillation (≤ 3 Hz) → 5 reversals need > 600 ms → excluded.
 * Holding still = tiny noise (<0.5 m/s² per frame) → stays below threshold.
 *
 * Key insight: tilting produces ONE directional change on an axis, not oscillation.
 * A real shake at 4 Hz creates 10+ direction changes per second on X or Y.
 *
 * The 80-frame warmup (~800 ms at 100 Hz / 1333 ms at 60 Hz) absorbs:
 *   • PIN-tap vibration decay            (~200–350 ms)
 *   • SPA navigation animation           (~300–500 ms)
 *   • Grip-settling after page load      (~300–500 ms)
 */

/** Minimum per-frame change on a single axis (m/s²) to register a direction.
 *  Fast tilt (60° in 50 ms at 60 Hz): ~0.9 m/s² per frame — below threshold.
 *  Deliberate shake (1 cm at 4 Hz, 60 Hz): ~1.9 m/s² per frame — above threshold. */
export const SHAKE_AXIS_DELTA_MIN = 1.2

/** Direction reversals required.  5 = 2.5 full oscillations.
 *  At 4 Hz each reversal ≈ 125 ms apart → 5 reversals span 500 ms < 600 ms window. */
export const SHAKE_MIN_REVERSALS = 5

/** All 5 reversals must fall within this window.
 *  Walking at ≤ 3 Hz: 5 reversals span ≥ 833 ms > 600 ms → filtered.
 *  Shaking at ≥ 4 Hz: 5 reversals span ≤ 500 ms < 600 ms → detected. */
export const SHAKE_REVERSAL_WINDOW_MS = 600

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
 * Axis-reversal shake detection state.
 * Tracks per-axis direction to count rapid back-and-forth oscillations.
 */
export interface ShakeStartState {
  prevX: number | null
  prevY: number | null
  lastSignX: number       // direction of last significant X move: -1 | 0 | +1
  lastSignY: number       // direction of last significant Y move: -1 | 0 | +1
  reversals: number       // direction-reversal count (one per oscillation peak)
  burstStartAt: number    // timestamp of first reversal (0 = burst not started yet)
  lastMotionAt: number    // last frame with |delta| ≥ SHAKE_AXIS_DELTA_MIN
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
 * Axis-reversal shake detector.
 *
 * Counts per-frame direction reversals on the X and Y axes.
 * Five reversals within 600 ms confirms a ≥ 4 Hz oscillation — a deliberate shake.
 *
 * Why this works for all sensor data types:
 *  • accelerationIncludingGravity: tilting is monotonic (0–1 reversals),
 *    only actual left/right oscillation creates multiple rapid reversals.
 *  • acceleration (linear, iOS): gravity removed, per-axis acceleration
 *    directly reflects hand motion — very clean reversal signal.
 *
 * False-positive analysis for accelerationIncludingGravity (worst case):
 *  • Still:        dx ≈ 0–0.3 m/s²    < 1.2 threshold → 0 reversals ✓
 *  • Tilt:         monotonic dx 0.3–0.9 m/s² per frame → 0–1 reversals ✓
 *  • Fast grip adj:same direction, 1–2 reversals max    → < 5 ✓
 *  • Walking 2 Hz: low-freq osc, 5 reversals need 833 ms > 600 ms window ✓
 *  • Shake ≥ 4 Hz: 5 reversals in ≤ 500 ms < 600 ms window → triggers ✓
 *
 * @param sample  Current accelerometer sample (gravity-inclusive or linear)
 * @param now     Current timestamp in ms
 * @param state   Accumulated detection state
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

  // First frame after arm/reset — establish baseline, do not count
  if (next.prevX === null || next.prevY === null) {
    next.prevX = sample.x
    next.prevY = sample.y
    return { triggered: false, state: next }
  }

  const dx = sample.x - next.prevX
  const dy = sample.y - next.prevY

  // Detect X-axis direction reversal
  if (Math.abs(dx) >= SHAKE_AXIS_DELTA_MIN) {
    const signX = dx > 0 ? 1 : -1
    if (next.lastSignX !== 0 && signX !== next.lastSignX) {
      next.reversals += 1
      if (next.burstStartAt === 0) next.burstStartAt = now
    }
    next.lastSignX = signX
    next.lastMotionAt = now
  }

  // Detect Y-axis direction reversal
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
