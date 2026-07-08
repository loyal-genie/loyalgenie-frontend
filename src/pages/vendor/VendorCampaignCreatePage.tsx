import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, Zap, Plus, Trash2, AlertCircle, CalendarDays, Loader2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FieldInput as Input, Slider, Stepper } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { getMechanicLabel, getMechanicEmoji, getMechanicColor } from '@/lib/utils'
import { ApiErrorBanner } from '@/components/shared/ApiErrorBanner'
import { useCreateCampaign } from '@/hooks/useCampaigns'
import { RewardPoolEditor, NumericInput, newRewardEntry, type RewardEntry } from '@/components/vendor/RewardPoolEditor'
import { StampDropEditor } from '@/components/vendor/StampDropEditor'
import { formatRedeemBeforeSummary } from '@/components/vendor/RedeemBeforeField'
import { buildStampCampaignPayload, defaultStampUiState, isStampDropValid, type StampDropUiState } from '@/lib/stamp-drop-config'
import { buildSpinCampaignPayload, defaultSpinSegments, isSpinSegmentConfigValid, spinWinRateFromSegments, type SpinSegmentUi } from '@/lib/spin-campaign-config'
import { buildDiceCampaignPayload, defaultDiceOutcomes, diceWinRateFromOutcomes, isDiceConfigValid, type DiceOutcomeUi } from '@/lib/dice-campaign-config'
import { SpinSegmentEditor } from '@/components/vendor/SpinSegmentEditor'
import { SpinWheelPreview } from '@/components/vendor/SpinWheelPreview'
import { DiceOutcomeEditor } from '@/components/vendor/DiceOutcomeEditor'
import { LoyaltyCampaignImpact, LotteryCampaignImpact, StampCampaignImpact, WinBasedCampaignImpact } from '@/components/vendor/CampaignImpactCards'
import { calcDailyWinners, calcTotalWinners, formatWinnerCount } from '@/lib/campaign-impact'
import { computeCreateSchedule, fmtCampaignDate, durationModeToDays, type DurationMode } from '@/lib/campaign-duration'
import { todayInCampaignTz } from '@/lib/campaign-dates'
import type { MechanicType } from '@/lib/types'
import { isMechanicLive } from '@/lib/live-mechanics'

// ── Constants ─────────────────────────────────────────────────────────────────
const MECHANICS: { type: MechanicType; desc: string; tags: string[] }[] = [
  { type: 'shake',   desc: 'Customer shakes their phone to reveal a mystery reward instantly.',          tags: ['Instant', 'High engagement'] },
  { type: 'stamp',   desc: 'Collect stamps on every visit. Rewards trigger at configured positions.',    tags: ['Repeat visits', 'Loyalty', 'Surprise'] },
  { type: 'check-in-loyalty', desc: 'Daily check-ins earn loyalty points. Unlock rewards at point milestones.', tags: ['Daily visits', 'Points', 'Milestones'] },
  { type: 'spin',    desc: 'Spin a colourful wheel and land on exciting rewards.',                       tags: ['Visual', 'Exciting'] },
  { type: 'dice',    desc: 'Roll the dice — certain faces win. Pure luck, maximum thrill.',              tags: ['Gamble feel', 'Quick'] },
  { type: 'lottery', desc: 'Scratch & reveal a lottery ticket with a jackpot and tiered prizes.',       tags: ['Jackpot', 'Tiered rewards'] },
]

const STEPS = ['Mechanic', 'Basics', 'Game Config', 'Review']
const ICONS = ['🎁', '☕', '🧁', '🥪', '🍰', '🏷️', '🎉', '🍳', '👑', '🎫', '🎟️', '💰']

const DURATION_ALL: { key: DurationMode; label: string; sub: string }[] = [
  { key: 'today',  label: 'Today',    sub: 'Right now'  },
  { key: '7d',     label: '7 Days',   sub: '1 week'     },
  { key: '14d',    label: '14 Days',  sub: '2 weeks'    },
  { key: '1m',     label: '1 Month',  sub: '~30 days'   },
  { key: '2m',     label: '2 Months', sub: '~60 days'   },
  { key: '3m',     label: '3 Months', sub: '~90 days'   },
  { key: 'custom', label: 'Custom',   sub: 'Date range' },
]
const DURATION_LOTTERY: { key: DurationMode; label: string; sub: string }[] = [
  { key: '7d',  label: '1 Week',  sub: '7 days'   },
  { key: '14d', label: '2 Weeks', sub: '14 days'  },
  { key: '1m',  label: '1 Month', sub: '~30 days' },
]

const TODAY = todayInCampaignTz()
function fmtDate(iso: string) { return fmtCampaignDate(iso) }
function fmtTime(t: string) { const [h, m] = t.split(':').map(Number); const ap = h >= 12 ? 'PM' : 'AM'; return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${ap}` }
function computeDates(mode: DurationMode, cs: string, ce: string, cst: string, cet: string) {
  return computeCreateSchedule(mode, cs, ce, cst, cet)
}

function getDailyWindowTimes(
  basics: { activeHoursEnabled: boolean; activeStartTime: string; activeEndTime: string },
  dates: { startTime: string; endTime: string },
) {
  if (basics.activeHoursEnabled) {
    return { startTime: basics.activeStartTime, endTime: basics.activeEndTime }
  }
  return { startTime: dates.startTime, endTime: dates.endTime }
}

const UNLIMITED_USER_CAP = 1_000_000
export function VendorCampaignCreatePage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [mechanic, setMechanic] = useState<MechanicType | null>(null)

  // Basics
  const [basics, setBasics] = useState({
    name: '',
    durationMode: '1m' as DurationMode,
    customStart: '',
    customEnd: '',
    customStartTime: '00:00',
    customEndTime: '23:59',
    // Active hours
    activeHoursEnabled: false,
    activeStartTime: '09:00',
    activeEndTime: '21:00',
    // Participation
    userCap: 300,
    userCapLimited: false,
    perDayUserLimit: 10,
    playsPerDay: 2,
    overallWinners: 150,
    claimDurationMode: '14d' as DurationMode,
  })

  // Shake rewards
  const [shakeRewards, setShakeRewards] = useState<RewardEntry[]>([newRewardEntry()])

  // Spin segments (reward embedded per winning segment)
  const [spinSegments, setSpinSegments] = useState<SpinSegmentUi[]>(defaultSpinSegments())

  const [stampConfig, setStampConfig] = useState(defaultStampUiState)

  // Dice outcomes (reward per winning face)
  const [diceOutcomes, setDiceOutcomes] = useState<DiceOutcomeUi[]>(defaultDiceOutcomes())

  // Lottery — jackpot fixed, free-form additional prizes (no probability — odds are built into ticket mechanics)
  const [lotteryConfig, setLotteryConfig] = useState({
    jackpotName: 'Grand Prize',
    jackpotReward: 'Free Month Subscription',
    prizes: [
      { id: '1', name: '2nd Prize', reward: 'Free Breakfast' },
      { id: '2', name: '3rd Prize', reward: 'Free Coffee' },
    ] as { id: string; name: string; reward: string }[],
  })

  const [loyaltyConfig, setLoyaltyConfig] = useState({
    pointsPerCheckIn: 10,
    milestones: [
      { id: '1', name: 'Free Coffee', description: '', icon: '☕', pointsThreshold: 50 },
      { id: '2', name: 'Free Meal', description: '', icon: '🍽️', pointsThreshold: 100 },
    ] as { id: string; name: string; description: string; icon: string; pointsThreshold: number }[],
  })

  const [launched, setLaunched] = useState(false)
  const [launchError, setLaunchError] = useState<unknown>(null)
  const createMutation = useCreateCampaign()

  const isLottery        = mechanic === 'lottery'
  const isStamp          = mechanic === 'stamp'
  const isLoyalty        = mechanic === 'check-in-loyalty'
  const hasGameConfigStep = mechanic === 'shake' || mechanic === 'stamp' || mechanic === 'check-in-loyalty' || mechanic === 'spin' || mechanic === 'dice'
  const activeSteps = hasGameConfigStep ? STEPS : ['Mechanic', 'Basics', 'Review']
  const reviewStepIndex = activeSteps.length - 1
  const isShakeSpinOrDice = mechanic === 'shake' || mechanic === 'spin' || mechanic === 'dice'
  const isToday          = basics.durationMode === 'today'
  const durationOptions  = isLottery ? DURATION_LOTTERY : DURATION_ALL

  // Campaign duration in days
  const campaignDays = (() => {
    if (basics.durationMode === 'today') return 1
    if (basics.durationMode === '7d')  return 7
    if (basics.durationMode === '14d') return 14
    if (basics.durationMode === '1m')  return 30
    if (basics.durationMode === '2m')  return 60
    if (basics.durationMode === '3m')  return 90
    if (basics.customStart && basics.customEnd)
      return Math.max(1, Math.round((new Date(basics.customEnd).getTime() - new Date(basics.customStart).getTime()) / 86400000) + 1)
    return 30
  })()
  const suggestedDailyLimit = Math.max(1, Math.floor(basics.userCap / campaignDays))

  const dailyLimitSyncRef = useRef<string | null>(null)
  useEffect(() => {
    if (isToday || !isShakeSpinOrDice) return
    const key = `${basics.userCap}:${campaignDays}`
    if (dailyLimitSyncRef.current === null) {
      dailyLimitSyncRef.current = key
      return
    }
    if (dailyLimitSyncRef.current === key) return
    dailyLimitSyncRef.current = key
    setBasics(p => {
      const next = Math.max(1, Math.floor(p.userCap / campaignDays))
      return p.perDayUserLimit === next ? p : { ...p, perDayUserLimit: next }
    })
  }, [basics.userCap, campaignDays, isToday, isShakeSpinOrDice])

  // Win rates
  // Shake: explicit vendor input (overallWinRate). Pool probabilities = share AMONG winners (sum to 100%)
  // Spin/Dice: structurally derived from config
  const shakePoolTotal = shakeRewards.reduce((s, r) => s + r.probability, 0)
  const spinWinRate    = spinWinRateFromSegments(spinSegments)
  const diceWinRate    = diceWinRateFromOutcomes(diceOutcomes)
  const activeWinRate  = mechanic === 'spin' ? spinWinRate : mechanic === 'dice' ? diceWinRate : 0
  const totalWinners = mechanic === 'shake' ? basics.overallWinners : calcTotalWinners(basics.userCap, basics.playsPerDay, activeWinRate)
  const dailyWinners = calcDailyWinners(isToday ? basics.userCap : basics.perDayUserLimit, basics.playsPerDay, activeWinRate)

  const selectMechanic = (m: MechanicType) => {
    if (!isMechanicLive(m)) return
    setMechanic(m)
  }

  const schedule = computeDates(basics.durationMode, basics.customStart, basics.customEnd, basics.customStartTime, basics.customEndTime)
  const dates = schedule
  const durationValid = basics.durationMode !== 'custom' || (basics.customStart && basics.customEnd && basics.customStartTime && basics.customEndTime)
  const effectiveUserCap = basics.userCapLimited ? basics.userCap : UNLIMITED_USER_CAP

  const step2Valid = () => {
    if (!mechanic) return false
    if (mechanic === 'shake') {
      const named = shakeRewards.filter(r => r.name.trim())
      return named.length > 0 && shakePoolTotal === 100 && named.every(r =>
        r.redeemExpiryMode === 'fixed' ? Boolean(r.redeemFixedDate) : r.redeemRelativeAmount > 0,
      )
    }
    if (mechanic === 'spin')  return isSpinSegmentConfigValid(spinSegments)
    if (mechanic === 'dice')  return isDiceConfigValid(diceOutcomes)
    if (mechanic === 'lottery') return lotteryConfig.jackpotReward.trim().length > 0
    if (mechanic === 'stamp') {
      const dropsValid = [...stampConfig.surpriseDrops, ...stampConfig.bigRewards].every(d =>
        d.to <= stampConfig.totalStamps && isStampDropValid(d),
      )
      return dropsValid
    }
    if (mechanic === 'check-in-loyalty') {
      const thresholds = loyaltyConfig.milestones.map(m => m.pointsThreshold)
      const unique = new Set(thresholds)
      return loyaltyConfig.milestones.every(m => m.name.trim() && m.pointsThreshold > 0) && unique.size === thresholds.length
    }
    return true
  }

  const canProceed = () => {
    if (step === 0) return mechanic !== null && isMechanicLive(mechanic)
    if (step === 1) return basics.name.trim().length > 0 && !!durationValid
    if (hasGameConfigStep && step === 2) return step2Valid()
    return true
  }

  const handleLaunch = async () => {
    if (mechanic !== 'shake' && mechanic !== 'stamp' && mechanic !== 'check-in-loyalty' && mechanic !== 'spin' && mechanic !== 'dice') {
      setLaunchError('Only Shake & Win, Stamp Card, Check-in Loyalty, Spin a Wheel, and Roll a Dice are wired to the API in this release.')
      return
    }
    setLaunchError(null)
    try {
      if (mechanic === 'shake') {
        const campaign = await createMutation.mutateAsync({
          name: basics.name.trim(),
          mechanic: 'shake',
          startDate: dates.start,
          endDate: dates.end,
          startTime: dates.startTime,
          endTime: dates.endTime,
          userCap: basics.userCap,
          perDayUserLimit: isToday ? basics.userCap : basics.perDayUserLimit,
          playsPerDay: basics.playsPerDay,
          overallWinners: basics.overallWinners,
          rewards: shakeRewards
            .filter(r => r.name.trim())
            .map(r => ({
              name: r.name.trim(),
              description: r.description,
              icon: r.icon,
              sharePercent: r.probability,
              redeemExpiryMode: r.redeemExpiryMode,
              redeemFixedDate: r.redeemExpiryMode === 'fixed' ? r.redeemFixedDate : undefined,
              redeemRelativeAmount: r.redeemExpiryMode === 'relative' ? r.redeemRelativeAmount : undefined,
              redeemRelativeUnit: r.redeemExpiryMode === 'relative' ? r.redeemRelativeUnit : undefined,
            })),
        })
        setLaunched(true)
        setTimeout(() => navigate(`/vendor/campaigns/${campaign.id}`), 2200)
        return
      }

      if (mechanic === 'spin') {
        const dailyWindow = getDailyWindowTimes(basics, dates)
        const campaign = await createMutation.mutateAsync({
          name: basics.name.trim(),
          mechanic: 'spin',
          startDate: dates.start,
          endDate: dates.end,
          startTime: dailyWindow.startTime,
          endTime: dailyWindow.endTime,
          userCap: basics.userCap,
          perDayUserLimit: isToday ? basics.userCap : basics.perDayUserLimit,
          playsPerDay: basics.playsPerDay,
          ...buildSpinCampaignPayload(spinSegments),
        })
        setLaunched(true)
        setTimeout(() => navigate(`/vendor/campaigns/${campaign.id}`), 2200)
        return
      }

      if (mechanic === 'dice') {
        const dailyWindow = getDailyWindowTimes(basics, dates)
        const campaign = await createMutation.mutateAsync({
          name: basics.name.trim(),
          mechanic: 'dice',
          startDate: dates.start,
          endDate: dates.end,
          startTime: dailyWindow.startTime,
          endTime: dailyWindow.endTime,
          userCap: basics.userCap,
          perDayUserLimit: isToday ? basics.userCap : basics.perDayUserLimit,
          playsPerDay: basics.playsPerDay,
          ...buildDiceCampaignPayload(diceOutcomes),
        })
        setLaunched(true)
        setTimeout(() => navigate(`/vendor/campaigns/${campaign.id}`), 2200)
        return
      }

      if (mechanic === 'check-in-loyalty') {
        const campaign = await createMutation.mutateAsync({
          name: basics.name.trim(),
          mechanic: 'check-in-loyalty',
          startDate: dates.start,
          endDate: dates.end,
          startTime: dates.startTime,
          endTime: dates.endTime,
          userCap: effectiveUserCap,
          checkInConfig: { pointsPerCheckIn: loyaltyConfig.pointsPerCheckIn },
          milestones: loyaltyConfig.milestones
            .filter(m => m.name.trim())
            .map(m => ({
              name: m.name.trim(),
              description: m.description,
              icon: m.icon,
              pointsThreshold: m.pointsThreshold,
            })),
        })
        setLaunched(true)
        setTimeout(() => navigate(`/vendor/campaigns/${campaign.id}`), 2200)
        return
      }

      const stampPayload = buildStampCampaignPayload(stampConfig)
      const campaign = await createMutation.mutateAsync({
        name: basics.name.trim(),
        mechanic: 'stamp',
        startDate: dates.start,
        endDate: dates.end,
        startTime: dates.startTime,
        endTime: dates.endTime,
        userCap: basics.userCap,
        claimPeriodDays: durationModeToDays(basics.claimDurationMode),
        ...stampPayload,
      })
      setLaunched(true)
      setTimeout(() => navigate(`/vendor/campaigns/${campaign.id}`), 2200)
    } catch (err) {
      setLaunchError(err)
    }
  }

  if (launched) {
    return (
      <div className="min-h-screen vendor-bg flex items-center justify-center">
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="text-center">
          <motion.div animate={{ rotate: [0, 10, -10, 5, 0], scale: [1, 1.2, 1] }} transition={{ duration: 0.6 }} className="text-7xl mb-6">🚀</motion.div>
          <h2 className="text-2xl font-extrabold text-v-text mb-2">Campaign Launched!</h2>
          <p className="text-v-text-2 text-sm">Redirecting to campaigns…</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <button onClick={() => step > 0 ? setStep(s => s - 1) : navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-v-text-2 hover:text-v-text mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-2xl font-extrabold text-v-text">Create Campaign</h1>
        <p className="text-v-text-2 text-sm mt-1">Configure your game mechanic and rewards</p>
      </motion.div>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-10">
        {activeSteps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all ${i < step ? 'bg-v-success text-white' : i === step ? 'bg-v-purple text-white' : 'bg-v-surface-2 text-v-text-3 border border-v-border'}`}>
              {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${i === step ? 'text-v-text' : 'text-v-text-3'}`}>{s}</span>
            {i < activeSteps.length - 1 && <div className={`h-px w-8 ${i < step ? 'bg-v-success' : 'bg-v-border'}`} />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}>

          {/* ── Step 0: Mechanic ── */}
          {step === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
              {MECHANICS.map(m => {
                const selected = mechanic === m.type
                const color = getMechanicColor(m.type)
                const comingSoon = !isMechanicLive(m.type)
                return (
                  <motion.div
                    key={m.type}
                    className="h-full"
                    whileHover={comingSoon ? {} : { y: -3 }}
                    whileTap={comingSoon ? {} : { scale: 0.97 }}
                  >
                    <button
                      type="button"
                      disabled={comingSoon}
                      onClick={() => selectMechanic(m.type)}
                      className={`w-full h-full text-left rounded-2xl p-5 border-2 transition-colors duration-200 flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-v-purple/30 ${selected ? '' : 'border-v-border bg-white hover:border-v-border-b'} ${comingSoon ? 'opacity-70 cursor-not-allowed' : ''}`}
                      style={selected ? { borderColor: color, background: `${color}08` } : {}}
                    >
                      <div className="h-10 flex items-center text-3xl mb-3 leading-none shrink-0">{getMechanicEmoji(m.type)}</div>
                      <div className="flex items-center gap-2 mb-2 min-h-[22px] shrink-0">
                        <span className="text-sm font-bold text-v-text truncate">{getMechanicLabel(m.type)}</span>
                        <div className="ml-auto flex items-center gap-1.5 shrink-0">
                          {comingSoon && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 whitespace-nowrap">
                              Live soon
                            </span>
                          )}
                          {selected && <Check className="w-4 h-4" style={{ color }} />}
                        </div>
                      </div>
                      <p className="text-xs text-v-text-3 mb-3 leading-relaxed line-clamp-2 min-h-[2.5rem] flex-1">{m.desc}</p>
                      <div className="flex flex-wrap gap-1 content-start min-h-[22px] mt-auto">
                        {m.tags.map(t => <span key={t} className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: `${color}12`, color }}>{t}</span>)}
                      </div>
                    </button>
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* ── Step 1: Basics ── */}
          {step === 1 && (
            <Card className="p-6">
              <h2 className="text-base font-bold text-v-text mb-5">Campaign Details</h2>
              <div className="space-y-6">
                <Input label="Campaign Name" placeholder="e.g. Weekend Spin Fiesta" value={basics.name} onChange={e => setBasics(p => ({ ...p, name: e.target.value }))} />

                {/* Duration */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-v-text-2 uppercase tracking-wider">Campaign Duration</label>
                    {basics.durationMode !== 'custom' && dates.start && (
                      <span className="text-xs text-v-purple font-semibold flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5" />
                        {isToday ? `Today · ${fmtDate(TODAY)}` : `${fmtDate(dates.start)} → ${fmtDate(dates.end)}`}
                        {basics.activeHoursEnabled && ` · ${fmtTime(basics.activeStartTime)}–${fmtTime(basics.activeEndTime)}`}
                      </span>
                    )}
                    {basics.durationMode === 'custom' && dates.start && dates.end && (
                      <span className="text-xs text-v-purple font-semibold flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5" />
                        {`${fmtDate(dates.start)} ${fmtTime(basics.customStartTime)} → ${fmtDate(dates.end)} ${fmtTime(basics.customEndTime)}`}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {durationOptions.map(opt => (
                      <button key={opt.key} onClick={() => setBasics(p => ({ ...p, durationMode: opt.key }))}
                        className={`rounded-xl py-2.5 px-3 text-center border-2 transition-all min-w-[4.5rem] ${basics.durationMode === opt.key ? 'border-v-purple bg-v-surface-3' : 'border-v-border bg-white hover:border-v-border-b'}`}>
                        <div className={`text-sm font-bold ${basics.durationMode === opt.key ? 'text-v-purple' : 'text-v-text'}`}>{opt.label}</div>
                        <div className="text-[10px] text-v-text-3 mt-0.5">{opt.sub}</div>
                      </button>
                    ))}
                  </div>
                  <AnimatePresence>
                    {basics.durationMode === 'custom' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-3 grid grid-cols-2 gap-4 overflow-hidden">
                        <Input label="Start Date" type="date" value={basics.customStart} onChange={e => setBasics(p => ({ ...p, customStart: e.target.value }))} />
                        <Input label="Start Time" type="time" value={basics.customStartTime} onChange={e => setBasics(p => ({ ...p, customStartTime: e.target.value }))} />
                        <Input label="End Date" type="date" value={basics.customEnd} onChange={e => setBasics(p => ({ ...p, customEnd: e.target.value }))} />
                        <Input label="End Time" type="time" value={basics.customEndTime} onChange={e => setBasics(p => ({ ...p, customEndTime: e.target.value }))} />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Claim period — stamp only */}
                  {isStamp && (
                    <div className="mt-5 pt-4 border-t border-v-border">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-v-text-2 uppercase tracking-wider">Claim Period</label>
                        <span className="text-xs text-v-purple font-semibold">
                          {durationModeToDays(basics.claimDurationMode)} days after enrollment closes
                        </span>
                      </div>
                      <p className="text-xs text-v-text-3 mb-3">
                        After the campaign ends or user cap fills, enrolled customers have this long to complete their stamp card.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {DURATION_ALL.filter(o => o.key !== 'custom').map(opt => (
                          <button key={opt.key} onClick={() => setBasics(p => ({ ...p, claimDurationMode: opt.key }))}
                            className={`rounded-xl py-2.5 px-3 text-center border-2 transition-all min-w-[4.5rem] ${basics.claimDurationMode === opt.key ? 'border-v-purple bg-v-surface-3' : 'border-v-border bg-white hover:border-v-border-b'}`}>
                            <div className={`text-sm font-bold ${basics.claimDurationMode === opt.key ? 'text-v-purple' : 'text-v-text'}`}>{opt.label}</div>
                            <div className="text-[10px] text-v-text-3 mt-0.5">{opt.sub}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Active hours — daily play window for instant-win campaigns */}
                  {isShakeSpinOrDice && (
                    <div className="mt-4 pt-4 border-t border-v-border">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="text-xs font-semibold text-v-text-2 uppercase tracking-wider">Active Hours</span>
                          <p className="text-xs text-v-text-3 mt-0.5">Restrict to specific hours each day (e.g. Lunch Rush)</p>
                        </div>
                        <button type="button" onClick={() => setBasics(p => ({ ...p, activeHoursEnabled: !p.activeHoursEnabled }))}
                          className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none shrink-0 ${basics.activeHoursEnabled ? 'bg-v-purple' : 'bg-v-border'}`}>
                          <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${basics.activeHoursEnabled ? 'left-6' : 'left-1'}`} />
                        </button>
                      </div>
                      <AnimatePresence>
                        {basics.activeHoursEnabled && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="grid grid-cols-2 gap-4 overflow-hidden">
                            <div>
                              <label className="text-xs font-semibold text-v-text-2 uppercase tracking-wider mb-1.5 block">Start Time</label>
                              <input type="time" value={basics.activeStartTime} onChange={e => setBasics(p => ({ ...p, activeStartTime: e.target.value }))} className="w-full bg-white border border-v-border rounded-xl px-3 py-2 text-sm text-v-text focus:outline-none focus:border-v-purple" />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-v-text-2 uppercase tracking-wider mb-1.5 block">End Time</label>
                              <input type="time" value={basics.activeEndTime} onChange={e => setBasics(p => ({ ...p, activeEndTime: e.target.value }))} className="w-full bg-white border border-v-border rounded-xl px-3 py-2 text-sm text-v-text focus:outline-none focus:border-v-purple" />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                {/* ── Participation ── */}
                <div className="pt-2 border-t border-v-border space-y-4">
                  <p className="text-[11px] font-semibold text-v-text-2 uppercase tracking-wider">Participation</p>

                  {/* Shake, Spin, Dice: overall + per-day */}
                  {isShakeSpinOrDice && (
                    <>
                      <Stepper label="Overall User Cap" hint="users total" value={basics.userCap} min={1} max={2000} step={1} onChange={v => setBasics(p => ({ ...p, userCap: v }))} />
                      {!isToday && (
                        <div>
                          <Stepper label="Daily User Limit" hint="users / day" value={basics.perDayUserLimit} min={1} max={basics.userCap} onChange={v => setBasics(p => ({ ...p, perDayUserLimit: v }))} />
                          <p className="text-xs text-v-text-3 mt-1.5">
                            Suggested: <span className="font-semibold text-v-text-2">{suggestedDailyLimit} / day</span> — even distribution over {campaignDays} days. Updates when cap or duration changes; override if needed.
                          </p>
                        </div>
                      )}
                      <Stepper label="Plays Per User Per Day" hint="plays / day" value={basics.playsPerDay} min={1} max={10} onChange={v => setBasics(p => ({ ...p, playsPerDay: v }))} />
                    </>
                  )}

                  {/* Stamp: single user cap */}
                  {isStamp && (
                    <Stepper label="User Cap" hint="users" value={basics.userCap} min={1} max={2000} step={1} onChange={v => setBasics(p => ({ ...p, userCap: v }))} />
                  )}

                  {/* Check-in Loyalty: all users by default, optional cap */}
                  {isLoyalty && (
                    <div className="space-y-3">
                      <div className="flex rounded-lg border border-v-border overflow-hidden bg-v-surface-2 p-0.5 gap-0.5">
                        {([
                          { key: false, label: 'All customers' },
                          { key: true, label: 'Limit participants' },
                        ] as const).map(opt => (
                          <button
                            key={String(opt.key)}
                            type="button"
                            onClick={() => setBasics(p => ({ ...p, userCapLimited: opt.key }))}
                            className={`flex-1 py-2 rounded-md text-xs font-semibold transition-all ${basics.userCapLimited === opt.key ? 'bg-white text-v-text shadow-sm' : 'text-v-text-3 hover:text-v-text-2'}`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                      {basics.userCapLimited ? (
                        <Stepper
                          label="User Cap"
                          hint="max participants"
                          value={basics.userCap}
                          min={1}
                          max={2000}
                          step={1}
                          onChange={v => setBasics(p => ({ ...p, userCap: v }))}
                        />
                      ) : (
                        <div className="flex items-start gap-2.5 p-3.5 bg-v-surface-2 border border-v-border rounded-xl text-xs text-v-text-2">
                          <AlertCircle className="w-4 h-4 text-v-purple shrink-0 mt-0.5" />
                          <p>Open to all customers — no enrollment limit. Anyone who checks in can earn loyalty points.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Lottery: no caps */}
                  {isLottery && (
                    <div className="flex items-start gap-2.5 p-3.5 bg-v-surface-2 border border-v-border rounded-xl text-xs text-v-text-2">
                      <AlertCircle className="w-4 h-4 text-v-purple shrink-0 mt-0.5" />
                      <p>Lottery has no user cap — open to all customers. Prize odds are built into the ticket mechanics.</p>
                    </div>
                  )}

                  {/* Shake: vendor sets winner %; count is derived from player cap */}
                  {mechanic === 'shake' && (
                    <div className="space-y-4">
                      <Stepper
                        label="Overall Winners"
                        hint="total prizes"
                        value={basics.overallWinners}
                        min={1}
                        max={basics.userCap}
                        step={1}
                        onChange={v => setBasics(p => ({ ...p, overallWinners: v }))}
                      />
                      <p className="text-xs text-v-text-3 -mt-2">
                        <span className="font-semibold text-v-text-2">{formatWinnerCount(basics.overallWinners, true)} winners</span>
                        {' '}randomly distributed out of {basics.userCap.toLocaleString()} players max
                      </p>
                    </div>
                  )}
                </div>

                {/* Stamp info note */}
                {isStamp && (
                  <div className="flex items-start gap-2.5 p-3.5 bg-v-surface-2 border border-v-border rounded-xl text-xs text-v-text-2">
                    <AlertCircle className="w-4 h-4 text-v-purple shrink-0 mt-0.5" />
                    <p>Stamp Card rewards fire at specific stamp positions — reward volume is determined by your stamp config, not a cap.</p>
                  </div>
                )}

                {/* Loyalty info note */}
                {isLoyalty && (
                  <div className="space-y-3">
                    <Stepper
                      label="Points per Check-In"
                      hint="points earned per visit"
                      value={loyaltyConfig.pointsPerCheckIn}
                      min={1}
                      max={1000}
                      step={1}
                      onChange={v => setLoyaltyConfig(p => ({ ...p, pointsPerCheckIn: v }))}
                    />
                  </div>
                )}
                {isLoyalty && (
                  <div className="flex items-start gap-2.5 p-3.5 bg-purple-50 border border-purple-200 rounded-xl text-xs text-v-text-2">
                    <AlertCircle className="w-4 h-4 text-v-purple shrink-0 mt-0.5" />
                    <p>Staff PIN refreshes every 2 minutes on your dashboard. Customers check in daily to earn points.</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* ── Step 2: Game Config (rewards embedded) ── */}

          {/* SHAKE & WIN */}
          {step === 2 && mechanic === 'shake' && (
            <Card className="p-6">
              <h2 className="text-base font-bold text-v-text mb-1">Shake & Win — Reward Distribution</h2>
              <p className="text-xs text-v-text-3 mb-1">Configure how winning plays are distributed across reward types.</p>
              <div className="flex items-center gap-2 mb-5 p-2.5 bg-v-surface-2 border border-v-border rounded-xl text-xs">
                <span className="text-v-text-3">Expected winners:</span>
                <span className="font-bold text-v-purple">{formatWinnerCount(totalWinners)} total</span>
                {!isToday && (
                  <>
                    <span className="text-v-text-3 mx-1">·</span>
                    <span className="text-v-text-3">Players / day:</span>
                    <span className="font-bold text-v-purple">{basics.perDayUserLimit.toLocaleString()}</span>
                  </>
                )}
              </div>
              <RewardPoolEditor rewards={shakeRewards} setRewards={setShakeRewards} shareMode />
            </Card>
          )}

          {/* SPIN A WHEEL */}
          {step === 2 && mechanic === 'spin' && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start xl:grid-cols-[minmax(0,1fr)_300px]">
              <Card className="p-6">
                <h2 className="text-base font-bold text-v-text mb-1">Spin a Wheel — Segments &amp; Rewards</h2>
                <p className="text-xs text-v-text-3 mb-4">Configure each wheel segment, reward details, and slice share on the wheel.</p>
                <div className="flex items-center gap-2 mb-5 p-3 bg-v-surface-2 border border-v-border rounded-xl text-xs">
                  <span className="text-v-text-3">Expected winners:</span>
                  <span className="font-bold text-v-purple">{formatWinnerCount(totalWinners)} total</span>
                  <span className="text-v-text-3 mx-1">·</span>
                  <span className="text-v-text-3">{spinWinRate}% win rate</span>
                  {!isToday && (
                    <>
                      <span className="text-v-text-3 mx-1">·</span>
                      <span className="font-bold text-v-purple">{basics.perDayUserLimit.toLocaleString()} players / day</span>
                    </>
                  )}
                </div>
                <SpinSegmentEditor segments={spinSegments} setSegments={setSpinSegments} />
              </Card>
              <div className="lg:sticky lg:top-6">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-v-text">Wheel Preview</h3>
                  <Eye className="h-4 w-4 text-v-text-3" />
                </div>
                <Card className="p-5">
                  <SpinWheelPreview segments={spinSegments} />
                </Card>
              </div>
            </div>
          )}

          {/* STAMP CARD */}
          {step === 2 && mechanic === 'stamp' && (
            <Card className="p-6">
              <h2 className="text-base font-bold text-v-text mb-1">Stamp Card — Trigger Config & Rewards</h2>
              <p className="text-xs text-v-text-3 mb-5">Add surprise drops and big rewards at stamp ranges. Each drop can have its own reward and redeem-before window.</p>
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

                <div>
                  <Stepper label="Pre-fill Stamps" hint="stamps pre-filled" value={stampConfig.prefillStamps} min={0} max={stampConfig.totalStamps} onChange={v => setStampConfig(p => ({ ...p, prefillStamps: v }))} />
                  <p className="text-xs text-v-text-3 mt-1.5">Customers start with this many stamps already earned — lowers the barrier to the first reward.</p>
                </div>

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

                <div>
                  <p className="text-[11px] font-semibold text-v-text-2 uppercase tracking-wider mb-2">Card Preview</p>
                  <div className="flex flex-wrap gap-1.5">
                    {Array.from({ length: stampConfig.totalStamps }, (_, i) => {
                      const n = i + 1
                      const isPrefilled = n <= stampConfig.prefillStamps
                      const surpriseDrop = stampConfig.surpriseDrops.find(d => n >= d.from && n <= d.to)
                      const bigDrop = stampConfig.bigRewards.find(d => n >= d.from && n <= d.to)
                      return (
                        <div
                          key={n}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold border-2 ${
                            isPrefilled ? 'border-v-purple bg-v-purple text-white' : 'border-v-border text-v-text-3'
                          }`}
                          style={!isPrefilled && bigDrop ? { borderColor: bigDrop.color, backgroundColor: bigDrop.color, color: '#92400e' } : undefined}
                          {...(!isPrefilled && surpriseDrop && !bigDrop ? { style: { borderColor: surpriseDrop.color, backgroundColor: surpriseDrop.color, color: '#6b21a8' } } : {})}
                        >
                          {isPrefilled ? '✓' : bigDrop ? '🏆' : surpriseDrop ? '?' : n}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* CHECK-IN LOYALTY */}
          {step === 2 && mechanic === 'check-in-loyalty' && (
            <Card className="p-6">
              <h2 className="text-base font-bold text-v-text mb-1">Check-in Loyalty — Points & Milestones</h2>
              <p className="text-xs text-v-text-3 mb-5">Customers earn points on each daily check-in. Configure rewards when they reach point thresholds.</p>
              <div className="space-y-5">
                <Stepper
                  label="Points per Check-in"
                  hint="points earned per visit"
                  value={loyaltyConfig.pointsPerCheckIn}
                  min={1}
                  max={999}
                  onChange={v => setLoyaltyConfig(p => ({ ...p, pointsPerCheckIn: v }))}
                />

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-v-text-2 uppercase tracking-wider">Reward Milestones</span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setLoyaltyConfig(p => ({
                        ...p,
                        milestones: [...p.milestones, { id: Math.random().toString(36).slice(2), name: '', description: '', icon: '🎁', pointsThreshold: (p.milestones.at(-1)?.pointsThreshold ?? 0) + 50 }],
                      }))}
                    >
                      <Plus className="w-3 h-3" /> Add Milestone
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {loyaltyConfig.milestones.map((m) => (
                      <div key={m.id} className="p-3 bg-white border border-v-border rounded-xl">
                        <div className="flex items-start gap-2">
                          <select value={m.icon} onChange={e => setLoyaltyConfig(p => ({ ...p, milestones: p.milestones.map(x => x.id === m.id ? { ...x, icon: e.target.value } : x) }))} className="text-lg bg-transparent border-none focus:outline-none cursor-pointer pt-0.5">
                            {ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                          </select>
                          <div className="flex-1 space-y-1.5">
                            <input className="w-full bg-v-surface-2 border border-v-border rounded-lg px-2.5 py-1.5 text-sm" placeholder="Reward name" value={m.name} onChange={e => setLoyaltyConfig(p => ({ ...p, milestones: p.milestones.map(x => x.id === m.id ? { ...x, name: e.target.value } : x) }))} />
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-v-text-3 shrink-0">At points:</span>
                              <NumericInput
                                value={m.pointsThreshold}
                                onChange={n => setLoyaltyConfig(p => ({ ...p, milestones: p.milestones.map(x => x.id === m.id ? { ...x, pointsThreshold: n } : x) }))}
                                min={1}
                                max={99_999}
                                className="w-20 bg-white border border-v-border rounded-lg px-2 py-1 text-xs text-center focus:outline-none focus:border-v-purple"
                              />
                            </div>
                          </div>
                          {loyaltyConfig.milestones.length > 1 && (
                            <button type="button" onClick={() => setLoyaltyConfig(p => ({ ...p, milestones: p.milestones.filter(x => x.id !== m.id) }))} className="p-1 rounded-lg text-v-text-3 hover:text-v-danger">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-v-text-3 mt-2">Each milestone threshold must be unique. Redemption is verified at your counter.</p>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                  <p className="text-xs font-bold text-v-purple mb-2">Preview</p>
                  <p className="text-sm text-v-text-2">Check-in = <strong>+{loyaltyConfig.pointsPerCheckIn} pts</strong> per day</p>
                  <div className="mt-2 space-y-1">
                    {loyaltyConfig.milestones.filter(m => m.name).map(m => (
                      <div key={m.id} className="flex items-center gap-2 text-xs text-v-text-2">
                        <span>{m.icon}</span>
                        <span>{m.name}</span>
                        <span className="text-v-purple font-bold ml-auto">{m.pointsThreshold} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* ROLL A DICE */}
          {step === 2 && mechanic === 'dice' && (
            <Card className="p-6">
              <h2 className="text-base font-bold text-v-text mb-1">Roll a Dice — Face Rewards</h2>
              <p className="text-xs text-v-text-3 mb-4">Toggle each of the six faces as a win and assign its reward. Each face is equally likely.</p>
              <div className="flex items-center gap-2 mb-5 p-3 bg-v-surface-2 border border-v-border rounded-xl text-xs">
                <span className="text-v-text-3">Expected winners:</span>
                <span className="font-bold text-v-purple">{formatWinnerCount(totalWinners)} total</span>
                <span className="text-v-text-3 mx-1">·</span>
                <span className="text-v-text-3">{diceWinRate}% win rate</span>
                {!isToday && (
                  <>
                    <span className="text-v-text-3 mx-1">·</span>
                    <span className="font-bold text-v-purple">{basics.perDayUserLimit.toLocaleString()} players / day</span>
                  </>
                )}
              </div>
              <DiceOutcomeEditor outcomes={diceOutcomes} setOutcomes={setDiceOutcomes} />
            </Card>
          )}

          {/* LOTTERY */}
          {step === 2 && mechanic === 'lottery' && (
            <Card className="p-6">
              <h2 className="text-base font-bold text-v-text mb-1">Lottery — Prizes</h2>
              <p className="text-xs text-v-text-3 mb-5">Configure the jackpot and add as many additional prizes as you need. Win odds are built into the scratch-card mechanics — no probability setup required.</p>
              <div className="space-y-3">

                {/* Jackpot — always present, can't be deleted */}
                <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">👑</span>
                    <span className="text-sm font-bold text-amber-700">Jackpot</span>
                    <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 font-semibold border border-amber-200">Required</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input className="bg-white border border-amber-200 rounded-lg px-3 py-2 text-sm text-v-text placeholder:text-v-text-3 focus:outline-none focus:border-amber-400" placeholder="Prize name (e.g. Grand Prize)" value={lotteryConfig.jackpotName} onChange={e => setLotteryConfig(p => ({ ...p, jackpotName: e.target.value }))} />
                    <input className="bg-white border border-amber-200 rounded-lg px-3 py-2 text-sm text-v-text placeholder:text-v-text-3 focus:outline-none focus:border-amber-400" placeholder="Reward (e.g. Free Month Sub)" value={lotteryConfig.jackpotReward} onChange={e => setLotteryConfig(p => ({ ...p, jackpotReward: e.target.value }))} />
                  </div>
                </div>

                {/* Additional prizes */}
                {lotteryConfig.prizes.map((prize, i) => (
                  <div key={prize.id} className="p-3.5 bg-v-surface-2 border border-v-border rounded-xl">
                    <div className="flex items-center gap-2 mb-2.5">
                      <span className="text-sm font-semibold text-v-text-2">Prize {i + 2}</span>
                      <button onClick={() => setLotteryConfig(p => ({ ...p, prizes: p.prizes.filter(x => x.id !== prize.id) }))} className="ml-auto p-1 rounded-lg text-v-text-3 hover:text-v-danger hover:bg-red-50 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input className="bg-white border border-v-border rounded-lg px-3 py-2 text-sm text-v-text placeholder:text-v-text-3 focus:outline-none focus:border-v-purple" placeholder={`Prize name (e.g. ${i === 0 ? '2nd Prize' : '3rd Prize'})`} value={prize.name} onChange={e => setLotteryConfig(p => ({ ...p, prizes: p.prizes.map(x => x.id === prize.id ? { ...x, name: e.target.value } : x) }))} />
                      <input className="bg-white border border-v-border rounded-lg px-3 py-2 text-sm text-v-text placeholder:text-v-text-3 focus:outline-none focus:border-v-purple" placeholder="Reward (e.g. Free Coffee)" value={prize.reward} onChange={e => setLotteryConfig(p => ({ ...p, prizes: p.prizes.map(x => x.id === prize.id ? { ...x, reward: e.target.value } : x) }))} />
                    </div>
                  </div>
                ))}

                <Button variant="secondary" size="sm" onClick={() => setLotteryConfig(p => ({ ...p, prizes: [...p.prizes, { id: Math.random().toString(36).slice(2), name: `Prize ${p.prizes.length + 2}`, reward: '' }] }))}>
                  <Plus className="w-3 h-3" /> Add Prize
                </Button>
              </div>
            </Card>
          )}

          {/* ── Step 3: Review & Launch ── */}
          {step === reviewStepIndex && (
            <div className="space-y-4">
              {/* Summary */}
              <Card className="p-6">
                <h2 className="text-base font-bold text-v-text mb-4">Review & Launch</h2>
                <div className="space-y-0">
                  {[
                    { label: 'Campaign Name', value: basics.name || '—' },
                    { label: 'Mechanic', value: mechanic ? `${getMechanicEmoji(mechanic)} ${getMechanicLabel(mechanic)}` : '—' },
                    {
                      label: 'Duration',
                      value: (() => {
                        let dur = isToday ? `Today · ${fmtDate(TODAY)}` : (dates.start && dates.end ? `${fmtDate(dates.start)} → ${fmtDate(dates.end)}` : '—')
                        if (basics.durationMode === 'custom' && dates.start && dates.end) {
                          dur = `${fmtDate(dates.start)} ${fmtTime(basics.customStartTime)} → ${fmtDate(dates.end)} ${fmtTime(basics.customEndTime)}`
                        }
                        if (basics.activeHoursEnabled) dur += ` · ${fmtTime(basics.activeStartTime)}–${fmtTime(basics.activeEndTime)}`
                        return dur
                      })(),
                    },
                    ...(!isLottery && !isLoyalty ? [{ label: isShakeSpinOrDice ? 'Overall User Cap' : 'User Cap', value: `${basics.userCap} users` }] : []),
                    ...(isLoyalty ? [{ label: 'User Cap', value: basics.userCapLimited ? `${basics.userCap} users` : 'All customers (no limit)' }] : []),
                    ...(isStamp ? [{ label: 'Claim Period', value: `${durationModeToDays(basics.claimDurationMode)} days after enrollment closes` }] : []),
                    ...(isShakeSpinOrDice && !isToday ? [{ label: 'Daily User Limit', value: `${basics.perDayUserLimit} / day` }] : []),
                    ...(isShakeSpinOrDice ? [{ label: 'Plays Per User / Day', value: `${basics.playsPerDay}` }] : []),
                    ...(basics.activeHoursEnabled && isShakeSpinOrDice ? [{
                      label: 'Active Hours',
                      value: `${fmtTime(basics.activeStartTime)} – ${fmtTime(basics.activeEndTime)} daily`,
                    }] : []),
                    ...(mechanic === 'shake' ? [
                      { label: 'Overall Winners', value: `${formatWinnerCount(basics.overallWinners, true)} customers` },
                    ] : []),
                    ...(mechanic === 'spin' ? [
                      { label: 'Total Winners', value: `${formatWinnerCount(totalWinners)} if cap fills (${activeWinRate}% win rate)` },
                      ...(!isToday ? [{ label: 'Winners / Day', value: `${formatWinnerCount(dailyWinners)} on a full day` }] : []),
                    ] : []),
                    ...(mechanic === 'dice' ? [
                      { label: 'Total Winners', value: `${formatWinnerCount(totalWinners)} if cap fills (${activeWinRate}% win rate)` },
                      ...(!isToday ? [{ label: 'Winners / Day', value: `${formatWinnerCount(dailyWinners)} on a full day` }] : []),
                    ] : []),
                    {
                      label: 'Rewards',
                      value:
                        mechanic === 'shake'   ? `${shakeRewards.filter(r => r.name).length} reward type${shakeRewards.filter(r => r.name).length !== 1 ? 's' : ''} · split among ${formatWinnerCount(totalWinners)} winners` :
                        mechanic === 'spin'    ? `${spinSegments.length} segments · ${spinWinRate}% win rate · ${formatWinnerCount(totalWinners)} expected winners` :
                        mechanic === 'dice'    ? `${diceOutcomes.filter(o => o.isWin && o.reward.trim()).length} of 6 faces win · ${diceWinRate}% win rate · ${formatWinnerCount(totalWinners)} expected winners` :
                        mechanic === 'stamp'   ? `${stampConfig.prefillStamps > 0 ? `${stampConfig.prefillStamps} pre-filled · ` : ''}${stampConfig.surpriseDrops.length} surprise · ${stampConfig.bigRewards.length} big reward(s)` :
                        mechanic === 'check-in-loyalty' ? `+${loyaltyConfig.pointsPerCheckIn} pts/check-in · ${loyaltyConfig.milestones.filter(m => m.name.trim()).length} milestone(s)` :
                        mechanic === 'lottery' ? `Jackpot + ${lotteryConfig.prizes.length} prize${lotteryConfig.prizes.length !== 1 ? 's' : ''}` : '—',
                    },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-3 border-b border-v-border last:border-0">
                      <span className="text-sm text-v-text-2">{item.label}</span>
                      <span className="text-sm font-semibold text-v-text text-right max-w-[60%]">{item.value}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Campaign config detail */}
              {mechanic === 'shake' && (
                <Card className="p-6">
                  <h3 className="text-sm font-bold text-v-text mb-3">Reward Configuration</h3>
                  <div className="space-y-2">
                    {shakeRewards.filter(r => r.name.trim()).map(r => (
                      <div key={r.id} className="flex items-start justify-between gap-3 p-3 rounded-xl bg-v-surface-2 border border-v-border text-sm">
                        <div className="min-w-0">
                          <p className="font-semibold text-v-text">{r.icon} {r.name}</p>
                          <p className="text-xs text-v-text-3 mt-0.5">{formatRedeemBeforeSummary(r)}</p>
                        </div>
                        <span className="shrink-0 text-xs font-bold text-v-purple">{r.probability}% share</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {mechanic === 'spin' && (
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-4">
                  <Card className="p-6">
                    <h3 className="text-sm font-bold text-v-text mb-3">Wheel Configuration</h3>
                    <div className="space-y-2">
                      {spinSegments.map(seg => (
                        <div key={seg.id} className="flex items-start justify-between gap-3 p-3 rounded-xl bg-v-surface-2 border border-v-border text-sm">
                          <div className="min-w-0 flex items-start gap-2">
                            <span className="size-3 rounded-full shrink-0 mt-1" style={{ background: seg.color }} />
                            <div>
                              <p className="font-semibold text-v-text">
                                {seg.label}
                                {!seg.isWin && <span className="text-v-text-3 font-normal"> · no win</span>}
                              </p>
                              {seg.isWin && seg.label.trim() && (
                                <p className="text-xs text-v-text-3 mt-0.5">{formatRedeemBeforeSummary(seg)}</p>
                              )}
                            </div>
                          </div>
                          <span className="shrink-0 text-xs font-bold text-v-purple">{seg.probability}%</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                  <Card className="p-5 h-fit">
                    <p className="text-[11px] font-semibold text-v-text-2 uppercase tracking-wider mb-3">Preview</p>
                    <SpinWheelPreview segments={spinSegments} size={200} />
                  </Card>
                </div>
              )}

              {mechanic === 'stamp' && (
                <Card className="p-6">
                  <h3 className="text-sm font-bold text-v-text mb-3">Stamp Card Configuration</h3>
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between py-2 border-b border-v-border">
                      <span className="text-v-text-2">Total stamps</span>
                      <span className="font-semibold text-v-text">{stampConfig.totalStamps}</span>
                    </div>
                    {stampConfig.prefillStamps > 0 && (
                      <div className="flex justify-between py-2 border-b border-v-border">
                        <span className="text-v-text-2">Pre-filled stamps</span>
                        <span className="font-semibold text-v-text">{stampConfig.prefillStamps}</span>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold text-v-text-2 uppercase tracking-wider mb-2">Surprise Drops</p>
                      <div className="space-y-2">
                        {stampConfig.surpriseDrops.map(drop => (
                          <StampDropReviewRow key={drop.id} drop={drop} />
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-v-text-2 uppercase tracking-wider mb-2">Big Rewards</p>
                      <div className="space-y-2">
                        {stampConfig.bigRewards.map(drop => (
                          <StampDropReviewRow key={drop.id} drop={drop} />
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {mechanic === 'check-in-loyalty' && (
                <Card className="p-6">
                  <h3 className="text-sm font-bold text-v-text mb-3">Loyalty Configuration</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-v-border">
                      <span className="text-v-text-2">Points per check-in</span>
                      <span className="font-semibold text-v-purple">+{loyaltyConfig.pointsPerCheckIn} pts</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-v-text-2 uppercase tracking-wider mb-2">Milestones</p>
                      {loyaltyConfig.milestones.filter(m => m.name.trim()).length === 0 ? (
                        <p className="text-xs text-v-text-3">No milestones configured</p>
                      ) : (
                        <div className="space-y-2">
                          {loyaltyConfig.milestones.filter(m => m.name.trim()).map(m => (
                            <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-v-surface-2 border border-v-border">
                              <span className="font-medium text-v-text">{m.icon} {m.name}</span>
                              <span className="text-xs font-bold text-v-purple">{m.pointsThreshold} pts</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )}

              {/* Expected Campaign Impact */}
              {mechanic === 'shake' && (
                <WinBasedCampaignImpact
                  userCap={basics.userCap}
                  overallWinners={basics.overallWinners}
                  perDayUserLimit={isToday ? basics.userCap : basics.perDayUserLimit}
                  campaignDays={campaignDays}
                  startDate={dates.start}
                  endDate={dates.end}
                  isSingleDay={isToday}
                />
              )}

              {(mechanic === 'spin' || mechanic === 'dice') && (
                <WinBasedCampaignImpact
                  userCap={basics.userCap}
                  overallWinners={totalWinners}
                  perDayUserLimit={isToday ? basics.userCap : basics.perDayUserLimit}
                  campaignDays={campaignDays}
                  startDate={dates.start}
                  endDate={dates.end}
                  isSingleDay={isToday}
                />
              )}
              {isStamp && (
                <StampCampaignImpact userCap={basics.userCap} totalStamps={stampConfig.totalStamps} />
              )}
              {isLoyalty && (
                <LoyaltyCampaignImpact
                  userCap={effectiveUserCap}
                  userCapLimited={basics.userCapLimited}
                  pointsPerCheckIn={loyaltyConfig.pointsPerCheckIn}
                  milestoneCount={loyaltyConfig.milestones.filter(m => m.name.trim()).length}
                />
              )}
              {isLottery && (
                <LotteryCampaignImpact prizeCount={1 + lotteryConfig.prizes.length} />
              )}

              <Card className="p-5 text-center">
                <p className="text-xs text-v-text-3 mb-2">A PIN will be auto-generated on launch</p>
                <div className="text-4xl font-black tracking-[0.3em] text-v-border-b">···</div>
                <p className="text-xs text-v-text-3 mt-2">
                  {isStamp ? 'Rotates every 120 seconds · Staff PIN in dashboard' : isLoyalty ? 'Rotates every 120 seconds · Staff PIN in dashboard' : 'Rotates every 120 seconds · Campaign-level'}
                </p>
              </Card>

              <Button variant="gold" size="lg" className="w-full" onClick={handleLaunch} disabled={createMutation.isPending}>
                {createMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                {createMutation.isPending ? 'Launching…' : 'Launch Campaign'}
              </Button>
              {launchError != null && (
                <ApiErrorBanner error={launchError} fallback="Failed to launch campaign" className="mt-3" />
              )}
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      {!launched && (
        <div className="flex items-center justify-between mt-8">
          <Button variant="ghost" onClick={() => step > 0 ? setStep(s => s - 1) : navigate(-1)}>
            <ArrowLeft className="w-4 h-4" /> {step === 0 ? 'Cancel' : 'Back'}
          </Button>
          {step < reviewStepIndex && (
            <Button variant="primary" disabled={!canProceed()} onClick={() => setStep(s => Math.min(reviewStepIndex, s + 1))}>
              Continue <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

function StampDropReviewRow({ drop }: { drop: StampDropUiState }) {
  const rewards = drop.mode === 'single'
    ? [{ name: drop.singleName, redeem: drop.pool[0] }]
    : drop.pool.filter(r => r.name.trim()).map(r => ({ name: r.name, redeem: r }))

  return (
    <div className="p-3 rounded-xl border border-v-border" style={{ backgroundColor: `${drop.color}66` }}>
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <p className="font-semibold text-v-text">{drop.label}</p>
        <span className="text-[10px] font-bold text-v-text-3 shrink-0">Stamps {drop.from}–{drop.to}</span>
      </div>
      <div className="space-y-1">
        {rewards.map((r, i) => (
          <div key={i} className="text-xs">
            <span className="text-v-text-2">{r.name || 'Unnamed reward'}</span>
            {r.redeem && (
              <span className="text-v-text-3"> · {formatRedeemBeforeSummary(r.redeem)}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

