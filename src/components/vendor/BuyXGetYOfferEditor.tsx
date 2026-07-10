import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import type { BuyXGetYConfigUi, RewardKind } from '@/lib/buy-x-get-y-campaign-config'
import { formatBuyXGetYSentence } from '@/lib/buy-x-get-y-campaign-config'

const labelClass = 'text-xs font-semibold text-v-text-2 uppercase tracking-wider'
const inputClass =
  'h-11 w-full rounded-xl border border-v-border bg-white px-4 text-sm text-v-text placeholder:text-v-text-3 focus:border-v-purple focus:outline-none focus:ring-2 focus:ring-v-purple/12'
const selectClass = `${inputClass} appearance-none`

const REWARD_KINDS: { id: RewardKind; label: string }[] = [
  { id: 'flat', label: 'Flat ₹' },
  { id: 'percent', label: '% Off' },
  { id: 'item', label: 'Item/Service' },
]

interface BuyXGetYOfferEditorProps {
  config: BuyXGetYConfigUi
  setConfig: (config: BuyXGetYConfigUi) => void
  readOnly?: boolean
}

export function BuyXGetYOfferEditor({ config, setConfig, readOnly }: BuyXGetYOfferEditorProps) {
  const patch = (partial: Partial<BuyXGetYConfigUi>) => setConfig({ ...config, ...partial })
  const committedTrigger = config.condition === 'spend' ? config.spendAmount : config.buyQuantity
  const [triggerDraft, setTriggerDraft] = useState(String(committedTrigger))

  useEffect(() => {
    setTriggerDraft(String(committedTrigger))
  }, [committedTrigger, config.condition])

  const commitTrigger = (raw: string) => {
    const n = Math.max(1, Number.parseInt(raw, 10) || 1)
    if (config.condition === 'spend') patch({ spendAmount: n })
    else patch({ buyQuantity: n })
    setTriggerDraft(String(n))
  }

  if (readOnly) {
    return (
      <div className="rounded-xl border border-v-border bg-v-surface-2 p-4 space-y-2 text-sm">
        <p className="font-semibold text-v-purple">{formatBuyXGetYSentence(config)}</p>
        <p className="text-v-text-3 text-xs">
          Trigger: {config.condition === 'spend' ? `₹${config.spendAmount} spend` : `${config.buyQuantity} purchases`}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-v-text">Buy X Get Y — Offer Terms</h2>
        <p className="text-sm text-v-text-3 mt-1">
          Works across purchase counts or spend thresholds — pick what fits your business, then define the reward.
        </p>
      </div>

      <div>
        <label className={`${labelClass} mb-2 block`}>Trigger</label>
        <div className="grid grid-cols-[1fr_120px] gap-3">
          <select
            className={selectClass}
            value={config.condition}
            onChange={e => patch({ condition: e.target.value as 'quantity' | 'spend' })}
          >
            <option value="quantity">Purchases</option>
            <option value="spend">₹ Spend</option>
          </select>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            className={inputClass}
            value={triggerDraft}
            onChange={e => {
              const raw = e.target.value
              if (raw !== '' && !/^\d+$/.test(raw)) return
              setTriggerDraft(raw)
              if (raw === '') return
              const n = Number.parseInt(raw, 10)
              if (!Number.isFinite(n) || n < 1) return
              if (config.condition === 'spend') patch({ spendAmount: n })
              else patch({ buyQuantity: n })
            }}
            onBlur={() => commitTrigger(triggerDraft)}
          />
        </div>
      </div>

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
              ? 'e.g. 150'
              : config.rewardKind === 'percent'
                ? 'e.g. 20'
                : 'e.g. Free item or service'
          }
          value={config.rewardValue}
          onChange={e => patch({ rewardValue: e.target.value })}
        />
      </div>

      <div className="rounded-xl bg-v-purple/5 border border-v-purple/15 px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-v-text-3 mb-1">Preview</p>
        <p className="text-sm font-bold text-v-purple">{formatBuyXGetYSentence(config)}</p>
      </div>
    </div>
  )
}
