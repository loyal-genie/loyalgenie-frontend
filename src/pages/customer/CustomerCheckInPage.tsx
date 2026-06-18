import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Sparkles, Delete, Loader2, Gift, Star } from 'lucide-react'
import {
  fetchLoyaltyState,
  verifyCampaignPin,
  executeCheckIn,
  getApiErrorMessage,
} from '@/lib/api'
import { setPlaySession } from '@/lib/customer-game'
import { LoyaltyPointsSplash } from '@/components/customer/loyalty-points-splash'

type Phase = 'welcome' | 'pin' | 'checking-in' | 'splash' | 'done'

export function CustomerCheckInPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const campaignParam = searchParams.get('campaign')

  const [phase, setPhase] = useState<Phase>('welcome')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [checkInResult, setCheckInResult] = useState<{
    pointsEarned: number
    loyaltyPoints: number
    businessName: string
    milestonesUnlocked: { name: string; icon: string; code: string }[]
  } | null>(null)

  const campaignId = campaignParam

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

  const handleSplashComplete = useCallback(() => {
    setPhase('done')
    const dest = loyaltyState?.businessId
      ? `/customer/business/${loyaltyState.businessId}`
      : '/customer'
    navigate(dest, { replace: true })
  }, [navigate, loyaltyState?.businessId])

  useEffect(() => {
    if (!campaignId) {
      navigate('/customer', { replace: true })
    }
  }, [campaignId, navigate])

  useEffect(() => {
    if (pin.length === 3 && phase === 'pin' && !verifyMutation.isPending) {
      const t = setTimeout(() => verifyMutation.mutate(pin), 300)
      return () => clearTimeout(t)
    }
  }, [pin, phase]) // eslint-disable-line react-hooks/exhaustive-deps

  if (stateLoading || !campaignId || !loyaltyState) {
    return (
      <div className="min-h-dvh flex items-center justify-center customer-game-bg">
        <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
      </div>
    )
  }

  if (loyaltyState.checkedInToday && phase === 'welcome') {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center customer-game-bg">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-xl font-extrabold text-white mb-2">Already checked in today!</h1>
        <p className="text-sm text-white/60 mb-6">You have {loyaltyState.loyaltyPoints} loyalty points</p>
        <button
          type="button"
          onClick={() => navigate(loyaltyState.businessId ? `/customer/business/${loyaltyState.businessId}` : '/customer', { replace: true })}
          className="px-6 py-3 rounded-2xl font-bold text-sm border-0 cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #7C3AED, #F5C518)', color: '#1A0545' }}
        >
          Back to {loyaltyState.businessName}
        </button>
      </div>
    )
  }

  return (
    <div
      className="min-h-dvh flex flex-col relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #1A0545 0%, #2D1B69 40%, #0D0B1E 100%)' }}
    >
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
        <div className="relative z-10 flex flex-col min-h-dvh px-5 pt-[max(3rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))] max-w-md mx-auto w-full">
          {phase === 'welcome' && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col items-center justify-center text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.08, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-28 h-28 rounded-full flex items-center justify-center text-6xl mb-6"
                style={{
                  background: 'linear-gradient(135deg, rgba(124,58,237,0.4), rgba(245,197,24,0.3))',
                  border: '3px solid rgba(167,139,250,0.5)',
                  boxShadow: '0 0 60px rgba(124,58,237,0.4)',
                }}
              >
                ⭐
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 mb-4"
              >
                <MapPin className="w-3.5 h-3.5 text-purple-300" />
                <span className="text-xs font-bold text-purple-200">{loyaltyState.businessName}</span>
              </motion.div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 leading-tight">
                Welcome back!<br />Time to check in
              </h1>
              <p className="text-sm text-white/55 mb-6 max-w-xs">
                Earn <span className="text-amber-300 font-bold">+{loyaltyState.pointsPerCheckIn} loyalty points</span> with today&apos;s visit
              </p>

              {loyaltyState.enrolled && (
                <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/8 border border-white/10 mb-6">
                  <Star className="w-5 h-5 text-amber-400" />
                  <div className="text-left">
                    <p className="text-[10px] text-white/50 uppercase tracking-wider">Your points</p>
                    <p className="text-2xl font-black text-white">{loyaltyState.loyaltyPoints}</p>
                  </div>
                  {loyaltyState.nextMilestone && (
                    <div className="text-left border-l border-white/10 pl-3">
                      <p className="text-[10px] text-white/50">Next reward</p>
                      <p className="text-xs font-semibold text-amber-200">{loyaltyState.nextMilestone.pointsNeeded} pts to {loyaltyState.nextMilestone.name}</p>
                    </div>
                  )}
                </div>
              )}

              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => setPhase('pin')}
                className="w-full max-w-xs py-4 rounded-2xl text-base font-extrabold border-0 cursor-pointer flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #7C3AED, #F5C518)',
                  color: '#1A0545',
                  boxShadow: '0 12px 40px rgba(124,58,237,0.5)',
                }}
              >
                <Sparkles className="w-5 h-5" /> Check In Now
              </motion.button>

              <button
                type="button"
                onClick={() => navigate(loyaltyState.businessId ? `/customer/business/${loyaltyState.businessId}` : '/customer', { replace: true })}
                className="mt-4 text-xs text-white/40 bg-transparent border-0 cursor-pointer hover:text-white/60"
              >
                Back to cafe
              </button>
            </motion.div>
          )}

          {(phase === 'pin' || phase === 'checking-in') && (
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1 flex flex-col"
            >
              <button
                type="button"
                onClick={() => { setPhase('welcome'); setPin(''); setError('') }}
                className="text-sm text-white/50 mb-6 w-fit bg-transparent border-0 cursor-pointer"
              >
                ← Back
              </button>

              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/8 border border-white/10 mb-3">
                  <Gift className="w-3.5 h-3.5 text-purple-300" />
                  <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Staff PIN</span>
                </div>
                <h2 className="text-xl font-extrabold text-white">Show at the counter</h2>
                <p className="text-sm text-white/50 mt-1">Ask staff for today&apos;s 3-digit PIN</p>
              </div>

              <div className="flex justify-center gap-4 mb-6">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-14 h-14 rounded-2xl flex items-center justify-center border-2 text-2xl font-black text-white"
                    style={{
                      borderColor: pin[i] ? '#7C3AED' : 'rgba(255,255,255,0.15)',
                      background: pin[i] ? 'rgba(124,58,237,0.25)' : 'rgba(0,0,0,0.2)',
                    }}
                  >
                    {pin[i] ?? ''}
                  </div>
                ))}
              </div>

              {error && <p className="text-center text-xs text-red-400 mb-4">{error}</p>}

              {phase === 'checking-in' ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="w-10 h-10 text-purple-400 animate-spin mx-auto mb-3" />
                    <p className="text-sm text-white/60">Checking you in…</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 mt-auto">
                  {[1,2,3,4,5,6,7,8,9].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => { if (pin.length < 3) setPin(p => p + n); setError('') }}
                      disabled={verifyMutation.isPending}
                      className="h-12 rounded-2xl text-lg font-bold text-white border-0 cursor-pointer"
                      style={{ background: 'rgba(255,255,255,0.08)' }}
                    >
                      {n}
                    </button>
                  ))}
                  <div />
                  <button
                    type="button"
                    onClick={() => { if (pin.length < 3) setPin(p => p + '0'); setError('') }}
                    className="h-12 rounded-2xl text-lg font-bold text-white border-0 cursor-pointer"
                    style={{ background: 'rgba(255,255,255,0.08)' }}
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={() => setPin(p => p.slice(0, -1))}
                    className="h-12 rounded-2xl text-white/50 border-0 cursor-pointer flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                  >
                    <Delete className="w-5 h-5" />
                  </button>
                </div>
              )}

              <p className="text-center text-[10px] text-white/30 mt-4">PIN refreshes every 2 min on staff screen</p>
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}
