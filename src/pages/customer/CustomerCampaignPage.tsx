import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Delete, Loader2, Sparkles, Gift } from 'lucide-react'
import {
  fetchPublicCampaign,
  verifyCampaignPin,
  fetchPlayState,
  fetchStampState,
  fetchAuthSession,
  getApiErrorMessage,
} from '@/lib/api'
import { setPlaySession, markMotionGesture } from '@/lib/customer-game'
import { primeMotionSensors } from '@/lib/shake-motion-sensors'
import { getMechanicEmoji, getMechanicLabel, getMechanicColor } from '@/lib/utils'
import { getToken, isSessionValidForRole } from '@/lib/auth'

function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 8 }, (_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 40 + i * 12,
            height: 40 + i * 12,
            left: `${10 + i * 11}%`,
            top: `${5 + (i % 3) * 25}%`,
            background: `radial-gradient(circle, ${i % 2 ? 'rgba(245,197,24,0.15)' : 'rgba(167,139,250,0.2)'} 0%, transparent 70%)`,
          }}
          animate={{ y: [0, -20, 0], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

export function CustomerCampaignPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  const localSessionOk = isSessionValidForRole('customer') && Boolean(getToken())

  const { data: serverSession, isLoading: sessionLoading, isError: sessionError } = useQuery({
    queryKey: ['auth-session', 'customer'],
    queryFn: fetchAuthSession,
    enabled: localSessionOk,
    retry: false,
    staleTime: 30_000,
  })

  const authReady = localSessionOk && !sessionLoading && !sessionError && serverSession?.role === 'customer'

  const { data: campaign, isLoading } = useQuery({
    queryKey: ['public-campaign', id],
    queryFn: () => fetchPublicCampaign(id!),
    enabled: Boolean(id),
  })

  const { data: playState } = useQuery({
    queryKey: ['play-state', id, serverSession?.userId],
    queryFn: () => fetchPlayState(id!),
    enabled: Boolean(id) && authReady && campaign?.mechanic === 'shake',
    staleTime: 0,
  })

  const { data: stampState } = useQuery({
    queryKey: ['stamp-state', id, serverSession?.userId],
    queryFn: () => fetchStampState(id!),
    enabled: Boolean(id) && authReady && campaign?.mechanic === 'stamp',
    staleTime: 0,
  })

  const verifyMutation = useMutation({
    mutationFn: (enteredPin: string) => {
      if (!getToken()) {
        return Promise.reject(new Error('NOT_AUTHENTICATED'))
      }
      return verifyCampaignPin(id!, enteredPin)
    },
    onSuccess: (data) => {
      setPlaySession(id!, data.playSessionToken)
      if (campaign?.mechanic === 'stamp') {
        navigate(`/customer/games/stamp?campaign=${id}&collect=1`)
      } else {
        navigate(`/customer/games/shake?campaign=${id}`)
      }
    },
    onError: (err) => {
      if (err instanceof Error && err.message === 'NOT_AUTHENTICATED') {
        setError('Please sign in again to enter your PIN.')
        return
      }
      setError(getApiErrorMessage(err, 'Wrong PIN. Ask staff for the current PIN.'))
      setPin('')
    },
  })

  const color = campaign ? getMechanicColor(campaign.mechanic as 'shake') : '#7C3AED'
  const isStamp = campaign?.mechanic === 'stamp'

  const handleBack = () => {
    if (campaign?.businessId) {
      navigate(`/customer/business/${campaign.businessId}`)
    } else {
      navigate('/customer')
    }
  }

  const handleKey = (k: string) => {
    markMotionGesture()
    primeMotionSensors()
    if (pin.length < 3) setPin(p => p + k)
    setError('')
  }

  const handleDelete = () => {
    markMotionGesture()
    primeMotionSensors()
    setPin(p => p.slice(0, -1))
  }

  const handleSubmit = () => {
    markMotionGesture()
    primeMotionSensors()
    if (pin.length < 3 || verifyMutation.isPending || !authReady) return
    verifyMutation.mutate(pin)
  }

  useEffect(() => {
    if (pin.length === 3 && !verifyMutation.isPending && authReady) {
      const t = setTimeout(() => verifyMutation.mutate(pin), 300)
      return () => clearTimeout(t)
    }
  }, [pin, authReady]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!localSessionOk || sessionError || (serverSession && serverSession.role !== 'customer')) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-5 text-center customer-game-bg">
        <p className="text-white font-semibold mb-2">Sign in required</p>
        <p className="text-sm text-white/60 mb-6">
          Sign in with your customer account to enter the staff PIN and play.
        </p>
        <button
          type="button"
          onClick={() => navigate(`/signin?role=customer&reason=session_expired&from=/customer/campaigns/${id}`)}
          className="px-6 py-3 rounded-2xl font-bold text-sm border-0 cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #7C3AED, #F5C518)', color: '#1A0545' }}
        >
          Sign in as customer
        </button>
      </div>
    )
  }

  if (sessionLoading || isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center customer-game-bg">
        <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-5 text-center customer-game-bg">
        <p className="text-white font-semibold mb-4">Campaign not available</p>
        <button type="button" onClick={() => navigate('/customer')} className="text-purple-300 text-sm border-0 bg-transparent cursor-pointer">← Back home</button>
      </div>
    )
  }

  return (
    <div
      className="min-h-dvh flex flex-col relative overflow-hidden customer-game-bg"
      style={{ background: 'linear-gradient(160deg, #1A0545 0%, #2D1B69 40%, #0D0B1E 100%)' }}
    >
      <FloatingOrbs />

      <div className="relative z-10 flex flex-col min-h-dvh px-4 sm:px-5 pt-[max(2.5rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))] max-w-md mx-auto w-full">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white mb-6 w-fit bg-transparent border-0 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <motion.div
            animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
            className="inline-flex w-20 h-20 rounded-3xl items-center justify-center text-4xl mb-4"
            style={{
              background: `linear-gradient(135deg, ${color}40, ${color}15)`,
              border: `2px solid ${color}60`,
              boxShadow: `0 0 40px ${color}40`,
            }}
          >
            {getMechanicEmoji(campaign.mechanic)}
          </motion.div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white mb-1 px-1">{campaign.name}</h1>
          <p className="text-sm font-semibold" style={{ color }}>{getMechanicLabel(campaign.mechanic as 'shake')}</p>
          {campaign.mechanic === 'shake' && campaign.winRatePercent != null && (
            <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span className="text-xs font-bold text-amber-200">{campaign.winRatePercent}% chance to win!</span>
            </div>
          )}
          {campaign.mechanic === 'stamp' && stampState && (
            <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span className="text-xs font-bold text-amber-200">
                {stampState.enrolled
                  ? `${stampState.stampsCollected}/${stampState.totalStamps} stamps`
                  : stampState.enrollmentOpen
                    ? `${stampState.currentUsers}/${stampState.userCap} spots filled`
                    : 'Enrollment closed'}
              </span>
            </div>
          )}
          {campaign.mechanic === 'stamp' && stampState?.enrolled && !stampState.canCollectToday && !stampState.cardComplete && (
            <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-white/10 border border-white/15">
              <span className="text-xs font-bold text-white/80">Stamp collected today</span>
            </div>
          )}
          {campaign.mechanic === 'stamp' && stampState?.enrolled && (
            <p className="text-xs text-amber-200/80 mt-2 px-2">
              {!stampState.canCollectToday && !stampState.cardComplete
                ? 'Come back tomorrow for your next stamp.'
                : stampState.canCollectToday
                  ? 'Enter today\'s staff PIN to collect your stamp.'
                  : null}
            </p>
          )}
          {playState && (
            <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-white/10 border border-white/15">
              <span className="text-xs font-bold text-white/80">
                {!playState.canPlay && (playState.blockReason === 'daily_participant_limit' || playState.blockReason === 'user_cap')
                  ? 'Campaign full today'
                  : `${playState.playsUsedToday}/${playState.playsPerDay} attempts today`}
              </span>
            </div>
          )}
          {playState && !playState.canPlay && (
            <p className="text-xs text-amber-200/80 mt-2 px-2">{playState.message}</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex-1 flex flex-col rounded-3xl p-4 sm:p-6 backdrop-blur-xl border border-white/10 min-h-0"
          style={{ background: 'rgba(255,255,255,0.06)', boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}
        >
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/8 border border-white/10 mb-3">
              <Gift className="w-3.5 h-3.5 text-purple-300" />
              <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Ask staff for PIN</span>
            </div>
            <p className="text-sm text-white/50">Show this screen at the counter</p>
          </div>

          <div className="flex justify-center gap-3 sm:gap-5 mb-5 sm:mb-6">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                animate={error ? { x: [0, -8, 8, 0] } : {}}
                className="relative"
              >
                <div
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center border-2 transition-all duration-300"
                  style={{
                    borderColor: pin[i] ? color : 'rgba(255,255,255,0.15)',
                    background: pin[i] ? `${color}25` : 'rgba(0,0,0,0.2)',
                    boxShadow: pin[i] ? `0 0 30px ${color}50` : 'none',
                  }}
                >
                  <AnimatePresence mode="wait">
                    {pin[i] ? (
                      <motion.span
                        key={pin[i]}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-2xl font-black text-white"
                      >
                        {pin[i]}
                      </motion.span>
                    ) : (
                      <motion.span
                        key="empty"
                        animate={{ opacity: [0.2, 0.6, 0.2] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-3 h-3 rounded-full bg-white/30"
                      />
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-xs text-red-400 mb-4">
              {error}
            </motion.p>
          )}

          <div className="grid grid-cols-3 gap-2 sm:gap-2.5 mt-auto">
            {[1,2,3,4,5,6,7,8,9].map(n => (
              <motion.button
                key={n}
                type="button"
                whileTap={{ scale: 0.88 }}
                onClick={() => handleKey(String(n))}
                disabled={!authReady || verifyMutation.isPending}
                className="h-12 sm:h-14 rounded-2xl text-lg sm:text-xl font-bold text-white cursor-pointer border-0 transition-colors touch-manipulation active:bg-white/15 disabled:opacity-50"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {n}
              </motion.button>
            ))}
            <div />
            <motion.button
              type="button"
              whileTap={{ scale: 0.88 }}
              onClick={() => handleKey('0')}
              disabled={!authReady || verifyMutation.isPending}
              className="h-12 sm:h-14 rounded-2xl text-lg sm:text-xl font-bold text-white cursor-pointer border-0 touch-manipulation disabled:opacity-50"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              0
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.88 }}
              onClick={handleDelete}
              disabled={!authReady || verifyMutation.isPending}
              className="h-12 sm:h-14 rounded-2xl text-white/50 cursor-pointer border-0 flex items-center justify-center touch-manipulation disabled:opacity-50"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              <Delete className="w-5 h-5" />
            </motion.button>
          </div>

          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            disabled={pin.length < 3 || verifyMutation.isPending || !authReady}
            className="mt-5 w-full py-4 rounded-2xl text-base font-extrabold transition-all disabled:opacity-40 border-0 cursor-pointer"
            style={{
              background: pin.length === 3
                ? `linear-gradient(135deg, ${color}, #F5C518)`
                : 'rgba(255,255,255,0.06)',
              color: pin.length === 3 ? '#1A0545' : 'rgba(255,255,255,0.4)',
              boxShadow: pin.length === 3 ? `0 12px 40px ${color}60` : 'none',
            }}
          >
            {verifyMutation.isPending ? (
              <span className="flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Verifying…</span>
            ) : pin.length === 3 ? (
              isStamp ? `Collect Stamp ${getMechanicEmoji(campaign.mechanic)}` : `Let's Shake! ${getMechanicEmoji(campaign.mechanic)}`
            ) : (
              'Enter 3-digit PIN'
            )}
          </motion.button>

          <p className="text-center text-[10px] text-white/30 mt-4">
            {isStamp ? 'PIN rotates daily at midnight' : 'PIN refreshes every 2 min on staff screen'}
          </p>
        </motion.div>
      </div>
    </div>
  )
}
