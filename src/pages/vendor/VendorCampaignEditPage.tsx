import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, ArrowRight, Lock, Check, Save, AlertTriangle,
  Play, Pause, StopCircle, Loader2, TrendingUp, CalendarDays,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FieldInput as Input, Stepper } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { StatusBadge, MechanicBadge } from '@/components/ui/badge'
import { RewardPoolEditor, rewardShareTotal, rewardsAreValid, type RewardEntry } from '@/components/vendor/RewardPoolEditor'
import { useCampaign, useUpdateCampaign } from '@/hooks/useCampaigns'
import { getMechanicEmoji, getMechanicColor, formatDate } from '@/lib/utils'
import {
  DURATION_OPTIONS,
  inferDurationMode,
  computeEndFromStart,
  campaignDayCount,
  fmtCampaignDate,
  type DurationMode,
} from '@/lib/campaign-duration'
import { getApiErrorMessage } from '@/lib/api'
import type { CampaignStatus } from '@/lib/types'

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

const EDIT_STEPS = ['Edit', 'Review']
const TODAY = new Date().toISOString().split('T')[0]

function toRewardEntries(rewards: { id: string; name: string; description: string; icon: string; sharePercent: number }[]): RewardEntry[] {
  return rewards.map(r => ({
    id: r.id,
    name: r.name,
    description: r.description,
    icon: r.icon,
    probability: r.sharePercent,
  }))
}

function rewardsEqual(a: RewardEntry[], b: { id: string; name: string; description: string; icon: string; sharePercent: number }[]) {
  if (a.length !== b.length) return false
  return a.every((r, i) => {
    const o = b[i]
    return r.id === o.id && r.name === o.name && r.description === o.description && r.icon === o.icon && r.probability === o.sharePercent
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
  const [userCap, setUserCap] = useState(100)
  const [perDayUserLimit, setPerDayUserLimit] = useState(50)
  const [playsPerDay, setPlaysPerDay] = useState(1)
  const [winRatePercent, setWinRatePercent] = useState(30)
  const [rewards, setRewards] = useState<RewardEntry[]>([])
  const [saveState, setSaveState] = useState<'idle' | 'saved'>('idle')
  const [formError, setFormError] = useState('')
  const [pendingStatus, setPendingStatus] = useState<'paused' | 'active' | 'ended' | null>(null)

  useEffect(() => {
    if (!campaign) return
    setName(campaign.name)
    setEndDate(campaign.endDate)
    setDurationMode(inferDurationMode(campaign.startDate, campaign.endDate))
    setUserCap(campaign.userCap)
    setPerDayUserLimit(campaign.perDayUserLimit)
    setPlaysPerDay(campaign.playsPerDay)
    setWinRatePercent(campaign.winRatePercent)
    setRewards(toRewardEntries(campaign.rewards))
  }, [campaign])

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

  const isEnded = campaign.status === 'ended'
  const isLive = campaign.status === 'active' || campaign.status === 'paused'
  const color = getMechanicColor(campaign.mechanic as 'shake')
  const isSingleDay = campaign.startDate === endDate
  const originalIsSingleDay = campaign.startDate === campaign.endDate
  const campaignDays = campaignDayCount(campaign.startDate, endDate)
  const suggestedDailyLimit = Math.max(1, Math.floor(userCap / campaignDays))
  const minEndDate = isLive ? TODAY : campaign.startDate

  const selectDuration = (mode: DurationMode) => {
    setDurationMode(mode)
    if (mode !== 'custom') {
      const computed = computeEndFromStart(mode, campaign.startDate, endDate)
      setEndDate(computed < minEndDate ? minEndDate : computed)
    }
  }

  const changedFields = {
    name: name !== campaign.name,
    endDate: endDate !== campaign.endDate,
    userCap: userCap !== campaign.userCap,
    perDayUserLimit: perDayUserLimit !== campaign.perDayUserLimit,
    playsPerDay: playsPerDay !== campaign.playsPerDay,
    winRatePercent: winRatePercent !== campaign.winRatePercent,
    rewards: !rewardsEqual(rewards, campaign.rewards),
  }

  const hasChanges = Object.values(changedFields).some(Boolean)
  const formValid = name.trim().length > 0 && endDate >= campaign.startDate && rewardsAreValid(rewards)

  const handleSave = async () => {
    setFormError('')
    try {
      const payload: Parameters<typeof updateMutation.mutateAsync>[0] = {}
      if (changedFields.name) payload.name = name.trim()
      if (changedFields.endDate) payload.endDate = endDate
      if (changedFields.userCap) payload.userCap = userCap
      if (changedFields.perDayUserLimit) payload.perDayUserLimit = perDayUserLimit
      if (changedFields.playsPerDay) payload.playsPerDay = playsPerDay
      if (changedFields.winRatePercent) payload.winRatePercent = winRatePercent
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

      await updateMutation.mutateAsync(payload)
      setSaveState('saved')
      setTimeout(() => navigate(`/vendor/campaigns/${id}`), 1200)
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'Failed to save changes'))
    }
  }

  const handleStatusChange = async (status: 'paused' | 'active' | 'ended') => {
    setFormError('')
    setPendingStatus(status)
    try {
      await updateMutation.mutateAsync({ status })
      if (status === 'ended') {
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
    ? `Today · ${fmtCampaignDate(campaign.startDate)}`
    : `${fmtCampaignDate(campaign.startDate)} → ${fmtCampaignDate(endDate)}`

  const reviewRows: { label: string; value: string; changed: boolean; previous?: string }[] = [
    { label: 'Campaign Name', value: name, changed: changedFields.name, previous: campaign.name },
    { label: 'Duration', value: durationLabel, changed: changedFields.endDate, previous: originalIsSingleDay ? `Today · ${fmtCampaignDate(campaign.startDate)}` : `${fmtCampaignDate(campaign.startDate)} → ${fmtCampaignDate(campaign.endDate)}` },
    { label: 'Overall User Cap', value: `${userCap} users total`, changed: changedFields.userCap, previous: `${campaign.userCap} users total` },
    ...(!isSingleDay ? [{ label: 'Daily User Limit', value: `${perDayUserLimit} / day`, changed: changedFields.perDayUserLimit, previous: `${campaign.perDayUserLimit} / day` }] : []),
    { label: 'Plays Per User / Day', value: String(playsPerDay), changed: changedFields.playsPerDay, previous: String(campaign.playsPerDay) },
    { label: 'Overall Win Rate', value: `${winRatePercent}% of customers win`, changed: changedFields.winRatePercent, previous: `${campaign.winRatePercent}% of customers win` },
    { label: 'Daily Win Rate', value: `${winRatePercent}% / day (same as overall)`, changed: changedFields.winRatePercent },
    {
      label: 'Rewards',
      value: `${rewards.filter(r => r.name).length} reward type${rewards.filter(r => r.name).length !== 1 ? 's' : ''} · distributed among ${winRatePercent}% winners`,
      changed: changedFields.rewards,
      previous: `${campaign.rewards.length} reward type${campaign.rewards.length !== 1 ? 's' : ''} · distributed among ${campaign.winRatePercent}% winners`,
    },
  ]

  const totalPlays = userCap * playsPerDay
  const totalRewards = Math.round(totalPlays * winRatePercent / 100)
  const dailyPlays = (isSingleDay ? userCap : perDayUserLimit) * playsPerDay
  const dailyRewards = Math.round(dailyPlays * winRatePercent / 100)

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <Link to={`/vendor/campaigns/${id}`} className="inline-flex items-center gap-1.5 text-sm text-v-text-2 hover:text-v-text mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to campaign
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0"
              style={{ background: `${color}12`, border: `1px solid ${color}25` }}
            >
              {getMechanicEmoji(campaign.mechanic as 'shake')}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <h1 className="text-xl font-extrabold text-v-text">Edit Campaign</h1>
                <StatusBadge status={campaign.status as CampaignStatus} />
              </div>
              <MechanicBadge mechanic={campaign.mechanic as 'shake'} />
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
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          {formError}
        </div>
      )}

      {isLive && step === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl mb-5 text-xs text-amber-700"
        >
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            <strong>Campaign is live.</strong> Start date and mechanic are locked. You can update duration, caps, win rate, rewards, and pause or end the campaign.
          </p>
        </motion.div>
      )}

      {isEnded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-start gap-2.5 p-3.5 bg-v-surface-2 border border-v-border rounded-xl mb-5 text-xs text-v-text-2"
        >
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
                            <button
                              key={opt.key}
                              type="button"
                              onClick={() => selectDuration(opt.key)}
                              className={`rounded-xl py-2.5 px-3 text-center border-2 transition-all min-w-[4.5rem] ${durationMode === opt.key ? 'border-v-purple bg-v-surface-3' : 'border-v-border bg-white hover:border-v-border-b'}`}
                            >
                              <div className={`text-sm font-bold ${durationMode === opt.key ? 'text-v-purple' : 'text-v-text'}`}>{opt.label}</div>
                              <div className="text-[10px] text-v-text-3 mt-0.5">{opt.sub}</div>
                            </button>
                          ))}
                        </div>
                        <AnimatePresence>
                          {durationMode === 'custom' && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-3 overflow-hidden">
                              <Input
                                label="End Date"
                                type="date"
                                min={minEndDate}
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    )}
                  </div>

                  <div className="pt-2 border-t border-v-border space-y-4">
                    <p className="text-[11px] font-semibold text-v-text-2 uppercase tracking-wider">Participation</p>

                    {isEnded ? (
                      <>
                        <LockedField label="Overall User Cap" value={`${campaign.userCap} users total`} />
                        {!isSingleDay && (
                          <LockedField label="Daily User Limit" value={`${campaign.perDayUserLimit} users / day`} />
                        )}
                        <LockedField label="Plays Per User Per Day" value={`${campaign.playsPerDay} plays / day`} />
                        <LockedField label="Overall Win Rate" value={`${campaign.winRatePercent}% of customers win`} />
                      </>
                    ) : (
                      <>
                        <Stepper
                          label="Overall User Cap"
                          hint="users total"
                          value={userCap}
                          min={Math.max(campaign.currentUsers, 10)}
                          max={2000}
                          step={10}
                          onChange={v => {
                            setUserCap(v)
                            setPerDayUserLimit(prev => Math.min(prev, v))
                          }}
                        />
                        <p className="text-[11px] text-v-text-3 -mt-2">
                          {campaign.currentUsers} players joined · cap cannot go below current players
                        </p>
                        {!isSingleDay && (
                          <div>
                            <Stepper
                              label="Daily User Limit"
                              hint="users / day"
                              value={perDayUserLimit}
                              min={1}
                              max={userCap}
                              onChange={setPerDayUserLimit}
                            />
                            <p className="text-xs text-v-text-3 mt-1.5">
                              Suggested: <span className="font-semibold text-v-text-2">{suggestedDailyLimit} / day</span> — even distribution over {campaignDays} days. Override if needed.
                            </p>
                          </div>
                        )}
                        <Stepper
                          label="Plays Per User Per Day"
                          hint="plays / day"
                          value={playsPerDay}
                          min={1}
                          max={10}
                          onChange={setPlaysPerDay}
                        />
                        <div>
                          <Stepper
                            label="Overall Win Rate"
                            hint="% of customers win"
                            value={winRatePercent}
                            min={5}
                            max={100}
                            step={5}
                            onChange={setWinRatePercent}
                          />
                          <p className="text-xs text-v-text-3 mt-1.5">
                            Daily win rate is the same — <span className="font-semibold text-v-text-2">{winRatePercent}%</span> of each day&apos;s players will win. Configure what they win below.
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-base font-bold text-v-text mb-1">Shake &amp; Win — Reward Distribution</h2>
                <p className="text-xs text-v-text-3 mb-4">Configure how winning plays are distributed across reward types.</p>
                <div className="flex items-center gap-2 mb-5 p-2.5 bg-v-surface-2 border border-v-border rounded-xl text-xs">
                  <span className="text-v-text-3">Overall win rate:</span>
                  <span className="font-bold text-v-purple">{winRatePercent}% of players win</span>
                  <span className="text-v-text-3 mx-1">·</span>
                  <span className="text-v-text-3">Daily win rate:</span>
                  <span className="font-bold text-v-purple">{winRatePercent}% / day</span>
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
              </Card>

              {!isEnded && STATUS_ACTIONS[campaign.status] && (
                <Card className="p-6">
                  <h2 className="text-sm font-bold text-v-text mb-5">Campaign Status</h2>
                  <div className="space-y-3">
                    {STATUS_ACTIONS[campaign.status]!.map(action => (
                      <div key={action.label} className="flex items-center justify-between gap-4 p-4 rounded-xl border border-v-border bg-v-surface-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-v-text">{action.label}</p>
                          <p className="text-xs text-v-text-3 mt-0.5">{action.description}</p>
                        </div>
                        <Button
                          variant={action.variant}
                          size="sm"
                          disabled={updateMutation.isPending}
                          onClick={() => handleStatusChange(action.status)}
                        >
                          {pendingStatus === action.status ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <action.icon className="w-4 h-4" />
                          )}
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

              {changedFields.rewards && (
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

              <Card className="p-5 bg-v-surface-3 border-v-border-b">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-v-purple" />
                  <h3 className="text-sm font-bold text-v-text">Expected Campaign Impact</h3>
                </div>
                <div className={`grid gap-3 ${isSingleDay ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
                  <div className="bg-white rounded-xl p-3.5">
                    <div className="text-xl font-black text-v-purple">{winRatePercent}%</div>
                    <div className="text-xs font-semibold text-v-text-2 mt-1">Win Rate</div>
                    <div className="text-[10px] text-v-text-3 mt-0.5">Overall win rate you set</div>
                  </div>
                  <div className="bg-white rounded-xl p-3.5">
                    <div className="text-xl font-black text-v-text">~{totalRewards}</div>
                    <div className="text-xs font-semibold text-v-text-2 mt-1">Total Rewards</div>
                    <div className="text-[10px] text-v-text-3 mt-0.5">{userCap} users × {playsPerDay} play{playsPerDay > 1 ? 's' : ''} × {winRatePercent}%</div>
                  </div>
                  {!isSingleDay && (
                    <>
                      <div className="bg-white rounded-xl p-3.5">
                        <div className="text-xl font-black text-v-text">~{dailyRewards}</div>
                        <div className="text-xs font-semibold text-v-text-2 mt-1">Rewards / Day</div>
                        <div className="text-[10px] text-v-text-3 mt-0.5">{perDayUserLimit} users × {playsPerDay} play{playsPerDay > 1 ? 's' : ''} × {winRatePercent}%</div>
                      </div>
                      <div className="bg-white rounded-xl p-3.5">
                        <div className="text-xl font-black text-v-text">{campaignDays}d</div>
                        <div className="text-xs font-semibold text-v-text-2 mt-1">Duration</div>
                        <div className="text-[10px] text-v-text-3 mt-0.5">{fmtCampaignDate(campaign.startDate)} → {fmtCampaignDate(endDate)}</div>
                      </div>
                    </>
                  )}
                </div>
              </Card>

              <Button variant="gold" size="lg" className="w-full" onClick={handleSave} disabled={updateMutation.isPending || saveState === 'saved'}>
                {updateMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : saveState === 'saved' ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
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
