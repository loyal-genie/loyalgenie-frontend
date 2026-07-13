import { Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Stepper } from '@/components/ui/input'
import type { ComboConfigUi, ComboVariant } from '@/lib/combo-campaign-config'
import { formatComboSentence } from '@/lib/combo-campaign-config'

const labelClass = 'text-xs font-semibold text-v-text-2 uppercase tracking-wider'
const inputClass =
  'h-11 w-full rounded-xl border border-v-border bg-white px-4 text-sm text-v-text placeholder:text-v-text-3 focus:border-v-purple focus:outline-none focus:ring-2 focus:ring-v-purple/12'

interface ComboOfferEditorProps {
  config: ComboConfigUi
  setConfig: (config: ComboConfigUi) => void
  readOnly?: boolean
}

export function ComboOfferEditor({ config, setConfig, readOnly }: ComboOfferEditorProps) {
  const patch = (partial: Partial<ComboConfigUi>) => setConfig({ ...config, ...partial })

  if (readOnly) {
    return (
      <div className="rounded-xl border border-v-border bg-v-surface-2 p-4 space-y-2 text-sm">
        <p className="font-semibold text-v-purple">{formatComboSentence(config)}</p>
        {config.termsAndConditions.trim() && (
          <p className="text-v-text-3 text-xs whitespace-pre-wrap">{config.termsAndConditions}</p>
        )}
      </div>
    )
  }

  const savings =
    config.variant === 'discount' && config.originalPrice > config.bundlePrice && config.originalPrice > 0
      ? {
          amount: config.originalPrice - config.bundlePrice,
          pct: Math.round(((config.originalPrice - config.bundlePrice) / config.originalPrice) * 100),
        }
      : null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-v-text">Package/Combo Deal — Offer Terms</h2>
        <p className="text-sm text-v-text-3 mt-1">
          Bundle items or services together — either at one discounted price, or as a &quot;take these, get that free&quot; offer.
        </p>
      </div>

      <div>
        <label className={`${labelClass} mb-2 block`}>Combo Type</label>
        <div className="flex rounded-xl bg-v-surface-2 p-1 gap-1">
          {([
            { id: 'discount' as ComboVariant, label: 'Discounted Bundle' },
            { id: 'freeitem' as ComboVariant, label: 'Take X, Get Y Free' },
          ]).map(opt => (
            <button
              key={opt.id}
              type="button"
              onClick={() => patch({ variant: opt.id })}
              className={cn(
                'flex-1 py-2 rounded-lg text-xs font-semibold border-0 cursor-pointer transition-all',
                config.variant === opt.id
                  ? 'bg-white text-v-purple shadow-sm'
                  : 'bg-transparent text-v-text-3',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-v-text-3 mt-1.5">
          {config.variant === 'discount'
            ? 'e.g. Coffee + Croissant + Fruit Bowl bundled at a lower price.'
            : 'e.g. Take 3 Coffees, get the 4th free.'}
        </p>
      </div>

      {config.variant === 'discount' && (
        <>
          <div>
            <label className={`${labelClass} mb-2 block`}>Bundle Items</label>
            <div className="space-y-2">
              {config.items.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    className={inputClass}
                    placeholder="e.g. Coffee"
                    value={item}
                    onChange={e =>
                      patch({ items: config.items.map((it, j) => (j === i ? e.target.value : it)) })
                    }
                  />
                  {config.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => patch({ items: config.items.filter((_, j) => j !== i) })}
                      className="p-2 rounded-lg text-v-text-3 hover:text-red-500 border-0 bg-transparent cursor-pointer"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => patch({ items: [...config.items, ''] })}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-v-purple border border-v-border bg-white cursor-pointer"
            >
              <Plus className="w-3 h-3" /> Add Item
            </button>
          </div>

          <div>
            <label className={`${labelClass} mb-2 block`}>Pricing</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`${labelClass} mb-1.5 block`}>Original Price (₹)</label>
                <input
                  className={inputClass}
                  type="number"
                  min={1}
                  value={config.originalPrice || ''}
                  onChange={e => patch({ originalPrice: Number(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className={`${labelClass} mb-1.5 block`}>Bundle Price (₹)</label>
                <input
                  className={inputClass}
                  type="number"
                  min={1}
                  value={config.bundlePrice || ''}
                  onChange={e => patch({ bundlePrice: Number(e.target.value) || 0 })}
                />
              </div>
            </div>
            {savings && (
              <p className="text-xs text-emerald-600 mt-1.5 font-semibold">
                Customers save ₹{savings.amount} ({savings.pct}% off)
              </p>
            )}
          </div>
        </>
      )}

      {config.variant === 'freeitem' && (
        <>
          <div>
            <label className={`${labelClass} mb-2 block`}>Paid Items — customer takes these</label>
            <div className="space-y-2">
              {config.paidItems.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    className={inputClass}
                    placeholder="e.g. Coffee"
                    value={item}
                    onChange={e =>
                      patch({ paidItems: config.paidItems.map((it, j) => (j === i ? e.target.value : it)) })
                    }
                  />
                  {config.paidItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => patch({ paidItems: config.paidItems.filter((_, j) => j !== i) })}
                      className="p-2 rounded-lg text-v-text-3 hover:text-red-500 border-0 bg-transparent cursor-pointer"
                      aria-label="Remove paid item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => patch({ paidItems: [...config.paidItems, ''] })}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-v-purple border border-v-border bg-white cursor-pointer"
            >
              <Plus className="w-3 h-3" /> Add Paid Item
            </button>
          </div>

          <div>
            <label className={`${labelClass} mb-2 block`}>Free Items — customer gets these free</label>
            <div className="space-y-2">
              {config.freeItems.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    className={inputClass}
                    placeholder="e.g. Coffee"
                    value={item}
                    onChange={e =>
                      patch({ freeItems: config.freeItems.map((it, j) => (j === i ? e.target.value : it)) })
                    }
                  />
                  {config.freeItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => patch({ freeItems: config.freeItems.filter((_, j) => j !== i) })}
                      className="p-2 rounded-lg text-v-text-3 hover:text-red-500 border-0 bg-transparent cursor-pointer"
                      aria-label="Remove free item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => patch({ freeItems: [...config.freeItems, ''] })}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-v-purple border border-v-border bg-white cursor-pointer"
            >
              <Plus className="w-3 h-3" /> Add Free Item
            </button>
          </div>
        </>
      )}

      <Stepper
        label="Total Spots"
        hint="spots available"
        value={config.totalSpots}
        min={1}
        max={10000}
        step={1}
        onChange={v => patch({ totalSpots: v })}
      />

      <div>
        <label className={`${labelClass} mb-1.5 block`}>Terms & Conditions</label>
        <textarea
          className={`${inputClass} h-28 py-3 resize-none`}
          placeholder="e.g. Dine-in only. Cannot be combined with other offers. Valid once per table."
          value={config.termsAndConditions}
          onChange={e => patch({ termsAndConditions: e.target.value })}
        />
        <p className="text-xs text-v-text-3 mt-1.5">
          Qualifying conditions and redemption instructions shown to customers before they claim.
        </p>
      </div>

      <div className="rounded-xl bg-v-purple/5 border border-v-purple/15 px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-v-text-3 mb-1">Preview</p>
        <p className="text-sm font-bold text-v-purple">{formatComboSentence(config)}</p>
      </div>
    </div>
  )
}
