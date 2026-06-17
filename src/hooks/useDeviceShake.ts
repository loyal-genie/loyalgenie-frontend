import { useEffect, useRef, useCallback, useState } from 'react'
import {
  computeShakeDelta,
  computeShakeSpeed,
  createShakeSpeedState,
  createShakeStartState,
  evaluateShakeStart,
  hapticShakePulse,
  initialMotionPermission,
  requestMotionPermission,
  SHAKE_DELTA_THRESHOLD,
  SHAKE_SPEED_THRESHOLD,
  SHAKE_START_DEBOUNCE_MS,
  type MotionPermission,
  type ShakeStartState,
  type ShakeSpeedState,
} from '@/lib/shake-engine'
import {
  armFromUserGesture,
  motionPermissionOk,
  orientationToMotionDelta,
  setMotionSensorHandlers,
} from '@/lib/shake-motion-sensors'

interface UseDeviceShakeOptions {
  listenIdle: boolean
  listenActive: boolean
  onShakeStart?: () => void
  onIntensity?: (value: number) => void
  onShakeSpike?: (delta: number) => void
  onSensorPulse?: () => void
  reducedMotion?: boolean
}

export function useDeviceShake({
  listenIdle,
  listenActive,
  onShakeStart,
  onIntensity,
  onShakeSpike,
  onSensorPulse,
  reducedMotion = false,
}: UseDeviceShakeOptions) {
  const [permission, setPermission] = useState<MotionPermission>(initialMotionPermission)
  const [sensorsPrimed, setSensorsPrimed] = useState(false)
  const prevSampleRef = useRef<{ x: number; y: number; z: number } | null>(null)
  const orientPrevRef = useRef<{ beta: number; gamma: number; alpha: number } | null>(null)
  const startStateRef = useRef<ShakeStartState>(createShakeStartState())
  const speedStateRef = useRef<ShakeSpeedState>(createShakeSpeedState())
  const lastStartAtRef = useRef(0)
  const listenIdleRef = useRef(listenIdle)
  const listenActiveRef = useRef(listenActive)
  const onShakeStartRef = useRef(onShakeStart)
  const onIntensityRef = useRef(onIntensity)
  const onShakeSpikeRef = useRef(onShakeSpike)
  const onSensorPulseRef = useRef(onSensorPulse)

  // Require explicit arm — PIN page may attach sensors but must not start detection yet.
  listenIdleRef.current = listenIdle && sensorsPrimed
  listenActiveRef.current = listenActive
  onShakeStartRef.current = onShakeStart
  onIntensityRef.current = onIntensity
  onShakeSpikeRef.current = onShakeSpike
  onSensorPulseRef.current = onSensorPulse

  const tryStart = useCallback((now: number) => {
    if (!listenIdleRef.current) return
    if (now - lastStartAtRef.current < SHAKE_START_DEBOUNCE_MS) return
    lastStartAtRef.current = now
    startStateRef.current = createShakeStartState()
    speedStateRef.current = createShakeSpeedState()
    onShakeStartRef.current?.()
  }, [])

  const processMotion = useCallback((delta: number, speed: number) => {
    const now = Date.now()

    if (listenIdleRef.current) {
      if (speed >= SHAKE_SPEED_THRESHOLD) {
        tryStart(now)
      } else {
        const result = evaluateShakeStart(delta, now, startStateRef.current)
        startStateRef.current = result.state
        if (result.triggered) tryStart(now)
      }
      if (listenIdleRef.current && !listenActiveRef.current) return
    }

    if (!listenActiveRef.current) return

    const intensityInput = Math.max(delta, speed / SHAKE_SPEED_THRESHOLD)
    if (intensityInput > SHAKE_DELTA_THRESHOLD * 0.25) {
      onIntensityRef.current?.(Math.min(1, intensityInput / (SHAKE_DELTA_THRESHOLD * 1.5)))
    }

    if (intensityInput > SHAKE_DELTA_THRESHOLD * 0.4) {
      onShakeSpikeRef.current?.(intensityInput)
      hapticShakePulse(Math.min(1, intensityInput / 15))
    }
  }, [tryStart])

  const handleMotion = useCallback((e: DeviceMotionEvent) => {
    onSensorPulseRef.current?.()
    const { delta, sample } = computeShakeDelta(e, prevSampleRef.current)
    prevSampleRef.current = sample

    let speed = 0
    if (sample) {
      const speedResult = computeShakeSpeed(sample, Date.now(), speedStateRef.current)
      speedStateRef.current = speedResult.state
      speed = speedResult.speed
    }

    if (delta > 0 || speed > 0) processMotion(delta, speed)
  }, [processMotion])

  const handleOrientation = useCallback((e: DeviceOrientationEvent) => {
    onSensorPulseRef.current?.()
    const { delta, sample } = orientationToMotionDelta(e, orientPrevRef.current)
    orientPrevRef.current = sample
    if (delta > 0) processMotion(delta, 0)
  }, [processMotion])

  const wireHandlers = useCallback(() => {
    setMotionSensorHandlers(handleMotion, handleOrientation, () => onSensorPulseRef.current?.())
  }, [handleMotion, handleOrientation])

  const resetMotionBaseline = useCallback(() => {
    prevSampleRef.current = null
    orientPrevRef.current = null
    startStateRef.current = createShakeStartState()
    speedStateRef.current = createShakeSpeedState()
    lastStartAtRef.current = 0
  }, [])

  const primeFromGesture = useCallback(() => {
    armFromUserGesture()
    wireHandlers()
  }, [wireHandlers])

  /** Reset sensor baseline and enable shake-start detection. */
  const armShakeDetection = useCallback(() => {
    armFromUserGesture()
    wireHandlers()
    resetMotionBaseline()
    setSensorsPrimed(true)
  }, [wireHandlers, resetMotionBaseline])

  const ensurePermission = useCallback(async (): Promise<MotionPermission> => {
    if (permission === 'granted' || permission === 'unsupported') {
      primeFromGesture()
      return permission
    }
    const perm = await requestMotionPermission()
    setPermission(perm)
    if (perm === 'granted') primeFromGesture()
    return perm
  }, [permission, primeFromGesture])

  // Wire handlers whenever mounted with valid permission (don't wait for gesture for wiring).
  useEffect(() => {
    if (reducedMotion || !motionPermissionOk(permission)) {
      setMotionSensorHandlers(null, null, null)
      return
    }
    wireHandlers()
    return () => setMotionSensorHandlers(null, null, null)
  }, [reducedMotion, permission, wireHandlers])

  useEffect(() => {
    if (!listenIdle && !listenActive) {
      prevSampleRef.current = null
      orientPrevRef.current = null
      startStateRef.current = createShakeStartState()
      speedStateRef.current = createShakeSpeedState()
    }
  }, [listenIdle, listenActive])

  return {
    ensurePermission,
    permission,
    sensorsPrimed,
    primeFromGesture,
    armShakeDetection,
    resetMotionBaseline,
  }
}
