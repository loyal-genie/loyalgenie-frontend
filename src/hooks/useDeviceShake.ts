import { useEffect, useRef, useCallback } from 'react'
import {
  computeShakeDelta,
  hapticShakePulse,
  requestMotionPermission,
  SHAKE_DELTA_THRESHOLD,
  type MotionPermission,
} from '@/lib/shake-engine'

interface UseDeviceShakeOptions {
  active: boolean
  onIntensity: (value: number) => void
  onShakeSpike?: (delta: number) => void
  reducedMotion?: boolean
}

export function useDeviceShake({
  active,
  onIntensity,
  onShakeSpike,
  reducedMotion = false,
}: UseDeviceShakeOptions) {
  const permissionRef = useRef<MotionPermission>('unknown')
  const prevSampleRef = useRef<{ x: number; y: number; z: number } | null>(null)
  const listenerAttachedRef = useRef(false)

  const attachListener = useCallback(
    (handler: (e: DeviceMotionEvent) => void) => {
      if (listenerAttachedRef.current) return
      window.addEventListener('devicemotion', handler, { passive: true })
      listenerAttachedRef.current = true
    },
    [],
  )

  const detachListener = useCallback((handler: (e: DeviceMotionEvent) => void) => {
    window.removeEventListener('devicemotion', handler)
    listenerAttachedRef.current = false
  }, [])

  const ensurePermission = useCallback(async (): Promise<MotionPermission> => {
    if (permissionRef.current === 'granted' || permissionRef.current === 'unsupported') {
      return permissionRef.current
    }
    const perm = await requestMotionPermission()
    permissionRef.current = perm
    return perm
  }, [])

  useEffect(() => {
    if (!active || reducedMotion) {
      prevSampleRef.current = null
      return
    }

    const handler = (e: DeviceMotionEvent) => {
      const { delta, sample } = computeShakeDelta(e, prevSampleRef.current)
      prevSampleRef.current = sample

      if (delta > SHAKE_DELTA_THRESHOLD * 0.5) {
        onIntensity(Math.min(1, delta / (SHAKE_DELTA_THRESHOLD * 2.5)))
      }

      if (delta > SHAKE_DELTA_THRESHOLD) {
        onShakeSpike?.(delta)
        hapticShakePulse(Math.min(1, delta / 30))
      }
    }

    if (permissionRef.current === 'granted' || permissionRef.current === 'unsupported') {
      attachListener(handler)
    }

    return () => detachListener(handler)
  }, [active, reducedMotion, onIntensity, onShakeSpike, attachListener, detachListener])

  return { ensurePermission, permission: permissionRef }
}
