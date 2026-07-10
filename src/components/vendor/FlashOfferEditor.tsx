import { cn } from '@/lib/utils'
import { Stepper } from '@/components/ui/input'
import type { FlashConfigUi, FlashRewardKind } from '@/lib/flash-campaign-config'
import { formatFlashSentence } from '@/lib/flash-campaign-config'

const labelClass = 'text-xs font-semibold text-v-text-2 uppercase tracking-wider'
const inputClass =
  'h-11 w-full rounded-xl border border-v-border bg-white px-4 text-sm text-v-text placeholder:text-v-text-3 focus:border-v-purple focus:outline-none focus:ring-2 focus:ring-v-purple/12'

const REWARD_KINDS: { id: FlashRewardKind; label: string }[] = [
  { id: 'flat', label: 'Flat ₹' },
  { id: 'percent', label: '% Off' },
  { id: 'item', label: 'Item/Service' },
]

interface FlashOfferEditorProps {
  config: FlashConfigUi
  setConfig: (config: FlashConfigUi) => void
  readOnly?: boolean
}

export function FlashOfferEditor({ config, setConfig, readOnly }: FlashOfferEditorProps) {
  const patch = (partial: Partial<FlashConfigUi>) => setConfig({ ...config, ...partial })

  if (readOnly) {
    return (
      <div className="rounded-xl border border-v-border bg-v-surface-2 p-4 space-y-2 text-sm">
        <p className="font-semibold text-v-purple">{formatFlashSentence(config)}</p>
        {config.termsAndConditions.trim() && (
          <p className="text-v-text-3 text-xs whitespace-pre-wrap">{config.termsAndConditions}</p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-v-text">Flash Deal — Offer Terms</h2>
        <p className="text-sm text-v-text-3 mt-1">
          Short and urgent, with a hard limit on spots — set how many are up for grabs, what they win, and when it expires.
        </p>
      </div>

      <Stepper
        label="Total Spots"
        hint="spots available"
        value={config.totalSlots}
        min={1}
        max={5000}
        step={1}
        onChange={v => patch({ totalSlots: v })}
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
                ? 'e.g. 30'
                : 'e.g. Free dessert'
          }
          value={config.rewardValue}
          onChange={e => patch({ rewardValue: e.target.value })}
        />
      </div>

      <div>
        <label className={`${labelClass} mb-1.5 block`}>Terms & Conditions</label>
        <textarea
          className={`${inputClass} h-28 py-3 resize-none`}
          placeholder="e.g. Valid today only, while spots last. One redemption per customer. Show this screen at billing to redeem."
          value={config.termsAndConditions}
          onChange={e => patch({ termsAndConditions: e.target.value })}
        />
        <p className="text-xs text-v-text-3 mt-1.5">
          Qualifying conditions and redemption instructions shown to customers before they claim.
        </p>
      </div>

      <div className="rounded-xl bg-v-purple/5 border border-v-purple/15 px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-v-text-3 mb-1">Preview</p>
        <p className="text-sm font-bold text-v-purple">{formatFlashSentence(config)}</p>
      </div>
    </div>
  )
}
