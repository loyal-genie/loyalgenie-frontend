import { useEffect, useState } from 'react'
import { Plus, Trash2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RedeemBeforeField, isRedeemBeforeValid, type RedeemBeforeValue } from '@/components/vendor/RedeemBeforeField'

export const REWARD_ICONS = ['🎁', '☕', '🧁', '🥪', '🍰', '🏷️', '🎉', '🍳', '👑', '🎫', '🎟️', '💰']

export interface RewardEntry {
  id: string
  name: string
  description: string
  icon: string
  probability: number
  redeemExpiryMode: 'fixed' | 'relative'
  redeemFixedDate: string
  redeemRelativeAmount: number
  redeemRelativeUnit: 'day' | 'week' | 'month'
}

export type RewardMode = 'single' | 'pool'

export function newRewardEntry(): RewardEntry {
  return {
    id: Math.random().toString(36).slice(2),
    name: '',
    description: '',
    icon: '🎁',
    probability: 10,
    redeemExpiryMode: 'relative',
    redeemFixedDate: '',
    redeemRelativeAmount: 7,
    redeemRelativeUnit: 'day',
  }
}

function clampPercent(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

/** Compact share/win % slider with a visible track and draggable thumb. */
function ShareSlider({ value, onChange, min = 1, max = 100 }: { value: number; onChange: (n: number) => void; min?: number; max?: number }) {
  const pct = `${((value - min) / (max - min)) * 100}%`
  return (
    <div className="relative flex-1 min-w-[5.5rem] h-6 flex items-center">
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        aria-label="Share percentage"
        className="share-range-slider w-full"
        style={{ accentColor: '#7C3AED', ['--share-pct' as string]: pct }}
      />
    </div>
  )
}

export function PercentInput({
  value,
  onChange,
  min = 1,
  max = 100,
  className,
  disabled,
}: {
  value: number
  onChange: (n: number) => void
  min?: number
  max?: number
  className?: string
  disabled?: boolean
}) {
  return (
    <NumericInput
      value={value}
      onChange={onChange}
      min={min}
      max={max}
      className={className}
      disabled={disabled}
    />
  )
}

/** Generic integer input — use for point thresholds, counts, etc. (not capped at 100). */
export function NumericInput({
  value,
  onChange,
  min = 1,
  max = 99_999,
  className,
  disabled,
}: {
  value: number
  onChange: (n: number) => void
  min?: number
  max?: number
  className?: string
  disabled?: boolean
}) {
  const [draft, setDraft] = useState(String(value))
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    if (!focused) setDraft(String(value))
  }, [value, focused])

  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      disabled={disabled}
      value={focused ? draft : String(value)}
      onFocus={() => {
        setFocused(true)
        setDraft(String(value))
      }}
      onChange={e => {
        const digits = e.target.value.replace(/\D/g, '')
        setDraft(digits)
        if (digits !== '') {
          onChange(clampPercent(Number(digits), min, max))
        }
      }}
      onBlur={() => {
        setFocused(false)
        const next = draft === '' ? min : clampPercent(Number(draft), min, max)
        setDraft(String(next))
        onChange(next)
      }}
      className={className}
    />
  )
}

function ProbabilityBar({ entries, shareMode }: { entries: { name: string; probability: number; id: string }[]; shareMode?: boolean }) {
  const total = entries.reduce((s, r) => s + r.probability, 0)
  const noWin = Math.max(0, 100 - total)
  const over = total > 100
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-1.5 text-xs text-v-text-2">
        <span>{shareMode ? 'Share breakdown' : 'Probability breakdown'}</span>
        <span className={over ? 'text-v-danger font-bold' : total === 100 ? 'text-v-success font-bold' : ''}>{total}% {shareMode ? 'of winners allocated' : 'allocated'}</span>
      </div>
      <div className="flex h-2.5 rounded-full overflow-hidden bg-v-border gap-px">
        {entries.filter(r => r.probability > 0).map((r, i) => (
          <div key={r.id} className="h-full transition-all" style={{ width: `${Math.min(r.probability, 100)}%`, background: `hsl(${(i * 53) % 360}, 65%, 55%)` }} />
        ))}
        {noWin > 0 && !over && <div className="h-full bg-gray-200" style={{ width: `${noWin}%` }} />}
      </div>
      <div className="flex flex-wrap gap-3 mt-1.5 text-[10px] text-v-text-3">
        {entries.filter(r => r.name).map((r, i) => (
          <span key={r.id} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ background: `hsl(${(i * 53) % 360}, 65%, 55%)`, display: 'inline-block' }} />
            {r.name} ({r.probability}%)
          </span>
        ))}
        {noWin > 0 && !over && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />No win ({noWin}%)</span>}
      </div>
      {over && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-v-danger bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />Total exceeds 100% — reduce probabilities.
        </div>
      )}
    </div>
  )
}

export function RewardModeToggle({ mode, onChange, disabled }: { mode: RewardMode; onChange: (m: RewardMode) => void; disabled?: boolean }) {
  return (
    <div className="flex rounded-lg border border-v-border overflow-hidden bg-v-surface-2 p-0.5 gap-0.5">
      {(['single', 'pool'] as RewardMode[]).map(m => (
        <button
          key={m}
          type="button"
          disabled={disabled}
          onClick={() => onChange(m)}
          className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all disabled:opacity-60 ${mode === m ? 'bg-white text-v-text shadow-sm' : 'text-v-text-3 hover:text-v-text-2'}`}
        >
          {m === 'single' ? 'Single Reward' : 'Reward Pool'}
        </button>
      ))}
    </div>
  )
}

export function SingleRewardInput({ value, onChange, placeholder, disabled }: { value: string; onChange: (v: string) => void; placeholder?: string; disabled?: boolean }) {
  return (
    <input
      disabled={disabled}
      className="w-full bg-white border border-v-border rounded-xl px-3 py-2 text-sm text-v-text placeholder:text-v-text-3 focus:outline-none focus:border-v-purple transition-all disabled:opacity-60"
      placeholder={placeholder ?? 'e.g. Free Coffee'}
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  )
}

interface RewardPoolEditorProps {
  rewards: RewardEntry[]
  setRewards: (r: RewardEntry[]) => void
  compact?: boolean
  shareMode?: boolean
  readOnly?: boolean
  showRedeemBefore?: boolean
}

export function RewardPoolEditor({ rewards, setRewards, compact, shareMode, readOnly, showRedeemBefore }: RewardPoolEditorProps) {
  const redeemBefore = showRedeemBefore ?? shareMode
  const update = (id: string, field: keyof RewardEntry, value: string | number) =>
    setRewards(rewards.map(r => r.id === id ? { ...r, [field]: value } : r))

  const updateRedeem = (id: string, value: RedeemBeforeValue) =>
    setRewards(rewards.map(r => r.id === id ? { ...r, ...value } : r))

  if (readOnly) {
    return (
      <div className="space-y-2">
        {rewards.map(r => (
          <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-v-surface-2 border border-v-border">
            <span className="text-sm font-medium text-v-text">{r.icon} {r.name}</span>
            <span className="text-xs text-v-text-3">{r.probability}% {shareMode ? 'share' : 'win'}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-[11px] font-semibold text-v-text-2 uppercase tracking-wider">
            {shareMode ? 'Reward Distribution — among winners' : 'Rewards Pool'}
          </span>
          {shareMode && <p className="text-[10px] text-v-text-3 mt-0.5">Shares should add up to 100% — how wins are split across reward types.</p>}
        </div>
        <Button variant="secondary" size="sm" onClick={() => setRewards([...rewards, newRewardEntry()])}>
          <Plus className="w-3 h-3" /> Add
        </Button>
      </div>
      <div className="space-y-2">
        {rewards.map(r => (
          <div key={r.id} className="p-3 bg-v-surface-2 border border-v-border rounded-xl">
            <div className="flex items-start gap-2">
              <select value={r.icon} onChange={e => update(r.id, 'icon', e.target.value)} className="text-lg bg-transparent border-none focus:outline-none cursor-pointer pt-0.5">
                {REWARD_ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
              </select>
              <div className="flex-1 space-y-1.5">
                <input className="w-full bg-white border border-v-border rounded-lg px-2.5 py-1.5 text-sm text-v-text placeholder:text-v-text-3 focus:outline-none focus:border-v-purple" placeholder="Reward name" value={r.name} onChange={e => update(r.id, 'name', e.target.value)} />
                {!compact && <input className="w-full bg-white border border-v-border rounded-lg px-2.5 py-1.5 text-xs text-v-text placeholder:text-v-text-3 focus:outline-none focus:border-v-purple" placeholder="Description (optional)" value={r.description} onChange={e => update(r.id, 'description', e.target.value)} />}
                {redeemBefore && (
                  <RedeemBeforeField
                    compact={compact}
                    value={{
                      redeemExpiryMode: r.redeemExpiryMode,
                      redeemFixedDate: r.redeemFixedDate,
                      redeemRelativeAmount: r.redeemRelativeAmount,
                      redeemRelativeUnit: r.redeemRelativeUnit,
                    }}
                    onChange={value => updateRedeem(r.id, value)}
                  />
                )}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-v-text-3 shrink-0 w-9">{shareMode ? 'Share:' : 'Win %:'}</span>
                  <ShareSlider value={r.probability} onChange={n => update(r.id, 'probability', n)} />
                  <div className="flex items-center gap-0.5 shrink-0">
                    <PercentInput
                      value={r.probability}
                      onChange={n => update(r.id, 'probability', n)}
                      className="w-11 bg-white border border-v-border rounded-lg px-1.5 py-1 text-xs text-v-text text-center focus:outline-none focus:border-v-purple"
                    />
                    <span className="text-xs text-v-text-2">%</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setRewards(rewards.filter(x => x.id !== r.id))} className="p-1 rounded-lg text-v-text-3 hover:text-v-danger hover:bg-red-50 transition-colors mt-0.5">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
        {rewards.length === 0 && <div className="text-center py-4 text-v-text-3 text-xs border-2 border-dashed border-v-border rounded-xl">No rewards yet — click Add</div>}
      </div>
      {rewards.length > 0 && <ProbabilityBar entries={rewards} shareMode={shareMode} />}
    </div>
  )
}

export function rewardShareTotal(rewards: RewardEntry[]) {
  return rewards.reduce((s, r) => s + r.probability, 0)
}

/** Shake: shares must sum to exactly 100%; each reward needs redeem-before. */
export function rewardsAreValid(rewards: RewardEntry[]) {
  const named = rewards.filter(r => r.name.trim())
  return named.length > 0
    && rewardShareTotal(rewards) === 100
    && named.every(isRedeemBeforeValid)
}

/** Stamp pools: win % must be 1–100% total (not required to equal 100%). */
export function rewardPoolValid(rewards: RewardEntry[]) {
  const total = rewardShareTotal(rewards)
  return rewards.some(r => r.name.trim()) && total >= 1 && total <= 100
}
