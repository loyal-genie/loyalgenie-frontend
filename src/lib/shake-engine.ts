/** Haptics + motion helpers for Shake & Win */

/** Visual progress ring span — result timing uses RESULT_DELAY_* instead. */
export const SHAKE_DURATION_MS = 5000
export const CHARGE_MS = 300
/** After shake triggers, keep shaking this long before reveal. */
export const RESULT_DELAY_MIN_MS = 5000
export const RESULT_DELAY_MAX_MS = 7000

/**
 * devicemotion frames to skip before evaluating shake-start (establishes baseline;
 * does not delay with a timer — only ignores the first N sensor readings).
 * At ~100 Hz device events: 50 frames ≈ 500ms baseline settle time.
 */
export const SHAKE_IDLE_WARMUP_FRAMES = 50

/** Uniform random delay in [RESULT_DELAY_MIN_MS, RESULT_DELAY_MAX_MS]. */
export function randomRevealDelayMs(): number {
  const span = RESULT_DELAY_MAX_MS - RESULT_DELAY_MIN_MS
  return RESULT_DELAY_MIN_MS + Math.floor(Math.random() * (span + 1))
}

/** @deprecated use randomRevealDelayMs */
export const randomResultDelayMs = randomRevealDelayMs
/** Active-phase spike threshold (intensity + haptics). */
export const SHAKE_DELTA_THRESHOLD = 6
/** Minimum per-frame delta that contributes to start energy. */
export const SHAKE_START_MIN_DELTA = 0.45
/** At least one frame must reach this delta (filters steady drift). */
export const SHAKE_START_PEAK_DELTA = 1.1
/** Cumulative energy required to start — tuned for a deliberate, firm shake. */
export const SHAKE_START_ENERGY = 7.2
/** Minimum motion frames in a burst before shake can start — requires sustained motion. */
export const SHAKE_START_MIN_FRAMES = 8
/** Minimum peaks (sharp motion frames) in a burst — filters gentle sway. */
export const SHAKE_START_MIN_PEAKS = 4
/** Burst must last at least this long (filters single-frame spikes). */
export const SHAKE_START_MIN_BURST_MS = 180
/** Burst must complete within this window (filters slow drift). */
export const SHAKE_START_MAX_BURST_MS = 900
export const SHAKE_START_DEBOUNCE_MS = 450
/** shake.js-style speed threshold (lower = more sensitive). */
export const SHAKE_SPEED_THRESHOLD = 3
export const INTENSITY_DECAY = 0.04

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

export interface ShakeStartState {
  energy: number
  lastMotionAt: number
  firstMotionAt: number
  lastTriggeredAt: number
  sawPeak: boolean
  peakCount: number
  motionFrames: number
}

export function createShakeStartState(): ShakeStartState {
  return {
    energy: 0,
    lastMotionAt: 0,
    firstMotionAt: 0,
    lastTriggeredAt: 0,
    sawPeak: false,
    peakCount: 0,
    motionFrames: 0,
  }
}

/**
 * Energy-based shake start — requires a short burst of deliberate motion
 * (multiple frames + peaks). Single sensor spikes or orientation drift won't trigger.
 */
export function evaluateShakeStart(
  delta: number,
  now: number,
  state: ShakeStartState,
): { triggered: boolean; state: ShakeStartState } {
  const next: ShakeStartState = { ...state }

  if (next.lastMotionAt > 0) {
    const gap = now - next.lastMotionAt
    if (gap > 35) {
      next.energy *= Math.pow(0.6, gap / 35)
    }
    if (gap > SHAKE_START_MAX_BURST_MS) {
      next.sawPeak = false
      next.peakCount = 0
      next.motionFrames = 0
      next.firstMotionAt = 0
      next.energy = 0
    }
  }

  if (delta >= SHAKE_START_MIN_DELTA) {
    if (next.firstMotionAt === 0) next.firstMotionAt = now
    next.energy += delta
    next.lastMotionAt = now
    next.motionFrames += 1
    if (delta >= SHAKE_START_PEAK_DELTA) {
      next.sawPeak = true
      next.peakCount += 1
    }
  }

  const burstMs = next.firstMotionAt > 0 ? now - next.firstMotionAt : 0
  const triggered =
    next.peakCount >= SHAKE_START_MIN_PEAKS &&
    next.motionFrames >= SHAKE_START_MIN_FRAMES &&
    next.energy >= SHAKE_START_ENERGY &&
    burstMs >= SHAKE_START_MIN_BURST_MS &&
    burstMs <= SHAKE_START_MAX_BURST_MS &&
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
