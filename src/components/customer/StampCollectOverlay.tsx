import { useCallback, useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { StampCollectedSplash, type StampRewardInfo } from '@/components/customer/stamp-collected-splash'
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

export function StampCollectOverlay({
  campaignId,
  playSessionToken,
  stampsBefore,
  enrolledBefore,
  totalStamps,
  onDone,
}: StampCollectOverlayProps) {
  const queryClient = useQueryClient()
  const [pending, setPending] = useState(true)
  const [toCount, setToCount] = useState(stampsBefore)
  const [reward, setReward] = useState<StampRewardInfo | null>(null)

  const onDoneRef = useRef(onDone)
  const collectStartedRef = useRef(false)
  const successRef = useRef(false)

  onDoneRef.current = onDone

  const finishAndExit = useCallback(() => {
    clearPlaySession(campaignId)
    queryClient.invalidateQueries({ queryKey: ['stamp-state', campaignId] })
    queryClient.invalidateQueries({ queryKey: ['businesses-with-campaigns'] })
    queryClient.invalidateQueries({ queryKey: ['customer-rewards'] })
    onDoneRef.current()
  }, [campaignId, queryClient])

  const applySuccess = useCallback((result: StampCollectResult) => {
    successRef.current = true
    setToCount(result.stampsCollected)
    setPending(false)

    if (result.won && result.reward) {
      setReward({
        name: result.reward.name,
        emoji: result.trigger === 'big' ? '🏆' : result.reward.icon || '🎁',
        code: result.code ?? undefined,
      })
    }
  }, [])

  useEffect(() => {
    if (collectStartedRef.current) return
    collectStartedRef.current = true

    let cancelled = false

    executeStamp(campaignId, playSessionToken)
      .then(result => {
        if (!cancelled) applySuccess(result)
      })
      .catch(err => {
        if (cancelled || successRef.current) return
        clearPlaySession(campaignId)
        onDoneRef.current({ error: getApiErrorMessage(err, 'Could not collect stamp') })
      })

    return () => {
      cancelled = true
    }
  }, [campaignId, playSessionToken, applySuccess])

  return (
    <StampCollectedSplash
      fromCount={stampsBefore}
      toCount={toCount}
      totalStamps={totalStamps}
      enrolled={enrolledBefore}
      pending={pending}
      reward={reward}
      onComplete={finishAndExit}
      onBackToVendor={finishAndExit}
    />
  )
}
