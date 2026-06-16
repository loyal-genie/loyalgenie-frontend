import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Loader2, Clock, AlertTriangle } from 'lucide-react'
import { WinCelebration } from '@/components/customer/win-celebration'
import { StampCollectedSplash } from '@/components/customer/stamp-collected-splash'
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

function StampGrid({
  total,
  stamps,
  prefill,
  surpriseFrom,
  surpriseTo,
  bigFrom,
  bigTo,
  surpriseTriggerAt,
  bigTriggerAt,
  surpriseAwarded,
  bigAwarded,
  highlightStamp,
}: {
  total: number
  stamps: number
  prefill: number
  surpriseFrom: number
  surpriseTo: number
  bigFrom: number
  bigTo: number
  surpriseTriggerAt: number | null
  bigTriggerAt: number | null
  surpriseAwarded: boolean
  bigAwarded: boolean
  highlightStamp?: number | null
}) {
  function slotIcon(n: number, isFilled: boolean): string {
    if (!isFilled) {
      const inSurpriseRange = n >= surpriseFrom && n <= surpriseTo
      const inBigRange = n >= bigFrom && n <= bigTo
      return inSurpriseRange ? '?' : inBigRange ? '🏆' : String(n)
    }
    if (surpriseTriggerAt === n && surpriseAwarded) return '🎁'
    if (bigTriggerAt === n && bigAwarded) return '🏆'
    return '✓'
  }

  return (
    <div className="flex flex-wrap gap-2 justify-center mb-4">
      {Array.from({ length: total }, (_, i) => {
        const n = i + 1
        const isFilled = n <= stamps
        const isPrefilled = n <= prefill
        const isEndowedPrefill = isPrefilled && !isFilled
        const isSurpriseRange = n >= surpriseFrom && n <= surpriseTo
        const isBigRange = n >= bigFrom && n <= bigTo
        const isSurpriseTrigger = surpriseTriggerAt === n
        const isBigTrigger = bigTriggerAt === n
        const isHighlighted = highlightStamp === n
        const showSurpriseStyle = isSurpriseRange && (!isFilled || isSurpriseTrigger)
        const showBigStyle = isBigRange && (!isFilled || isBigTrigger)

        return (
          <motion.div
            key={n}
            animate={isHighlighted ? { scale: [1, 1.2, 1], boxShadow: ['0 0 0 rgba(245,197,24,0)', '0 0 24px rgba(245,197,24,0.8)', '0 0 0 rgba(245,197,24,0)'] } : {}}
            transition={{ duration: 0.8, repeat: isHighlighted ? 2 : 0 }}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg border-2 ${
              showBigStyle
                ? isFilled ? 'border-yellow-300/80 bg-yellow-300/20' : 'border-yellow-300/80 bg-black/20'
                : showSurpriseStyle
                  ? isFilled ? 'border-white/60 bg-white/20' : 'border-white/60 border-dashed bg-black/10'
                  : isEndowedPrefill
                    ? 'border-purple-300/80 bg-purple-400/25'
                    : isPrefilled && isFilled
                      ? 'border-purple-300 bg-purple-400/30'
                      : isFilled
                        ? 'border-white/60 bg-white/30'
                        : 'border-white/20 bg-black/20'
            }`}
          >
            {isFilled ? (
              <span>{slotIcon(n, true)}</span>
            ) : isEndowedPrefill ? (
              <span className="text-purple-200 text-sm">✓</span>
            ) : (
              <span className={`text-sm font-bold ${isFilled ? '' : 'text-white/30'}`}>
                {slotIcon(n, false)}
              </span>
            )}
          </motion.div>
        )
      })}
    </div>
  )
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

  const finishStampSplash = useCallback(() => {
    if (!splashData) {
      setPhase('card')
      return
    }
    setDisplayStamps(splashData.to)
    setHighlightStamp(splashData.to)
    setSplashData(null)

    if (pendingReward) {
      setLastReward(pendingReward)
      setPendingReward(null)
      setPhase(pendingReward.trigger === 'big' ? 'big-win' : 'surprise')
      return
    }
    setPhase('card')
    setTimeout(() => setHighlightStamp(null), 1500)
  }, [splashData, pendingReward])

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

  const returnToCard = useCallback(() => {
    setLastReward(null)
    setPhase('card')
    refetch()
  }, [refetch])

  if (!campaignId || !playSession) return null

  if (campaignLoading || stateLoading || !stampState || !campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(145deg, #1A0545 0%, #2D1B69 45%, #0D0B1E 100%)' }}>
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
        onClose={returnToCard}
        closeLabel="Back to Card"
      />
    )
  }

  if (phase === 'surprise' && lastReward) {
    return (
      <WinCelebration
        reward={lastReward.name}
        emoji={lastReward.emoji}
        code={lastReward.code}
        onClose={returnToCard}
        closeLabel="Back to Card"
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
  const [surpriseFrom, surpriseTo] = stampState.surpriseRange
  const [bigFrom, bigTo] = stampState.bigRange
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
        style={{ background: 'linear-gradient(145deg, #1A0545 0%, #2D1B69 45%, #0D0B1E 100%)' }}
      >
        <div className="w-20 h-20 rounded-full bg-red-500/15 border border-red-400/30 flex items-center justify-center mb-6">
          <AlertTriangle className="w-10 h-10 text-red-300" />
        </div>
        <h1 className="text-2xl font-extrabold text-white mb-2">Stamp Card Expired</h1>
        <p className="text-sm text-white/60 max-w-xs mb-2">
          The claim period has ended. This card can no longer collect stamps.
        </p>
        {stampState.claimDeadline && (
          <p className="text-xs text-white/40 flex items-center justify-center gap-1.5 mb-8">
            <Clock className="w-3.5 h-3.5" />
            Claim deadline was {fmtCampaignDate(stampState.claimDeadline)}
          </p>
        )}
        <p className="text-sm text-white/50 mb-6">
          Final progress: <span className="font-bold text-white">{stamps}/{total}</span> stamps
        </p>
        <button
          type="button"
          onClick={() => navigate('/customer')}
          className="px-6 py-3 rounded-2xl font-bold text-sm border-0 cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}
        >
          Back to campaigns
        </button>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex flex-col px-5 pt-12 pb-8"
      style={{ background: 'linear-gradient(145deg, #1A0545 0%, #2D1B69 45%, #0D0B1E 100%)' }}
    >
      <button
        onClick={goBack}
        className="flex items-center gap-1.5 text-white/50 hover:text-white/70 transition-colors text-sm mb-6 self-start"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="text-center mb-6">
        <h1 className="text-2xl font-extrabold text-white mb-1">{campaign.name}</h1>
        <p className="text-sm text-white/60">
          {stampState.cardComplete
            ? 'Card complete!'
            : showCollectButton && canCollect
              ? 'Tap below to collect today\'s stamp'
              : `Collect all ${total} stamps for the big reward`}
        </p>
      </div>

      <motion.div
        className="rounded-3xl overflow-hidden mb-6 relative"
        style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}
        animate={{ scale: [1, 1.01, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <span className="text-8xl opacity-10">🎯</span>
        </div>

        <div className="relative p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold text-white bg-black/20 px-2 py-0.5 rounded-full uppercase tracking-wide">
              STAMP CARD
            </span>
            <motion.span
              key={stamps}
              initial={{ scale: 1.3, color: '#FDE68A' }}
              animate={{ scale: 1, color: 'rgba(255,255,255,0.8)' }}
              className="text-xs font-bold"
            >
              {stamps}/{total}
            </motion.span>
          </div>

          <StampGrid
            total={total}
            stamps={stamps}
            prefill={prefill}
            surpriseFrom={surpriseFrom}
            surpriseTo={surpriseTo}
            bigFrom={bigFrom}
            bigTo={bigTo}
            surpriseTriggerAt={stampState.surpriseTriggerAt}
            bigTriggerAt={stampState.bigTriggerAt}
            surpriseAwarded={stampState.surpriseAwarded}
            bigAwarded={stampState.bigAwarded}
            highlightStamp={highlightStamp}
          />

          <div className="flex flex-wrap gap-3 text-[10px] text-white/70">
            {prefill > 0 && <span>● Pre-filled ({prefill})</span>}
            <span>● Surprise range</span>
            <span>● Big reward range</span>
          </div>
        </div>
      </motion.div>

      {error && (
        <p className="text-sm text-red-300 text-center mb-4">{error}</p>
      )}

      <AnimatePresence mode="wait">
        {showCollectButton && canCollect ? (
          <motion.button
            key="collect"
            initial={{ opacity: 0, y: 12 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: phase === 'collecting' ? 1 : [1, 1.03, 1],
            }}
            transition={{
              opacity: { duration: 0.3 },
              y: { duration: 0.3 },
              scale: phase === 'collecting' ? { duration: 0 } : { duration: 1.2, repeat: Infinity },
            }}
            whileTap={{ scale: 0.96 }}
            onClick={startCollect}
            disabled={phase === 'collecting'}
            className="w-full py-5 rounded-2xl text-base font-bold transition-all disabled:opacity-80"
            style={{
              background: 'linear-gradient(135deg, #F5C518, #F59E0B)',
              color: '#08071A',
              boxShadow: '0 8px 32px rgba(245,197,24,0.35)',
            }}
          >
            {phase === 'collecting' ? (
              <span className="inline-flex items-center gap-2 justify-center w-full">
                <Loader2 className="w-5 h-5 animate-spin" /> Collecting…
              </span>
            ) : stampState.enrolled ? (
              'Collect Stamp ✦'
            ) : (
              'Collect Stamp & Start Card ✦'
            )}
          </motion.button>
        ) : (
          <motion.div
            key="status"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full py-5 rounded-2xl text-base font-bold text-center"
            style={{
              background: stampState.cardComplete ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.7)',
            }}
          >
            {stampState.cardComplete
              ? 'Card Complete! 🎉'
              : !stampState.enrolled && !stampState.enrollmentOpen
                ? 'Enrollment full'
                : 'Come back tomorrow ✦'}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
