import { useEffect, useRef, useCallback, useState } from 'react'
import {
  computeShakeDelta,
  hapticShakePulse,
  initialMotionPermission,
  requestMotionPermission,
  SHAKE_DELTA_THRESHOLD,
  type MotionPermission,
} from '@/lib/shake-engine'

const START_DEBOUNCE_MS = 700

interface UseDeviceShakeOptions {
  listenIdle: boolean
  listenActive: boolean
  onShakeStart?: () => void
  onIntensity?: (value: number) => void
  onShakeSpike?: (delta: number) => void
  reducedMotion?: boolean
}

export function useDeviceShake({
  listenIdle,
  listenActive,
  onShakeStart,
  onIntensity,
  onShakeSpike,
  reducedMotion = false,
}: UseDeviceShakeOptions) {
  const [permission, setPermission] = useState<MotionPermission>(initialMotionPermission)
  const prevSampleRef = useRef<{ x: number; y: number; z: number } | null>(null)
  const lastStartAtRef = useRef(0)
  const onShakeStartRef = useRef(onShakeStart)
  const onIntensityRef = useRef(onIntensity)
  const onShakeSpikeRef = useRef(onShakeSpike)

  onShakeStartRef.current = onShakeStart
  onIntensityRef.current = onIntensity
  onShakeSpikeRef.current = onShakeSpike

  const ensurePermission = useCallback(async (): Promise<MotionPermission> => {
    if (permission === 'granted' || permission === 'unsupported') {
      return permission
    }
    const perm = await requestMotionPermission()
    setPermission(perm)
    return perm
  }, [permission])

  useEffect(() => {
    const listening = !reducedMotion && (listenIdle || listenActive)
    if (!listening) {
      prevSampleRef.current = null
      return
    }

    if (permission !== 'granted' && permission !== 'unsupported') {
      return
    }

    const handler = (e: DeviceMotionEvent) => {
      const { delta, sample } = computeShakeDelta(e, prevSampleRef.current)
      prevSampleRef.current = sample

      if (listenIdle && delta > SHAKE_DELTA_THRESHOLD) {
        const now = Date.now()
        if (now - lastStartAtRef.current >= START_DEBOUNCE_MS) {
          lastStartAtRef.current = now
          onShakeStartRef.current?.()
        }
        return
      }

      if (!listenActive) return

      if (delta > SHAKE_DELTA_THRESHOLD * 0.5) {
        onIntensityRef.current?.(Math.min(1, delta / (SHAKE_DELTA_THRESHOLD * 2.5)))
      }

      if (delta > SHAKE_DELTA_THRESHOLD) {
        onShakeSpikeRef.current?.(delta)
        hapticShakePulse(Math.min(1, delta / 30))
      }
    }

    window.addEventListener('devicemotion', handler, { passive: true })
    return () => window.removeEventListener('devicemotion', handler)
  }, [listenIdle, listenActive, permission, reducedMotion])

  return { ensurePermission, permission }
}
