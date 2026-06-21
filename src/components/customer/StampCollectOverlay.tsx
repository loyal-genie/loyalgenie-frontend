import { useCallback, useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { WinCelebration } from '@/components/customer/win-celebration'
import { StampCollectedSplash } from '@/components/customer/stamp-collected-splash'
import { executeStamp, getApiErrorMessage, type StampCollectResult } from '@/lib/api'
import { clearPlaySession } from '@/lib/customer-game'

interface StampCollectOverlayProps {
  campaignId: string
  businessId?: string
  playSessionToken: string
  stampsBefore: number
  enrolledBefore: boolean
  totalStamps: number
  onDone: (opts?: { error?: string }) => void
}

type Phase = 'collecting' | 'splash' | 'surprise' | 'big-win'

export function StampCollectOverlay({
  campaignId,
  playSessionToken,
  stampsBefore,
  enrolledBefore,
  totalStamps,
  onDone,
}: StampCollectOverlayProps) {
  const queryClient = useQueryClient()
  const [phase, setPhase] = useState<Phase>('collecting')
  const [splashData, setSplashData] = useState<{ from: number; to: number; enrolled: boolean } | null>(null)
  const [reward, setReward] = useState<{
    name: string
    emoji: string
    code?: string
    trigger: 'surprise' | 'big'
  } | null>(null)

  const finishAndExit = useCallback(() => {
    clearPlaySession(campaignId)
    queryClient.invalidateQueries({ queryKey: ['stamp-state', campaignId] })
    queryClient.invalidateQueries({ queryKey: ['businesses-with-campaigns'] })
    onDone()
  }, [campaignId, onDone, queryClient])

  const handleSuccess = useCallback((result: StampCollectResult) => {
    queryClient.invalidateQueries({ queryKey: ['stamp-state', campaignId] })

    if (result.won && result.reward) {
      setReward({
        name: result.reward.name,
        emoji: result.trigger === 'big' ? '🏆' : result.reward.icon || '🎁',
        code: result.code ?? undefined,
        trigger: result.trigger === 'big' ? 'big' : 'surprise',
      })
    }

    setSplashData({
      from: stampsBefore,
      to: result.stampsCollected,
      enrolled: enrolledBefore,
    })
    setPhase('splash')
  }, [campaignId, enrolledBefore, queryClient, stampsBefore])

  useEffect(() => {
    let cancelled = false

    executeStamp(campaignId, playSessionToken)
      .then(result => {
        if (!cancelled) handleSuccess(result)
      })
      .catch(err => {
        if (!cancelled) {
          clearPlaySession(campaignId)
          onDone({ error: getApiErrorMessage(err, 'Could not collect stamp') })
        }
      })

    return () => {
      cancelled = true
    }
  }, [campaignId, playSessionToken, handleSuccess, onDone])

  const finishSplash = useCallback(() => {
    if (reward) {
      setPhase(reward.trigger === 'big' ? 'big-win' : 'surprise')
      return
    }
    finishAndExit()
  }, [reward, finishAndExit])

  if (phase === 'collecting') {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 px-6"
        style={{ background: 'linear-gradient(165deg, #43036d 0%, #2d110e 38%, #1c0038 100%)' }}
      >
        <Loader2 className="size-10 text-[#fad499] animate-spin" />
        <p className="text-sm font-semibold text-white/90">Collecting your stamp…</p>
      </div>
    )
  }

  if (phase === 'splash' && splashData) {
    return (
      <StampCollectedSplash
        fromCount={splashData.from}
        toCount={splashData.to}
        totalStamps={totalStamps}
        enrolled={splashData.enrolled}
        onComplete={finishSplash}
      />
    )
  }

  if ((phase === 'surprise' || phase === 'big-win') && reward) {
    return (
      <WinCelebration
        reward={reward.name}
        emoji={reward.emoji}
        code={reward.code}
        onClose={finishAndExit}
        closeLabel="Done"
      />
    )
  }

  return null
}
