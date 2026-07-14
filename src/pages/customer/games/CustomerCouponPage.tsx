import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Loader2, Ticket } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  claimCouponReward,
  fetchCouponState,
  fetchPublicCampaign,
  getApiErrorMessage,
} from '@/lib/api'
import { getCampaignIdFromSearch, getPlaySession } from '@/lib/customer-game'
import { getUser } from '@/lib/auth'
import { getCampaignTheme, getPlayScreenBackground } from '@/lib/campaign-themes'
import { getCustomerBusinessPath } from '@/lib/customer-ui'
import { WinCelebration } from '@/components/customer/win-celebration'

type Phase = 'ready' | 'claiming' | 'won'

export function CustomerCouponPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { search } = useLocation()
  const campaignId = getCampaignIdFromSearch(search)
  const playSession = campaignId ? getPlaySession(campaignId) : null
  const customerId = getUser('customer')?.userId
  const theme = getCampaignTheme('coupon')

  const [phase, setPhase] = useState<Phase>('ready')
  const [claimed, setClaimed] = useState<{
    reward: string
    code: string
    icon: string
  } | null>(null)
  const [claimError, setClaimError] = useState('')

  const { data: campaign, isLoading: campaignLoading } = useQuery({
    queryKey: ['public-campaign', campaignId],
    queryFn: () => fetchPublicCampaign(campaignId!),
    enabled: Boolean(campaignId),
  })

  const { data: state, isLoading: stateLoading } = useQuery({
    queryKey: ['coupon-state', campaignId, customerId],
    queryFn: () => fetchCouponState(campaignId!),
    enabled: Boolean(campaignId) && Boolean(customerId),
  })

  useEffect(() => {
    if (claimed || phase !== 'ready') return
    if (!campaignId) {
      navigate('/customer')
      return
    }
    if (!playSession && !state?.hasClaimed) {
      navigate(`/customer/campaigns/${campaignId}`)
    }
  }, [campaignId, playSession, navigate, claimed, state?.hasClaimed, phase])

  const claimMutation = useMutation({
    mutationFn: () => claimCouponReward(campaignId!, playSession!),
    onSuccess: result => {
      setClaimError('')
      setPhase('claiming')
      setClaimed({ reward: result.reward, code: result.code, icon: result.icon })
      void queryClient.invalidateQueries({ queryKey: ['coupon-state', campaignId] })
      void queryClient.refetchQueries({ queryKey: ['customer-rewards'] })
      void queryClient.invalidateQueries({ queryKey: ['business-campaign-states'] })
      window.setTimeout(() => setPhase('won'), 1400)
    },
    onError: err => {
      setPhase('ready')
      setClaimError(getApiErrorMessage(err, 'Could not claim coupon. Try again.'))
    },
  })

  const goBack = () => {
    const businessId = campaign?.businessId
    if (businessId) navigate(getCustomerBusinessPath(businessId), { replace: true })
    else navigate('/customer', { replace: true })
  }

  if (campaignLoading || stateLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center" style={{ background: getPlayScreenBackground('coupon') }}>
        <Loader2 className="size-8 animate-spin" style={{ color: theme.accent }} />
      </div>
    )
  }

  if (phase === 'won' && claimed) {
    return (
      <WinCelebration
        reward={claimed.reward}
        emoji={claimed.icon || '🎫'}
        code={claimed.code}
        businessName={campaign?.businessName ?? state?.businessName}
        onBackToCafe={goBack}
        mechanic="coupon"
      />
    )
  }

  const rewardLabel = state?.rewardLabel ?? campaign?.rewards[0]?.name ?? 'Coupon'
  const terms = state?.termsAndConditions?.trim() || campaign?.couponConfig?.termsAndConditions?.trim() || ''
  const total = state?.totalCoupons ?? campaign?.couponConfig?.totalCoupons ?? 0
  const remaining = state?.spotsRemaining ?? total
  const claimedCount = state?.claimedCount ?? Math.max(0, total - remaining)

  return (
    <div
      className="min-h-dvh flex flex-col px-5 pt-12 pb-8 relative overflow-hidden max-w-[440px] mx-auto"
      style={{ background: getPlayScreenBackground('coupon') }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: 'radial-gradient(circle, #0E7490 1.2px, transparent 1.2px)',
          backgroundSize: '22px 22px',
        }}
      />

      <button
        type="button"
        onClick={goBack}
        className="absolute top-12 left-4 w-9 h-9 rounded-full bg-black/5 backdrop-blur-md flex items-center justify-center z-20 border-0 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 text-gray-700" />
      </button>

      <AnimatePresence mode="wait">
        {phase === 'claiming' ? (
          <motion.div
            key="claiming"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="flex-1 flex flex-col items-center justify-center relative z-10"
          >
            <motion.div
              animate={{ rotate: [0, -8, 8, -4, 0], scale: [1, 1.08, 1] }}
              transition={{ duration: 1.1, ease: 'easeInOut' }}
              className="text-7xl mb-5"
            >
              🎫
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-black text-gray-900 tracking-tight"
            >
              Claiming…
            </motion.p>
            <p className="text-sm text-gray-500 mt-2">Adding coupon to your wallet</p>
          </motion.div>
        ) : (
          <motion.div
            key="ready"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col justify-center relative z-10 gap-6 mt-8"
          >
            <div className="text-center">
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                className="inline-flex items-center justify-center size-[72px] rounded-[20px] mb-4"
                style={{
                  background: 'linear-gradient(145deg, #ffffff 0%, #CFFAFE 100%)',
                  boxShadow: `0 12px 32px ${theme.accent}33`,
                }}
              >
                <Ticket className="size-8" style={{ color: theme.accentTo }} strokeWidth={2.2} />
              </motion.div>
              <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
                {campaign?.name ?? state?.campaignName}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {campaign?.businessName ?? state?.businessName}
              </p>
            </div>

            <div
              className="relative overflow-hidden rounded-[22px]"
              style={{
                background: 'linear-gradient(160deg, #ffffff 0%, #ECFBFE 55%, #CFFAFE 100%)',
                boxShadow: '0 18px 40px rgba(6,182,212,0.15)',
              }}
            >
              <div
                className="absolute inset-y-0 left-[18px] w-px opacity-40"
                style={{
                  backgroundImage: `repeating-linear-gradient(to bottom, ${theme.accent} 0 6px, transparent 6px 12px)`,
                }}
              />
              <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 size-5 rounded-full" style={{ background: '#ECFBFE' }} />
              <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 size-5 rounded-full" style={{ background: '#ECFBFE' }} />

              <div className="relative px-6 pt-5 pb-4 pl-8">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                    Your coupon
                  </p>
                  <span
                    className="text-[10px] font-extrabold px-2 py-0.5 rounded-full text-white"
                    style={{ background: theme.accent }}
                  >
                    COUPON
                  </span>
                </div>

                <p className="text-[34px] leading-none font-black text-gray-900 tracking-tight">
                  {rewardLabel}
                </p>

                {terms ? (
                  <div className="mt-4 rounded-xl bg-white/80 border border-cyan-100 px-3.5 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                      Terms & conditions
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{terms}</p>
                  </div>
                ) : null}

                <div className="mt-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Available</p>
                    <p className="text-sm font-extrabold text-gray-900">
                      {remaining} of {total} left
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Claimed</p>
                    <p className="text-sm font-extrabold text-gray-900">{claimedCount}</p>
                  </div>
                </div>
              </div>
            </div>

            {claimError && <p className="text-center text-sm text-red-500">{claimError}</p>}

            {state?.hasClaimed ? (
              <div className="rounded-2xl bg-white/95 p-5 text-center border border-gray-100">
                <p className="text-sm font-semibold text-gray-900">Already in your wallet</p>
                <button
                  type="button"
                  onClick={() => navigate('/customer/wallet')}
                  className="mt-3 text-sm font-bold border-0 bg-transparent cursor-pointer"
                  style={{ color: theme.accent }}
                >
                  View in Wallet →
                </button>
              </div>
            ) : (
              <motion.button
                type="button"
                onClick={() => {
                  if (!playSession || claimMutation.isPending || !state?.canClaim) return
                  setClaimError('')
                  claimMutation.mutate()
                }}
                disabled={!state?.canClaim || claimMutation.isPending || !playSession}
                whileTap={{ scale: 0.97 }}
                className="w-full py-4 rounded-2xl font-extrabold text-base disabled:opacity-50 border-0 cursor-pointer text-white"
                style={{
                  background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accentTo} 100%)`,
                  boxShadow: `0 10px 28px ${theme.accent}55`,
                }}
              >
                {claimMutation.isPending ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" /> Claiming…
                  </span>
                ) : (
                  'Claim Coupon'
                )}
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
