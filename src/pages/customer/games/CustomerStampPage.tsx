import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Loader2, Clock, AlertTriangle } from 'lucide-react'
import { WinCelebration } from '@/components/customer/win-celebration'
import { StampCollectedSplash } from '@/components/customer/stamp-collected-splash'
import { StampGameGrid } from '@/components/customer/StampGameGrid'
import {
  executeStamp,
  fetchPublicCampaign,
  fetchStampState,
  getApiErrorMessage,
  type StampCollectResult,
} from '@/lib/api'
import { getPlaySession, clearPlaySession } from '@/lib/customer-game'
import { fmtCampaignDate } from '@/lib/campaign-dates'

type Phase = 'ready' | 'card' | 'collecting' | 'stamp-splash' | 'surprise' | 'big-win' | 'expired'

const AUTO_COLLECT_DELAY_MS = 650
const PIN_READY_DELAY_MS = 400

interface SplashData {
  from: number
  to: number
  enrolled: boolean
}

interface PendingReward {
  name: string
  emoji: string
  code?: string
  trigger: 'surprise' | 'big'
}

export function CustomerStampPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const campaignId = searchParams.get('campaign') ?? ''
  const shouldAutoCollect = searchParams.get('collect') === '1'
  const queryClient = useQueryClient()
  const autoCollectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autoCollectedRef = useRef(false)
  const stampsBeforeCollectRef = useRef(0)
  const enrolledBeforeCollectRef = useRef(false)

  useEffect(() => {
    autoCollectedRef.current = false
  }, [shouldAutoCollect, campaignId])

  const [phase, setPhase] = useState<Phase>('ready')
  const [displayStamps, setDisplayStamps] = useState(0)
  const [splashData, setSplashData] = useState<SplashData | null>(null)
  const [pendingReward, setPendingReward] = useState<PendingReward | null>(null)
  const [lastReward, setLastReward] = useState<PendingReward | null>(null)
  const [highlightStamp, setHighlightStamp] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [showPinReady, setShowPinReady] = useState(shouldAutoCollect)

  const playSession = campaignId ? getPlaySession(campaignId) : null

  const { data: campaign, isLoading: campaignLoading } = useQuery({
    queryKey: ['public-campaign', campaignId],
    queryFn: () => fetchPublicCampaign(campaignId),
    enabled: Boolean(campaignId),
  })

  const { data: stampState, isLoading: stateLoading, refetch } = useQuery({
    queryKey: ['stamp-state', campaignId],
    queryFn: () => fetchStampState(campaignId),
    enabled: Boolean(campaignId),
    staleTime: 0,
  })

  useEffect(() => {
    if (stampState && phase !== 'stamp-splash' && phase !== 'collecting' && phase !== 'surprise' && phase !== 'big-win') {
      setDisplayStamps(stampState.stampsCollected)
    }
  }, [stampState?.stampsCollected]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!shouldAutoCollect) return
    const t = setTimeout(() => setShowPinReady(false), PIN_READY_DELAY_MS)
    return () => clearTimeout(t)
  }, [shouldAutoCollect])

  const goBackAfterCollect = useCallback(() => {
    clearPlaySession(campaignId)
    queryClient.invalidateQueries({ queryKey: ['stamp-state', campaignId] })
    queryClient.invalidateQueries({ queryKey: ['businesses-with-campaigns'] })
    if (campaign?.businessId) {
      navigate(`/customer/business/${campaign.businessId}`, { replace: true })
    } else {
      navigate('/customer', { replace: true })
    }
  }, [campaignId, campaign?.businessId, navigate, queryClient])

  const finishStampSplash = useCallback(() => {
    if (!splashData) return
    setDisplayStamps(splashData.to)
    setHighlightStamp(splashData.to)
    setSplashData(null)

    if (pendingReward) {
      setLastReward(pendingReward)
      setPendingReward(null)
      setPhase(pendingReward.trigger === 'big' ? 'big-win' : 'surprise')
      return
    }
    goBackAfterCollect()
  }, [splashData, pendingReward, goBackAfterCollect])

  const handleCollectSuccess = useCallback((result: StampCollectResult, wasEnrolled: boolean, from: number) => {
    const to = result.stampsCollected

    queryClient.invalidateQueries({ queryKey: ['stamp-state', campaignId] })
    refetch()

    if (result.won && result.reward) {
      setPendingReward({
        name: result.reward.name,
        emoji: result.trigger === 'big' ? '🏆' : result.reward.icon || '🎁',
        code: result.code ?? undefined,
        trigger: result.trigger === 'big' ? 'big' : 'surprise',
      })
    } else {
      setPendingReward(null)
    }

    setSplashData({ from, to, enrolled: wasEnrolled })
    setPhase('stamp-splash')

    navigate(`/customer/games/stamp?campaign=${campaignId}`, { replace: true })
  }, [campaignId, navigate, queryClient, refetch])

  const collectMutation = useMutation({
    mutationFn: () => {
      if (!playSession) return Promise.reject(new Error('NO_SESSION'))
      return executeStamp(campaignId, playSession)
    },
    onSuccess: (result) => {
      handleCollectSuccess(
        result,
        enrolledBeforeCollectRef.current,
        stampsBeforeCollectRef.current,
      )
    },
    onError: (err) => {
      setError(getApiErrorMessage(err, 'Could not collect stamp'))
      if (shouldAutoCollect) {
        clearPlaySession(campaignId)
        navigate(`/customer/campaigns/${campaignId}`, { replace: true })
        return
      }
      setPhase(stampState?.canCollectToday ? 'ready' : 'card')
    },
  })

  const startCollect = useCallback(() => {
    if (!stampState?.canCollectToday || stampState.cardComplete || collectMutation.isPending) return
    stampsBeforeCollectRef.current = stampState.stampsCollected
    enrolledBeforeCollectRef.current = stampState.enrolled
    setError('')
    setPhase('collecting')
    collectMutation.mutate()
  }, [stampState, collectMutation])

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
    if (stampState?.status === 'expired') {
      setPhase('expired')
    }
  }, [stampState?.status])

  useEffect(() => {
    if (!stampState) return
    if (phase === 'stamp-splash' || phase === 'collecting' || phase === 'surprise' || phase === 'big-win') return

    if (stampState.canCollectToday) {
      setPhase('ready')
    } else {
      setPhase('card')
    }
  }, [stampState?.canCollectToday, stampState?.cardComplete]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!shouldAutoCollect || !stampState?.canCollectToday || autoCollectedRef.current) return
    if (phase !== 'ready' || showPinReady) return

    autoCollectTimerRef.current = setTimeout(() => {
      autoCollectedRef.current = true
      startCollect()
    }, AUTO_COLLECT_DELAY_MS)

    return () => {
      if (autoCollectTimerRef.current) clearTimeout(autoCollectTimerRef.current)
    }
  }, [shouldAutoCollect, stampState?.canCollectToday, phase, showPinReady, startCollect])

  if (!campaignId || !playSession) return null

  if (campaignLoading || stateLoading || !stampState || !campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(145deg, #f5f0ff 0%, #ffffff 45%, #fef7f3 100%)' }}>
        <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
      </div>
    )
  }

  if (phase === 'big-win' && lastReward) {
    return (
      <WinCelebration
        reward={lastReward.name}
        emoji={lastReward.emoji}
        code={lastReward.code}
        onClose={goBackAfterCollect}
        closeLabel="Done"
      />
    )
  }

  if (phase === 'surprise' && lastReward) {
    return (
      <WinCelebration
        reward={lastReward.name}
        emoji={lastReward.emoji}
        code={lastReward.code}
        onClose={goBackAfterCollect}
        closeLabel="Done"
      />
    )
  }

  if (phase === 'stamp-splash' && splashData) {
    return (
      <StampCollectedSplash
        fromCount={splashData.from}
        toCount={splashData.to}
        totalStamps={stampState.totalStamps}
        enrolled={splashData.enrolled}
        onComplete={finishStampSplash}
      />
    )
  }

  const total = stampState.totalStamps
  const stamps = displayStamps
  const prefill = stampState.prefillStamps
  const canCollect = stampState.canCollectToday && !stampState.cardComplete
  const showCollectButton = phase === 'ready' || phase === 'collecting'

  const goBack = () => {
    clearPlaySession(campaignId)
    if (campaign.businessId) {
      navigate(`/customer/business/${campaign.businessId}`)
    } else {
      navigate('/customer')
    }
  }

  if (phase === 'expired' || stampState.status === 'expired') {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
        style={{ background: 'linear-gradient(145deg, #f5f0ff 0%, #ffffff 45%, #fef7f3 100%)' }}
      >
        <div className="w-20 h-20 rounded-full bg-red-500/15 border border-red-400/30 flex items-center justify-center mb-6">
          <AlertTriangle className="w-10 h-10 text-red-300" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#2b2827] mb-2">Stamp Card Expired</h1>
        <p className="text-sm text-[#6b6461] max-w-xs mb-2">
          The claim period has ended. This card can no longer collect stamps.
        </p>
        {stampState.claimDeadline && (
          <p className="text-xs text-[#888] flex items-center justify-center gap-1.5 mb-8">
            <Clock className="w-3.5 h-3.5" />
            Claim deadline was {fmtCampaignDate(stampState.claimDeadline)}
          </p>
        )}
        <p className="text-sm text-[#6b6461] mb-6">
          Final progress: <span className="font-bold text-[#5b0e81]">{stamps}/{total}</span> stamps
        </p>
        <button
          type="button"
          onClick={() => navigate('/customer')}
          className="px-6 py-3 rounded-full font-bold text-sm border-0 cursor-pointer bg-[#5b0e81] text-white"
        >
          Back to campaigns
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-dvh flex flex-col bg-white">
      <div className="relative bg-[#43036d] h-56 shrink-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#631cbb]/40 to-transparent" />
        <button
          type="button"
          onClick={goBack}
          className="absolute top-12 left-4 size-9 rounded-full bg-black/25 backdrop-blur-sm flex items-center justify-center border-0 cursor-pointer"
        >
          <ArrowLeft size={16} className="text-[#d4a8ff]" />
        </button>
        <span className="absolute top-12 right-4 bg-[#fef3c7] text-[#92400e] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide">
          Stamp
        </span>
      </div>

      <div className="flex-1 px-5 -mt-6 pb-8">
        <h1 className="text-sm font-bold text-[#101828] mb-1">{campaign.name}</h1>
        <p className="text-xs text-[#6a7282] mb-4">
          {stampState.cardComplete
            ? 'Card complete!'
            : showCollectButton && canCollect
              ? "Open me. You'll like what's inside."
              : `Collect all ${total} stamps for the big reward`}
        </p>

        <motion.div
          className="rounded-[20px] overflow-hidden mb-6 relative bg-[#43036d] p-[18px]"
          animate={{ scale: [1, 1.005, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="absolute bottom-[-30px] right-[-30px] size-[120px] rounded-[60px] bg-[#631cbb]/50 pointer-events-none" />

          <div className="relative">
            <p className="text-[9px] text-[#c084fc] tracking-widest mb-0.5">LOYALTY CARD</p>
            <div className="flex items-center justify-between mb-4">
              <p className="text-base font-bold text-white">{campaign.name}</p>
              <motion.span
                key={stamps}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-xs font-bold text-[#c084fc]"
              >
                {stamps}/{total}
              </motion.span>
            </div>

            <StampGameGrid
              total={total}
              stamps={stamps}
              prefill={prefill}
              surpriseTriggerAt={stampState.surpriseTriggerAt}
              bigTriggerAt={stampState.bigTriggerAt}
              surpriseAwarded={stampState.surpriseAwarded}
              bigAwarded={stampState.bigAwarded}
              highlightStamp={highlightStamp}
            />

            {prefill > 0 && (
              <div className="flex flex-wrap gap-3 text-[9px] text-[#c084fc]/80">
                <span>● Pre-filled ({prefill})</span>
              </div>
            )}
          </div>
        </motion.div>

        {error && (
          <p className="text-sm text-red-500 text-center mb-4">{error}</p>
        )}

        <AnimatePresence mode="wait">
          {showCollectButton && canCollect ? (
            <motion.button
              key="collect"
              initial={{ opacity: 0, y: 12 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: phase === 'collecting' ? 1 : [1, 1.02, 1],
              }}
              transition={{
                opacity: { duration: 0.3 },
                y: { duration: 0.3 },
                scale: phase === 'collecting' ? { duration: 0 } : { duration: 1.2, repeat: Infinity },
              }}
              whileTap={{ scale: 0.96 }}
              onClick={startCollect}
              disabled={phase === 'collecting'}
              className="w-full py-4 rounded-3xl text-base font-bold text-white border-0 cursor-pointer disabled:opacity-80 shadow-[0px_8px_14px_rgba(245,158,11,0.33)]"
              style={{ background: 'linear-gradient(139deg, #c46a0a 0%, #d97706 100%)' }}
            >
              {phase === 'collecting' ? (
                <span className="inline-flex items-center gap-2 justify-center w-full">
                  <Loader2 className="w-5 h-5 animate-spin" /> Collecting…
                </span>
              ) : stampState.enrolled ? (
                'Collect Stamp ☕'
              ) : (
                'Collect Stamp & Start Card ☕'
              )}
            </motion.button>
          ) : (
            <motion.div
              key="status"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full py-4 rounded-3xl text-base font-bold text-center bg-[#f5f0ff] text-[#5b0e81]"
            >
              {stampState.cardComplete
                ? 'Card Complete! 🎉'
                : !stampState.enrolled && !stampState.enrollmentOpen
                  ? 'Enrollment full'
                  : 'Come back tomorrow ☕'}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
