import { useCallback, useEffect, useRef, useState } from 'react'

/** Minimum acceleration delta (m/s²) to count as shaking. */
export const SHAKE_CHARGE_MIN_DELTA = 5
/** Charge added per ~16ms frame while shaking — full in ~2.5s at 60fps. */
export const SHAKE_CHARGE_PER_FRAME = 2.4
/** Charge lost per frame while still — drains in ~1.5s. */
export const SHAKE_CHARGE_DECAY_PER_FRAME = 3.0
/** If no motion event within this window, considered still. */
export const SHAKE_MOTION_TIMEOUT_MS = 80

export type ShakeChargePermission =
  | 'unknown'
  | 'granted'
  | 'denied'
  | 'unsupported'
  | 'needs-prompt'

interface UseShakeChargeOptions {
  enabled?: boolean
}

function vibrate(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern)
  } catch {
    /* unsupported */
  }
}

/**
 * POC charge/decay shake detection — self-contained, no complex high-pass logic.
 * Sustained shaking (~2.5s) fills intensity 0→100; stillness decays charge.
 */
export function useShakeCharge(onComplete: () => void, options: UseShakeChargeOptions = {}) {
  const { enabled = true } = options

  const [permissionState, setPermissionState] = useState<ShakeChargePermission>('unknown')
  const [intensity, setIntensity] = useState(0)

  const lastAccel = useRef({ x: 0, y: 0, z: 0 })
  const chargeRef = useRef(0)
  const lastMotionAt = useRef(0)
  const rafId = useRef<number | null>(null)
  const firedRef = useRef(false)
  const onCompleteRef = useRef(onComplete)

  onCompleteRef.current = onComplete

  const permissionGranted =
    enabled && (permissionState === 'granted' || permissionState === 'unsupported')

  useEffect(() => {
    if (typeof DeviceMotionEvent === 'undefined') {
      setPermissionState('unsupported')
      return
    }
    const dm = DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> }
    if (typeof dm.requestPermission !== 'function') {
      setPermissionState('granted')
      return
    }
    setPermissionState('needs-prompt')
  }, [])

  useEffect(() => {
    if (!permissionGranted) return

    function tick() {
      const timeSinceMotion = Date.now() - lastMotionAt.current
      const isShaking = timeSinceMotion < SHAKE_MOTION_TIMEOUT_MS

      if (isShaking) {
        chargeRef.current = Math.min(100, chargeRef.current + SHAKE_CHARGE_PER_FRAME)
      } else {
        chargeRef.current = Math.max(0, chargeRef.current - SHAKE_CHARGE_DECAY_PER_FRAME)
      }

      setIntensity(Math.round(chargeRef.current))

      if (!firedRef.current && chargeRef.current >= 100) {
        firedRef.current = true
        vibrate([80, 40, 120])
        onCompleteRef.current()
      }

      rafId.current = requestAnimationFrame(tick)
    }

    rafId.current = requestAnimationFrame(tick)
    return () => {
      if (rafId.current != null) cancelAnimationFrame(rafId.current)
    }
  }, [permissionGranted])

  useEffect(() => {
    if (!permissionGranted) return

    function handleMotion(e: DeviceMotionEvent) {
      const accel = e.accelerationIncludingGravity
      if (!accel) return

      const x = accel.x ?? 0
      const y = accel.y ?? 0
      const z = accel.z ?? 0
      const prev = lastAccel.current

      const delta = Math.sqrt(
        (x - prev.x) ** 2 + (y - prev.y) ** 2 + (z - prev.z) ** 2,
      )

      lastAccel.current = { x, y, z }

      if (delta > SHAKE_CHARGE_MIN_DELTA) {
        lastMotionAt.current = Date.now()
      }
    }

    window.addEventListener('devicemotion', handleMotion)
    return () => window.removeEventListener('devicemotion', handleMotion)
  }, [permissionGranted])

  const simulateShake = useCallback(() => {
    if (firedRef.current) return
    lastMotionAt.current = Date.now()
  }, [])

  const resetIntensity = useCallback(() => {
    chargeRef.current = 0
    firedRef.current = false
    lastMotionAt.current = 0
    setIntensity(0)
  }, [])

  const requestPermission = useCallback(async () => {
    const dm = DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> }
    if (typeof dm.requestPermission !== 'function') {
      setPermissionState('granted')
      return 'granted' as const
    }
    try {
      const result = await dm.requestPermission()
      setPermissionState(result === 'granted' ? 'granted' : 'denied')
      return result === 'granted' ? ('granted' as const) : ('denied' as const)
    } catch {
      setPermissionState('denied')
      return 'denied' as const
    }
  }, [])

  return {
    permissionState,
    requestPermission,
    intensity,
    simulateShake,
    resetIntensity,
  }
}
