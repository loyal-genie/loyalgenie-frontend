import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { CampaignPinDetailShell } from '@/components/customer/CampaignPinDetailShell'
import { LoyaltyMilestonesList } from '@/components/customer/LoyaltyMilestonesList'
import { LoyaltyPointsCard } from '@/components/customer/LoyaltyPointsCard'
import { LoyaltyPointsSplash } from '@/components/customer/loyalty-points-splash'
import { PinKeypad } from '@/components/customer/PinKeypad'
import {
  executeCheckIn,
  getApiErrorMessage,
  verifyCampaignPin,
  type CustomerBusinessRewardsDto,
  type LoyaltyState,
  type PublicCampaign,
} from '@/lib/api'
import { clearPlaySession, setPlaySession } from '@/lib/customer-game'
import { getCampaignTheme } from '@/lib/campaign-themes'

interface LoyaltyCampaignDetailProps {
  campaign: PublicCampaign
  loyaltyState: LoyaltyState
  onBack: () => void
  onSplashActiveChange?: (active: boolean) => void
}

type Phase = 'overview' | 'checking-in' | 'splash'

function refreshBusinessPointsAfterCheckIn(
  queryClient: QueryClient,
  businessId: string,
  campaignId: string,
  loyaltyPoints: number,
) {
  queryClient.setQueryData<CustomerBusinessRewardsDto>(
    ['customer-business-rewards', businessId],
    old => {
      if (!old) return old
      return {
        ...old,
        points: loyaltyPoints,
        rewards: old.rewards.map(reward => ({
          ...reward,
          claimable: reward.status === 'active' && loyaltyPoints >= reward.pointsRequired,
          lockedByPoints: loyaltyPoints < reward.pointsRequired,
        })),
      }
    },
  )
  void queryClient.invalidateQueries({ queryKey: ['customer-business-rewards', businessId] })
  void queryClient.invalidateQueries({ queryKey: ['loyalty-state', campaignId] })
  void queryClient.invalidateQueries({ queryKey: ['business-campaign-states', businessId] })
  void queryClient.invalidateQueries({ queryKey: ['businesses-with-campaigns'] })
  void queryClient.invalidateQueries({ queryKey: ['customer-rewards'] })
  void queryClient.invalidateQueries({ queryKey: ['customer-loyalty-profile'] })
}

export function LoyaltyCampaignDetail({
  campaign,
  loyaltyState,
  onBack,
  onSplashActiveChange,
}: LoyaltyCampaignDetailProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const theme = getCampaignTheme('check-in-loyalty')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [phase, setPhase] = useState<Phase>('overview')
  const [checkInResult, setCheckInResult] = useState<{
    pointsBefore: number
    loyaltyPoints: number
    businessName: string
    milestonesUnlocked: { name: string; icon: string; code: string }[]
  } | null>(null)

  const verifyMutation = useMutation({
    mutationFn: (enteredPin: string) => verifyCampaignPin(campaign.id, enteredPin),
    onSuccess: async (data) => {
      const pointsBefore = loyaltyState.loyaltyPoints
      setPlaySession(campaign.id, data.playSessionToken)
      setPhase('checking-in')
      try {
        const result = await executeCheckIn(campaign.id, data.playSessionToken)
        if (loyaltyState.businessId) {
          refreshBusinessPointsAfterCheckIn(
            queryClient,
            loyaltyState.businessId,
            campaign.id,
            result.loyaltyPoints,
          )
        }
        setCheckInResult({
          pointsBefore,
          loyaltyPoints: result.loyaltyPoints,
          businessName: loyaltyState.businessName,
          milestonesUnlocked: result.milestonesUnlocked,
        })
        setPhase('splash')
      } catch (err) {
        setError(getApiErrorMessage(err, 'Check-in failed. Please try again.'))
        setPhase('overview')
        setPin('')
      }
    },
    onError: (err) => {
      setError(getApiErrorMessage(err, 'Wrong PIN. Ask staff for the current PIN.'))
      setPin('')
    },
  })

  const handleSplashComplete = useCallback(() => {
    clearPlaySession(campaign.id)
    if (loyaltyState.businessId && checkInResult) {
      refreshBusinessPointsAfterCheckIn(
        queryClient,
        loyaltyState.businessId,
        campaign.id,
        checkInResult.loyaltyPoints,
      )
    } else {
      queryClient.invalidateQueries({ queryKey: ['loyalty-state', campaign.id] })
      queryClient.invalidateQueries({ queryKey: ['businesses-with-campaigns'] })
      queryClient.invalidateQueries({ queryKey: ['customer-rewards'] })
    }
    const dest = loyaltyState.businessId
      ? `/customer/business/${loyaltyState.businessId}`
      : '/customer'
    navigate(dest, { replace: true })
  }, [campaign.id, checkInResult, navigate, loyaltyState.businessId, queryClient])

  const handleKey = (digit: string) => {
    if (pin.length < 3) setPin(prev => prev + digit)
    setError('')
  }

  const handleDelete = () => setPin(prev => prev.slice(0, -1))

  const handleSubmit = () => {
    if (pin.length === 3 && !verifyMutation.isPending && phase === 'overview') {
      verifyMutation.mutate(pin)
    }
  }

  useEffect(() => {
    if (pin.length !== 3 || verifyMutation.isPending || phase !== 'overview') return
    const t = setTimeout(() => verifyMutation.mutate(pin), 300)
    return () => clearTimeout(t)
  }, [pin, phase]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    onSplashActiveChange?.(phase === 'splash')
    return () => onSplashActiveChange?.(false)
  }, [phase, onSplashActiveChange])

  const pinBusy = phase === 'checking-in' || verifyMutation.isPending

  return (
    <>
      <AnimatePresence>
        {phase === 'splash' && checkInResult && (
          <LoyaltyPointsSplash
            pointsBefore={checkInResult.pointsBefore}
            totalPoints={checkInResult.loyaltyPoints}
            businessName={checkInResult.businessName}
            milestonesUnlocked={checkInResult.milestonesUnlocked}
            onComplete={handleSplashComplete}
            onBackToCafe={handleSplashComplete}
          />
        )}
      </AnimatePresence>

      {phase !== 'splash' && (
        <CampaignPinDetailShell
          mechanic="check-in-loyalty"
          title={campaign.name || 'Daily Check-in'}
          subtitle={`Every visit earns ${loyaltyState.pointsPerCheckIn} points toward your rewards.`}
          businessName={loyaltyState.businessName}
          onBack={onBack}
          loading={verifyMutation.isPending}
          coverExtra={
            <span
              className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold"
              style={{ background: `${theme.accent}18`, color: theme.accent }}
            >
              +{loyaltyState.pointsPerCheckIn} pts / visit
            </span>
          }
          footer={
            phase === 'checking-in' ? (
              <div className="flex flex-col items-center py-5">
                <Loader2 className="mb-2 size-8 animate-spin" style={{ color: theme.accent }} />
                <p className="text-sm font-semibold text-gray-900">Checking you in…</p>
              </div>
            ) : (
              <PinKeypad
                pin={pin}
                error={error}
                loading={verifyMutation.isPending}
                disabled={pinBusy}
                compact
                onKey={handleKey}
                onDelete={handleDelete}
                onSubmit={handleSubmit}
                submitLabel="Play Now"
                submitColor={theme.accent}
                submitColorTo={theme.accentTo}
              />
            )
          }
        >
          <LoyaltyPointsCard
            businessName={loyaltyState.businessName}
            points={loyaltyState.loyaltyPoints}
            pointsPerCheckIn={loyaltyState.pointsPerCheckIn}
            milestones={loyaltyState.milestones}
            nextMilestone={loyaltyState.nextMilestone}
            className="mb-3"
          />

          {loyaltyState.milestones.length > 0 && (
            <div
              className="rounded-xl p-3"
              style={{ background: `${theme.accent}0C`, border: `1px solid ${theme.accent}22` }}
            >
              <LoyaltyMilestonesList
                milestones={loyaltyState.milestones}
                currentPoints={loyaltyState.loyaltyPoints}
                compact
              />
            </div>
          )}
        </CampaignPinDetailShell>
      )}
    </>
  )
}
