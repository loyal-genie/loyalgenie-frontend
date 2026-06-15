/**
 * Persistent motion sensor bridge — attaches during a user gesture (PIN tap)
 * and stays alive across SPA navigation so Chrome Android actually delivers events.
 */
import {
  computeShakeDelta,
  hasDeviceMotionApi,
  readMotionSample,
  type MotionPermission,
} from './shake-engine'

export type MotionListener = (e: DeviceMotionEvent) => void
export type OrientationListener = (e: DeviceOrientationEvent) => void

let motionAttached = false
let orientAttached = false
let motionHandler: MotionListener | null = null
let orientHandler: OrientationListener | null = null
let orientPrev: { beta: number; gamma: number; alpha: number } | null = null

function dispatchMotion(e: DeviceMotionEvent) {
  motionHandler?.(e)
}

function dispatchOrientation(e: DeviceOrientationEvent) {
  if (!orientHandler) return
  const beta = e.beta
  const gamma = e.gamma
  const alpha = e.alpha
  if (beta == null && gamma == null && alpha == null) return

  const sample = { beta: beta ?? 0, gamma: gamma ?? 0, alpha: alpha ?? 0 }
  orientPrev = sample
  orientHandler(e)
}

/** Call synchronously inside click/touch (e.g. PIN submit) before navigation. */
export function primeMotionSensors(): boolean {
  if (!hasDeviceMotionApi()) return false

  if (!motionAttached) {
    window.addEventListener('devicemotion', dispatchMotion, { passive: true })
    motionAttached = true
  }

  if (!orientAttached && typeof DeviceOrientationEvent !== 'undefined') {
    window.addEventListener('deviceorientation', dispatchOrientation, { passive: true })
    orientAttached = true
  }

  return true
}

export function setMotionSensorHandlers(
  onMotion: MotionListener | null,
  onOrientation: OrientationListener | null = null,
) {
  motionHandler = onMotion
  orientHandler = onOrientation
  if (!onOrientation) orientPrev = null
}

export function isMotionSensorAttached(): boolean {
  return motionAttached
}

/** Synthetic motion event from orientation delta — Chrome Android fallback. */
export function orientationToMotionDelta(e: DeviceOrientationEvent): number {
  const beta = e.beta ?? 0
  const gamma = e.gamma ?? 0
  const alpha = e.alpha ?? 0

  if (!orientPrev) {
    orientPrev = { beta, gamma, alpha }
    return 0
  }

  const db = beta - orientPrev.beta
  const dg = gamma - orientPrev.gamma
  const da = alpha - orientPrev.alpha
  orientPrev = { beta, gamma, alpha }

  // deg → rough m/s² equivalent for threshold comparison
  return Math.sqrt(db * db + dg * dg + da * da) * 0.12
}

export function resetOrientationBaseline() {
  orientPrev = null
}

export function motionPermissionOk(permission: MotionPermission): boolean {
  return permission === 'granted' || permission === 'unsupported'
}

/** Quick sanity check that an event actually carries sensor data (Chrome quirk). */
export function motionEventHasData(e: DeviceMotionEvent): boolean {
  return readMotionSample(e) !== null
}

export function computeCombinedShakeDelta(
  e: DeviceMotionEvent,
  prev: { x: number; y: number; z: number } | null,
): { delta: number; sample: { x: number; y: number; z: number } | null } {
  return computeShakeDelta(e, prev)
}
