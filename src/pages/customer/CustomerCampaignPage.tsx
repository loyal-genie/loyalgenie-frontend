import { useState, useEffect, useCallback, useRef, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  fetchPublicCampaign,
  verifyCampaignPin,
  fetchPlayState,
  fetchStampState,
  fetchLoyaltyState,
  fetchAuthSession,
  getApiErrorMessage,
} from '@/lib/api'
import { setPlaySession, markMotionGesture } from '@/lib/customer-game'
import { primeMotionSensors } from '@/lib/shake-motion-sensors'
import { getGameRouteForMechanic } from '@/lib/customer-ui'
import { isMechanicComingSoon } from '@/lib/live-mechanics'
import { MechanicComingSoon } from '@/components/shared/MechanicComingSoon'
import { getToken, isSessionValidForRole } from '@/lib/auth'
import { useBusinessesWithCampaigns } from '@/hooks/useCustomerData'
import {
  CampaignPinBlocked,
  CampaignPinLoading,
  CampaignPinShell,
} from '@/components/customer/CampaignPinShell'
import { ShakeCampaignDetail } from '@/components/customer/ShakeCampaignDetail'
import { StampCampaignDetail } from '@/components/customer/StampCampaignDetail'
import { LoyaltyCampaignDetail } from '@/components/customer/LoyaltyCampaignDetail'
import { StampCollectOverlay } from '@/components/customer/StampCollectOverlay'

type StampCollectSession = {
  token: string
  stampsBefore: number
  enrolledBefore: boolean
}

function StatusChip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#f5f0ff] border border-[#5b0e81]/20 text-[10px] font-bold text-[#5b0e81]">
      {children}
    </span>
  )
}

export function CustomerCampaignPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [stampCollect, setStampCollect] = useState<StampCollectSession | null>(null)
  const [loyaltySplash, setLoyaltySplash] = useState(false)
  const stampCollectRef = useRef(stampCollect)
  stampCollectRef.current = stampCollect

  const localSessionOk = isSessionValidForRole('customer') && Boolean(getToken('customer'))

  const { data: serverSession, isLoading: sessionLoading, isError: sessionError } = useQuery({
    queryKey: ['auth-session', 'customer'],
    queryFn: fetchAuthSession,
    enabled: localSessionOk,
    retry: false,
    staleTime: 30_000,
  })

  const authReady = localSessionOk && !sessionLoading && !sessionError && serverSession?.role === 'customer'

  const { data: businesses } = useBusinessesWithCampaigns()

  const { data: campaign, isLoading } = useQuery({
    queryKey: ['public-campaign', id],
    queryFn: () => fetchPublicCampaign(id!),
    enabled: Boolean(id),
  })

  const { data: playState, isLoading: playStateLoading } = useQuery({
    queryKey: ['play-state', id, serverSession?.userId],
    queryFn: () => fetchPlayState(id!),
    enabled: Boolean(id) && authReady && campaign?.mechanic === 'shake',
    staleTime: 0,
  })

  const { data: stampState, isLoading: stampStateLoading } = useQuery({
    queryKey: ['stamp-state', id, serverSession?.userId],
    queryFn: () => fetchStampState(id!),
    enabled: Boolean(id) && authReady && campaign?.mechanic === 'stamp',
    staleTime: 0,
  })

  const { data: loyaltyState, isLoading: loyaltyStateLoading } = useQuery({
    queryKey: ['loyalty-state', id, serverSession?.userId],
    queryFn: () => fetchLoyaltyState(id!),
    enabled: Boolean(id) && authReady && campaign?.mechanic === 'check-in-loyalty',
    staleTime: 0,
  })

  const verifyMutation = useMutation({
    mutationFn: (enteredPin: string) => {
      if (!getToken('customer')) return Promise.reject(new Error('NOT_AUTHENTICATED'))
      return verifyCampaignPin(id!, enteredPin)
    },
    onSuccess: (data) => {
      if (isMechanicComingSoon(campaign!.mechanic)) return
      setPlaySession(id!, data.playSessionToken)
      if (campaign!.mechanic === 'stamp' && stampState) {
        if (stampCollectRef.current) return
        setStampCollect({
          token: data.playSessionToken,
          stampsBefore: stampState.stampsCollected,
          enrolledBefore: stampState.enrolled,
        })
        return
      }
      const route = getGameRouteForMechanic(campaign!.mechanic, id!)
      navigate(route)
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

  const handleBack = useCallback(() => {
    if (campaign?.businessId) navigate(`/customer/business/${campaign.businessId}`)
    else navigate('/customer')
  }, [campaign?.businessId, navigate])

  const handleStampCollectDone = useCallback((opts?: { error?: string }) => {
    setStampCollect(null)
    setPin('')
    if (opts?.error) {
      setError(opts.error)
      return
    }
    if (campaign?.businessId) navigate(`/customer/business/${campaign.businessId}`)
    else navigate('/customer')
  }, [campaign?.businessId, navigate])

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
    if (pin.length < 3 || verifyMutation.isPending || !authReady || stampCollect) return
    verifyMutation.mutate(pin)
  }

  useEffect(() => {
    if (pin.length !== 3 || verifyMutation.isPending || !authReady || stampCollect) return
    const t = setTimeout(() => verifyMutation.mutate(pin), 300)
    return () => clearTimeout(t)
  }, [pin, authReady, stampCollect]) // eslint-disable-line react-hooks/exhaustive-deps

  const stateStillLoading =
    (campaign?.mechanic === 'shake' && playStateLoading)
    || (campaign?.mechanic === 'stamp' && stampStateLoading)
    || (campaign?.mechanic === 'check-in-loyalty' && loyaltyStateLoading)

  const shakeBlocked = campaign?.mechanic === 'shake' && playState && !playState.canPlay
  const stampBlocked = campaign?.mechanic === 'stamp' && stampState && (
    stampState.cardComplete
    || stampState.status === 'expired'
    || (stampState.enrolled && !stampState.canCollectToday)
    || (!stampState.enrolled && !stampState.enrollmentOpen)
  )
  const loyaltyBlocked = campaign?.mechanic === 'check-in-loyalty' && loyaltyState?.checkedInToday
  const blocked = Boolean(shakeBlocked || stampBlocked || loyaltyBlocked)

  useEffect(() => {
    if (!blocked || stampCollect || loyaltySplash || !campaign || sessionLoading || isLoading || stateStillLoading) return
    const path = campaign.businessId ? `/customer/business/${campaign.businessId}` : '/customer'
    navigate(path, { replace: true })
  }, [blocked, stampCollect, loyaltySplash, campaign, sessionLoading, isLoading, stateStillLoading, navigate])

  if (!localSessionOk || sessionError || (serverSession && serverSession.role !== 'customer')) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-5 text-center bg-white">
        <p className="text-[#2b2827] font-semibold mb-2">Sign in required</p>
        <p className="text-sm text-[#6b6461] mb-6">
          Sign in with your customer account to enter the staff PIN and play.
        </p>
        <button
          type="button"
          onClick={() => navigate(`/signin?reason=session_expired&from=/customer/campaigns/${id}`)}
          className="px-6 py-3 rounded-full font-bold text-sm text-white bg-[#5b0e81] border-0 cursor-pointer"
        >
          Sign in as customer
        </button>
      </div>
    )
  }

  if (sessionLoading || isLoading) return <CampaignPinLoading />

  if (stateStillLoading) return <CampaignPinLoading />

  if (!campaign) {
    return (
      <CampaignPinBlocked
        title="Campaign not available"
        detail="This campaign may have ended or been removed."
        emoji="😔"
        onBack={() => navigate('/customer')}
      />
    )
  }

  if (isMechanicComingSoon(campaign.mechanic)) {
    return (
      <MechanicComingSoon
        mechanic={campaign.mechanic}
        title={campaign.name}
        onBack={handleBack}
      />
    )
  }

  if (blocked && !stampCollect && !loyaltySplash) return <CampaignPinLoading />

  const isStamp = campaign.mechanic === 'stamp'
  const isLoyalty = campaign.mechanic === 'check-in-loyalty'
  const businessName = businesses?.find(b => b.id === campaign?.businessId)?.name ?? 'Store'

  const statusChips = (
    <>
      {campaign.mechanic === 'shake' && campaign.winRatePercent != null && (
        <StatusChip>{campaign.winRatePercent}% of players win</StatusChip>
      )}
      {isLoyalty && loyaltyState && (
        <StatusChip>{loyaltyState.loyaltyPoints} pts · +{loyaltyState.pointsPerCheckIn}/visit</StatusChip>
      )}
      {isLoyalty && loyaltyState?.checkedInToday && <StatusChip>Checked in today ✓</StatusChip>}
      {isStamp && stampState && (
        <StatusChip>
          {stampState.enrolled
            ? `${stampState.stampsCollected}/${stampState.totalStamps} stamps`
            : stampState.enrollmentOpen
              ? `${stampState.currentUsers}/${stampState.userCap} spots filled`
              : 'Enrollment closed'}
        </StatusChip>
      )}
      {playState && (
        <StatusChip>
          {!playState.canPlay && (playState.blockReason === 'daily_participant_limit' || playState.blockReason === 'user_cap')
            ? 'Campaign full today'
            : `${playState.playsUsedToday}/${playState.playsPerDay} attempts today`}
        </StatusChip>
      )}
    </>
  )

  const submitLabel = isStamp
    ? 'Collect stamp'
    : isLoyalty
      ? 'Check in'
      : campaign.mechanic === 'spin'
        ? 'Spin the wheel'
        : campaign.mechanic === 'dice'
          ? 'Open mystery box'
          : campaign.mechanic === 'lottery'
            ? 'Enter lottery'
            : "Let's shake!"

  if (campaign.mechanic === 'shake') {
    return (
      <ShakeCampaignDetail
        campaign={campaign}
        pin={pin}
        error={error}
        loading={verifyMutation.isPending}
        winRatePercent={campaign.winRatePercent}
        playsUsedToday={playState?.playsUsedToday}
        playsPerDay={playState?.playsPerDay ?? campaign.playsPerDay}
        onBack={handleBack}
        onKey={handleKey}
        onDelete={handleDelete}
        onSubmit={handleSubmit}
      />
    )
  }

  if (campaign.mechanic === 'check-in-loyalty' && loyaltyState) {
    return (
      <LoyaltyCampaignDetail
        campaign={campaign}
        loyaltyState={loyaltyState}
        onBack={handleBack}
        onSplashActiveChange={setLoyaltySplash}
      />
    )
  }

  if (campaign.mechanic === 'stamp' && stampState) {
    if (stampCollect) {
      return (
        <StampCollectOverlay
          campaignId={id!}
          businessId={campaign.businessId}
          playSessionToken={stampCollect.token}
          stampsBefore={stampCollect.stampsBefore}
          enrolledBefore={stampCollect.enrolledBefore}
          totalStamps={stampState.totalStamps}
          onDone={handleStampCollectDone}
        />
      )
    }

    return (
      <StampCampaignDetail
        campaign={campaign}
        businessName={businessName}
        stampState={stampState}
        pin={pin}
        error={error}
        loading={verifyMutation.isPending}
        onBack={handleBack}
        onKey={handleKey}
        onDelete={handleDelete}
        onSubmit={handleSubmit}
      />
    )
  }

  return (
    <CampaignPinShell
      businessName={businessName}
      campaignName={campaign.name}
      mechanic={campaign.mechanic}
      pin={pin}
      error={error}
      loading={verifyMutation.isPending}
      disabled={!authReady}
      onBack={handleBack}
      onKey={handleKey}
      onDelete={handleDelete}
      onSubmit={handleSubmit}
      submitLabel={submitLabel}
      statusChips={statusChips}
    />
  )
}
