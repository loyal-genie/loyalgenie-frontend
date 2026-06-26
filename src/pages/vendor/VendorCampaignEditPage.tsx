import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, ArrowRight, Lock, Check, Save, AlertTriangle, AlertCircle,
  Play, Pause, StopCircle, Loader2, CalendarDays, Plus, Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FieldInput as Input, Slider, Stepper } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { StatusBadge, MechanicBadge } from '@/components/ui/badge'
import {
  RewardPoolEditor, RewardModeToggle, SingleRewardInput, NumericInput,
  REWARD_ICONS, newRewardEntry, rewardShareTotal, rewardsAreValid, rewardPoolValid,
  type RewardEntry, type RewardMode,
} from '@/components/vendor/RewardPoolEditor'
import { LoyaltyCampaignImpact, StampCampaignImpact, WinBasedCampaignImpact } from '@/components/vendor/CampaignImpactCards'
import {
  formatWinnerCount,
} from '@/lib/campaign-impact'
import { useCampaign, useUpdateCampaign } from '@/hooks/useCampaigns'
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
import { MechanicComingSoonBanner } from '@/components/vendor/MechanicComingSoonBanner'
import type { CampaignStatus } from '@/lib/types'

const UNLIMITED_USER_CAP = 1_000_000
const CLAIM_DURATION_OPTIONS = DURATION_OPTIONS.filter(o => o.key !== 'custom')
const TODAY = todayInCampaignTz()
const EDIT_STEPS = ['Edit', 'Review']

interface MilestoneEntry {
  id: string
  name: string
  description: string
  icon: string
  pointsThreshold: number
}

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
    }))
}

function tierRewardsToEntries(rewards: CampaignDto['rewards'], tier: string): RewardEntry[] {
  return rewards
    .filter(r => r.rewardTier === tier)
    .map(r => ({
      id: r.id,
      name: r.name,
      description: r.description,
      icon: r.icon,
      probability: r.sharePercent,
    }))
}

function hydrateStampFromCampaign(campaign: CampaignDto) {
  const sc = campaign.stampStats?.stampConfig
  const surpriseRewards = tierRewardsToEntries(campaign.rewards, 'surprise')
  const bigRewards = tierRewardsToEntries(campaign.rewards, 'big')
  const surpriseMode: RewardMode = sc?.surpriseMode ?? (surpriseRewards.length <= 1 ? 'single' : 'pool')
  const bigMode: RewardMode = sc?.bigMode ?? (bigRewards.length <= 1 ? 'single' : 'pool')

  return {
    totalStamps: sc?.totalStamps ?? 10,
    prefillStamps: sc?.prefillStamps ?? 0,
    surpriseFrom: sc?.surpriseRange?.[0] ?? 3,
    surpriseTo: sc?.surpriseRange?.[1] ?? 5,
    bigRewardFrom: sc?.bigRange?.[0] ?? 8,
    bigRewardTo: sc?.bigRange?.[1] ?? 10,
    surpriseMode,
    surpriseSingle: surpriseMode === 'single' ? (surpriseRewards[0]?.name ?? '') : '',
    surprisePool: surpriseMode === 'pool' && surpriseRewards.length > 0 ? surpriseRewards : [newRewardEntry()],
    bigMode,
    bigSingle: bigMode === 'single' ? (bigRewards[0]?.name ?? '') : '',
    bigPool: bigMode === 'pool' && bigRewards.length > 0 ? bigRewards : [newRewardEntry()],
  }
}

function hydrateMilestones(campaign: CampaignDto): MilestoneEntry[] {
  const rows = campaign.rewards.filter(r => r.rewardTier === 'milestone')
  if (rows.length === 0) {
    return [{ id: Math.random().toString(36).slice(2), name: '', description: '', icon: '🎁', pointsThreshold: 50 }]
  }
  return rows.map(r => ({
    id: r.id,
    name: r.name,
    description: r.description,
    icon: r.icon,
    pointsThreshold: r.sharePercent,
  }))
}

function rewardsEqual(a: RewardEntry[], b: RewardEntry[]) {
  if (a.length !== b.length) return false
  return a.every((r, i) => {
    const o = b[i]
    return r.id === o.id && r.name === o.name && r.description === o.description && r.icon === o.icon && r.probability === o.probability
  })
}

function milestonesEqual(a: MilestoneEntry[], b: MilestoneEntry[]) {
  if (a.length !== b.length) return false
  return a.every((m, i) => {
    const o = b[i]
    return m.id === o.id && m.name === o.name && m.description === o.description && m.icon === o.icon && m.pointsThreshold === o.pointsThreshold
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
  const [claimDurationMode, setClaimDurationMode] = useState<DurationMode>('14d')
  const [userCap, setUserCap] = useState(100)
  const [userCapLimited, setUserCapLimited] = useState(true)
  const [perDayUserLimit, setPerDayUserLimit] = useState(50)
  const [playsPerDay, setPlaysPerDay] = useState(1)
  const [overallWinners, setOverallWinners] = useState(150)
  const [rewards, setRewards] = useState<RewardEntry[]>([])
  const [stampConfig, setStampConfig] = useState(() => ({
    totalStamps: 10,
    prefillStamps: 0,
    surpriseFrom: 3,
    surpriseTo: 5,
    surpriseMode: 'single' as RewardMode,
    surpriseSingle: '',
    surprisePool: [newRewardEntry()] as RewardEntry[],
    bigRewardFrom: 8,
    bigRewardTo: 10,
    bigMode: 'single' as RewardMode,
    bigSingle: '',
    bigPool: [newRewardEntry()] as RewardEntry[],
  }))
  const [pointsPerCheckIn, setPointsPerCheckIn] = useState(10)
  const [milestones, setMilestones] = useState<MilestoneEntry[]>([])
  const [originalStampConfig, setOriginalStampConfig] = useState(stampConfig)
  const [originalMilestones, setOriginalMilestones] = useState<MilestoneEntry[]>([])
  const [originalClaimDurationMode, setOriginalClaimDurationMode] = useState<DurationMode>('14d')
  const [originalUserCapLimited, setOriginalUserCapLimited] = useState(true)
  const [originalPointsPerCheckIn, setOriginalPointsPerCheckIn] = useState(10)
  const [saveState, setSaveState] = useState<'idle' | 'saved'>('idle')
  const [formError, setFormError] = useState('')
  const [pendingStatus, setPendingStatus] = useState<'paused' | 'active' | 'ended' | null>(null)
  const dailyLimitSyncRef = useRef<string | null>(null)

  useEffect(() => {
    if (!campaign) return
    setName(campaign.name)
    setEndDate(campaign.endDate)
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
      const ms = hydrateMilestones(campaign)
      setMilestones(ms)
      setOriginalMilestones(ms)
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

  const surprisePoolTotal = stampConfig.surprisePool.reduce((s, r) => s + r.probability, 0)
  const bigPoolTotal = stampConfig.bigPool.reduce((s, r) => s + r.probability, 0)

  const stampRewardsChanged = () => {
    if (!isStamp) return false
    if (stampConfig.surpriseMode !== originalStampConfig.surpriseMode) return true
    if (stampConfig.bigMode !== originalStampConfig.bigMode) return true
    if (stampConfig.surpriseSingle !== originalStampConfig.surpriseSingle) return true
    if (stampConfig.bigSingle !== originalStampConfig.bigSingle) return true
    if (!rewardsEqual(stampConfig.surprisePool, originalStampConfig.surprisePool)) return true
    if (!rewardsEqual(stampConfig.bigPool, originalStampConfig.bigPool)) return true
    return false
  }

  const stampConfigChanged = () => {
    if (!isStamp) return false
    return (
      stampConfig.totalStamps !== originalStampConfig.totalStamps ||
      stampConfig.prefillStamps !== originalStampConfig.prefillStamps ||
      stampConfig.surpriseFrom !== originalStampConfig.surpriseFrom ||
      stampConfig.surpriseTo !== originalStampConfig.surpriseTo ||
      stampConfig.bigRewardFrom !== originalStampConfig.bigRewardFrom ||
      stampConfig.bigRewardTo !== originalStampConfig.bigRewardTo ||
      stampRewardsChanged()
    )
  }

  const changedFields = {
    name: name !== campaign.name,
    endDate: endDate !== campaign.endDate,
    userCap: effectiveUserCap !== campaign.userCap,
    userCapLimited: isLoyalty && userCapLimited !== originalUserCapLimited,
    perDayUserLimit: isShake && perDayUserLimit !== campaign.perDayUserLimit,
    playsPerDay: isShake && playsPerDay !== campaign.playsPerDay,
    overallWinners: isShake && overallWinners !== (campaign.overallWinners ?? Math.max(1, Math.round(campaign.userCap * campaign.winRatePercent / 100))),
    rewards: isShake && !rewardsEqual(rewards, toShakeRewards(campaign.rewards)),
    claimPeriod: isStamp && claimDurationMode !== originalClaimDurationMode,
    stampConfig: stampConfigChanged(),
    pointsPerCheckIn: isLoyalty && pointsPerCheckIn !== originalPointsPerCheckIn,
    milestones: isLoyalty && !milestonesEqual(milestones, originalMilestones),
  }

  const stampFormValid = () => {
    const sValid = stampConfig.surpriseMode === 'single'
      ? stampConfig.surpriseSingle.trim().length > 0
      : rewardPoolValid(stampConfig.surprisePool)
    const bValid = stampConfig.bigMode === 'single'
      ? stampConfig.bigSingle.trim().length > 0
      : rewardPoolValid(stampConfig.bigPool)
    return sValid && bValid
  }

  const loyaltyFormValid = () => {
    const thresholds = milestones.map(m => m.pointsThreshold)
    const unique = new Set(thresholds)
    return milestones.every(m => m.name.trim() && m.pointsThreshold > 0) && unique.size === thresholds.length
  }

  const formValid = (() => {
    if (!name.trim() || endDate < campaign.startDate) return false
    if (isShake) return rewardsAreValid(rewards)
    if (isStamp) return stampFormValid()
    if (isLoyalty) return loyaltyFormValid()
    return true
  })()

  const hasChanges = Object.values(changedFields).some(Boolean)

  const handleSave = async () => {
    setFormError('')
    try {
      const payload: Parameters<typeof updateMutation.mutateAsync>[0] = {}
      if (changedFields.name) payload.name = name.trim()
      if (changedFields.endDate) payload.endDate = endDate
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
            }))
        }
      }

      if (isStamp && (changedFields.claimPeriod || changedFields.stampConfig || changedFields.userCap)) {
        if (changedFields.claimPeriod) {
          payload.claimPeriodDays = durationModeToDays(claimDurationMode)
        }
        if (changedFields.stampConfig) {
          payload.stampConfig = {
            totalStamps: stampConfig.totalStamps,
            prefillStamps: stampConfig.prefillStamps,
            surpriseRange: [stampConfig.surpriseFrom, stampConfig.surpriseTo],
            bigRange: [stampConfig.bigRewardFrom, stampConfig.bigRewardTo],
            surpriseMode: stampConfig.surpriseMode,
            bigMode: stampConfig.bigMode,
          }
          payload.rewards = {
            surprise: stampConfig.surpriseMode === 'single'
              ? [{ name: stampConfig.surpriseSingle.trim(), icon: '🎁', winPercent: 100 }]
              : stampConfig.surprisePool.filter(r => r.name).map(r => ({
                  id: r.id,
                  name: r.name.trim(),
                  description: r.description,
                  icon: r.icon,
                  winPercent: r.probability,
                })),
            big: stampConfig.bigMode === 'single'
              ? [{ name: stampConfig.bigSingle.trim(), icon: '🏆', winPercent: 100 }]
              : stampConfig.bigPool.filter(r => r.name).map(r => ({
                  id: r.id,
                  name: r.name.trim(),
                  description: r.description,
                  icon: r.icon,
                  winPercent: r.probability,
                })),
          }
        }
      }

      if (isLoyalty && (changedFields.pointsPerCheckIn || changedFields.milestones || changedFields.userCap)) {
        if (changedFields.pointsPerCheckIn) {
          payload.checkInConfig = { pointsPerCheckIn }
        }
        if (changedFields.milestones) {
          payload.milestones = milestones
            .filter(m => m.name.trim())
            .map(m => ({
              id: m.id,
              name: m.name.trim(),
              description: m.description,
              icon: m.icon,
              pointsThreshold: m.pointsThreshold,
            }))
        }
      }

      await updateMutation.mutateAsync(payload)
      setSaveState('saved')
      setTimeout(() => navigate(`/vendor/campaigns/${id}`), 1200)
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'Failed to save changes'))
    }
  }

  const handleStatusChange = async (nextStatus: 'paused' | 'active' | 'ended') => {
    setFormError('')
    setPendingStatus(nextStatus)
    try {
      await updateMutation.mutateAsync({ status: nextStatus })
      if (nextStatus === 'ended') {
        navigate('/vendor/campaigns')
      } else {
        navigate(`/vendor/campaigns/${id}`)
      }
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'Failed to update campaign status'))
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
      { label: 'Stamp Config', value: `${stampConfig.totalStamps} stamps · Surprise ${stampConfig.surpriseFrom}–${stampConfig.surpriseTo} · Big ${stampConfig.bigRewardFrom}–${stampConfig.bigRewardTo}`, changed: changedFields.stampConfig },
    ] : []),
    ...(isLoyalty ? [
      { label: 'User Cap', value: userCapLimited ? `${userCap} users` : 'All customers (no limit)', changed: changedFields.userCap || changedFields.userCapLimited, previous: originalUserCapLimited ? `${campaign.userCap >= UNLIMITED_USER_CAP ? 200 : campaign.userCap} users` : 'All customers (no limit)' },
      { label: 'Points per Check-in', value: `+${pointsPerCheckIn} pts`, changed: changedFields.pointsPerCheckIn, previous: `+${originalPointsPerCheckIn} pts` },
      { label: 'Milestones', value: `${milestones.filter(m => m.name).length} reward${milestones.filter(m => m.name).length !== 1 ? 's' : ''}`, changed: changedFields.milestones },
    ] : []),
  ]

  const mechanicTitle = isShake ? 'Shake & Win — Reward Distribution'
    : isStamp ? 'Stamp Card — Trigger Config & Rewards'
    : isLoyalty ? 'Check-in Loyalty — Points & Milestones'
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

      {formError && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{formError}</div>
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
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-3 overflow-hidden">
                              <Input label="End Date" type="date" min={minEndDate} value={endDate} onChange={e => setEndDate(e.target.value)} />
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
                        <p>Staff PIN refreshes every 2 minutes. Customers check in daily to earn points and unlock milestone rewards.</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

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
                    <p className="text-xs text-v-text-3 mb-5">Set stamp positions for each reward trigger, then configure what gets awarded.</p>
                    {isEnded ? (
                      <LockedField label="Stamp configuration" value={`${stampConfig.totalStamps} stamps · Surprise ${stampConfig.surpriseFrom}–${stampConfig.surpriseTo} · Big ${stampConfig.bigRewardFrom}–${stampConfig.bigRewardTo}`} />
                    ) : (
                      <div className="space-y-5">
                        <Slider label="Total Stamps" displayValue={`${stampConfig.totalStamps} stamps`} min={5} max={20} step={1} value={stampConfig.totalStamps}
                          onChange={e => {
                            const n = Number(e.target.value)
                            setStampConfig(p => {
                              const surpriseFrom = Math.min(Math.max(p.surpriseFrom, 1), n)
                              const bigRewardFrom = Math.min(Math.max(p.bigRewardFrom, 1), n)
                              return {
                                ...p,
                                totalStamps: n,
                                prefillStamps: Math.min(p.prefillStamps, n),
                                surpriseFrom,
                                surpriseTo: Math.min(Math.max(p.surpriseTo, surpriseFrom), n),
                                bigRewardFrom,
                                bigRewardTo: Math.min(Math.max(p.bigRewardTo, bigRewardFrom), n),
                              }
                            })
                          }}
                        />
                        <Stepper label="Pre-fill Stamps" hint="stamps pre-filled" value={stampConfig.prefillStamps} min={0} max={stampConfig.totalStamps} onChange={v => setStampConfig(p => ({ ...p, prefillStamps: v }))} />

                        <div className="p-4 bg-v-surface-2 border border-v-border rounded-xl space-y-3">
                          <div className="flex items-center gap-2 mb-1"><span className="text-base">🎁</span><p className="text-xs font-bold text-v-text-2 uppercase tracking-wider">Surprise Drop</p></div>
                          <div className="grid grid-cols-2 gap-3">
                            <Input label="From Stamp #" type="number" min={1} max={stampConfig.totalStamps} value={stampConfig.surpriseFrom} onChange={e => setStampConfig(p => ({ ...p, surpriseFrom: Number(e.target.value) }))} />
                            <Input label="To Stamp #" type="number" min={stampConfig.surpriseFrom} max={stampConfig.totalStamps} value={stampConfig.surpriseTo} onChange={e => setStampConfig(p => ({ ...p, surpriseTo: Number(e.target.value) }))} />
                          </div>
                          <RewardModeToggle mode={stampConfig.surpriseMode} onChange={m => setStampConfig(p => ({ ...p, surpriseMode: m }))} />
                          {stampConfig.surpriseMode === 'single' ? (
                            <SingleRewardInput value={stampConfig.surpriseSingle} onChange={v => setStampConfig(p => ({ ...p, surpriseSingle: v }))} placeholder="e.g. Mystery Treat" />
                          ) : (
                            <RewardPoolEditor compact rewards={stampConfig.surprisePool} setRewards={r => setStampConfig(p => ({ ...p, surprisePool: r }))} />
                          )}
                          {stampConfig.surpriseMode === 'pool' && surprisePoolTotal > 100 && (
                            <p className="text-xs text-v-danger">Surprise pool total cannot exceed 100%.</p>
                          )}
                        </div>

                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
                          <div className="flex items-center gap-2 mb-1"><span className="text-base">🏆</span><p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Big Reward</p></div>
                          <div className="grid grid-cols-2 gap-3">
                            <Input label="From Stamp #" type="number" min={1} max={stampConfig.totalStamps} value={stampConfig.bigRewardFrom} onChange={e => setStampConfig(p => ({ ...p, bigRewardFrom: Number(e.target.value) }))} />
                            <Input label="To Stamp #" type="number" min={stampConfig.bigRewardFrom} max={stampConfig.totalStamps} value={stampConfig.bigRewardTo} onChange={e => setStampConfig(p => ({ ...p, bigRewardTo: Number(e.target.value) }))} />
                          </div>
                          <RewardModeToggle mode={stampConfig.bigMode} onChange={m => setStampConfig(p => ({ ...p, bigMode: m }))} />
                          {stampConfig.bigMode === 'single' ? (
                            <SingleRewardInput value={stampConfig.bigSingle} onChange={v => setStampConfig(p => ({ ...p, bigSingle: v }))} placeholder="e.g. Free Breakfast Combo" />
                          ) : (
                            <RewardPoolEditor compact rewards={stampConfig.bigPool} setRewards={r => setStampConfig(p => ({ ...p, bigPool: r }))} />
                          )}
                          {stampConfig.bigMode === 'pool' && bigPoolTotal > 100 && (
                            <p className="text-xs text-v-danger">Big reward pool total cannot exceed 100%.</p>
                          )}
                        </div>

                        <div>
                          <p className="text-[11px] font-semibold text-v-text-2 uppercase tracking-wider mb-2">Card Preview</p>
                          <div className="flex flex-wrap gap-1.5">
                            {Array.from({ length: stampConfig.totalStamps }, (_, i) => {
                              const n = i + 1
                              const isPrefilled = n <= stampConfig.prefillStamps
                              const isSurprise = n >= stampConfig.surpriseFrom && n <= stampConfig.surpriseTo
                              const isBig = n >= stampConfig.bigRewardFrom && n <= stampConfig.bigRewardTo
                              return (
                                <div key={n} className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold border-2 ${isPrefilled ? 'border-v-purple bg-v-purple text-white' : isBig ? 'border-amber-400 bg-amber-50 text-amber-600' : isSurprise ? 'border-v-purple/40 bg-v-surface-2 text-v-purple' : 'border-v-border text-v-text-3'}`}>
                                  {isPrefilled ? '✓' : isBig ? '🏆' : isSurprise ? '?' : n}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {isLoyalty && (
                  <>
                    <p className="text-xs text-v-text-3 mb-5">Customers earn points on each daily check-in. Configure rewards when they reach point thresholds.</p>
                    {isEnded ? (
                      <div className="space-y-2">
                        <LockedField label="Points per Check-in" value={`+${pointsPerCheckIn} pts`} />
                        {milestones.filter(m => m.name).map(m => (
                          <div key={m.id} className="flex justify-between p-3 rounded-xl bg-v-surface-2 border border-v-border text-sm">
                            <span>{m.icon} {m.name}</span>
                            <span className="text-v-purple font-bold">{m.pointsThreshold} pts</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-5">
                        <Stepper label="Points per Check-in" hint="points earned per visit" value={pointsPerCheckIn} min={1} max={999} onChange={setPointsPerCheckIn} />
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-semibold text-v-text-2 uppercase tracking-wider">Reward Milestones</span>
                            <Button variant="secondary" size="sm" onClick={() => setMilestones(p => [...p, { id: Math.random().toString(36).slice(2), name: '', description: '', icon: '🎁', pointsThreshold: (p.at(-1)?.pointsThreshold ?? 0) + 50 }])}>
                              <Plus className="w-3 h-3" /> Add Milestone
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {milestones.map(m => (
                              <div key={m.id} className="p-3 bg-v-surface-2 border border-v-border rounded-xl">
                                <div className="flex items-start gap-2">
                                  <select value={m.icon} onChange={e => setMilestones(p => p.map(x => x.id === m.id ? { ...x, icon: e.target.value } : x))} className="text-lg bg-transparent border-none focus:outline-none cursor-pointer pt-0.5">
                                    {REWARD_ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                                  </select>
                                  <div className="flex-1 space-y-1.5">
                                    <input className="w-full bg-white border border-v-border rounded-lg px-2.5 py-1.5 text-sm" placeholder="Reward name" value={m.name} onChange={e => setMilestones(p => p.map(x => x.id === m.id ? { ...x, name: e.target.value } : x))} />
                                    <div className="flex items-center gap-2">
                                      <span className="text-[11px] text-v-text-3 shrink-0">At points:</span>
                                      <NumericInput value={m.pointsThreshold} onChange={n => setMilestones(p => p.map(x => x.id === m.id ? { ...x, pointsThreshold: n } : x))} min={1} max={99_999} className="w-20 bg-white border border-v-border rounded-lg px-2 py-1 text-xs text-center focus:outline-none focus:border-v-purple" />
                                    </div>
                                  </div>
                                  {milestones.length > 1 && (
                                    <button type="button" onClick={() => setMilestones(p => p.filter(x => x.id !== m.id))} className="p-1 rounded-lg text-v-text-3 hover:text-v-danger">
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                          <p className="text-xs font-bold text-v-purple mb-2">Preview</p>
                          <p className="text-sm text-v-text-2">Check-in = <strong>+{pointsPerCheckIn} pts</strong> per day</p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </Card>

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
                  milestoneCount={milestones.filter(m => m.name).length}
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
