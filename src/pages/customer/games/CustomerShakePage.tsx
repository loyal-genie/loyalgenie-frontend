import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Loader2, Smartphone } from 'lucide-react'
import { WinCelebration, NoWin } from '@/components/customer/win-celebration'
import {
  FloatingPrizes,
  PhoneMockup,
  ProgressRing,
  RevealFlash,
  ShakeVignette,
  SplashBurst,
  StarField,
  SHAKE_PARTICLE_COLORS,
} from '@/components/customer/shake-effects'
import { getCampaignIdFromSearch, getPlaySession, hasRecentMotionGesture } from '@/lib/customer-game'
import { fetchPublicCampaign, fetchPlayState, executeShake, getApiErrorMessage, type PlayState } from '@/lib/api'
import { getUser } from '@/lib/auth'
import { useDeviceShake } from '@/hooks/useDeviceShake'
import { primeMotionSensors } from '@/lib/shake-motion-sensors'
import {
  hapticCharge,
  hapticReveal,
  hapticStart,
  canUseMotionSensors,
  hasDeviceMotionApi,
  isSecureMotionContext,
  INTENSITY_DECAY,
  needsMotionPermissionPrompt,
  prefersReducedMotion,
  randomRevealDelayMs,
  vibrate,
} from '@/lib/shake-engine'

type Phase = 'idle' | 'shaking' | 'suspending' | 'revealing' | 'result'
type MotionHint = 'needed' | 'ready' | 'live'

const GAME_BG = 'linear-gradient(165deg, #1A0545 0%, #2D1B69 38%, #0D0B1E 100%)'

export function CustomerShakePage() {
  const navigate = useNavigate()
  const { search } = useLocation()
  const campaignId = getCampaignIdFromSearch(search)
  const reducedMotion = prefersReducedMotion()
  const motionPlay = !reducedMotion && canUseMotionSensors()
  const needsHttpsForShake = !reducedMotion && hasDeviceMotionApi() && !isSecureMotionContext()

  const [phase, setPhase] = useState<Phase>('idle')
  const [intensity, setIntensity] = useState(0)
  const [shakeProgress, setShakeProgress] = useState(0)
  const [burstKey, setBurstKey] = useState(0)
  const [motionHint, setMotionHint] = useState<MotionHint>('ready')
  const [won, setWon] = useState(false)
  const [rewardText, setRewardText] = useState('')
  const [rewardEmoji, setRewardEmoji] = useState('🎁')
  const [rewardCode, setRewardCode] = useState<string | undefined>()
  const [playsLeft, setPlaysLeft] = useState<number | null>(null)
  const [canPlay, setCanPlay] = useState(false)
  const [blockReason, setBlockReason] = useState<PlayState['blockReason']>(null)
  const [attempts, setAttempts] = useState<{ used: number; total: number } | null>(null)
  const [error, setError] = useState('')
  const [playStateReady, setPlayStateReady] = useState(false)
  const [shakeDetectionArmed, setShakeDetectionArmed] = useState(false)

  const shakeStartRef = useRef<number | null>(null)
  const sequenceStartRef = useRef<number | null>(null)
  const resolvedRef = useRef(false)
  const intensityRef = useRef(0)
  const progressRafRef = useRef<number | null>(null)
  const startingRef = useRef(false)
  const sensorPulseRef = useRef(false)
  const resultDeadlineRef = useRef<number | null>(null)
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const deadlineTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const apiReadyRef = useRef(false)
  const latestWonRef = useRef(false)
  const revealingRef = useRef(false)

  const customerId = getUser()?.userId
  const playSession = campaignId ? getPlaySession(campaignId) : null
  const queryClient = useQueryClient()

  const { data: campaign, isLoading: campaignLoading } = useQuery({
    queryKey: ['public-campaign', campaignId],
    queryFn: () => fetchPublicCampaign(campaignId!),
    enabled: Boolean(campaignId),
  })

  const { data: playState, isLoading: stateLoading } = useQuery({
    queryKey: ['play-state', campaignId, customerId],
    queryFn: () => fetchPlayState(campaignId!),
    enabled: Boolean(campaignId) && Boolean(playSession) && Boolean(customerId),
    staleTime: 0,
  })

  useEffect(() => {
    if (!campaignId) {
      navigate('/customer')
      return
    }
    if (!playSession) {
      navigate(`/customer/campaigns/${campaignId}`)
    }
  }, [campaignId, playSession, navigate])

  useEffect(() => {
    if (!playState) return
    setPlayStateReady(true)
    setCanPlay(playState.canPlay)
    setBlockReason(playState.blockReason ?? null)
    setPlaysLeft(playState.playsRemaining)
    setAttempts({ used: playState.playsUsedToday, total: playState.playsPerDay })
    setError(playState.canPlay ? '' : playState.message)
  }, [playState])

  useEffect(() => {
    if (phase !== 'shaking') return
    const tick = setInterval(() => {
      setIntensity(i => {
        const next = Math.max(0, i - INTENSITY_DECAY)
        intensityRef.current = next
        return next
      })
    }, 80)
    return () => clearInterval(tick)
  }, [phase])

  useEffect(() => {
    if (!sequenceStartRef.current || !resultDeadlineRef.current) return
    if (phase === 'idle' || phase === 'result' || phase === 'revealing') return

    const update = () => {
      const start = sequenceStartRef.current
      const end = resultDeadlineRef.current
      if (!start || !end) return
      const span = Math.max(1, end - start)
      setShakeProgress(Math.min(1, (Date.now() - start) / span))
      progressRafRef.current = requestAnimationFrame(update)
    }
    progressRafRef.current = requestAnimationFrame(update)
    return () => {
      if (progressRafRef.current) cancelAnimationFrame(progressRafRef.current)
    }
  }, [phase])

  const clearPlayTimers = useCallback(() => {
    if (revealTimerRef.current) clearTimeout(revealTimerRef.current)
    if (deadlineTimerRef.current) clearTimeout(deadlineTimerRef.current)
    revealTimerRef.current = null
    deadlineTimerRef.current = null
  }, [])

  const tryRevealResult = useCallback(() => {
    const deadline = resultDeadlineRef.current
    if (!deadline || !apiReadyRef.current) {
      if (deadline && Date.now() >= deadline) setPhase('suspending')
      return
    }
    if (Date.now() < deadline || revealingRef.current) return

    revealingRef.current = true
    setPhase('revealing')
    hapticReveal(latestWonRef.current)
    if (revealTimerRef.current) clearTimeout(revealTimerRef.current)
    const flashDelay = reducedMotion ? 200 : 400
    revealTimerRef.current = setTimeout(() => {
      setPhase('result')
      revealTimerRef.current = null
    }, flashDelay)
  }, [reducedMotion])

  useEffect(() => {
    return () => clearPlayTimers()
  }, [clearPlayTimers])

  const scheduleResultDeadline = useCallback(() => {
    const deadline = resultDeadlineRef.current
    if (!deadline) return
    const wait = Math.max(0, deadline - Date.now())
    if (deadlineTimerRef.current) clearTimeout(deadlineTimerRef.current)
    deadlineTimerRef.current = setTimeout(() => {
      deadlineTimerRef.current = null
      tryRevealResult()
    }, wait)
  }, [tryRevealResult])

  const shakeMutation = useMutation({
    mutationFn: () => executeShake(campaignId!, playSession!),
    onSuccess: result => {
      queryClient.invalidateQueries({ queryKey: ['customer-rewards'] })
      queryClient.invalidateQueries({ queryKey: ['play-state', campaignId] })
      apiReadyRef.current = true
      latestWonRef.current = result.won
      setWon(result.won)
      setPlaysLeft(result.playsRemaining)
      setCanPlay(result.playsRemaining > 0)
      setBlockReason(result.playsRemaining > 0 ? null : 'no_plays_remaining')
      setAttempts({ used: result.playsUsedToday, total: result.playsPerDay })
      if (result.won && result.reward) {
        setRewardText(result.reward.name)
        setRewardEmoji(result.reward.icon)
        setRewardCode(result.code ?? undefined)
      }
      tryRevealResult()
    },
    onError: err => {
      clearPlayTimers()
      setError(getApiErrorMessage(err, 'Could not complete shake. Try again.'))
      setPhase('idle')
      resolvedRef.current = false
      apiReadyRef.current = false
      revealingRef.current = false
      sequenceStartRef.current = null
      shakeStartRef.current = null
      resultDeadlineRef.current = null
      setShakeProgress(0)
      setIntensity(0)
    },
  })

  const kickOffPlay = useCallback(() => {
    if (resolvedRef.current || shakeMutation.isPending) return

    resolvedRef.current = true
    apiReadyRef.current = false
    revealingRef.current = false
    const now = Date.now()
    sequenceStartRef.current = now
    shakeStartRef.current = now
    resultDeadlineRef.current = now + randomRevealDelayMs()
    scheduleResultDeadline()
    shakeMutation.mutate()
  }, [shakeMutation, scheduleResultDeadline])

  const bumpIntensity = useCallback((amount: number) => {
    setIntensity(i => {
      const next = Math.min(1, i + amount)
      intensityRef.current = next
      if (next > 0.35) setBurstKey(k => k + 1)
      return next
    })
  }, [])

  const onSensorPulse = useCallback(() => {
    sensorPulseRef.current = true
    setMotionHint('live')
  }, [])

  const onPhysicalShakeRef = useRef<(() => void) | null>(null)

  const { ensurePermission, permission, primeFromGesture, armShakeDetection, detectionLive } = useDeviceShake({
    listenIdle:
      motionPlay &&
      shakeDetectionArmed &&
      phase === 'idle' &&
      playStateReady &&
      canPlay &&
      playsLeft !== null &&
      playsLeft > 0,
    listenActive: phase === 'shaking',
    onShakeStart: () => onPhysicalShakeRef.current?.(),
    onIntensity: val => bumpIntensity(val * 0.14),
    onShakeSpike: () => bumpIntensity(0.08),
    onSensorPulse,
    reducedMotion,
  })

  /** Shake detected → 12–15s active shaking → reveal. */
  const beginPlayAfterShake = useCallback(() => {
    if (
      startingRef.current ||
      phase !== 'idle' ||
      !shakeDetectionArmed ||
      !playStateReady ||
      !canPlay ||
      playsLeft === null ||
      playsLeft <= 0 ||
      !playSession ||
      resolvedRef.current
    ) {
      return
    }

    startingRef.current = true
    hapticStart()
    kickOffPlay()
    setPhase('shaking')
    hapticCharge()
    startingRef.current = false
  }, [phase, shakeDetectionArmed, canPlay, playsLeft, playSession, playStateReady, kickOffPlay])

  const onPhysicalShake = useCallback(() => {
    if (!motionPlay || phase !== 'idle' || !shakeDetectionArmed || !detectionLive) return
    if (needsMotionPermissionPrompt() && permission !== 'granted') {
      setMotionHint('needed')
      return
    }
    beginPlayAfterShake()
  }, [motionPlay, phase, shakeDetectionArmed, detectionLive, permission, beginPlayAfterShake])

  onPhysicalShakeRef.current = onPhysicalShake

  // Arm shake detection as soon as play state is ready.
  // The oscillation-reversal algorithm requires actual back-and-forth motion to trigger —
  // tilting, picking up, or holding the phone still produces 0–1 reversals (needs 4).
  useEffect(() => {
    if (!motionPlay || !playStateReady || !canPlay) return

    if (hasRecentMotionGesture()) {
      primeMotionSensors()
      primeFromGesture()
    }

    if (needsMotionPermissionPrompt() && permission !== 'granted') {
      setMotionHint('needed')
      setShakeDetectionArmed(false)
      return
    }

    armShakeDetection()
    setShakeDetectionArmed(true)
    setMotionHint(sensorPulseRef.current ? 'live' : 'ready')
  }, [motionPlay, playStateReady, canPlay, primeFromGesture, permission, armShakeDetection])

  // iOS: one tap to grant DeviceMotion permission
  const handlePermissionTap = useCallback(() => {
    if (!motionPlay || phase !== 'idle' || motionHint !== 'needed') return
    primeFromGesture()
    void ensurePermission().then(perm => {
      if (perm === 'granted') {
        armShakeDetection()
        setShakeDetectionArmed(true)
        setMotionHint(sensorPulseRef.current ? 'live' : 'ready')
      } else {
        setMotionHint('needed')
      }
    })
  }, [motionPlay, phase, motionHint, primeFromGesture, ensurePermission, armShakeDetection])

  useEffect(() => {
    if (motionPlay) return
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || e.repeat) return
      e.preventDefault()
      if (phase === 'idle') beginPlayAfterShake()
      else if (phase === 'shaking') {
        bumpIntensity(0.18)
        vibrate(25)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [motionPlay, phase, beginPlayAfterShake, bumpIntensity])

  const handleTap = () => {
    if (motionPlay) {
      handlePermissionTap()
      return
    }
    // Desktop / HTTP fallback — no accelerometer
    if (phase === 'idle') beginPlayAfterShake()
    else if (phase === 'shaking') {
      bumpIntensity(reducedMotion ? 0.25 : 0.16)
      vibrate(22)
    }
  }

  const handlePlayAgain = () => {
    if (playsLeft === null || playsLeft <= 0) {
      navigate('/customer/wallet')
      return
    }
    resolvedRef.current = false
    apiReadyRef.current = false
    revealingRef.current = false
    shakeStartRef.current = null
    sequenceStartRef.current = null
    resultDeadlineRef.current = null
    clearPlayTimers()
    setShakeDetectionArmed(false)
    setIntensity(0)
    setShakeProgress(0)
    setPhase('idle')
    setWon(false)
    sensorPulseRef.current = false
    setMotionHint('ready')
    armShakeDetection()
    setShakeDetectionArmed(true)
  }

  if (campaignLoading || stateLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center customer-game-bg">
        <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
      </div>
    )
  }

  if (phase === 'result' && won) {
    return (
      <WinCelebration
        reward={rewardText}
        emoji={rewardEmoji}
        code={rewardCode}
        onClose={handlePlayAgain}
      />
    )
  }

  if (phase === 'result' && !won) {
    return <NoWin onClose={handlePlayAgain} playsLeft={playsLeft ?? undefined} attempts={attempts ?? undefined} />
  }

  const isShaking = phase === 'shaking'
  const isSuspense = phase === 'suspending' || phase === 'revealing'
  const winRate = campaign?.winRatePercent ?? 30
  const phonePhase = isSuspense ? 'suspense' : isShaking ? 'shaking' : 'idle'

  const phaseCopy: Record<Phase, string> = {
    idle: playStateReady
      ? canPlay && playsLeft && playsLeft > 0
        ? needsHttpsForShake
          ? 'Shake requires HTTPS — use the secure site link'
          : motionPlay
            ? motionHint === 'needed'
              ? 'Tap once to allow motion, then shake!'
              : !detectionLive
                ? 'Hold steady… get ready to shake!'
                : 'Shake your phone to start!'
            : 'Tap or press spacebar to start!'
        : blockReason === 'daily_participant_limit' || blockReason === 'user_cap'
          ? 'Campaign is full — no new players today'
          : 'No plays left today'
      : 'Loading your play status…',
    shaking: 'Keep shaking… result in 12–15 seconds!',
    suspending: 'Revealing your reward…',
    revealing: won ? 'You won!' : '…',
    result: '',
  }

  const screenShake = !reducedMotion && isShaking
    ? {
        x: [0, -4 - intensity * 6, 5 + intensity * 7, -3, 2, 0],
        y: [0, 3 + intensity * 5, -4 - intensity * 6, 2, -1, 0],
      }
    : {}

  return (
    <motion.div
      className="min-h-dvh flex flex-col items-center justify-between px-4 sm:px-5 pt-[max(2.5rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))] overflow-hidden relative max-w-md mx-auto w-full"
      style={{ background: GAME_BG }}
      animate={screenShake}
      transition={isShaking ? { duration: 0.1, repeat: Infinity } : {}}
      onTouchStart={handlePermissionTap}
    >
      <StarField />
      <FloatingPrizes visible={phase === 'idle'} />
      <ShakeVignette intensity={intensity} active={isShaking} />
      <RevealFlash active={phase === 'revealing'} />

      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: isShaking ? [0.35, 0.65, 0.35] : 0.12 }}
        transition={{ duration: 1.2, repeat: Infinity }}
        style={{
          background: `radial-gradient(circle at 50% 55%, rgba(139,92,246,${0.12 + intensity * 0.4}) 0%, transparent 58%)`,
        }}
      />

      <div className="w-full flex items-center justify-between mb-1 sm:mb-2 relative z-10 shrink-0">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-white/50 hover:text-white/80 transition-colors text-sm bg-transparent border-0 cursor-pointer py-2 -ml-1"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <div className="glass rounded-full px-3 py-1.5 min-w-[7.5rem] text-center">
          {!playStateReady ? (
            <p className="text-[10px] sm:text-xs text-white/50 font-medium">Checking…</p>
          ) : !canPlay && (blockReason === 'daily_participant_limit' || blockReason === 'user_cap') ? (
            <p className="text-[10px] sm:text-xs text-amber-200/90 font-bold">Full today</p>
          ) : attempts ? (
            <p className="text-[10px] sm:text-xs text-white/90 font-bold">
              {attempts.used}/{attempts.total} attempts
            </p>
          ) : (
            <p className="text-[10px] sm:text-xs text-white/70 font-medium">
              {playsLeft} play{playsLeft !== 1 ? 's' : ''} left
            </p>
          )}
        </div>
      </div>

      <div className="text-center relative z-10 px-1 shrink-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/25 mb-2 sm:mb-3"
        >
          <span className="text-[9px] sm:text-[10px] font-bold text-amber-200 uppercase tracking-wider">
            🎯 {winRate}% win chance
          </span>
          {motionPlay && motionHint === 'live' && (
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" title="Sensors active" />
          )}
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl sm:text-3xl font-extrabold mb-1 bg-gradient-to-r from-white via-purple-100 to-amber-200 bg-clip-text text-transparent shake-title-shimmer"
        >
          Shake &amp; Win!
        </motion.h1>
        <AnimatePresence mode="wait">
          <motion.p
            key={error || phaseCopy[phase]}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-xs sm:text-sm text-white/65 min-h-[1.25rem]"
          >
            {error || phaseCopy[phase]}
          </motion.p>
        </AnimatePresence>
        {campaign && (
          <p className="text-[10px] text-white/30 mt-1 truncate max-w-[18rem] mx-auto">{campaign.name}</p>
        )}
        {needsHttpsForShake && phase === 'idle' && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[10px] text-red-300/90 mt-2 px-3"
          >
            Sensors blocked on HTTP — open via https://
          </motion.p>
        )}
        {motionHint === 'needed' && phase === 'idle' && !needsHttpsForShake && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[10px] text-amber-300/80 mt-2 flex items-center justify-center gap-1"
          >
            <Smartphone className="w-3 h-3" /> Tap once to enable motion sensors (iOS)
          </motion.p>
        )}
      </div>

      <div className="relative z-10 w-full max-w-[13rem] shrink-0">
        {isShaking && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  width: `${intensity * 100}%`,
                  background: 'linear-gradient(90deg, #7C3AED, #F5C518)',
                  boxShadow: '0 0 14px rgba(245,197,24,0.65)',
                }}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              />
            </div>
            <p className="text-[9px] text-center text-white/35 uppercase tracking-widest">Shake power</p>
          </motion.div>
        )}
      </div>

      <div className="relative flex-1 flex items-center justify-center my-2 sm:my-4 z-10 min-h-[14rem] w-full">
        {isShaking && <ProgressRing progress={shakeProgress} size={210} />}
        {isShaking && intensity > 0.25 && <SplashBurst intensity={intensity} burstKey={burstKey} />}

        {isShaking &&
          Array.from({ length: 14 }, (_, i) => (
            <motion.div
              key={`p-${i}`}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: 4 + (i % 4) * 2,
                height: 4 + (i % 4) * 2,
                background: SHAKE_PARTICLE_COLORS[i % SHAKE_PARTICLE_COLORS.length],
                left: `calc(50% + ${Math.sin(i * 1.3) * 36}px)`,
                bottom: '52%',
                boxShadow: `0 0 8px ${SHAKE_PARTICLE_COLORS[i % SHAKE_PARTICLE_COLORS.length]}80`,
              }}
              initial={{ y: 0, opacity: 0.9, scale: 1 }}
              animate={{
                y: -90 - i * 10 - intensity * 40,
                opacity: 0,
                x: (i % 2 === 0 ? 1 : -1) * (24 + i * 5 + intensity * 20),
                scale: 0.3,
              }}
              transition={{ duration: 0.9 + (i % 3) * 0.1, delay: i * 0.06, repeat: Infinity, ease: 'easeOut' }}
            />
          ))}

        <PhoneMockup
          phase={phonePhase}
          intensity={intensity}
          onTap={handleTap}
          shakeToStart={motionPlay}
          motionHint={motionHint === 'live' ? 'ready' : motionHint}
          disabled={isSuspense || !playStateReady || !canPlay || playsLeft === null || playsLeft <= 0}
          reducedMotion={reducedMotion}
        />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="text-center relative z-10 shrink-0 px-2"
      >
        <p className="text-[9px] sm:text-xs text-white/30 leading-relaxed">
          {motionPlay
            ? 'Shake to play · Result reveals in 12–15 seconds'
            : reducedMotion
              ? 'Tap to play · Result in 12–15 seconds'
              : 'Tap or spacebar (no motion) · Result in 12–15 seconds'}
        </p>
      </motion.div>
    </motion.div>
  )
}
