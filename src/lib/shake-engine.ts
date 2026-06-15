/** Haptics + motion helpers for Shake & Win */

export const SHAKE_DURATION_MS = 2400
export const CHARGE_MS = 450
export const SHAKE_DELTA_THRESHOLD = 12
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

/** Magnitude of change between consecutive motion samples (better shake feel than absolute accel). */
export function computeShakeDelta(e: DeviceMotionEvent, prev: { x: number; y: number; z: number } | null) {
  const acc = e.acceleration ?? e.accelerationIncludingGravity
  if (!acc) return { delta: 0, sample: prev }

  const x = acc.x ?? 0
  const y = acc.y ?? 0
  const z = acc.z ?? 0
  const sample = { x, y, z }

  if (!prev) return { delta: 0, sample }

  const dx = x - prev.x
  const dy = y - prev.y
  const dz = z - prev.z
  const delta = Math.sqrt(dx * dx + dy * dy + dz * dz)
  return { delta, sample }
}
