import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { WinCelebration, NoWin } from '@/components/customer/win-celebration'
import { getCampaignIdFromSearch, getPlaySession } from '@/lib/customer-game'
import { fetchPublicCampaign, fetchPlayState, executeShake, getApiErrorMessage } from '@/lib/api'
import { getUser } from '@/lib/auth'

type Phase = 'idle' | 'charging' | 'shaking' | 'suspending' | 'revealing' | 'result'

const PARTICLE_COLORS = ['#7C3AED', '#F5C518', '#EC4899', '#06B6D4', '#22C55E', '#F59E0B', '#A78BFA', '#FDE68A']
const SHAKE_THRESHOLD = 14
const SHAKE_DURATION_MS = 2200
const CHARGE_MS = 400

function vibrate(pattern: number | number[]) {
  try { navigator.vibrate?.(pattern) } catch { /* unsupported */ }
}

function SplashBurst({ intensity }: { intensity: number }) {
  const count = Math.min(24, 8 + Math.floor(intensity * 16))
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <motion.div
          key={`splash-${i}-${intensity}`}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 4 + (i % 4) * 3,
            height: 4 + (i % 4) * 3,
            background: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
            left: '50%',
            top: '50%',
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: (Math.cos((i / count) * Math.PI * 2) * (60 + intensity * 80)),
            y: (Math.sin((i / count) * Math.PI * 2) * (60 + intensity * 80)),
            opacity: 0,
            scale: 0.2,
          }}
          transition={{ duration: 0.6 + Math.random() * 0.4, ease: 'easeOut' }}
        />
      ))}
    </>
  )
}

export function CustomerShakePage() {
  const navigate = useNavigate()
  const { search } = useLocation()
  const campaignId = getCampaignIdFromSearch(search)

  const [phase, setPhase] = useState<Phase>('idle')
  const [intensity, setIntensity] = useState(0)
  const [won, setWon] = useState(false)
  const [rewardText, setRewardText] = useState('')
  const [rewardEmoji, setRewardEmoji] = useState('🎁')
  const [rewardCode, setRewardCode] = useState<string | undefined>()
  const [playsLeft, setPlaysLeft] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [playStateReady, setPlayStateReady] = useState(false)

  const shakeStartRef = useRef<number | null>(null)
  const motionHandlerRef = useRef<((e: DeviceMotionEvent) => void) | null>(null)
  const resolvedRef = useRef(false)

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
    setPlaysLeft(playState.playsRemaining)
    setError(playState.canPlay ? '' : playState.message)
  }, [playState])

  const shakeMutation = useMutation({
    mutationFn: () => executeShake(campaignId!, playSession!),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['customer-rewards'] })
      queryClient.invalidateQueries({ queryKey: ['play-state', campaignId] })
      setWon(result.won)
      setPlaysLeft(result.playsRemaining)
      if (result.won && result.reward) {
        setRewardText(result.reward.name)
        setRewardEmoji(result.reward.icon)
        setRewardCode(result.code ?? undefined)
      }
      setPhase('revealing')
      vibrate(result.won ? [100, 50, 100, 50, 200] : [80])
      setTimeout(() => setPhase('result'), 600)
    },
    onError: (err) => {
      setError(getApiErrorMessage(err, 'Could not complete shake. Try again.'))
      setPhase('idle')
      resolvedRef.current = false
      shakeStartRef.current = null
    },
  })

  const finishShake = useCallback(() => {
    if (resolvedRef.current || shakeMutation.isPending) return
    resolvedRef.current = true
    setPhase('suspending')
    shakeMutation.mutate()
  }, [shakeMutation])

  const startShakeSequence = useCallback(() => {
    if (phase !== 'idle' || !playStateReady || playsLeft === null || playsLeft <= 0 || !playSession || resolvedRef.current) return
    setPhase('charging')
    vibrate(30)
    setTimeout(() => {
      setPhase('shaking')
      shakeStartRef.current = Date.now()
      vibrate([40, 20, 40, 20, 40])
    }, CHARGE_MS)
  }, [phase, playsLeft, playSession, playStateReady])

  // Accelerometer
  useEffect(() => {
    if (phase !== 'shaking' && phase !== 'charging') return

    const handler = (e: DeviceMotionEvent) => {
      const acc = e.accelerationIncludingGravity
      if (!acc) return
      const magnitude = Math.sqrt((acc.x ?? 0) ** 2 + (acc.y ?? 0) ** 2 + (acc.z ?? 0) ** 2)
      if (magnitude > SHAKE_THRESHOLD) {
        setIntensity(i => Math.min(1, i + 0.08))
        if (phase === 'charging') {
          setPhase('shaking')
          shakeStartRef.current = Date.now()
        }
        if (shakeStartRef.current && Date.now() - shakeStartRef.current >= SHAKE_DURATION_MS) {
          finishShake()
        }
      }
    }

    motionHandlerRef.current = handler

    const requestPermission = async () => {
      const dm = DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> }
      if (typeof dm.requestPermission === 'function') {
        try {
          const perm = await dm.requestPermission()
          if (perm === 'granted') window.addEventListener('devicemotion', handler)
        } catch { /* tap fallback */ }
      } else {
        window.addEventListener('devicemotion', handler)
      }
    }

    requestPermission()
    return () => window.removeEventListener('devicemotion', handler)
  }, [phase, finishShake])

  // Tap fallback timer — completes shake after duration if no accelerometer
  useEffect(() => {
    if (phase !== 'shaking') return
    const timer = setTimeout(finishShake, SHAKE_DURATION_MS + 200)
    return () => clearTimeout(timer)
  }, [phase, finishShake])

  const handleTap = () => {
    if (phase === 'idle') startShakeSequence()
    else if (phase === 'shaking') {
      setIntensity(i => Math.min(1, i + 0.15))
      vibrate(20)
    }
  }

  const handlePlayAgain = () => {
    if (playsLeft === null || playsLeft <= 0) {
      navigate('/customer/wallet')
      return
    }
    resolvedRef.current = false
    shakeStartRef.current = null
    setIntensity(0)
    setPhase('idle')
    setWon(false)
  }

  if (campaignLoading || stateLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(145deg, #1A0545 0%, #2D1B69 45%, #0D0B1E 100%)' }}>
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
    return <NoWin onClose={handlePlayAgain} playsLeft={playsLeft ?? undefined} />
  }

  const isShaking = phase === 'shaking' || phase === 'charging'
  const isSuspense = phase === 'suspending' || phase === 'revealing'
  const winRate = campaign?.winRatePercent ?? 30

  const phaseCopy: Record<Phase, string> = {
    idle: playStateReady
      ? (playsLeft && playsLeft > 0 ? 'Shake your phone or tap to start!' : 'No plays left today')
      : 'Loading your play status…',
    charging: 'Get ready…',
    shaking: intensity > 0.6 ? 'Almost there…' : 'Keep shaking!',
    suspending: 'Revealing your reward…',
    revealing: won ? 'You won!' : '…',
    result: '',
  }

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-between px-5 pt-10 pb-10 overflow-hidden relative"
      style={{ background: 'linear-gradient(160deg, #1A0545 0%, #2D1B69 35%, #0D0B1E 100%)' }}
      animate={isShaking ? {
        x: [0, -3, 4, -4, 3, -2, 2, 0],
        y: [0, 2, -2, 3, -2, 1, -1, 0],
      } : {}}
      transition={isShaking ? { duration: 0.12, repeat: Infinity } : {}}
    >
      {/* Floating prize emojis in idle */}
      {phase === 'idle' && ['🎁', '☕', '🏆', '✨'].map((emoji, i) => (
        <motion.span
          key={emoji}
          className="absolute text-2xl pointer-events-none select-none opacity-20"
          style={{ left: `${15 + i * 22}%`, top: `${20 + (i % 2) * 40}%` }}
          animate={{ y: [0, -15, 0], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          {emoji}
        </motion.span>
      ))}

      {/* Ambient glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: isShaking ? [0.3, 0.6, 0.3] : 0.15 }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{
          background: `radial-gradient(circle at 50% 60%, rgba(139,92,246,${0.15 + intensity * 0.35}) 0%, transparent 55%)`,
        }}
      />

      <div className="w-full flex items-center justify-between mb-2 relative z-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-white/50 hover:text-white/70 transition-colors text-sm bg-transparent border-0 cursor-pointer"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <div className="glass rounded-full px-3 py-1.5 min-w-[120px] text-center">
          {!playStateReady ? (
            <p className="text-xs text-white/50 font-medium">Checking plays…</p>
          ) : (
            <p className="text-xs text-white/70 font-medium">
              {playsLeft} play{playsLeft !== 1 ? 's' : ''} left today
            </p>
          )}
        </div>
      </div>

      <div className="text-center relative z-10 px-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/25 mb-3"
        >
          <span className="text-[10px] font-bold text-amber-200 uppercase tracking-wider">🎯 {winRate}% win chance</span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-extrabold mb-1 bg-gradient-to-r from-white via-purple-100 to-amber-200 bg-clip-text text-transparent"
        >
          Shake &amp; Win!
        </motion.h1>
        <motion.p
          key={phase}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-white/60"
        >
          {error || phaseCopy[phase]}
        </motion.p>
        {campaign && (
          <p className="text-xs text-white/30 mt-1">{campaign.name}</p>
        )}
      </div>

      {/* Intensity bar */}
      {isShaking && (
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          className="w-48 h-1.5 rounded-full bg-white/10 overflow-hidden relative z-10"
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              width: `${intensity * 100}%`,
              background: 'linear-gradient(90deg, #7C3AED, #F5C518)',
              boxShadow: '0 0 12px rgba(245,197,24,0.6)',
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          />
        </motion.div>
      )}

      <div className="relative flex items-center justify-center my-4 z-10">
        {/* Idle pulse rings */}
        {phase === 'idle' && [0, 0.5, 1].map((delay, i) => (
          <motion.div
            key={`idle-ring-${i}`}
            className="absolute rounded-[2.5rem] border border-purple-400/20 pointer-events-none"
            style={{ width: '11rem', height: '18rem' }}
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 1.6 + i * 0.2, opacity: 0 }}
            transition={{ duration: 2, delay, repeat: Infinity, ease: 'easeOut' }}
          />
        ))}

        {/* Ripple rings when shaking */}
        {isShaking && [0, 0.3, 0.6, 0.9].map((delay, i) => (
          <motion.div
            key={i}
            className="absolute rounded-[2.5rem] border-2 border-purple-400/40 pointer-events-none"
            style={{ width: '11rem', height: '18rem' }}
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 2.4, opacity: 0 }}
            transition={{ duration: 1.2, delay, repeat: Infinity }}
          />
        ))}

        {/* Splash bursts on intensity spikes */}
        {isShaking && intensity > 0.3 && <SplashBurst intensity={intensity} />}

        {/* Floating particles */}
        {isShaking && Array.from({ length: 12 }, (_, i) => (
          <motion.div
            key={`p-${i}`}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 6 + (i % 3) * 2,
              height: 6 + (i % 3) * 2,
              background: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
              left: `calc(50% + ${Math.sin(i) * 40}px)`,
              bottom: '55%',
            }}
            initial={{ y: 0, opacity: 1 }}
            animate={{
              y: -100 - i * 12,
              opacity: 0,
              x: (i % 2 === 0 ? 1 : -1) * (30 + i * 6),
            }}
            transition={{ duration: 1, delay: i * 0.08, repeat: Infinity, ease: 'easeOut' }}
          />
        ))}

        <motion.button
          onClick={handleTap}
          disabled={isSuspense || !playStateReady || playsLeft === null || playsLeft <= 0}
          animate={
            isShaking
              ? {
                  x: [0, -18, 20, -16, 18, -12, 14, -8, 10, 0],
                  y: [0, 12, -10, 14, -12, 10, -8, 6, -4, 0],
                  rotate: [0, -12, 14, -10, 12, -8, 10, -6, 8, 0],
                }
              : isSuspense
                ? { scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }
                : { y: [0, -10, 0] }
          }
          transition={
            isShaking
              ? { duration: 0.3, repeat: Infinity, ease: 'easeInOut' }
              : isSuspense
                ? { duration: 0.5, repeat: Infinity }
                : { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
          }
          whileTap={phase === 'idle' ? { scale: 0.94 } : {}}
          className="relative flex flex-col items-center justify-center border-0 cursor-pointer"
          style={{
            width: '11rem',
            height: '18rem',
            borderRadius: '2.5rem',
            background: 'linear-gradient(145deg, #2D1B69, #1A0545)',
            border: '2px solid rgba(167,139,250,0.4)',
            boxShadow: isShaking
              ? `0 0 ${60 + intensity * 80}px rgba(139,92,246,${0.5 + intensity * 0.4}), 0 30px 60px rgba(0,0,0,0.8)`
              : '0 0 40px rgba(139,92,246,0.3), 0 20px 40px rgba(0,0,0,0.6)',
          }}
        >
          <div className="absolute top-4 w-20 h-1.5 rounded-full" style={{ background: 'rgba(0,0,0,0.4)' }} />
          <div className="absolute bottom-5 w-12 h-1 rounded-full" style={{ background: 'rgba(0,0,0,0.4)' }} />

          <AnimatePresence mode="wait">
            {isSuspense ? (
              <motion.div
                key="suspense"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="flex flex-col items-center gap-3"
              >
                <span className="text-6xl select-none">✨</span>
                <div className="flex gap-1.5">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-gold"
                      style={{ background: '#F5C518' }}
                      animate={{ scale: [1, 1.8, 1], opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 0.5, delay: i * 0.12, repeat: Infinity }}
                    />
                  ))}
                </div>
              </motion.div>
            ) : isShaking ? (
              <motion.div
                key="shaking"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-3"
              >
                <motion.span
                  className="text-5xl select-none"
                  animate={{ scale: [1, 1.4, 1], rotate: [0, 30, -30, 0] }}
                  transition={{ duration: 0.35, repeat: Infinity }}
                >
                  🎁
                </motion.span>
                <p className="text-xs font-semibold text-white/80">Shaking!</p>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-3"
              >
                <motion.span
                  className="text-5xl select-none"
                  animate={{ rotate: [0, -15, 15, -10, 10, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 0.8 }}
                >
                  📱
                </motion.span>
                <div className="text-center">
                  <p className="text-sm font-bold text-white">Tap to Shake!</p>
                  <p className="text-[10px] text-white/40 mt-1">or shake your phone</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center relative z-10"
      >
        <p className="text-xs text-white/30">
          Win chance: {winRate}% per play · Server decides outcome fairly
        </p>
      </motion.div>
    </motion.div>
  )
}
