import { useCallback, useEffect, useState } from 'react'
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

type Phase = 'splash' | 'surprise' | 'big-win'

export function StampCollectOverlay({
  campaignId,
  playSessionToken,
  stampsBefore,
  enrolledBefore,
  totalStamps,
  onDone,
}: StampCollectOverlayProps) {
  const queryClient = useQueryClient()
  const [phase, setPhase] = useState<Phase>('splash')
  const [pending, setPending] = useState(true)
  const [toCount, setToCount] = useState(stampsBefore)
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
    setToCount(result.stampsCollected)
    setPending(false)

    if (result.won && result.reward) {
      setReward({
        name: result.reward.name,
        emoji: result.trigger === 'big' ? '🏆' : result.reward.icon || '🎁',
        code: result.code ?? undefined,
        trigger: result.trigger === 'big' ? 'big' : 'surprise',
      })
    }
  }, [campaignId, queryClient])

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

  if (phase === 'splash') {
    return (
      <StampCollectedSplash
        fromCount={stampsBefore}
        toCount={toCount}
        totalStamps={totalStamps}
        enrolled={enrolledBefore}
        pending={pending}
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
