import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { WinCelebration, NoWin } from '@/components/customer/win-celebration'
import { FloatingPrizes, StarField } from '@/components/customer/shake-effects'
import { ShakeChargeRing } from '@/components/customer/ShakeChargeRing'
import { SimulateShakeButton } from '@/components/customer/SimulateShakeButton'
import { getCampaignIdFromSearch, getPlaySession } from '@/lib/customer-game'
import { fetchPublicCampaign, fetchPlayState, executeShake, getApiErrorMessage, type PlayState } from '@/lib/api'
import { getUser } from '@/lib/auth'
import { useBusinessesWithCampaigns } from '@/hooks/useCustomerData'
import { findBusinessForCampaign, getCustomerBusinessPath } from '@/lib/customer-ui'
import { formatShakeWinLabel } from '@/lib/campaign-impact'
import { useShakeCharge } from '@/hooks/useShakeCharge'

type Phase = 'idle' | 'submitting' | 'result'

const GAME_BG = 'linear-gradient(165deg, #43036d 0%, #2d110e 38%, #1c0038 100%)'

function fireConfetti() {
  confetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.5 },
    colors: ['#7C3AED', '#F5C518', '#d4a8ff', '#e8b050', '#631cbb'],
  })
}

export function CustomerShakePage() {
  const navigate = useNavigate()
  const { search } = useLocation()
  const campaignId = getCampaignIdFromSearch(search)

  const [phase, setPhase] = useState<Phase>('idle')
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

  const submittingRef = useRef(false)
  const resetIntensityRef = useRef<() => void>(() => {})
  const mutateShakeRef = useRef<() => void>(() => {})

  const customerId = getUser('customer')?.userId
  const playSession = campaignId ? getPlaySession(campaignId) : null
  const queryClient = useQueryClient()
  const { data: businesses } = useBusinessesWithCampaigns()

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
    if (phase === 'result' || phase === 'submitting') return
    if (!campaignId) {
      navigate('/customer')
      return
    }
    if (!playSession) {
      navigate(`/customer/campaigns/${campaignId}`)
    }
  }, [campaignId, playSession, navigate, phase])

  useEffect(() => {
    if (!playState) return
    setPlayStateReady(true)
    setCanPlay(playState.canPlay)
    setBlockReason(playState.blockReason ?? null)
    setPlaysLeft(playState.playsRemaining)
    setAttempts({ used: playState.playsUsedToday, total: playState.playsPerDay })
    setError(playState.canPlay ? '' : playState.message)
  }, [playState])

  const shakeMutation = useMutation({
    mutationFn: () => executeShake(campaignId!, playSession!),
    onSuccess: result => {
      queryClient.invalidateQueries({ queryKey: ['customer-rewards'] })
      queryClient.invalidateQueries({ queryKey: ['play-state', campaignId] })
      setWon(result.won)
      setPlaysLeft(result.playsRemaining)
      setCanPlay(result.playsRemaining > 0)
      setBlockReason(result.playsRemaining > 0 ? null : 'no_plays_remaining')
      setAttempts({ used: result.playsUsedToday, total: result.playsPerDay })
      if (result.won && result.reward) {
        setRewardText(result.reward.name)
        setRewardEmoji(result.reward.icon)
        setRewardCode(result.code ?? undefined)
        fireConfetti()
      }
      submittingRef.current = false
      setPhase('result')
    },
    onError: err => {
      submittingRef.current = false
      setError(getApiErrorMessage(err, 'Could not complete shake. Try again.'))
      setPhase('idle')
      resetIntensityRef.current()
    },
  })

  mutateShakeRef.current = () => shakeMutation.mutate()

  const handleChargeComplete = useCallback(() => {
    if (
      submittingRef.current ||
      phase !== 'idle' ||
      !playStateReady ||
      !canPlay ||
      playsLeft === null ||
      playsLeft <= 0 ||
      !playSession ||
      !campaignId
    ) {
      return
    }
    submittingRef.current = true
    setPhase('submitting')
    mutateShakeRef.current()
  }, [phase, playStateReady, canPlay, playsLeft, playSession, campaignId])

  const shakeEnabled =
    phase === 'idle' && playStateReady && canPlay && playsLeft !== null && playsLeft > 0

  const { permissionState, requestPermission, intensity, simulateShake, resetIntensity } =
    useShakeCharge(handleChargeComplete, { enabled: shakeEnabled })

  resetIntensityRef.current = resetIntensity

  const businessName = findBusinessForCampaign(businesses, campaignId ?? '', campaign?.businessId)?.name

  const handleBackToCafe = useCallback(() => {
    const dest = getCustomerBusinessPath(campaign?.businessId)
    navigate(dest, { replace: true })
  }, [navigate, campaign?.businessId])

  const handlePlayAgain = () => {
    if (playsLeft === null || playsLeft <= 0) return
    submittingRef.current = false
    resetIntensity()
    setPhase('idle')
    setWon(false)
    setError('')
  }

  if (phase === 'result' && won) {
    return (
      <WinCelebration
        reward={rewardText}
        emoji={rewardEmoji}
        code={rewardCode}
        businessName={businessName}
        onBackToCafe={handleBackToCafe}
      />
    )
  }

  if (phase === 'result' && !won) {
    return (
      <NoWin
        onTryAgain={handlePlayAgain}
        onBackToCafe={handleBackToCafe}
        playsLeft={playsLeft ?? undefined}
        attempts={attempts ?? undefined}
      />
    )
  }

  if (campaignLoading || stateLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#1c0038]">
        <Loader2 className="w-10 h-10 text-[#d4a8ff] animate-spin" />
      </div>
    )
  }

  const winLabel = campaign?.overallWinners != null && campaign?.userCap != null
    ? formatShakeWinLabel(campaign.overallWinners, campaign.userCap)
    : `${campaign?.winRatePercent ?? 30}% of players win`
  const showSimulate =
    permissionState === 'unsupported' || permissionState === 'granted'

  const statusMessage = error
    ? error
    : !playStateReady
      ? 'Loading your play status…'
      : !canPlay || (playsLeft !== null && playsLeft <= 0)
        ? blockReason === 'daily_participant_limit' || blockReason === 'user_cap'
          ? 'Campaign is full — no new players today'
          : 'No plays left today'
        : permissionState === 'denied'
          ? 'Motion access denied. Enable in Safari → Settings → Motion & Orientation.'
          : permissionState === 'needs-prompt'
            ? 'Tap below to enable shake detection.'
            : permissionState === 'unsupported'
              ? 'Motion API not available — use the simulate button.'
              : 'Shake your phone to win!'

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-between px-4 sm:px-5 pt-[max(2.5rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))] overflow-hidden relative max-w-md mx-auto w-full"
      style={{ background: GAME_BG }}
    >
      <StarField />
      <FloatingPrizes visible={phase === 'idle'} />

      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: intensity > 0 ? 0.12 + intensity * 0.003 : 0.1 }}
        style={{
          background: `radial-gradient(circle at 50% 55%, rgba(124,58,237,${0.1 + intensity * 0.003}) 0%, transparent 58%)`,
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
            🎯 {winLabel}
          </span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl sm:text-3xl font-extrabold mb-1 bg-gradient-to-r from-white via-purple-100 to-amber-200 bg-clip-text text-transparent shake-title-shimmer"
        >
          Shake &amp; Win!
        </motion.h1>
        <motion.p
          key={statusMessage}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-xs sm:text-sm min-h-[1.25rem] ${error ? 'text-red-300/90' : 'text-white/65'}`}
        >
          {statusMessage}
        </motion.p>
        {campaign && (
          <p className="text-[10px] text-white/30 mt-1 truncate max-w-[18rem] mx-auto">{campaign.name}</p>
        )}
      </div>

      <div className="relative flex-1 flex flex-col items-center justify-center gap-8 my-4 z-10 w-full">
        <ShakeChargeRing intensity={intensity} loading={phase === 'submitting'} />

        <div className="flex flex-col items-center gap-3">
          {phase === 'idle' && permissionState === 'needs-prompt' && shakeEnabled && (
            <button
              type="button"
              onClick={() => void requestPermission()}
              className="px-6 py-2.5 rounded-lg text-sm font-medium bg-white text-[#43036d] hover:bg-white/90 transition-colors cursor-pointer border-0"
            >
              Enable Shake Detection
            </button>
          )}
          {phase === 'idle' && showSimulate && shakeEnabled && (
            <SimulateShakeButton onTick={simulateShake} />
          )}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="text-center relative z-10 shrink-0 px-2"
      >
        <p className="text-[9px] sm:text-xs text-white/30 leading-relaxed">
          Shake for ~2.5 seconds to reveal your reward
        </p>
      </motion.div>
    </div>
  )
}
