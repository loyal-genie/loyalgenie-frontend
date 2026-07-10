import { cn } from '@/lib/utils'
import { Stepper } from '@/components/ui/input'
import type { GroupUnlockConfigUi, GroupUnlockRewardKind } from '@/lib/groupunlock-campaign-config'
import { formatGroupUnlockSentence } from '@/lib/groupunlock-campaign-config'

const labelClass = 'text-xs font-semibold text-v-text-2 uppercase tracking-wider'
const inputClass =
  'h-11 w-full rounded-xl border border-v-border bg-white px-4 text-sm text-v-text placeholder:text-v-text-3 focus:border-v-purple focus:outline-none focus:ring-2 focus:ring-v-purple/12'

const REWARD_KINDS: { id: GroupUnlockRewardKind; label: string }[] = [
  { id: 'flat', label: 'Flat ₹' },
  { id: 'percent', label: '% Off' },
  { id: 'item', label: 'Item/Service' },
]

interface GroupUnlockOfferEditorProps {
  config: GroupUnlockConfigUi
  setConfig: (config: GroupUnlockConfigUi) => void
  readOnly?: boolean
}

export function GroupUnlockOfferEditor({ config, setConfig, readOnly }: GroupUnlockOfferEditorProps) {
  const patch = (partial: Partial<GroupUnlockConfigUi>) => setConfig({ ...config, ...partial })

  if (readOnly) {
    return (
      <div className="rounded-xl border border-v-border bg-v-surface-2 p-4 space-y-2 text-sm">
        <p className="font-semibold text-v-purple">{formatGroupUnlockSentence(config)}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-v-text">Community Offer — Offer Terms</h2>
        <p className="text-sm text-v-text-3 mt-1">
          Set how many people need to reserve a spot before the reward unlocks for everyone, then define the reward.
        </p>
      </div>

      <Stepper
        label="Target Participants"
        hint="people required"
        value={config.targetParticipants}
        min={1}
        max={2000}
        step={1}
        onChange={v => patch({ targetParticipants: v })}
      />

      <div>
        <label className={`${labelClass} mb-2 block`}>Reward</label>
        <div className="flex rounded-xl bg-v-surface-2 p-1 gap-1 mb-3">
          {REWARD_KINDS.map(k => (
            <button
              key={k.id}
              type="button"
              onClick={() => patch({ rewardKind: k.id, rewardValue: '' })}
              className={cn(
                'flex-1 py-2 rounded-lg text-xs font-semibold border-0 cursor-pointer transition-all',
                config.rewardKind === k.id
                  ? 'bg-white text-v-purple shadow-sm'
                  : 'bg-transparent text-v-text-3',
              )}
            >
              {k.label}
            </button>
          ))}
        </div>
        <label className={`${labelClass} mb-1.5 block`}>
          {config.rewardKind === 'flat' && 'Discount Amount (₹)'}
          {config.rewardKind === 'percent' && 'Discount %'}
          {config.rewardKind === 'item' && 'Reward Description'}
        </label>
        <input
          className={inputClass}
          placeholder={
            config.rewardKind === 'flat'
              ? 'e.g. 50'
              : config.rewardKind === 'percent'
                ? 'e.g. 21'
                : 'e.g. Free item or service'
          }
          value={config.rewardValue}
          onChange={e => patch({ rewardValue: e.target.value })}
        />
      </div>

      <div className="rounded-xl bg-v-purple/5 border border-v-purple/15 px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-v-text-3 mb-1">Preview</p>
        <p className="text-sm font-bold text-v-purple">{formatGroupUnlockSentence(config)}</p>
      </div>
    </div>
  )
}
