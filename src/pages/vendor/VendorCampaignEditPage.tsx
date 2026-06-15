import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Lock, Check, Save, AlertTriangle,
  Play, Pause, StopCircle, Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FieldInput as Input, Slider } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { StatusBadge, MechanicBadge } from '@/components/ui/badge'
import { useCampaign, useUpdateCampaign } from '@/hooks/useCampaigns'
import { getMechanicEmoji, getMechanicColor, formatDate } from '@/lib/utils'
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

function Stepper({ label, hint, value, min = 1, max = 20, onChange, disabled }: {
  label: string; hint?: string; value: number; min?: number; max?: number
  onChange: (v: number) => void; disabled?: boolean
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-v-text-2 uppercase tracking-wider">{label}</label>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={disabled || value <= min}
          className="w-9 h-9 rounded-xl border border-v-border bg-white text-v-text flex items-center justify-center text-lg font-bold hover:border-v-border-b disabled:opacity-30 disabled:cursor-not-allowed transition-all select-none">
          −
        </button>
        <input type="number" value={value} min={min} max={max} disabled={disabled}
          onChange={e => { const v = Math.max(min, Math.min(max, Number(e.target.value))); if (!isNaN(v)) onChange(v) }}
          className="w-16 text-center bg-white border border-v-border rounded-xl py-2 text-sm font-bold text-v-text focus:outline-none focus:border-v-purple disabled:opacity-50" />
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={disabled || value >= max}
          className="w-9 h-9 rounded-xl border border-v-border bg-white text-v-text flex items-center justify-center text-lg font-bold hover:border-v-border-b disabled:opacity-30 disabled:cursor-not-allowed transition-all select-none">
          +
        </button>
        {hint && <span className="text-xs text-v-text-3 ml-1">{hint}</span>}
      </div>
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

export function VendorCampaignEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: campaign, isLoading, error } = useCampaign(id)
  const updateMutation = useUpdateCampaign(id)

  const [name, setName] = useState('')
  const [endDate, setEndDate] = useState('')
  const [userCap, setUserCap] = useState(100)
  const [perDayUserLimit, setPerDayUserLimit] = useState(50)
  const [playsPerDay, setPlaysPerDay] = useState(1)
  const [winRatePercent, setWinRatePercent] = useState(30)
  const [saveState, setSaveState] = useState<'idle' | 'saved'>('idle')
  const [formError, setFormError] = useState('')
  const [pendingStatus, setPendingStatus] = useState<'paused' | 'active' | 'ended' | null>(null)

  useEffect(() => {
    if (!campaign) return
    setName(campaign.name)
    setEndDate(campaign.endDate)
    setUserCap(campaign.userCap)
    setPerDayUserLimit(campaign.perDayUserLimit)
    setPlaysPerDay(campaign.playsPerDay)
    setWinRatePercent(campaign.winRatePercent)
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
  const isSingleDay = campaign.startDate === campaign.endDate
  const campaignDays = Math.max(1, Math.ceil(
    (new Date(campaign.endDate).getTime() - new Date(campaign.startDate).getTime()) / 86400000,
  ) + 1)
  const suggestedDailyLimit = Math.max(1, Math.floor(userCap / campaignDays))

  const hasChanges =
    name !== campaign.name ||
    endDate !== campaign.endDate ||
    userCap !== campaign.userCap ||
    perDayUserLimit !== campaign.perDayUserLimit ||
    playsPerDay !== campaign.playsPerDay ||
    winRatePercent !== campaign.winRatePercent

  const handleSave = async () => {
    setFormError('')
    try {
      await updateMutation.mutateAsync({
        name,
        endDate,
        userCap,
        perDayUserLimit,
        playsPerDay,
        winRatePercent,
      })
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 2000)
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

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
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
                <h1 className="text-xl font-extrabold text-v-text">{campaign.name}</h1>
                <StatusBadge status={campaign.status as CampaignStatus} />
              </div>
              <MechanicBadge mechanic={campaign.mechanic as 'shake'} />
            </div>
          </div>
          {!isEnded && (
            <Button
              variant={saveState === 'saved' ? 'secondary' : 'primary'}
              onClick={handleSave}
              disabled={!hasChanges || updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Saving…</span>
              ) : saveState === 'saved' ? (
                <span className="flex items-center gap-2"><Check className="w-4 h-4" /> Saved</span>
              ) : (
                <span className="flex items-center gap-2"><Save className="w-4 h-4" /> Save Changes</span>
              )}
            </Button>
          )}
        </div>
      </motion.div>

      {formError && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          {formError}
        </div>
      )}

      {isLive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl mb-5 text-xs text-amber-700"
        >
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            <strong>Campaign is live.</strong> Start date and mechanic are locked. You can update name, end date, caps, win rate, and pause or end the campaign.
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

      <div className="space-y-4">
        {/* Campaign Details — matches create step 1 */}
        <Card className="p-6">
          <h2 className="text-sm font-bold text-v-text mb-5">Campaign Details</h2>
          <div className="space-y-5">
            {isEnded ? (
              <LockedField label="Campaign Name" value={campaign.name} />
            ) : (
              <Input label="Campaign Name" value={name} onChange={e => setName(e.target.value)} />
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LockedField label="Start Date" value={formatDate(campaign.startDate)} reason="Cannot change after launch" />
              {isEnded ? (
                <LockedField label="End Date" value={formatDate(campaign.endDate)} />
              ) : (
                <Input label="End Date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
              )}
            </div>
          </div>
        </Card>

        {/* Participation & Win Rate — matches create layout */}
        <Card className="p-6">
          <h2 className="text-sm font-bold text-v-text mb-5">Participation &amp; Win Rate</h2>
          <div className="space-y-4">
            <div className="pt-0 border-t-0 space-y-4">
              <p className="text-[11px] font-semibold text-v-text-2 uppercase tracking-wider">Participation</p>

              {isEnded ? (
                <>
                  <LockedField label="Overall User Cap" value={`${campaign.userCap} users total`} />
                  {!isSingleDay && (
                    <LockedField label="Daily User Limit" value={`${campaign.perDayUserLimit} users / day`} />
                  )}
                </>
              ) : (
                <>
                  <Slider
                    label="Overall User Cap"
                    displayValue={`${userCap} users total`}
                    min={Math.max(campaign.currentUsers, 10)}
                    max={2000}
                    step={10}
                    value={userCap}
                    onChange={e => setUserCap(Number(e.target.value))}
                  />
                  <p className="text-[11px] text-v-text-3 -mt-2">
                    {campaign.currentUsers} players joined · cap cannot go below current players
                  </p>
                  {!isSingleDay && (
                    <div>
                      <Slider
                        label="Daily User Limit"
                        displayValue={`${perDayUserLimit} users / day`}
                        min={1}
                        max={userCap}
                        step={1}
                        value={perDayUserLimit}
                        onChange={e => setPerDayUserLimit(Number(e.target.value))}
                      />
                      <p className="text-xs text-v-text-3 mt-1.5">
                        Suggested: <span className="font-semibold text-v-text-2">{suggestedDailyLimit} / day</span> — even distribution over {campaignDays} days. Override if needed.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {isEnded ? (
              <LockedField label="Plays Per User Per Day" value={`${campaign.playsPerDay} plays / day`} />
            ) : (
              <Stepper
                label="Plays Per User Per Day"
                hint="plays / day"
                value={playsPerDay}
                min={1}
                max={10}
                onChange={setPlaysPerDay}
              />
            )}

            <div className="pt-2 border-t border-v-border space-y-2">
              {isEnded ? (
                <LockedField label="Overall Win Rate" value={`${campaign.winRatePercent}% of customers win`} />
              ) : (
                <>
                  <Slider
                    label="Overall Win Rate"
                    displayValue={`${winRatePercent}% of customers win`}
                    min={5}
                    max={100}
                    step={5}
                    value={winRatePercent}
                    onChange={e => setWinRatePercent(Number(e.target.value))}
                  />
                  <p className="text-xs text-v-text-3 mt-1.5">
                    Daily win rate is the same — <span className="font-semibold text-v-text-2">{winRatePercent}%</span> of each day&apos;s players will win. Reward mix is locked while live.
                  </p>
                </>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-sm font-bold text-v-text mb-5">Rewards</h2>
          <div className="space-y-2">
            {campaign.rewards.map(r => (
              <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-v-surface-2 border border-v-border">
                <span className="text-sm font-medium text-v-text">{r.icon} {r.name}</span>
                <span className="text-xs text-v-text-3">{r.sharePercent}% share</span>
              </div>
            ))}
            <p className="text-[11px] text-v-text-3 mt-2">Reward shares are locked while live to keep odds fair for all players.</p>
          </div>
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
    </div>
  )
}
