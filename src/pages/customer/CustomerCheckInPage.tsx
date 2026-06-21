import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Loader2 } from 'lucide-react'
import {
  fetchLoyaltyState,
  verifyCampaignPin,
  executeCheckIn,
  getApiErrorMessage,
} from '@/lib/api'
import { setPlaySession } from '@/lib/customer-game'
import { LoyaltyPointsSplash } from '@/components/customer/loyalty-points-splash'
import { PinKeypad } from '@/components/customer/PinKeypad'

type Phase = 'overview' | 'pin' | 'checking-in' | 'splash'

export function CustomerCheckInPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const campaignId = searchParams.get('campaign')

  const [phase, setPhase] = useState<Phase>('overview')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [checkInResult, setCheckInResult] = useState<{
    pointsEarned: number
    loyaltyPoints: number
    businessName: string
    milestonesUnlocked: { name: string; icon: string; code: string }[]
  } | null>(null)

  const { data: loyaltyState, isLoading: stateLoading } = useQuery({
    queryKey: ['loyalty-state', campaignId],
    queryFn: () => fetchLoyaltyState(campaignId!),
    enabled: Boolean(campaignId),
  })

  const verifyMutation = useMutation({
    mutationFn: (enteredPin: string) => verifyCampaignPin(campaignId!, enteredPin),
    onSuccess: async (data) => {
      setPlaySession(campaignId!, data.playSessionToken)
      setPhase('checking-in')
      try {
        const result = await executeCheckIn(campaignId!, data.playSessionToken)
        setCheckInResult({
          pointsEarned: result.pointsEarned,
          loyaltyPoints: result.loyaltyPoints,
          businessName: loyaltyState?.businessName ?? 'Store',
          milestonesUnlocked: result.milestonesUnlocked,
        })
        setPhase('splash')
      } catch (err) {
        setError(getApiErrorMessage(err, 'Check-in failed'))
        setPhase('pin')
        setPin('')
      }
    },
    onError: (err) => {
      setError(getApiErrorMessage(err, 'Wrong PIN. Ask staff for the current PIN.'))
      setPin('')
    },
  })

  const handleBack = () => {
    if (loyaltyState?.businessId) navigate(`/customer/business/${loyaltyState.businessId}`)
    else navigate('/customer')
  }

  const handleSplashComplete = useCallback(() => {
    const dest = loyaltyState?.businessId
      ? `/customer/business/${loyaltyState.businessId}`
      : '/customer'
    navigate(dest, { replace: true })
  }, [navigate, loyaltyState?.businessId])

  useEffect(() => {
    if (!campaignId) navigate('/customer', { replace: true })
  }, [campaignId, navigate])

  useEffect(() => {
    if (pin.length === 3 && phase === 'pin' && !verifyMutation.isPending) {
      const t = setTimeout(() => verifyMutation.mutate(pin), 300)
      return () => clearTimeout(t)
    }
  }, [pin, phase]) // eslint-disable-line react-hooks/exhaustive-deps

  if (stateLoading || !campaignId || !loyaltyState) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#f5f0ff]">
        <Loader2 className="size-10 text-[#631cbb] animate-spin" />
      </div>
    )
  }

  if (loyaltyState.checkedInToday && phase === 'overview') {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center bg-[#f5f0ff]">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-xl font-bold text-[#1a0030] mb-2">Already checked in today!</h1>
        <p className="text-sm text-[#888] mb-6">{loyaltyState.loyaltyPoints} loyalty points</p>
        <button
          type="button"
          onClick={handleBack}
          className="px-6 py-3 rounded-[22px] font-bold text-sm text-white bg-[#631cbb] border-0 cursor-pointer"
        >
          Back to {loyaltyState.businessName}
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-[#f5f0ff] relative flex flex-col">
      <AnimatePresence>
        {phase === 'splash' && checkInResult && (
          <LoyaltyPointsSplash
            pointsEarned={checkInResult.pointsEarned}
            totalPoints={checkInResult.loyaltyPoints}
            businessName={checkInResult.businessName}
            milestonesUnlocked={checkInResult.milestonesUnlocked}
            onComplete={handleSplashComplete}
          />
        )}
      </AnimatePresence>

      {phase !== 'splash' && (
        <>
          <div className="bg-[#43036d] h-[190px] relative shrink-0">
            <button
              type="button"
              onClick={handleBack}
              className="absolute top-12 left-4 size-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center border-0 cursor-pointer"
              aria-label="Go back"
            >
              <ArrowLeft className="size-4 text-[#d4a8ff]" />
            </button>
            <div className="absolute top-12 right-4 bg-[#631cbb] px-2.5 py-1 rounded-full">
              <span className="text-[8px] font-bold text-[#d4a8ff] tracking-wide">CHECK-IN</span>
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 size-[90px] rounded-full bg-[#631cbb] flex flex-col items-center justify-center shadow-lg border-4 border-[#9b59e8]/30">
              <span className="text-2xl font-bold text-white">{loyaltyState.totalCheckIns}</span>
              <span className="text-[9px] text-[#9b59e8]">days</span>
            </div>
          </div>

          <div className="flex-1 px-5 pt-14 pb-8">
            <div className="bg-white border border-[#ede7f6] rounded-[20px] p-4 shadow-sm mb-6">
              <h1 className="text-base font-bold text-[#1a0030] mb-1">Daily Check-in</h1>
              <p className="text-[8.4px] text-[#9b59e8] mb-4 leading-relaxed">
                Check in every day and earn {loyaltyState.pointsPerCheckIn} points per visit.
              </p>

              <div className="bg-[#43036d] rounded-xl px-3.5 py-6 mb-4 flex items-center justify-between">
                <span className="text-[8px] font-bold text-[#c084fc] tracking-wide">TOTAL POINTS</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-[#e8b050]">{loyaltyState.loyaltyPoints}</span>
                  <span className="text-[9px] text-[#c084fc]">pts</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1.5 mb-4">
                <div className="bg-[#f5f0ff] rounded-[10px] p-2.5">
                  <p className="text-[7px] font-bold text-[#9b59e8] tracking-wide mb-1">STREAK</p>
                  <p className="text-[17px] font-bold text-[#1a0030]">
                    {loyaltyState.totalCheckIns}
                    <span className="text-[9px] text-[#888] font-normal ml-1">days</span>
                  </p>
                </div>
                <div className="bg-[#f5f0ff] rounded-[10px] p-2.5">
                  <p className="text-[7px] font-bold text-[#9b59e8] tracking-wide mb-1">NEXT REWARD</p>
                  {loyaltyState.nextMilestone ? (
                    <p className="text-[17px] font-bold text-[#1a0030]">
                      {loyaltyState.nextMilestone.pointsNeeded}
                      <span className="text-[9px] text-[#888] font-normal ml-1">pts</span>
                    </p>
                  ) : (
                    <p className="text-sm font-bold text-[#1a0030]">—</p>
                  )}
                </div>
              </div>

              <div className="border border-[#ede7f6] rounded-[10px] px-2.5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-[7px] font-bold text-[#9b59e8] tracking-wide">DURATION</p>
                  <p className="text-[9px] font-bold text-[#1a0030]">Ongoing</p>
                </div>
                <p className="text-xs text-[#888]">{loyaltyState.currentUsers ?? 0} players</p>
              </div>
            </div>

            <p className="text-[10px] text-[#888] mb-0.5">Offered by</p>
            <p className="text-xs font-bold text-[#1a0030] mb-6">{loyaltyState.businessName}</p>

            <button
              type="button"
              onClick={() => setPhase('pin')}
              disabled={phase === 'checking-in'}
              className="w-full py-5 rounded-[22px] font-bold text-xs text-white border-0 cursor-pointer disabled:opacity-60"
              style={{ background: 'linear-gradient(to right, #400560, #2d110e)' }}
            >
              {phase === 'checking-in' ? 'Checking in…' : 'Play Now'}
            </button>
          </div>

          <AnimatePresence>
            {(phase === 'pin' || phase === 'checking-in') && (
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[440px] bg-[#1c0038] rounded-t-3xl px-5 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
              >
                <div className="w-12 h-1 bg-[#260448] rounded-full mx-auto mb-4" />
                <button
                  type="button"
                  onClick={() => { setPhase('overview'); setPin(''); setError('') }}
                  className="absolute top-4 left-4 size-7 rounded-full bg-white/10 flex items-center justify-center border-0 cursor-pointer"
                >
                  <ArrowLeft className="size-3.5 text-[#d4a8ff]" />
                </button>
                <div className="flex justify-center mb-4">
                  <div className="size-[90px] rounded-full bg-[#631cbb]/50 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-white">☕</span>
                  </div>
                </div>
                {phase === 'checking-in' ? (
                  <div className="flex flex-col items-center py-8">
                    <Loader2 className="size-10 text-[#d4a8ff] animate-spin mb-3" />
                    <p className="text-sm text-[#9b59e8]">Checking you in…</p>
                  </div>
                ) : (
                  <div className="[&_h2]:text-white [&_p]:text-[#9b59e8] [&_button]:bg-[#631cbb]">
                    <PinKeypad
                      pin={pin}
                      error={error}
                      loading={verifyMutation.isPending}
                      onKey={k => { if (pin.length < 3) setPin(p => p + k); setError('') }}
                      onDelete={() => setPin(p => p.slice(0, -1))}
                      onSubmit={() => pin.length === 3 && verifyMutation.mutate(pin)}
                      submitLabel="Check in"
                    />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          {(phase === 'pin' || phase === 'checking-in') && (
            <div className="fixed inset-0 bg-black/40 z-30" onClick={() => { setPhase('overview'); setPin(''); setError('') }} />
          )}
        </>
      )}
    </div>
  )
}
