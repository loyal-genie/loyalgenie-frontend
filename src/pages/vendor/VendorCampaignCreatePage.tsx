import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, Zap, Plus, Trash2, AlertCircle, CalendarDays, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FieldInput as Input, Slider, Stepper } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { getMechanicLabel, getMechanicEmoji, getMechanicColor } from '@/lib/utils'
import { getApiErrorMessage } from '@/lib/api'
import { useCreateCampaign } from '@/hooks/useCampaigns'
import { RewardPoolEditor, RewardModeToggle, SingleRewardInput, NumericInput, newRewardEntry, type RewardEntry, type RewardMode } from '@/components/vendor/RewardPoolEditor'
import { LoyaltyCampaignImpact, LotteryCampaignImpact, StampCampaignImpact, WinBasedCampaignImpact } from '@/components/vendor/CampaignImpactCards'
import { calcDailyWinners, calcTotalWinners, formatWinnerCount, maxTotalWinners, winRateFromTotalWinners } from '@/lib/campaign-impact'
import { computeCreateDates, fmtCampaignDate, durationModeToDays, type DurationMode } from '@/lib/campaign-duration'
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
const SPIN_COLORS = ['#7C3AED', '#EC4899', '#F59E0B', '#06B6D4', '#22C55E', '#F43F5E', '#8B5CF6', '#10B981']
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
function computeDates(mode: DurationMode, cs: string, ce: string) {
  return computeCreateDates(mode, cs, ce)
}

const UNLIMITED_USER_CAP = 1_000_000

// ── Page ──────────────────────────────────────────────────────────────────────
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
    // Active hours
    activeHoursEnabled: false,
    activeStartTime: '09:00',
    activeEndTime: '21:00',
    // Participation
    userCap: 200,
    userCapLimited: false,
    perDayUserLimit: 50,
    playsPerDay: 1,
    // Shake & Win only
    overallWinRate: 30,
    claimDurationMode: '14d' as DurationMode,
  })

  // Shake rewards
  const [shakeRewards, setShakeRewards] = useState<RewardEntry[]>([newRewardEntry()])

  // Spin segments (reward embedded per winning segment)
  const [spinSegments, setSpinSegments] = useState([
    { label: 'Free Coffee',  color: '#7C3AED', isWin: true,  reward: 'Free Coffee' },
    { label: 'Try Again',    color: '#E5E1F8', isWin: false, reward: '' },
    { label: '20% Off',      color: '#EC4899', isWin: true,  reward: '20% Off' },
    { label: 'Better Luck',  color: '#EDE9FF', isWin: false, reward: '' },
    { label: 'Free Muffin',  color: '#F59E0B', isWin: true,  reward: 'Free Muffin' },
    { label: '₹50 Off',      color: '#06B6D4', isWin: true,  reward: '₹50 Off' },
  ])

  // Stamp config with per-category toggle
  const [stampConfig, setStampConfig] = useState({
    totalStamps: 10,
    prefillStamps: 0,
    surpriseFrom: 3,
    surpriseTo: 5,
    surpriseMode: 'single' as RewardMode,
    surpriseSingle: 'Mystery Treat',
    surprisePool: [newRewardEntry()] as RewardEntry[],
    bigRewardFrom: 8,
    bigRewardTo: 10,
    bigMode: 'single' as RewardMode,
    bigSingle: 'Free Breakfast Combo',
    bigPool: [newRewardEntry()] as RewardEntry[],
  })

  // Dice outcomes (reward per winning face)
  const [diceOutcomes, setDiceOutcomes] = useState([
    { value: 1, isWin: false, reward: '' },
    { value: 2, isWin: false, reward: '' },
    { value: 3, isWin: true,  reward: 'Free Dessert' },
    { value: 4, isWin: true,  reward: '₹50 Off' },
    { value: 5, isWin: false, reward: '' },
    { value: 6, isWin: true,  reward: 'Free Dessert' },
  ])

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
  const [launchError, setLaunchError] = useState('')
  const createMutation = useCreateCampaign()

  const isLottery        = mechanic === 'lottery'
  const isStamp          = mechanic === 'stamp'
  const isLoyalty        = mechanic === 'check-in-loyalty'
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

  // Win rates
  // Shake: explicit vendor input (overallWinRate). Pool probabilities = share AMONG winners (sum to 100%)
  // Spin/Dice: structurally derived from config
  const shakePoolTotal = shakeRewards.reduce((s, r) => s + r.probability, 0)
  const spinWinRate    = spinSegments.length > 0 ? Math.round((spinSegments.filter(s => s.isWin).length / spinSegments.length) * 100) : 0
  const diceWinRate    = Math.round((diceOutcomes.filter(o => o.isWin).length / 6) * 100)
  const activeWinRate  = mechanic === 'shake' ? basics.overallWinRate : mechanic === 'spin' ? spinWinRate : mechanic === 'dice' ? diceWinRate : 0
  const totalWinners = calcTotalWinners(basics.userCap, basics.playsPerDay, activeWinRate)
  const dailyWinners = calcDailyWinners(isToday ? basics.userCap : basics.perDayUserLimit, basics.playsPerDay, activeWinRate)
  const maxWinners = maxTotalWinners(basics.userCap, basics.playsPerDay)

  const selectMechanic = (m: MechanicType) => {
    if (!isMechanicLive(m)) return
    setMechanic(m)
  }

  const dates = computeDates(basics.durationMode, basics.customStart, basics.customEnd)
  const durationValid = basics.durationMode !== 'custom' || (basics.customStart && basics.customEnd)
  const effectiveUserCap = basics.userCapLimited ? basics.userCap : UNLIMITED_USER_CAP

  const surprisePoolTotal = stampConfig.surprisePool.reduce((s, r) => s + r.probability, 0)
  const bigPoolTotal = stampConfig.bigPool.reduce((s, r) => s + r.probability, 0)

  const step2Valid = () => {
    if (!mechanic) return false
    if (mechanic === 'shake') return shakeRewards.some(r => r.name) && shakePoolTotal === 100
    if (mechanic === 'spin')  return spinSegments.some(s => s.isWin && s.reward.trim())
    if (mechanic === 'dice')  return diceOutcomes.some(o => o.isWin && o.reward.trim())
    if (mechanic === 'lottery') return lotteryConfig.jackpotReward.trim().length > 0
    if (mechanic === 'stamp') {
      const sValid = stampConfig.surpriseMode === 'single' ? stampConfig.surpriseSingle.trim().length > 0 : stampConfig.surprisePool.some(r => r.name) && surprisePoolTotal <= 100
      const bValid = stampConfig.bigMode === 'single' ? stampConfig.bigSingle.trim().length > 0 : stampConfig.bigPool.some(r => r.name) && bigPoolTotal <= 100
      return sValid && bValid
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
    if (step === 2) return step2Valid()
    return true
  }

  const handleLaunch = async () => {
    if (mechanic !== 'shake' && mechanic !== 'stamp' && mechanic !== 'check-in-loyalty') {
      setLaunchError('Only Shake & Win, Stamp Card, and Check-in Loyalty are wired to the API in this release.')
      return
    }
    setLaunchError('')
    try {
      if (mechanic === 'shake') {
        const campaign = await createMutation.mutateAsync({
          name: basics.name.trim(),
          mechanic: 'shake',
          startDate: dates.start,
          endDate: dates.end,
          userCap: basics.userCap,
          perDayUserLimit: isToday ? basics.userCap : basics.perDayUserLimit,
          playsPerDay: basics.playsPerDay,
          winRatePercent: basics.overallWinRate,
          rewards: shakeRewards
            .filter(r => r.name.trim())
            .map(r => ({
              name: r.name.trim(),
              description: r.description,
              icon: r.icon,
              sharePercent: r.probability,
            })),
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

      const campaign = await createMutation.mutateAsync({
        name: basics.name.trim(),
        mechanic: 'stamp',
        startDate: dates.start,
        endDate: dates.end,
        userCap: basics.userCap,
        claimPeriodDays: durationModeToDays(basics.claimDurationMode),
        stampConfig: {
          totalStamps: stampConfig.totalStamps,
          prefillStamps: stampConfig.prefillStamps,
          surpriseRange: [stampConfig.surpriseFrom, stampConfig.surpriseTo] as [number, number],
          bigRange: [stampConfig.bigRewardFrom, stampConfig.bigRewardTo] as [number, number],
          surpriseMode: stampConfig.surpriseMode,
          bigMode: stampConfig.bigMode,
        },
        rewards: {
          surprise: stampConfig.surpriseMode === 'single'
            ? [{ name: stampConfig.surpriseSingle.trim(), icon: '🎁', winPercent: 100 }]
            : stampConfig.surprisePool.filter(r => r.name).map(r => ({
                name: r.name.trim(),
                description: r.description,
                icon: r.icon,
                winPercent: r.probability,
              })),
          big: stampConfig.bigMode === 'single'
            ? [{ name: stampConfig.bigSingle.trim(), icon: '🏆', winPercent: 100 }]
            : stampConfig.bigPool.filter(r => r.name).map(r => ({
                name: r.name.trim(),
                description: r.description,
                icon: r.icon,
                winPercent: r.probability,
              })),
        },
      })
      setLaunched(true)
      setTimeout(() => navigate(`/vendor/campaigns/${campaign.id}`), 2200)
    } catch (err) {
      setLaunchError(getApiErrorMessage(err, 'Failed to launch campaign'))
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
    <div className="p-8 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <button onClick={() => step > 0 ? setStep(s => s - 1) : navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-v-text-2 hover:text-v-text mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-2xl font-extrabold text-v-text">Create Campaign</h1>
        <p className="text-v-text-2 text-sm mt-1">Configure your game mechanic and rewards</p>
      </motion.div>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-10">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all ${i < step ? 'bg-v-success text-white' : i === step ? 'bg-v-purple text-white' : 'bg-v-surface-2 text-v-text-3 border border-v-border'}`}>
              {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${i === step ? 'text-v-text' : 'text-v-text-3'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`h-px w-8 ${i < step ? 'bg-v-success' : 'bg-v-border'}`} />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}>

          {/* ── Step 0: Mechanic ── */}
          {step === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {MECHANICS.map(m => {
                const selected = mechanic === m.type
                const color = getMechanicColor(m.type)
                const comingSoon = !isMechanicLive(m.type)
                return (
                  <motion.div key={m.type} whileHover={comingSoon ? {} : { y: -3 }} whileTap={comingSoon ? {} : { scale: 0.97 }}>
                    <button
                      type="button"
                      disabled={comingSoon}
                      onClick={() => selectMechanic(m.type)}
                      className={`w-full text-left rounded-2xl p-5 border-2 transition-all duration-200 ${selected ? '' : 'border-v-border bg-white hover:border-v-border-b'} ${comingSoon ? 'opacity-70 cursor-not-allowed' : ''}`}
                      style={selected ? { borderColor: color, background: `${color}08` } : {}}
                    >
                      <div className="text-4xl mb-3">{getMechanicEmoji(m.type)}</div>
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-sm font-bold text-v-text">{getMechanicLabel(m.type)}</span>
                        {comingSoon && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            Live soon
                          </span>
                        )}
                        {selected && <Check className="w-4 h-4" style={{ color }} />}
                      </div>
                      <p className="text-xs text-v-text-3 mb-3 leading-relaxed">{m.desc}</p>
                      <div className="flex flex-wrap gap-1">
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
                        <Input label="End Date"   type="date" value={basics.customEnd}   onChange={e => setBasics(p => ({ ...p, customEnd:   e.target.value }))} />
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

                  {/* Active hours — deferred (not enforced in v1) */}
                  {false && !isLottery && (
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
                      <Stepper label="Overall User Cap" hint="users total" value={basics.userCap} min={1} max={2000} step={1} onChange={v => setBasics(p => ({ ...p, userCap: v, perDayUserLimit: Math.min(p.perDayUserLimit, v) }))} />
                      {!isToday && (
                        <div>
                          <Stepper label="Daily User Limit" hint="users / day" value={basics.perDayUserLimit} min={1} max={basics.userCap} onChange={v => setBasics(p => ({ ...p, perDayUserLimit: v }))} />
                          <p className="text-xs text-v-text-3 mt-1.5">
                            Suggested: <span className="font-semibold text-v-text-2">{suggestedDailyLimit} / day</span> — even distribution over {campaignDays} days. Override if needed.
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

                  {/* Winners — Shake only (vendor sets count; stored as win rate %) */}
                  {mechanic === 'shake' && (
                    <div>
                      <Stepper
                        label="Total Winners"
                        hint={`of ${maxWinners.toLocaleString()} possible plays`}
                        value={totalWinners}
                        min={1}
                        max={maxWinners}
                        step={1}
                        onChange={v => setBasics(p => ({ ...p, overallWinRate: winRateFromTotalWinners(v, p.userCap, p.playsPerDay) }))}
                      />
                      <p className="text-xs text-v-text-3 mt-1.5">
                        About <span className="font-semibold text-v-text-2">{formatWinnerCount(dailyWinners)} winners per day</span> when {isToday ? 'all' : basics.perDayUserLimit.toLocaleString()} customers play ({basics.overallWinRate}% win rate). Configure rewards in the next step.
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
                  <div className="flex items-start gap-2.5 p-3.5 bg-purple-50 border border-purple-200 rounded-xl text-xs text-v-text-2">
                    <AlertCircle className="w-4 h-4 text-v-purple shrink-0 mt-0.5" />
                    <p>Staff PIN refreshes every 2 minutes on your dashboard. Customers check in daily to earn points and unlock milestone rewards.</p>
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
                <span className="text-v-text-3 mx-1">·</span>
                <span className="text-v-text-3">Per full day:</span>
                <span className="font-bold text-v-purple">{formatWinnerCount(dailyWinners)}</span>
              </div>
              <RewardPoolEditor rewards={shakeRewards} setRewards={setShakeRewards} shareMode />
            </Card>
          )}

          {/* SPIN A WHEEL */}
          {step === 2 && mechanic === 'spin' && (
            <Card className="p-6">
              <h2 className="text-base font-bold text-v-text mb-1">Spin a Wheel — Segments & Rewards</h2>
              <p className="text-xs text-v-text-3 mb-5">Configure each segment. Mark it as a win and set the reward name directly on the segment.</p>
              <div className="space-y-2">
                {spinSegments.map((seg, i) => (
                  <div key={i} className={`p-3 rounded-xl border-2 transition-all ${seg.isWin ? 'border-v-border-b/60 bg-v-surface-2' : 'border-v-border bg-white'}`}>
                    <div className="flex items-center gap-2.5">
                      {/* Color dot + picker */}
                      <div className="relative group shrink-0">
                        <div className="w-5 h-5 rounded-full border border-v-border cursor-pointer" style={{ background: seg.color }} />
                        <div className="absolute left-0 top-7 z-10 hidden group-hover:flex flex-wrap gap-1 p-2 bg-white border border-v-border rounded-xl shadow-lg w-28">
                          {SPIN_COLORS.map(c => <button key={c} onClick={() => setSpinSegments(s => s.map((x, j) => j === i ? { ...x, color: c } : x))} className="w-5 h-5 rounded-full border-2 transition-all" style={{ background: c, borderColor: seg.color === c ? '#1E1B4B' : 'transparent' }} />)}
                        </div>
                      </div>
                      {/* Label */}
                      <input className="flex-1 bg-transparent border-none text-sm font-semibold text-v-text placeholder:text-v-text-3 focus:outline-none" placeholder="Segment label" value={seg.label} onChange={e => setSpinSegments(s => s.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} />
                      {/* Win toggle */}
                      <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                        <input type="checkbox" checked={seg.isWin} onChange={e => setSpinSegments(s => s.map((x, j) => j === i ? { ...x, isWin: e.target.checked, reward: e.target.checked ? x.reward : '' } : x))} className="w-3.5 h-3.5 accent-v-purple rounded" />
                        <span className="text-xs text-v-text-3">Win</span>
                      </label>
                      {/* Delete */}
                      {spinSegments.length > 2 && (
                        <button onClick={() => setSpinSegments(s => s.filter((_, j) => j !== i))} className="p-1 rounded-lg text-v-text-3 hover:text-v-danger hover:bg-red-50 transition-colors">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    {/* Reward field — only for winning segments */}
                    {seg.isWin && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2 pl-8 overflow-hidden">
                        <input className="w-full bg-white border border-v-border-b/50 rounded-lg px-3 py-1.5 text-sm text-v-text placeholder:text-v-text-3 focus:outline-none focus:border-v-purple" placeholder="Reward (e.g. Free Coffee)" value={seg.reward} onChange={e => setSpinSegments(s => s.map((x, j) => j === i ? { ...x, reward: e.target.value } : x))} />
                      </motion.div>
                    )}
                  </div>
                ))}
                <Button variant="secondary" size="sm" onClick={() => setSpinSegments(s => [...s, { label: 'New Segment', color: '#7C3AED', isWin: false, reward: '' }])}>
                  <Plus className="w-3 h-3" /> Add Segment
                </Button>
              </div>
              <div className="mt-4 flex items-center justify-between p-3 bg-v-surface-2 border border-v-border rounded-xl text-xs">
                <span className="text-v-text-2">Effective win rate</span>
                <span className="font-bold text-v-purple">
                  {spinSegments.filter(s => s.isWin).length} of {spinSegments.length} segments win = {spinWinRate}%
                </span>
              </div>
            </Card>
          )}

          {/* STAMP CARD */}
          {step === 2 && mechanic === 'stamp' && (
            <Card className="p-6">
              <h2 className="text-base font-bold text-v-text mb-1">Stamp Card — Trigger Config & Rewards</h2>
              <p className="text-xs text-v-text-3 mb-5">Set stamp positions for each reward trigger, then configure what gets awarded.</p>
              <div className="space-y-5">
                {/* Total stamps */}
                <Slider label="Total Stamps" displayValue={`${stampConfig.totalStamps} stamps`} min={5} max={20} step={1} value={stampConfig.totalStamps}
                  onChange={e => {
                    const n = Number(e.target.value)
                    setStampConfig(p => ({ ...p, totalStamps: n, prefillStamps: Math.min(p.prefillStamps, n - 1), surpriseTo: Math.min(p.surpriseTo, Math.floor(n / 2)), bigRewardFrom: Math.min(p.bigRewardFrom, n), bigRewardTo: Math.min(p.bigRewardTo, n) }))
                  }}
                />

                {/* Pre-fill stamps */}
                <div>
                  <Stepper label="Pre-fill Stamps" hint="stamps pre-filled" value={stampConfig.prefillStamps} min={0} max={Math.max(0, stampConfig.totalStamps - 1)} onChange={v => setStampConfig(p => ({ ...p, prefillStamps: v }))} />
                  <p className="text-xs text-v-text-3 mt-1.5">Customers start with this many stamps already earned — lowers the barrier to the first reward.</p>
                </div>

                {/* Surprise Drop */}
                <div className="p-4 bg-v-surface-2 border border-v-border rounded-xl space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">🎁</span>
                    <p className="text-xs font-bold text-v-text-2 uppercase tracking-wider">Surprise Drop</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="From Stamp #" type="number" min={1} max={Math.floor(stampConfig.totalStamps / 2)} value={stampConfig.surpriseFrom} onChange={e => setStampConfig(p => ({ ...p, surpriseFrom: Number(e.target.value) }))} />
                    <Input label="To Stamp #"   type="number" min={stampConfig.surpriseFrom} max={Math.floor(stampConfig.totalStamps / 2)} value={stampConfig.surpriseTo} onChange={e => setStampConfig(p => ({ ...p, surpriseTo: Number(e.target.value) }))} />
                  </div>
                  <p className="text-[11px] text-v-text-3">Triggers at a random stamp within this range.</p>
                  <RewardModeToggle mode={stampConfig.surpriseMode} onChange={m => setStampConfig(p => ({ ...p, surpriseMode: m }))} />
                  <AnimatePresence mode="wait">
                    {stampConfig.surpriseMode === 'single' ? (
                      <motion.div key="single" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <SingleRewardInput value={stampConfig.surpriseSingle} onChange={v => setStampConfig(p => ({ ...p, surpriseSingle: v }))} placeholder="e.g. Mystery Treat" />
                      </motion.div>
                    ) : (
                      <motion.div key="pool" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <RewardPoolEditor compact rewards={stampConfig.surprisePool} setRewards={r => setStampConfig(p => ({ ...p, surprisePool: r }))} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Big Reward */}
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">🏆</span>
                    <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Big Reward</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="From Stamp #" type="number" min={Math.floor(stampConfig.totalStamps / 2) + 1} max={stampConfig.totalStamps} value={stampConfig.bigRewardFrom} onChange={e => setStampConfig(p => ({ ...p, bigRewardFrom: Number(e.target.value) }))} />
                    <Input label="To Stamp #"   type="number" min={stampConfig.bigRewardFrom} max={stampConfig.totalStamps} value={stampConfig.bigRewardTo} onChange={e => setStampConfig(p => ({ ...p, bigRewardTo: Number(e.target.value) }))} />
                  </div>
                  <p className="text-[11px] text-amber-600">Triggers at a random stamp within this range.</p>
                  <RewardModeToggle mode={stampConfig.bigMode} onChange={m => setStampConfig(p => ({ ...p, bigMode: m }))} />
                  <AnimatePresence mode="wait">
                    {stampConfig.bigMode === 'single' ? (
                      <motion.div key="single" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <SingleRewardInput value={stampConfig.bigSingle} onChange={v => setStampConfig(p => ({ ...p, bigSingle: v }))} placeholder="e.g. Free Breakfast Combo" />
                      </motion.div>
                    ) : (
                      <motion.div key="pool" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <RewardPoolEditor compact rewards={stampConfig.bigPool} setRewards={r => setStampConfig(p => ({ ...p, bigPool: r }))} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Card preview */}
                <div>
                  <p className="text-[11px] font-semibold text-v-text-2 uppercase tracking-wider mb-2">Card Preview</p>
                  <div className="flex flex-wrap gap-1.5">
                    {Array.from({ length: stampConfig.totalStamps }, (_, i) => {
                      const n = i + 1
                      const isPrefilled = n <= stampConfig.prefillStamps
                      const isSurprise  = n >= stampConfig.surpriseFrom && n <= stampConfig.surpriseTo
                      const isBig       = n >= stampConfig.bigRewardFrom && n <= stampConfig.bigRewardTo
                      return (
                        <div key={n} className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold border-2 ${
                          isPrefilled ? 'border-v-purple bg-v-purple text-white' :
                          isBig       ? 'border-amber-400 bg-amber-50 text-amber-600' :
                          isSurprise  ? 'border-v-purple/40 bg-v-surface-2 text-v-purple' :
                          'border-v-border text-v-text-3'
                        }`}>
                          {isPrefilled ? '✓' : isBig ? '🏆' : isSurprise ? '?' : n}
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-[10px] text-v-text-3">
                    {stampConfig.prefillStamps > 0 && <span className="flex items-center gap-1"><span className="w-3 h-3 rounded border-2 border-v-purple bg-v-purple inline-block" /> Pre-filled ({stampConfig.prefillStamps})</span>}
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded border-2 border-v-purple/40 bg-v-surface-2 inline-block" /> Surprise range</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded border-2 border-amber-400 bg-amber-50 inline-block" /> Big reward range</span>
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
              <p className="text-xs text-v-text-3 mb-5">Toggle each face as a win and assign its reward. Non-winning faces show "Better luck next time! You almost won!"</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {diceOutcomes.map((o, i) => (
                  <div key={i} className={`rounded-2xl border-2 p-3.5 transition-all ${o.isWin ? 'border-v-purple/40 bg-v-surface-2' : 'border-v-border bg-white'}`}>
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-v-border flex items-center justify-center">
                        <DiceFaceSVG value={o.value} />
                      </div>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" checked={o.isWin}
                          onChange={e => setDiceOutcomes(d => d.map((x, j) => j === i ? { ...x, isWin: e.target.checked, reward: e.target.checked ? x.reward : '' } : x))}
                          className="w-3.5 h-3.5 accent-v-purple" />
                        <span className="text-xs font-semibold text-v-text-2">Win</span>
                      </label>
                    </div>
                    <p className="text-xs font-bold text-v-text mb-1.5">Roll {o.value}</p>
                    {o.isWin ? (
                      <input
                        className="w-full bg-white border border-v-border-b/50 rounded-lg px-2.5 py-1.5 text-xs text-v-text placeholder:text-v-text-3 focus:outline-none focus:border-v-purple"
                        placeholder="Reward name"
                        value={o.reward}
                        onChange={e => setDiceOutcomes(d => d.map((x, j) => j === i ? { ...x, reward: e.target.value } : x))}
                      />
                    ) : (
                      <p className="text-[10px] text-v-text-3 italic leading-relaxed">Better luck next time! You almost won!</p>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between p-3 bg-v-surface-2 border border-v-border rounded-xl text-xs">
                <span className="text-v-text-2">Effective win rate</span>
                <span className="font-bold text-v-purple">
                  {diceOutcomes.filter(o => o.isWin).length} of 6 faces win = {diceWinRate}%
                </span>
              </div>
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
          {step === 3 && (
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
                        if (basics.activeHoursEnabled) dur += ` · ${fmtTime(basics.activeStartTime)}–${fmtTime(basics.activeEndTime)}`
                        return dur
                      })(),
                    },
                    ...(!isLottery && !isLoyalty ? [{ label: isShakeSpinOrDice ? 'Overall User Cap' : 'User Cap', value: `${basics.userCap} users` }] : []),
                    ...(isLoyalty ? [{ label: 'User Cap', value: basics.userCapLimited ? `${basics.userCap} users` : 'All customers (no limit)' }] : []),
                    ...(isStamp ? [{ label: 'Claim Period', value: `${durationModeToDays(basics.claimDurationMode)} days after enrollment closes` }] : []),
                    ...(isShakeSpinOrDice && !isToday ? [{ label: 'Daily User Limit', value: `${basics.perDayUserLimit} / day` }] : []),
                    ...(isShakeSpinOrDice ? [{ label: 'Plays Per User / Day', value: `${basics.playsPerDay}` }] : []),
                    ...(mechanic === 'shake' ? [
                      { label: 'Total Winners', value: `${formatWinnerCount(totalWinners)} customers win (${basics.overallWinRate}% win rate)` },
                      { label: 'Winners / Day', value: `${formatWinnerCount(dailyWinners)} on a full day (${basics.overallWinRate}%)` },
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
                        mechanic === 'spin'    ? `${spinSegments.filter(s => s.isWin && s.reward).length} winning segment${spinSegments.filter(s => s.isWin).length !== 1 ? 's' : ''} · ${formatWinnerCount(totalWinners)} expected winners` :
                        mechanic === 'dice'    ? `${diceOutcomes.filter(o => o.isWin).length} of 6 faces win · ${formatWinnerCount(totalWinners)} expected winners` :
                        mechanic === 'stamp'   ? `${stampConfig.prefillStamps > 0 ? `${stampConfig.prefillStamps} pre-filled · ` : ''}Surprise (${stampConfig.surpriseFrom}–${stampConfig.surpriseTo}) · Big (${stampConfig.bigRewardFrom}–${stampConfig.bigRewardTo})` :
                        mechanic === 'check-in-loyalty' ? `+${loyaltyConfig.pointsPerCheckIn} pts/check-in · ${loyaltyConfig.milestones.filter(m => m.name).length} milestone${loyaltyConfig.milestones.filter(m => m.name).length !== 1 ? 's' : ''}` :
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

              {/* Expected Campaign Impact */}
              {isShakeSpinOrDice && (
                <WinBasedCampaignImpact
                  userCap={basics.userCap}
                  perDayUserLimit={basics.perDayUserLimit}
                  playsPerDay={basics.playsPerDay}
                  winRatePercent={activeWinRate}
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
                  milestoneCount={loyaltyConfig.milestones.filter(m => m.name).length}
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
              {launchError && (
                <p className="text-xs text-v-danger text-center mt-2">{launchError}</p>
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
          {step < 3 && (
            <Button variant="primary" disabled={!canProceed()} onClick={() => setStep(s => s + 1)}>
              Continue <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

function DiceFaceSVG({ value }: { value: number }) {
  const dots: Record<number, [number, number][]> = {
    1: [[50, 50]],
    2: [[28, 28], [72, 72]],
    3: [[28, 28], [50, 50], [72, 72]],
    4: [[28, 28], [72, 28], [28, 72], [72, 72]],
    5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
    6: [[28, 28], [72, 28], [28, 50], [72, 50], [28, 72], [72, 72]],
  }
  return (
    <svg viewBox="0 0 100 100" width="28" height="28">
      {(dots[value] || []).map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r="9" fill="#1E1B4B" />)}
    </svg>
  )
}
