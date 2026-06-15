import { useEffect, useRef, useCallback, useState } from 'react'
import {
  computeShakeDelta,
  createShakeStartState,
  evaluateShakeStart,
  hapticShakePulse,
  initialMotionPermission,
  requestMotionPermission,
  SHAKE_DELTA_THRESHOLD,
  type MotionPermission,
  type ShakeStartState,
} from '@/lib/shake-engine'
import {
  motionPermissionOk,
  orientationToMotionDelta,
  primeMotionSensors,
  resetOrientationBaseline,
  setMotionSensorHandlers,
} from '@/lib/shake-motion-sensors'

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
  const [motionArmed, setMotionArmed] = useState(false)
  const prevSampleRef = useRef<{ x: number; y: number; z: number } | null>(null)
  const startStateRef = useRef<ShakeStartState>(createShakeStartState())
  const listenIdleRef = useRef(listenIdle)
  const listenActiveRef = useRef(listenActive)
  const onShakeStartRef = useRef(onShakeStart)
  const onIntensityRef = useRef(onIntensity)
  const onShakeSpikeRef = useRef(onShakeSpike)

  listenIdleRef.current = listenIdle
  listenActiveRef.current = listenActive
  onShakeStartRef.current = onShakeStart
  onIntensityRef.current = onIntensity
  onShakeSpikeRef.current = onShakeSpike

  const processDelta = useCallback((delta: number) => {
    if (listenIdleRef.current) {
      const result = evaluateShakeStart(delta, Date.now(), startStateRef.current)
      startStateRef.current = result.state
      if (result.triggered) {
        onShakeStartRef.current?.()
      }
      if (listenIdleRef.current && !listenActiveRef.current) return
    }

    if (!listenActiveRef.current) return

    if (delta > SHAKE_DELTA_THRESHOLD * 0.3) {
      onIntensityRef.current?.(Math.min(1, delta / (SHAKE_DELTA_THRESHOLD * 1.8)))
    }

    if (delta > SHAKE_DELTA_THRESHOLD * 0.45) {
      onShakeSpikeRef.current?.(delta)
      hapticShakePulse(Math.min(1, delta / 18))
    }
  }, [])

  const handleMotion = useCallback((e: DeviceMotionEvent) => {
    const { delta, sample } = computeShakeDelta(e, prevSampleRef.current)
    prevSampleRef.current = sample
    if (delta > 0) processDelta(delta)
  }, [processDelta])

  const handleOrientation = useCallback((e: DeviceOrientationEvent) => {
    const delta = orientationToMotionDelta(e)
    if (delta > 0) processDelta(delta)
  }, [processDelta])

  const attachSensors = useCallback(() => {
    if (reducedMotion) return
    primeMotionSensors()
    setMotionSensorHandlers(handleMotion, handleOrientation)
  }, [reducedMotion, handleMotion, handleOrientation])

  const armMotion = useCallback(() => {
    setMotionArmed(true)
    attachSensors()
  }, [attachSensors])

  const ensurePermission = useCallback(async (): Promise<MotionPermission> => {
    if (permission === 'granted' || permission === 'unsupported') {
      armMotion()
      return permission
    }
    const perm = await requestMotionPermission()
    setPermission(perm)
    if (perm === 'granted') armMotion()
    return perm
  }, [permission, armMotion])

  // Keep handlers wired while mounted; listener stays attached across phase changes.
  useEffect(() => {
    if (reducedMotion || !motionArmed || !motionPermissionOk(permission)) {
      setMotionSensorHandlers(null, null)
      return
    }

    attachSensors()
    return () => {
      setMotionSensorHandlers(null, null)
      resetOrientationBaseline()
    }
  }, [reducedMotion, motionArmed, permission, attachSensors])

  useEffect(() => {
    if (!listenIdle && !listenActive) {
      prevSampleRef.current = null
      startStateRef.current = createShakeStartState()
      resetOrientationBaseline()
    }
  }, [listenIdle, listenActive])

  return { ensurePermission, permission, motionArmed, armMotion }
}
