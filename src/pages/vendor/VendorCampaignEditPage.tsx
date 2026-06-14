import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Lock, Check, Save, AlertTriangle,
  Play, Pause, StopCircle, Trash2, Zap, Plus, Trash,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FieldInput as Input, Slider } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { StatusBadge, MechanicBadge } from '@/components/ui/badge'
import { campaigns } from '@/lib/mock-data'
import { getMechanicEmoji, getMechanicLabel, getMechanicColor, formatDate } from '@/lib/utils'
import type { CampaignStatus } from '@/lib/types'

// ── Helpers ───────────────────────────────────────────────────────────────────
const SPIN_COLORS = ['#7C3AED', '#EC4899', '#F59E0B', '#06B6D4', '#22C55E', '#F43F5E', '#8B5CF6', '#10B981']

// ── Reusable locked field ─────────────────────────────────────────────────────
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

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ title, children, locked }: { title: string; children: React.ReactNode; locked?: boolean }) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-5">
        <h2 className="text-sm font-bold text-v-text">{title}</h2>
        {locked && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-v-surface-3 text-v-text-3 border border-v-border">
            <Lock className="w-2.5 h-2.5" /> Locked while live
          </span>
        )}
      </div>
      {children}
    </Card>
  )
}

// ── Stepper ───────────────────────────────────────────────────────────────────
function Stepper({ label, hint, value, min = 1, max = 20, onChange }: {
  label: string; hint?: string; value: number; min?: number; max?: number; onChange: (v: number) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-v-text-2 uppercase tracking-wider">{label}</label>
      <div className="flex items-center gap-2">
        <button onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}
          className="w-9 h-9 rounded-xl border border-v-border bg-white text-v-text flex items-center justify-center text-lg font-bold hover:border-v-border-b disabled:opacity-30 disabled:cursor-not-allowed transition-all select-none">−</button>
        <input type="number" value={value} min={min} max={max}
          onChange={e => { const v = Math.max(min, Math.min(max, Number(e.target.value))); if (!isNaN(v)) onChange(v) }}
          className="w-16 text-center bg-white border border-v-border rounded-xl py-2 text-sm font-bold text-v-text focus:outline-none focus:border-v-purple" />
        <button onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}
          className="w-9 h-9 rounded-xl border border-v-border bg-white text-v-text flex items-center justify-center text-lg font-bold hover:border-v-border-b disabled:opacity-30 disabled:cursor-not-allowed transition-all select-none">+</button>
        {hint && <span className="text-xs text-v-text-3 ml-1">{hint}</span>}
      </div>
    </div>
  )
}

// ── Game config summaries (read-only for active/paused) ──────────────────────
function GameConfigSummary({ campaign }: { campaign: typeof campaigns[0] }) {
  const color = getMechanicColor(campaign.mechanic)
  const details = () => {
    if (campaign.mechanic === 'spin' && campaign.config.type === 'spin') {
      const segs = campaign.config.segments
      return [`${segs.length} segments`, `${segs.filter(s => s.isWin).length} winning`]
    }
    if (campaign.mechanic === 'stamp' && campaign.config.type === 'stamp') {
      const c = campaign.config
      return [`${c.totalStamps} stamps total`, `Surprise: stamps ${c.surpriseDropRange[0]}–${c.surpriseDropRange[1]}`, `Big reward: stamp #${c.bigRewardPosition}`]
    }
    if (campaign.mechanic === 'dice' && campaign.config.type === 'dice') {
      const wins = campaign.config.outcomes.filter(o => o.isWin).map(o => o.value)
      return [`Winning faces: ${wins.join(', ')}`]
    }
    if (campaign.mechanic === 'lottery' && campaign.config.type === 'lottery') {
      return [`${campaign.config.tiers.length} prize tiers + jackpot`]
    }
    if (campaign.mechanic === 'shake' && campaign.config.type === 'shake') {
      return [`Win probability: ${Math.round((campaign.config.winProbability ?? 0.65) * 100)}%`]
    }
    return []
  }
  return (
    <div className="p-4 bg-v-surface-2 border border-v-border rounded-xl">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl shrink-0"
          style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
          {getMechanicEmoji(campaign.mechanic)}
        </div>
        <div>
          <p className="text-sm font-bold text-v-text">{getMechanicLabel(campaign.mechanic)}</p>
          <p className="text-xs text-v-text-3">Game mechanic</p>
        </div>
      </div>
      <div className="space-y-1">
        {details().map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-xs text-v-text-2">
            <div className="w-1 h-1 rounded-full bg-v-text-3" />
            {d}
          </div>
        ))}
        {campaign.rewards.map(r => (
          <div key={r.id} className="flex items-center gap-2 text-xs text-v-text-2">
            <div className="w-1 h-1 rounded-full bg-v-text-3" />
            {r.icon} {r.name}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-start gap-1.5 text-xs text-v-text-3 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
        <Lock className="w-3 h-3 mt-0.5 shrink-0 text-amber-500" />
        Game config is locked while the campaign is live to ensure a consistent experience for all participants.
      </div>
    </div>
  )
}

// ── Draft game config (inline edit for draft campaigns) ──────────────────────
function DraftSpinConfig({ segments, setSegments }: { segments: { label: string; color: string; isWin: boolean; reward: string }[]; setSegments: (s: typeof segments) => void }) {
  return (
    <div className="space-y-2">
      {segments.map((seg, i) => (
        <div key={i} className={`p-3 rounded-xl border-2 transition-all ${seg.isWin ? 'border-v-border-b/60 bg-v-surface-2' : 'border-v-border bg-white'}`}>
          <div className="flex items-center gap-2.5">
            <div className="relative group shrink-0">
              <div className="w-5 h-5 rounded-full border border-v-border cursor-pointer" style={{ background: seg.color }} />
              <div className="absolute left-0 top-7 z-10 hidden group-hover:flex flex-wrap gap-1 p-2 bg-white border border-v-border rounded-xl shadow-lg w-28">
                {SPIN_COLORS.map(c => <button key={c} onClick={() => setSegments(segments.map((x, j) => j === i ? { ...x, color: c } : x))} className="w-5 h-5 rounded-full border-2 transition-all" style={{ background: c, borderColor: seg.color === c ? '#1E1B4B' : 'transparent' }} />)}
              </div>
            </div>
            <input className="flex-1 bg-transparent border-none text-sm font-semibold text-v-text placeholder:text-v-text-3 focus:outline-none" placeholder="Segment label" value={seg.label} onChange={e => setSegments(segments.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} />
            <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
              <input type="checkbox" checked={seg.isWin} onChange={e => setSegments(segments.map((x, j) => j === i ? { ...x, isWin: e.target.checked } : x))} className="w-3.5 h-3.5 accent-v-purple" />
              <span className="text-xs text-v-text-3">Win</span>
            </label>
            {segments.length > 2 && <button onClick={() => setSegments(segments.filter((_, j) => j !== i))} className="p-1 rounded-lg text-v-text-3 hover:text-v-danger hover:bg-red-50 transition-colors"><Trash className="w-3 h-3" /></button>}
          </div>
          {seg.isWin && (
            <div className="mt-2 pl-8">
              <input className="w-full bg-white border border-v-border-b/50 rounded-lg px-3 py-1.5 text-sm text-v-text placeholder:text-v-text-3 focus:outline-none focus:border-v-purple" placeholder="Reward (e.g. Free Coffee)" value={seg.reward} onChange={e => setSegments(segments.map((x, j) => j === i ? { ...x, reward: e.target.value } : x))} />
            </div>
          )}
        </div>
      ))}
      <Button variant="secondary" size="sm" onClick={() => setSegments([...segments, { label: 'New Segment', color: '#7C3AED', isWin: false, reward: '' }])}>
        <Plus className="w-3 h-3" /> Add Segment
      </Button>
    </div>
  )
}

// ── Status action configs ─────────────────────────────────────────────────────
const STATUS_TRANSITIONS: Record<CampaignStatus, { label: string; icon: typeof Play; variant: 'primary' | 'secondary' | 'danger' | 'gold'; description: string }[]> = {
  active: [
    { label: 'Pause Campaign',    icon: Pause,       variant: 'secondary', description: 'Temporarily stop new plays. Existing rewards remain valid.' },
    { label: 'End Campaign Early', icon: StopCircle, variant: 'danger',    description: 'Permanently end the campaign. This cannot be undone.' },
  ],
  draft: [
    { label: 'Launch Campaign',   icon: Zap,       variant: 'gold',    description: 'Make the campaign live. A PIN will be generated automatically.' },
    { label: 'Delete Draft',      icon: Trash2,    variant: 'danger',  description: 'Permanently delete this draft. This cannot be undone.' },
  ],
  paused: [
    { label: 'Resume Campaign',   icon: Play,        variant: 'primary', description: 'Reactivate the campaign for new plays.' },
    { label: 'End Campaign',      icon: StopCircle,  variant: 'danger',  description: 'Permanently end the campaign. This cannot be undone.' },
  ],
  ended: [],
}

// ── Page ──────────────────────────────────────────────────────────────────────
export function VendorCampaignEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const original = campaigns.find(c => c.id === id) ?? campaigns[0]

  const isLocked = original.status === 'ended'
  const isLive   = original.status === 'active' || original.status === 'paused'

  // Form state initialised from campaign data
  const [name,          setName]          = useState(original.name)
  const [endDate,       setEndDate]       = useState(original.endDate)
  const [userCap,       setUserCap]       = useState(original.userCap)
  const [playsPerDay,   setPlaysPerDay]   = useState(original.playsPerUser)
  const [dailyRewardCap, setDailyRewardCap] = useState(50)

  // Spin segments for draft editing
  const [spinSegments, setSpinSegments] = useState(() => {
    if (original.config.type === 'spin') {
      return original.config.segments.map(s => ({ label: s.label, color: s.color, isWin: s.isWin, reward: s.reward ?? '' }))
    }
    return [{ label: 'Free Coffee', color: '#7C3AED', isWin: true, reward: 'Free Coffee' }]
  })

  // Save state
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [confirmAction, setConfirmAction] = useState<string | null>(null)

  const hasChanges =
    name !== original.name ||
    endDate !== original.endDate ||
    userCap !== original.userCap ||
    playsPerDay !== original.playsPerUser

  const handleSave = () => {
    setSaveState('saving')
    setTimeout(() => {
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 2500)
    }, 800)
  }

  const handleAction = (label: string) => {
    setConfirmAction(label)
    setTimeout(() => {
      setConfirmAction(null)
      if (label === 'Delete Draft' || label === 'End Campaign Early' || label === 'End Campaign') {
        navigate('/vendor/campaigns')
      } else {
        navigate(`/vendor/campaigns/${id}`)
      }
    }, 1200)
  }

  const isStamp   = original.mechanic === 'stamp'
  const isLottery = original.mechanic === 'lottery'

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <Link to={`/vendor/campaigns/${id}`} className="inline-flex items-center gap-1.5 text-sm text-v-text-2 hover:text-v-text mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to campaign
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0"
              style={{ background: `${getMechanicColor(original.mechanic)}12`, border: `1px solid ${getMechanicColor(original.mechanic)}25` }}>
              {getMechanicEmoji(original.mechanic)}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="text-xl font-extrabold text-v-text">{original.name}</h1>
                <StatusBadge status={original.status} />
              </div>
              <MechanicBadge mechanic={original.mechanic} />
            </div>
          </div>
          {!isLocked && (
            <Button
              variant={saveState === 'saved' ? 'secondary' : 'primary'}
              onClick={handleSave}
              disabled={!hasChanges || saveState === 'saving'}
            >
              {saveState === 'saving' ? (
                <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</span>
              ) : saveState === 'saved' ? (
                <span className="flex items-center gap-2"><Check className="w-4 h-4" /> Saved</span>
              ) : (
                <span className="flex items-center gap-2"><Save className="w-4 h-4" /> Save Changes</span>
              )}
            </Button>
          )}
        </div>
      </motion.div>

      {/* Live / ended banners */}
      {isLive && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}
          className="flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl mb-5 text-xs text-amber-700">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <p><strong>Campaign is live.</strong> Mechanic, start date, and game config are locked to protect current participants. You can still update the name, end date, user cap, plays per day, and daily reward cap.</p>
        </motion.div>
      )}
      {isLocked && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}
          className="flex items-start gap-2.5 p-3.5 bg-v-surface-2 border border-v-border rounded-xl mb-5 text-xs text-v-text-2">
          <Lock className="w-4 h-4 shrink-0 mt-0.5" />
          <p>This campaign has ended and is read-only.</p>
        </motion.div>
      )}

      <div className="space-y-4">
        {/* ── Campaign Details ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Section title="Campaign Details">
            <div className="space-y-5">
              {isLocked ? (
                <LockedField label="Campaign Name" value={original.name} />
              ) : (
                <Input label="Campaign Name" value={name} onChange={e => setName(e.target.value)} />
              )}
              <div className="grid grid-cols-2 gap-4">
                {isLive || isLocked ? (
                  <LockedField label="Start Date" value={formatDate(original.startDate)} reason={isLive ? 'Cannot change — campaign already started' : undefined} />
                ) : (
                  <Input label="Start Date" type="date" value={original.startDate} readOnly />
                )}
                {isLocked ? (
                  <LockedField label="End Date" value={formatDate(original.endDate)} />
                ) : (
                  <Input label="End Date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                )}
              </div>
            </div>
          </Section>
        </motion.div>

        {/* ── Participation Settings ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
          <Section title="Participation Settings">
            <div className="space-y-5">
              {/* User Cap */}
              {isLocked ? (
                <LockedField label="User Cap" value={`${original.userCap} users`} />
              ) : isLottery ? (
                <div className="flex items-start gap-2.5 p-3 bg-v-surface-2 border border-v-border rounded-xl text-xs text-v-text-2">
                  No user cap for Lottery campaigns.
                </div>
              ) : (
                <Slider label="User Cap" displayValue={`${userCap} users`} min={original.currentUsers || 10} max={5000} step={10} value={userCap} onChange={e => setUserCap(Number(e.target.value))} />
              )}

              {/* Plays Per Day — not for stamp or lottery */}
              {!isStamp && !isLottery && (
                isLocked ? (
                  <LockedField label="Plays Per User Per Day" value={`${original.playsPerUser} / day`} />
                ) : (
                  <Stepper label="Plays Per User Per Day" hint="per day" value={playsPerDay} min={1} max={10} onChange={setPlaysPerDay} />
                )
              )}

              {/* Daily Reward Cap — not for stamp or lottery */}
              {!isStamp && !isLottery && (
                isLocked ? (
                  <LockedField label="Daily Rewards Cap" value={dailyRewardCap === 0 ? 'Unlimited' : `${dailyRewardCap} / day`} />
                ) : (
                  <div>
                    <Slider label="Daily Rewards Cap" displayValue={dailyRewardCap === 0 ? 'Unlimited' : `${dailyRewardCap} / day`} min={0} max={500} step={5} value={dailyRewardCap} onChange={e => setDailyRewardCap(Number(e.target.value))} />
                    <p className="text-xs text-v-text-3 mt-1.5">Set to 0 for unlimited.</p>
                  </div>
                )
              )}

              {/* Stamp / Lottery notes */}
              {(isStamp || isLottery) && !isLocked && (
                <div className="flex items-start gap-2 p-3 bg-v-surface-2 border border-v-border rounded-xl text-xs text-v-text-2">
                  {isStamp ? 'Stamp Card has no plays per day or daily reward cap — rewards trigger at stamp positions.' : 'Lottery has no plays per day or daily reward cap — prizes are governed by ticket probabilities.'}
                </div>
              )}
            </div>
          </Section>
        </motion.div>

        {/* ── Game Config ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
          <Section title="Game Config" locked={isLive}>
            {isLive || isLocked ? (
              <GameConfigSummary campaign={original} />
            ) : (
              /* Draft — fully editable game config */
              <div>
                {original.mechanic === 'spin' && (
                  <DraftSpinConfig segments={spinSegments} setSegments={setSpinSegments} />
                )}
                {original.mechanic === 'shake' && (
                  <div className="p-4 bg-v-surface-2 border border-v-border rounded-xl text-sm text-v-text-2 space-y-2">
                    <p className="font-semibold">Shake & Win</p>
                    <p className="text-xs text-v-text-3">Reward pool and win probabilities can be configured freely before launch.</p>
                  </div>
                )}
                {original.mechanic === 'stamp' && original.config.type === 'stamp' && (() => {
                  const sc = original.config
                  return (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-3 text-center">
                        {[
                          { label: 'Total Stamps',   value: sc.totalStamps },
                          { label: 'Surprise Range', value: `${sc.surpriseDropRange[0]}–${sc.surpriseDropRange[1]}` },
                          { label: 'Big Reward At',  value: `#${sc.bigRewardPosition}` },
                        ].map(s => (
                          <div key={s.label} className="bg-v-surface-2 border border-v-border rounded-xl p-3">
                            <div className="text-sm font-bold text-v-text">{s.value}</div>
                            <div className="text-[10px] text-v-text-3 mt-0.5">{s.label}</div>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {Array.from({ length: sc.totalStamps }, (_, i) => {
                          const n = i + 1
                          const isSurprise = n >= sc.surpriseDropRange[0] && n <= sc.surpriseDropRange[1]
                          const isBig = n === sc.bigRewardPosition
                          return (
                            <div key={n} className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold border-2 ${isBig ? 'border-amber-400 bg-amber-50 text-amber-600' : isSurprise ? 'border-v-purple/40 bg-v-surface-2 text-v-purple' : 'border-v-border text-v-text-3'}`}>
                              {isBig ? '🏆' : isSurprise ? '?' : n}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })()}
                {original.mechanic === 'dice' && original.config.type === 'dice' && (
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {original.config.outcomes.map(o => (
                      <div key={o.value} className={`p-3 rounded-xl border-2 text-center ${o.isWin ? 'border-v-purple/40 bg-v-surface-2' : 'border-v-border bg-white'}`}>
                        <DiceFaceSVG value={o.value} />
                        <p className="text-[10px] mt-1.5 font-semibold text-v-text">Roll {o.value}</p>
                        {o.isWin
                          ? <p className="text-[10px] text-v-purple">{o.reward ?? 'Win'}</p>
                          : <p className="text-[10px] text-v-text-3">No win</p>
                        }
                      </div>
                    ))}
                  </div>
                )}
                {original.mechanic === 'lottery' && original.config.type === 'lottery' && (() => {
                  const lc = original.config
                  return (
                    <div className="space-y-2">
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
                        <span className="text-xl">👑</span>
                        <div>
                          <p className="text-sm font-bold text-amber-700">Jackpot</p>
                          <p className="text-xs text-amber-600">{lc.jackpotReward?.name}</p>
                        </div>
                        <span className="ml-auto text-xs font-bold text-amber-600">{((lc.tiers[0]?.probability ?? 0.01) * 100).toFixed(0)}%</span>
                      </div>
                      {lc.tiers.slice(1).map((t, i) => (
                        <div key={i} className="p-3 bg-v-surface-2 border border-v-border rounded-xl flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full shrink-0" style={{ background: t.color }} />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-v-text">{t.name}</p>
                            <p className="text-xs text-v-text-3">{t.reward}</p>
                          </div>
                          <span className="text-xs font-bold text-v-text-2">{(t.probability * 100).toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>
                  )
                })()}
              </div>
            )}
          </Section>
        </motion.div>

        {/* ── Status Actions ── */}
        {!isLocked && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
            <Card className="p-6">
              <h2 className="text-sm font-bold text-v-text mb-1">Campaign Actions</h2>
              <p className="text-xs text-v-text-3 mb-5">Manage the campaign lifecycle.</p>
              <div className="space-y-3">
                {STATUS_TRANSITIONS[original.status].map(action => {
                  const Icon = action.icon
                  const isConfirming = confirmAction === action.label
                  return (
                    <div key={action.label} className="flex items-center justify-between gap-4 p-3.5 bg-v-surface-2 border border-v-border rounded-xl">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-v-text">{action.label}</p>
                        <p className="text-xs text-v-text-3 mt-0.5">{action.description}</p>
                      </div>
                      <Button variant={action.variant as any} size="sm" onClick={() => handleAction(action.label)} disabled={isConfirming}>
                        <AnimatePresence mode="wait">
                          {isConfirming ? (
                            <motion.span key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5" /> Done
                            </motion.span>
                          ) : (
                            <motion.span key="action" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5">
                              <Icon className="w-3.5 h-3.5" /> {action.label}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </Button>
                    </div>
                  )
                })}
              </div>
            </Card>
          </motion.div>
        )}
      </div>
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
    <svg viewBox="0 0 100 100" width="28" height="28" className="mx-auto">
      {(dots[value] || []).map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r="9" fill="#1E1B4B" />)}
    </svg>
  )
}
