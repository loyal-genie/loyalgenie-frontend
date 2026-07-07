import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, ArrowRight, Lock, Check, Save, AlertTriangle, AlertCircle,
  Play, Pause, StopCircle, Loader2, CalendarDays,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FieldInput as Input, Slider, Stepper } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { StatusBadge, MechanicBadge } from '@/components/ui/badge'
import {
  RewardPoolEditor, rewardShareTotal, rewardsAreValid,
  type RewardEntry,
} from '@/components/vendor/RewardPoolEditor'
import { StampDropEditor } from '@/components/vendor/StampDropEditor'
import {
  buildStampCampaignPayload,
  defaultStampUiState,
  hydrateStampUiFromCampaign,
  isStampDropValid,
  type StampDropUiState,
} from '@/lib/stamp-drop-config'
import { LoyaltyCampaignImpact, StampCampaignImpact, WinBasedCampaignImpact } from '@/components/vendor/CampaignImpactCards'
import {
  formatWinnerCount,
} from '@/lib/campaign-impact'
import { useCampaign, useUpdateCampaign } from '@/hooks/useCampaigns'
import { CampaignDeleteSection } from '@/components/vendor/CampaignDeleteSection'
import { getMechanicEmoji, getMechanicColor, formatDate } from '@/lib/utils'
import {
  DURATION_OPTIONS,
  inferDurationMode,
  inferClaimDurationMode,
  computeEndFromStart,
  campaignDayCount,
  durationModeToDays,
  fmtCampaignDate,
  type DurationMode,
} from '@/lib/campaign-duration'
import { effectiveCampaignStatus, singleDayDurationLabel, todayInCampaignTz } from '@/lib/campaign-dates'
import { getApiErrorMessage, type CampaignDto } from '@/lib/api'
import { ApiErrorBanner } from '@/components/shared/ApiErrorBanner'
import { MechanicComingSoonBanner } from '@/components/vendor/MechanicComingSoonBanner'
import type { CampaignStatus } from '@/lib/types'

const UNLIMITED_USER_CAP = 1_000_000
const CLAIM_DURATION_OPTIONS = DURATION_OPTIONS.filter(o => o.key !== 'custom')
const TODAY = todayInCampaignTz()
const EDIT_STEPS = ['Edit', 'Review']

function LockedField({ label, value, reason }: { label: string; value: string; reason?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <label className="text-xs font-semibold text-v-text-2 uppercase tracking-wider">{label}</label>
        <Lock className="w-3 h-3 text-v-text-3" />
      </div>
      <div className="bg-v-surface-2 border border-v-border rounded-xl px-4 py-2.5 text-sm text-v-text-3 select-none">
        {value}
      </div>
      {reason && <p className="text-[11px] text-v-text-3">{reason}</p>}
    </div>
  )
}

const STATUS_ACTIONS: Record<string, { label: string; icon: typeof Pause; status: 'paused' | 'active' | 'ended'; variant: 'secondary' | 'primary' | 'danger'; description: string }[]> = {
  active: [
    { label: 'Pause Campaign', icon: Pause, status: 'paused', variant: 'secondary', description: 'Stop new plays temporarily. Existing rewards stay valid.' },
    { label: 'End Campaign', icon: StopCircle, status: 'ended', variant: 'danger', description: 'Permanently end this campaign. Cannot be undone.' },
  ],
  paused: [
    { label: 'Resume Campaign', icon: Play, status: 'active', variant: 'primary', description: 'Reactivate the campaign for new plays.' },
    { label: 'End Campaign', icon: StopCircle, status: 'ended', variant: 'danger', description: 'Permanently end this campaign. Cannot be undone.' },
  ],
}

function toShakeRewards(rewards: CampaignDto['rewards']): RewardEntry[] {
  return rewards
    .filter(r => !r.rewardTier || r.rewardTier === 'shake')
    .map(r => ({
      id: r.id,
      name: r.name,
      description: r.description,
      icon: r.icon,
      probability: r.sharePercent,
      redeemExpiryMode: r.redeemExpiryMode ?? 'relative',
      redeemFixedDate: r.redeemFixedDate ?? '',
      redeemRelativeAmount: r.redeemRelativeAmount ?? 7,
      redeemRelativeUnit: r.redeemRelativeUnit ?? 'day',
    }))
}

function hydrateStampFromCampaign(campaign: CampaignDto) {
  const sc = campaign.stampStats?.stampConfig
  if (!sc) return defaultStampUiState()
  return hydrateStampUiFromCampaign(sc, campaign.rewards.map(r => ({
    id: r.id,
    name: r.name,
    description: r.description,
    icon: r.icon,
    tier: r.rewardTier,
    sharePercent: r.sharePercent,
    redeemExpiryMode: r.redeemExpiryMode,
    redeemFixedDate: r.redeemFixedDate,
    redeemRelativeAmount: r.redeemRelativeAmount,
    redeemRelativeUnit: r.redeemRelativeUnit,
  })))
}

function dropsEqual(a: StampDropUiState[], b: StampDropUiState[]) {
  return JSON.stringify(a) === JSON.stringify(b)
}

function rewardsEqual(a: RewardEntry[], b: RewardEntry[]) {
  if (a.length !== b.length) return false
  return a.every((r, i) => {
    const o = b[i]
    return r.id === o.id
      && r.name === o.name
      && r.description === o.description
      && r.icon === o.icon
      && r.probability === o.probability
      && r.redeemExpiryMode === o.redeemExpiryMode
      && r.redeemFixedDate === o.redeemFixedDate
      && r.redeemRelativeAmount === o.redeemRelativeAmount
      && r.redeemRelativeUnit === o.redeemRelativeUnit
  })
}

export function VendorCampaignEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: campaign, isLoading, error } = useCampaign(id)
  const updateMutation = useUpdateCampaign(id)

  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [durationMode, setDurationMode] = useState<DurationMode>('1m')
  const [endDate, setEndDate] = useState('')
  const [endTime, setEndTime] = useState('23:59')
  const [claimDurationMode, setClaimDurationMode] = useState<DurationMode>('14d')
  const [userCap, setUserCap] = useState(100)
  const [userCapLimited, setUserCapLimited] = useState(true)
  const [perDayUserLimit, setPerDayUserLimit] = useState(50)
  const [playsPerDay, setPlaysPerDay] = useState(1)
  const [overallWinners, setOverallWinners] = useState(150)
  const [rewards, setRewards] = useState<RewardEntry[]>([])
  const [stampConfig, setStampConfig] = useState(defaultStampUiState)
  const [originalStampConfig, setOriginalStampConfig] = useState(defaultStampUiState)
  const [pointsPerCheckIn, setPointsPerCheckIn] = useState(10)
  const [originalClaimDurationMode, setOriginalClaimDurationMode] = useState<DurationMode>('14d')
  const [originalUserCapLimited, setOriginalUserCapLimited] = useState(true)
  const [originalPointsPerCheckIn, setOriginalPointsPerCheckIn] = useState(10)
  const [saveState, setSaveState] = useState<'idle' | 'saved'>('idle')
  const [formError, setFormError] = useState<unknown>(null)
  const [pendingStatus, setPendingStatus] = useState<'paused' | 'active' | 'ended' | null>(null)
  const dailyLimitSyncRef = useRef<string | null>(null)

  useEffect(() => {
    if (!campaign) return
    setName(campaign.name)
    setEndDate(campaign.endDate)
    setEndTime(campaign.endTime ?? '23:59')
    setDurationMode(inferDurationMode(campaign.startDate, campaign.endDate))
    setUserCap(campaign.userCap >= UNLIMITED_USER_CAP ? 200 : campaign.userCap)
    setUserCapLimited(campaign.userCap < UNLIMITED_USER_CAP)
    setPerDayUserLimit(campaign.perDayUserLimit)
    setPlaysPerDay(campaign.playsPerDay)
    setOverallWinners(campaign.overallWinners ?? Math.max(1, Math.round(campaign.userCap * campaign.winRatePercent / 100)))
    setRewards(toShakeRewards(campaign.rewards))

    if (campaign.mechanic === 'stamp') {
      const hydrated = hydrateStampFromCampaign(campaign)
      setStampConfig(hydrated)
      setOriginalStampConfig(hydrated)
      const claimMode = inferClaimDurationMode(campaign.claimPeriodDays ?? campaign.stampStats?.claimPeriodDays ?? 30)
      setClaimDurationMode(claimMode)
      setOriginalClaimDurationMode(claimMode)
      setUserCap(campaign.userCap)
      setUserCapLimited(true)
      setOriginalUserCapLimited(true)
    }

    if (campaign.mechanic === 'check-in-loyalty') {
      const pts = campaign.loyaltyStats?.checkInConfig?.pointsPerCheckIn ?? 10
      setPointsPerCheckIn(pts)
      setOriginalPointsPerCheckIn(pts)
      setOriginalUserCapLimited(campaign.userCap < UNLIMITED_USER_CAP)
    }

    if (campaign.mechanic === 'shake' && campaign.startDate !== campaign.endDate) {
      const cap = campaign.userCap >= UNLIMITED_USER_CAP ? 200 : campaign.userCap
      dailyLimitSyncRef.current = `${cap}:${campaignDayCount(campaign.startDate, campaign.endDate)}`
    } else {
      dailyLimitSyncRef.current = null
    }
  }, [campaign])

  useEffect(() => {
    if (!campaign || campaign.mechanic !== 'shake') return
    if (campaign.startDate === endDate) return
    const status = effectiveCampaignStatus(campaign.status as CampaignStatus, campaign.endDate, TODAY)
    if (status === 'ended') return

    const days = campaignDayCount(campaign.startDate, endDate)
    const key = `${userCap}:${days}`
    if (dailyLimitSyncRef.current === null) {
      dailyLimitSyncRef.current = key
      return
    }
    if (dailyLimitSyncRef.current === key) return
    dailyLimitSyncRef.current = key
    const next = Math.max(1, Math.floor(userCap / days))
    setPerDayUserLimit(prev => (prev === next ? prev : next))
  }, [campaign, userCap, endDate])

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="w-8 h-8 text-v-purple animate-spin" />
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center">
        <p className="text-v-text font-semibold mb-2">Campaign not found</p>
        <p className="text-sm text-v-text-3 mb-4">{getApiErrorMessage(error, 'Could not load campaign')}</p>
        <Link to="/vendor/campaigns" className="text-sm text-v-purple font-semibold">← Back to campaigns</Link>
      </div>
    )
  }

  const mechanic = campaign.mechanic
  const isShake = mechanic === 'shake'
  const isStamp = mechanic === 'stamp'
  const isLoyalty = mechanic === 'check-in-loyalty'
  const status = effectiveCampaignStatus(campaign.status as CampaignStatus, campaign.endDate, TODAY)
  const isEnded = status === 'ended'
  const isLive = status === 'active' || status === 'paused'
  const color = getMechanicColor(mechanic as 'shake')
  const isSingleDay = campaign.startDate === endDate
  const originalIsSingleDay = campaign.startDate === campaign.endDate
  const campaignDays = campaignDayCount(campaign.startDate, endDate)
  const suggestedDailyLimit = Math.max(1, Math.floor(userCap / campaignDays))
  const minEndDate = isLive ? TODAY : campaign.startDate
  const effectiveUserCap = isLoyalty && !userCapLimited ? UNLIMITED_USER_CAP : userCap

  const selectDuration = (mode: DurationMode) => {
    setDurationMode(mode)
    if (mode !== 'custom') {
      const computed = computeEndFromStart(mode, campaign.startDate, endDate)
      setEndDate(computed < minEndDate ? minEndDate : computed)
    }
  }

  const stampConfigChanged = () => {
    if (!isStamp) return false
    return (
      stampConfig.totalStamps !== originalStampConfig.totalStamps ||
      stampConfig.prefillStamps !== originalStampConfig.prefillStamps ||
      !dropsEqual(stampConfig.surpriseDrops, originalStampConfig.surpriseDrops) ||
      !dropsEqual(stampConfig.bigRewards, originalStampConfig.bigRewards)
    )
  }

  const changedFields = {
    name: name !== campaign.name,
    endDate: endDate !== campaign.endDate,
    endTime: endTime !== (campaign.endTime ?? '23:59'),
    userCap: effectiveUserCap !== campaign.userCap,
    userCapLimited: isLoyalty && userCapLimited !== originalUserCapLimited,
    perDayUserLimit: isShake && perDayUserLimit !== campaign.perDayUserLimit,
    playsPerDay: isShake && playsPerDay !== campaign.playsPerDay,
    overallWinners: isShake && overallWinners !== (campaign.overallWinners ?? Math.max(1, Math.round(campaign.userCap * campaign.winRatePercent / 100))),
    rewards: isShake && !rewardsEqual(rewards, toShakeRewards(campaign.rewards)),
    claimPeriod: isStamp && claimDurationMode !== originalClaimDurationMode,
    stampConfig: stampConfigChanged(),
    pointsPerCheckIn: isLoyalty && pointsPerCheckIn !== originalPointsPerCheckIn,
  }

  const stampFormValid = () =>
    [...stampConfig.surpriseDrops, ...stampConfig.bigRewards].every(d =>
      d.to <= stampConfig.totalStamps && isStampDropValid(d),
    )

  const loyaltyFormValid = () => pointsPerCheckIn > 0

  const formValid = (() => {
    if (!name.trim() || endDate < campaign.startDate) return false
    if (isShake) return rewardsAreValid(rewards)
    if (isStamp) return stampFormValid()
    if (isLoyalty) return loyaltyFormValid()
    return true
  })()

  const hasChanges = Object.values(changedFields).some(Boolean)

  const handleSave = async () => {
    setFormError(null)
    try {
      const payload: Parameters<typeof updateMutation.mutateAsync>[0] = {}
      if (changedFields.name) payload.name = name.trim()
      if (changedFields.endDate) payload.endDate = endDate
      if (changedFields.endTime) payload.endTime = endTime
      if (changedFields.userCap || changedFields.userCapLimited) payload.userCap = effectiveUserCap

      if (isShake) {
        if (changedFields.perDayUserLimit) payload.perDayUserLimit = perDayUserLimit
        if (changedFields.playsPerDay) payload.playsPerDay = playsPerDay
        if (changedFields.overallWinners) payload.overallWinners = overallWinners
        if (changedFields.rewards) {
          payload.rewards = rewards
            .filter(r => r.name.trim())
            .map(r => ({
              id: r.id,
              name: r.name.trim(),
              description: r.description,
              icon: r.icon,
              sharePercent: r.probability,
              redeemExpiryMode: r.redeemExpiryMode,
              redeemFixedDate: r.redeemExpiryMode === 'fixed' ? r.redeemFixedDate : undefined,
              redeemRelativeAmount: r.redeemExpiryMode === 'relative' ? r.redeemRelativeAmount : undefined,
              redeemRelativeUnit: r.redeemExpiryMode === 'relative' ? r.redeemRelativeUnit : undefined,
            }))
        }
      }

      if (isStamp && (changedFields.claimPeriod || changedFields.stampConfig || changedFields.userCap)) {
        if (changedFields.claimPeriod) {
          payload.claimPeriodDays = durationModeToDays(claimDurationMode)
        }
        if (changedFields.stampConfig) {
          const stampPayload = buildStampCampaignPayload(stampConfig)
          payload.stampConfig = stampPayload.stampConfig
          payload.rewards = stampPayload.rewards
        }
      }

      if (isLoyalty && (changedFields.pointsPerCheckIn || changedFields.userCap)) {
        if (changedFields.pointsPerCheckIn) {
          payload.checkInConfig = { pointsPerCheckIn }
        }
      }

      await updateMutation.mutateAsync(payload)
      setSaveState('saved')
      setTimeout(() => navigate(`/vendor/campaigns/${id}`), 1200)
    } catch (err) {
      setFormError(err)
    }
  }

  const handleStatusChange = async (nextStatus: 'paused' | 'active' | 'ended') => {
    setFormError(null)
    setPendingStatus(nextStatus)
    try {
      await updateMutation.mutateAsync({ status: nextStatus })
      if (nextStatus === 'ended') {
        navigate('/vendor/campaigns')
      } else {
        navigate(`/vendor/campaigns/${id}`)
      }
    } catch (err) {
      setFormError(err)
      setPendingStatus(null)
    }
  }

  const durationLabel = isSingleDay
    ? singleDayDurationLabel(campaign.startDate, TODAY)
    : `${fmtCampaignDate(campaign.startDate)} → ${fmtCampaignDate(endDate)}`


  const reviewRows: { label: string; value: string; changed: boolean; previous?: string }[] = [
    { label: 'Campaign Name', value: name, changed: changedFields.name, previous: campaign.name },
    { label: 'Duration', value: durationLabel, changed: changedFields.endDate, previous: originalIsSingleDay ? singleDayDurationLabel(campaign.startDate, TODAY) : `${fmtCampaignDate(campaign.startDate)} → ${fmtCampaignDate(campaign.endDate)}` },
    ...(isShake ? [
      { label: 'Overall User Cap', value: `${userCap} users total`, changed: changedFields.userCap, previous: `${campaign.userCap} users total` },
      ...(!isSingleDay ? [{ label: 'Daily User Limit', value: `${perDayUserLimit} / day`, changed: changedFields.perDayUserLimit, previous: `${campaign.perDayUserLimit} / day` }] : []),
      { label: 'Plays Per User / Day', value: String(playsPerDay), changed: changedFields.playsPerDay, previous: String(campaign.playsPerDay) },
      { label: 'Overall Winners', value: `${formatWinnerCount(overallWinners, true)} customers`, changed: changedFields.overallWinners, previous: `${formatWinnerCount(campaign.overallWinners ?? Math.max(1, Math.round(campaign.userCap * campaign.winRatePercent / 100)), true)} customers` },
    ] : []),
    ...(isStamp ? [
      { label: 'User Cap', value: `${userCap} users`, changed: changedFields.userCap, previous: `${campaign.userCap} users` },
      { label: 'Claim Period', value: `${durationModeToDays(claimDurationMode)} days after enrollment closes`, changed: changedFields.claimPeriod, previous: `${durationModeToDays(originalClaimDurationMode)} days after enrollment closes` },
      { label: 'Stamp Config', value: `${stampConfig.totalStamps} stamps · ${stampConfig.surpriseDrops.length} surprise · ${stampConfig.bigRewards.length} big reward(s)`, changed: changedFields.stampConfig },
    ] : []),
    ...(isLoyalty ? [
      { label: 'User Cap', value: userCapLimited ? `${userCap} users` : 'All customers (no limit)', changed: changedFields.userCap || changedFields.userCapLimited, previous: originalUserCapLimited ? `${campaign.userCap >= UNLIMITED_USER_CAP ? 200 : campaign.userCap} users` : 'All customers (no limit)' },
      { label: 'Points per Check-in', value: `+${pointsPerCheckIn} pts`, changed: changedFields.pointsPerCheckIn, previous: `+${originalPointsPerCheckIn} pts` },
    ] : []),
  ]

  const mechanicTitle = isShake ? 'Shake & Win — Reward Distribution'
    : isStamp ? 'Stamp Card — Trigger Config & Rewards'
    : 'Campaign Configuration'

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <MechanicComingSoonBanner mechanic={mechanic} />
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <Link to={`/vendor/campaigns/${id}`} className="inline-flex items-center gap-1.5 text-sm text-v-text-2 hover:text-v-text mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to campaign
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
              {getMechanicEmoji(mechanic as 'shake')}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <h1 className="text-xl font-extrabold text-v-text">Edit Campaign</h1>
                <StatusBadge status={status} />
              </div>
              <MechanicBadge mechanic={mechanic as 'shake'} />
            </div>
          </div>
        </div>
      </motion.div>

      {!isEnded && (
        <div className="flex items-center gap-2 mb-8">
          {EDIT_STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all ${i < step ? 'bg-v-success text-white' : i === step ? 'bg-v-purple text-white' : 'bg-v-surface-2 text-v-text-3 border border-v-border'}`}>
                {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${i === step ? 'text-v-text' : 'text-v-text-3'}`}>{s}</span>
              {i < EDIT_STEPS.length - 1 && <div className={`h-px w-8 ${i < step ? 'bg-v-success' : 'bg-v-border'}`} />}
            </div>
          ))}
        </div>
      )}

      {formError != null && (
        <ApiErrorBanner error={formError} fallback="Failed to save campaign" className="mb-4" />
      )}

      {isLive && step === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl mb-5 text-xs text-amber-700">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <p><strong>Campaign is live.</strong> Start date and mechanic are locked. You can update duration, caps, rewards, and pause or end the campaign.</p>
        </motion.div>
      )}

      {isEnded && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-2.5 p-3.5 bg-v-surface-2 border border-v-border rounded-xl mb-5 text-xs text-v-text-2">
          <Lock className="w-4 h-4 shrink-0 mt-0.5" />
          <p>This campaign has ended and is read-only.</p>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}>
          {step === 0 && (
            <div className="space-y-4">
              <Card className="p-6">
                <h2 className="text-base font-bold text-v-text mb-5">Campaign Details</h2>
                <div className="space-y-6">
                  {isEnded ? (
                    <LockedField label="Campaign Name" value={campaign.name} />
                  ) : (
                    <Input label="Campaign Name" placeholder="e.g. Weekend Spin Fiesta" value={name} onChange={e => setName(e.target.value)} />
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-v-text-2 uppercase tracking-wider">Campaign Duration</label>
                      {!isEnded && endDate && (
                        <span className="text-xs text-v-purple font-semibold flex items-center gap-1.5">
                          <CalendarDays className="w-3.5 h-3.5" />
                          {durationLabel}
                        </span>
                      )}
                    </div>
                    {isEnded ? (
                      <LockedField label="Duration" value={durationLabel} />
                    ) : (
                      <>
                        <p className="text-[11px] text-v-text-3 mb-2">Start date {formatDate(campaign.startDate)} is locked after launch.</p>
                        <div className="flex flex-wrap gap-2">
                          {DURATION_OPTIONS.map(opt => (
                            <button key={opt.key} type="button" onClick={() => selectDuration(opt.key)} className={`rounded-xl py-2.5 px-3 text-center border-2 transition-all min-w-[4.5rem] ${durationMode === opt.key ? 'border-v-purple bg-v-surface-3' : 'border-v-border bg-white hover:border-v-border-b'}`}>
                              <div className={`text-sm font-bold ${durationMode === opt.key ? 'text-v-purple' : 'text-v-text'}`}>{opt.label}</div>
                              <div className="text-[10px] text-v-text-3 mt-0.5">{opt.sub}</div>
                            </button>
                          ))}
                        </div>
                        <AnimatePresence>
                          {durationMode === 'custom' && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-3 grid grid-cols-2 gap-4 overflow-hidden">
                              <Input label="End Date" type="date" min={minEndDate} value={endDate} onChange={e => setEndDate(e.target.value)} />
                              <Input label="End Time" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    )}
                  </div>

                  {isStamp && (
                    <div className="pt-2 border-t border-v-border">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-v-text-2 uppercase tracking-wider">Claim Period</label>
                        <span className="text-xs text-v-purple font-semibold">{durationModeToDays(claimDurationMode)} days after enrollment closes</span>
                      </div>
                      <p className="text-xs text-v-text-3 mb-3">After the campaign ends or user cap fills, enrolled customers have this long to complete their stamp card.</p>
                      {isEnded ? (
                        <LockedField label="Claim Period" value={`${durationModeToDays(claimDurationMode)} days`} />
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {CLAIM_DURATION_OPTIONS.map(opt => (
                            <button key={opt.key} type="button" onClick={() => setClaimDurationMode(opt.key)} className={`rounded-xl py-2.5 px-3 text-center border-2 transition-all min-w-[4.5rem] ${claimDurationMode === opt.key ? 'border-v-purple bg-v-surface-3' : 'border-v-border bg-white hover:border-v-border-b'}`}>
                              <div className={`text-sm font-bold ${claimDurationMode === opt.key ? 'text-v-purple' : 'text-v-text'}`}>{opt.label}</div>
                              <div className="text-[10px] text-v-text-3 mt-0.5">{opt.sub}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="pt-2 border-t border-v-border space-y-4">
                    <p className="text-[11px] font-semibold text-v-text-2 uppercase tracking-wider">Participation</p>

                    {isShake && (isEnded ? (
                      <>
                        <LockedField label="Overall User Cap" value={`${campaign.userCap} users total`} />
                        {!isSingleDay && <LockedField label="Daily User Limit" value={`${campaign.perDayUserLimit} users / day`} />}
                        <LockedField label="Plays Per User Per Day" value={`${campaign.playsPerDay} plays / day`} />
                        <LockedField label="Overall Winners" value={`${formatWinnerCount(campaign.overallWinners ?? Math.max(1, Math.round(campaign.userCap * campaign.winRatePercent / 100)), true)} customers`} />
                      </>
                    ) : (
                      <>
                        <Stepper label="Overall User Cap" hint="users total" value={userCap} min={Math.max(campaign.currentUsers, 1)} max={2000} step={1} onChange={setUserCap} />
                        <p className="text-[11px] text-v-text-3 -mt-2">{campaign.currentUsers} players joined · cap cannot go below current players</p>
                        {!isSingleDay && (
                          <div>
                            <Stepper label="Daily User Limit" hint="users / day" value={perDayUserLimit} min={1} max={userCap} onChange={setPerDayUserLimit} />
                            <p className="text-xs text-v-text-3 mt-1.5">Suggested: <span className="font-semibold text-v-text-2">{suggestedDailyLimit} / day</span> — even distribution over {campaignDays} days. Updates when cap or duration changes.</p>
                          </div>
                        )}
                        <Stepper label="Plays Per User Per Day" hint="plays / day" value={playsPerDay} min={1} max={10} onChange={setPlaysPerDay} />
                        <div>
                          <Stepper
                            label="Overall Winners"
                            hint="total prizes"
                            value={overallWinners}
                            min={1}
                            max={userCap}
                            step={1}
                            onChange={setOverallWinners}
                          />
                          <p className="text-xs text-v-text-3 mt-1.5">
                            <span className="font-semibold text-v-text-2">{formatWinnerCount(overallWinners, true)} winners</span>
                            {' '}out of {userCap.toLocaleString()} players max
                          </p>
                        </div>
                      </>
                    ))}

                    {isStamp && (isEnded ? (
                      <LockedField label="User Cap" value={`${campaign.userCap} users`} />
                    ) : (
                      <Stepper label="User Cap" hint="users" value={userCap} min={Math.max(campaign.currentUsers, 1)} max={2000} step={1} onChange={setUserCap} />
                    ))}

                    {isLoyalty && (
                      <div className="space-y-3">
                        {isEnded ? (
                          <LockedField label="User Cap" value={userCapLimited ? `${campaign.userCap >= UNLIMITED_USER_CAP ? 'All customers' : `${campaign.userCap} users`}` : 'All customers (no limit)'} />
                        ) : (
                          <>
                            <div className="flex rounded-lg border border-v-border overflow-hidden bg-v-surface-2 p-0.5 gap-0.5">
                              {([{ key: false, label: 'All customers' }, { key: true, label: 'Limit participants' }] as const).map(opt => (
                                <button key={String(opt.key)} type="button" onClick={() => setUserCapLimited(opt.key)} className={`flex-1 py-2 rounded-md text-xs font-semibold transition-all ${userCapLimited === opt.key ? 'bg-white text-v-text shadow-sm' : 'text-v-text-3 hover:text-v-text-2'}`}>
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                            {userCapLimited ? (
                              <Stepper label="User Cap" hint="max participants" value={userCap} min={Math.max(campaign.currentUsers, 1)} max={2000} step={1} onChange={setUserCap} />
                            ) : (
                              <div className="flex items-start gap-2.5 p-3.5 bg-v-surface-2 border border-v-border rounded-xl text-xs text-v-text-2">
                                <AlertCircle className="w-4 h-4 text-v-purple shrink-0 mt-0.5" />
                                <p>Open to all customers — no enrollment limit.</p>
                              </div>
                            )}
                          </>
                        )}
                        {isEnded ? (
                          <LockedField label="Points per Check-in" value={`+${pointsPerCheckIn} pts`} />
                        ) : (
                          <Stepper label="Points per Check-in" hint="points earned per visit" value={pointsPerCheckIn} min={1} max={1000} onChange={setPointsPerCheckIn} />
                        )}
                      </div>
                    )}

                    {isStamp && (
                      <div className="flex items-start gap-2.5 p-3.5 bg-v-surface-2 border border-v-border rounded-xl text-xs text-v-text-2">
                        <AlertCircle className="w-4 h-4 text-v-purple shrink-0 mt-0.5" />
                        <p>Stamp Card rewards fire at specific stamp positions — reward volume is determined by your stamp config.</p>
                      </div>
                    )}

                    {isLoyalty && (
                      <div className="flex items-start gap-2.5 p-3.5 bg-purple-50 border border-purple-200 rounded-xl text-xs text-v-text-2">
                        <AlertCircle className="w-4 h-4 text-v-purple shrink-0 mt-0.5" />
                        <p>Staff PIN refreshes every 2 minutes on your dashboard. Customers check in daily to earn points.</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {(isShake || isStamp) && (
              <Card className="p-6">
                <h2 className="text-base font-bold text-v-text mb-1">{mechanicTitle}</h2>

                {isShake && (
                  <>
                    <p className="text-xs text-v-text-3 mb-4">Configure how winning plays are distributed across reward types.</p>
                    <div className="flex items-center gap-2 mb-5 p-2.5 bg-v-surface-2 border border-v-border rounded-xl text-xs">
                      <span className="text-v-text-3">Expected winners:</span>
                      <span className="font-bold text-v-purple">{formatWinnerCount(overallWinners, true)} total</span>
                    </div>
                    {isEnded ? (
                      <RewardPoolEditor rewards={rewards} setRewards={setRewards} shareMode readOnly />
                    ) : (
                      <>
                        <RewardPoolEditor rewards={rewards} setRewards={setRewards} shareMode />
                        {rewardShareTotal(rewards) !== 100 && (
                          <p className="text-xs text-v-danger mt-2">Reward shares must add up to exactly 100% before saving.</p>
                        )}
                      </>
                    )}
                  </>
                )}

                {isStamp && (
                  <>
                    <p className="text-xs text-v-text-3 mb-5">Add surprise drops and big rewards at stamp ranges. Each drop can have its own reward and redeem-before window.</p>
                    {isEnded ? (
                      <LockedField label="Stamp configuration" value={`${stampConfig.totalStamps} stamps · ${stampConfig.surpriseDrops.length} surprise · ${stampConfig.bigRewards.length} big reward(s)`} />
                    ) : (
                      <div className="space-y-5">
                        <Slider label="Total Stamps" displayValue={`${stampConfig.totalStamps} stamps`} min={5} max={30} step={1} value={stampConfig.totalStamps}
                          onChange={e => {
                            const n = Number(e.target.value)
                            setStampConfig(p => ({
                              ...p,
                              totalStamps: n,
                              prefillStamps: Math.min(p.prefillStamps, n),
                              surpriseDrops: p.surpriseDrops.map(d => ({
                                ...d,
                                from: Math.min(d.from, n),
                                to: Math.min(Math.max(d.to, d.from), n),
                              })),
                              bigRewards: p.bigRewards.map(d => ({
                                ...d,
                                from: Math.min(d.from, n),
                                to: Math.min(Math.max(d.to, d.from), n),
                              })),
                            }))
                          }}
                        />
                        <Stepper label="Pre-fill Stamps" hint="stamps pre-filled" value={stampConfig.prefillStamps} min={0} max={stampConfig.totalStamps} onChange={v => setStampConfig(p => ({ ...p, prefillStamps: v }))} />

                        <StampDropEditor
                          title="Surprise Drops"
                          emoji="🎁"
                          tier="surprise"
                          drops={stampConfig.surpriseDrops}
                          setDrops={surpriseDrops => setStampConfig(p => ({ ...p, surpriseDrops }))}
                          totalStamps={stampConfig.totalStamps}
                        />

                        <StampDropEditor
                          title="Big Rewards"
                          emoji="🏆"
                          tier="big"
                          drops={stampConfig.bigRewards}
                          setDrops={bigRewards => setStampConfig(p => ({ ...p, bigRewards }))}
                          totalStamps={stampConfig.totalStamps}
                        />
                      </div>
                    )}
                  </>
                )}
              </Card>
              )}

              {!isEnded && STATUS_ACTIONS[status] && (
                <Card className="p-6">
                  <h2 className="text-sm font-bold text-v-text mb-5">Campaign Status</h2>
                  <div className="space-y-3">
                    {STATUS_ACTIONS[status]!.map(action => (
                      <div key={action.label} className="flex items-center justify-between gap-4 p-4 rounded-xl border border-v-border bg-v-surface-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-v-text">{action.label}</p>
                          <p className="text-xs text-v-text-3 mt-0.5">{action.description}</p>
                        </div>
                        <Button variant={action.variant} size="sm" disabled={updateMutation.isPending} onClick={() => handleStatusChange(action.status)}>
                          {pendingStatus === action.status ? <Loader2 className="w-4 h-4 animate-spin" /> : <action.icon className="w-4 h-4" />}
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              <CampaignDeleteSection
                campaignId={campaign.id}
                campaignName={campaign.name}
                participations={campaign.participations}
                onDeleted={() => navigate('/vendor/campaigns')}
              />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <Card className="p-6">
                <h2 className="text-base font-bold text-v-text mb-4">Review Changes</h2>
                <div className="space-y-0">
                  {reviewRows.map(item => (
                    <div key={item.label} className="flex items-center justify-between py-3 border-b border-v-border last:border-0 gap-4">
                      <span className="text-sm text-v-text-2 shrink-0">{item.label}</span>
                      <div className="text-right min-w-0">
                        {item.changed && item.previous ? (
                          <div className="space-y-0.5">
                            <span className="text-xs text-v-text-3 line-through block">{item.previous}</span>
                            <span className="text-sm font-semibold text-v-purple block">{item.value}</span>
                          </div>
                        ) : (
                          <span className={`text-sm font-semibold ${item.changed ? 'text-v-purple' : 'text-v-text'}`}>{item.value}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {isShake && changedFields.rewards && (
                <Card className="p-6">
                  <h3 className="text-sm font-bold text-v-text mb-3">Reward Changes</h3>
                  <div className="space-y-2">
                    {rewards.filter(r => r.name).map(r => (
                      <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-v-surface-2 border border-v-border text-sm">
                        <span>{r.icon} {r.name}</span>
                        <span className="text-v-text-3">{r.probability}% share</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {isShake && (
                <WinBasedCampaignImpact
                  userCap={userCap}
                  overallWinners={overallWinners}
                  perDayUserLimit={isSingleDay ? userCap : perDayUserLimit}
                  campaignDays={campaignDays}
                  startDate={campaign.startDate}
                  endDate={endDate}
                  isSingleDay={isSingleDay}
                  variant="muted"
                />
              )}

              {isStamp && (
                <StampCampaignImpact userCap={userCap} totalStamps={stampConfig.totalStamps} variant="muted" />
              )}

              {isLoyalty && (
                <LoyaltyCampaignImpact
                  userCap={userCapLimited ? userCap : null}
                  userCapLimited={userCapLimited}
                  pointsPerCheckIn={pointsPerCheckIn}
                  milestoneCount={0}
                  variant="muted"
                />
              )}

              <Button variant="gold" size="lg" className="w-full" onClick={handleSave} disabled={updateMutation.isPending || saveState === 'saved'}>
                {updateMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : saveState === 'saved' ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                {updateMutation.isPending ? 'Saving…' : saveState === 'saved' ? 'Saved!' : 'Save Changes'}
              </Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {!isEnded && (
        <div className="flex items-center justify-between mt-8">
          <Button variant="ghost" onClick={() => step > 0 ? setStep(0) : navigate(`/vendor/campaigns/${id}`)}>
            <ArrowLeft className="w-4 h-4" /> {step === 0 ? 'Cancel' : 'Back'}
          </Button>
          {step === 0 && (
            <Button variant="primary" disabled={!hasChanges || !formValid} onClick={() => setStep(1)}>
              Review Changes <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
