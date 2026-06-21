/**
 * Persistent motion sensor bridge for Chrome Android.
 * Listeners must be attached inside a user gesture (touch/click).
 */

export type MotionListener = (e: DeviceMotionEvent) => void
export type OrientationListener = (e: DeviceOrientationEvent) => void
export type SensorPulseListener = () => void

let motionAttached = false
let orientAttached = false
let motionHandler: MotionListener | null = null
let orientHandler: OrientationListener | null = null
let pulseHandler: SensorPulseListener | null = null

function dispatchMotion(e: DeviceMotionEvent) {
  pulseHandler?.()
  motionHandler?.(e)
}

function dispatchOrientation(e: DeviceOrientationEvent) {
  if (!orientHandler) return
  pulseHandler?.()
  orientHandler(e)
}

/** Call synchronously inside touchstart/click — required for Chrome Android. */
export function primeMotionSensors(): boolean {
  if (typeof DeviceMotionEvent === 'undefined') return false

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

/** Synchronous arm from user gesture — call on every touchstart on shake screen. */
export function armFromUserGesture(): void {
  primeMotionSensors()
}

export function setMotionSensorHandlers(
  onMotion: MotionListener | null,
  onOrientation: OrientationListener | null = null,
  onPulse: SensorPulseListener | null = null,
) {
  motionHandler = onMotion
  orientHandler = onOrientation
  pulseHandler = onPulse
}

export function isMotionSensorAttached(): boolean {
  return motionAttached
}
