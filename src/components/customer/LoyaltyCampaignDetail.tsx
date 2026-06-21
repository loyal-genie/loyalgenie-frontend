import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence } from 'framer-motion'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { LoyaltyMilestonesList } from '@/components/customer/LoyaltyMilestonesList'
import { LoyaltyPointsCard } from '@/components/customer/LoyaltyPointsCard'
import { LoyaltyPointsSplash } from '@/components/customer/loyalty-points-splash'
import { PinKeypad } from '@/components/customer/PinKeypad'
import {
  executeCheckIn,
  getApiErrorMessage,
  verifyCampaignPin,
  type LoyaltyState,
  type PublicCampaign,
} from '@/lib/api'
import { clearPlaySession, setPlaySession } from '@/lib/customer-game'
import { getCustomerMechanicChipLabel } from '@/lib/customer-ui'

interface LoyaltyCampaignDetailProps {
  campaign: PublicCampaign
  loyaltyState: LoyaltyState
  onBack: () => void
  onSplashActiveChange?: (active: boolean) => void
}

type Phase = 'overview' | 'checking-in' | 'splash'

export function LoyaltyCampaignDetail({
  campaign,
  loyaltyState,
  onBack,
  onSplashActiveChange,
}: LoyaltyCampaignDetailProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
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
    queryClient.invalidateQueries({ queryKey: ['loyalty-state', campaign.id] })
    queryClient.invalidateQueries({ queryKey: ['businesses-with-campaigns'] })
    queryClient.invalidateQueries({ queryKey: ['customer-rewards'] })
    const dest = loyaltyState.businessId
      ? `/customer/business/${loyaltyState.businessId}`
      : '/customer'
    navigate(dest, { replace: true })
  }, [campaign.id, navigate, loyaltyState.businessId, queryClient])

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
    <div className="h-dvh flex flex-col bg-[#43036d] max-w-[440px] mx-auto overflow-hidden relative">
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
        <>
          <div className="relative shrink-0 px-4 pb-4 pt-[max(2.75rem,env(safe-area-inset-top))]">
            <div
              className="pointer-events-none absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(255,255,255,0.06) 10px, rgba(255,255,255,0.06) 20px)',
              }}
            />
            <div className="relative flex items-center justify-between">
              <button
                type="button"
                onClick={onBack}
                className="flex size-9 items-center justify-center rounded-full border-0 bg-black/25 backdrop-blur-sm cursor-pointer"
                aria-label="Go back"
              >
                <ArrowLeft className="size-4 text-white" />
              </button>
              <span className="rounded-full bg-[#fef3c7] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#92400e]">
                {getCustomerMechanicChipLabel('check-in-loyalty')}
              </span>
            </div>
            <div className="relative mt-3">
              <h1 className="text-xl font-extrabold text-white">Daily Check-in</h1>
              <p className="mt-1 text-xs text-white/70">
                Every visit earns {loyaltyState.pointsPerCheckIn} points toward your rewards.
              </p>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-[28px] bg-white shadow-[0_-8px_32px_rgba(0,0,0,0.12)]">
            <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-2">
              <LoyaltyPointsCard
                businessName={loyaltyState.businessName}
                points={loyaltyState.loyaltyPoints}
                pointsPerCheckIn={loyaltyState.pointsPerCheckIn}
                milestones={loyaltyState.milestones}
                nextMilestone={loyaltyState.nextMilestone}
                className="mb-3"
              />

              {loyaltyState.milestones.length > 0 && (
                <div className="rounded-xl border border-[#f0ebf8] bg-[#faf8fc] p-3">
                  <LoyaltyMilestonesList
                    milestones={loyaltyState.milestones}
                    currentPoints={loyaltyState.loyaltyPoints}
                    compact
                  />
                </div>
              )}
            </div>

            <div className="shrink-0 border-t border-[#f0ebf8] bg-[#faf8fc] px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              {phase === 'checking-in' ? (
                <div className="flex flex-col items-center py-5">
                  <Loader2 className="mb-2 size-8 animate-spin text-[#631cbb]" />
                  <p className="text-sm font-semibold text-[#1a0030]">Checking you in…</p>
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
                  submitLabel="Check in"
                />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
