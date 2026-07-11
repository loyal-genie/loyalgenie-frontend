import { cn } from '@/lib/utils'
import { Stepper } from '@/components/ui/input'
import type { CouponConfigUi, CouponRewardKind } from '@/lib/coupon-campaign-config'
import { formatCouponSentence } from '@/lib/coupon-campaign-config'

const labelClass = 'text-xs font-semibold text-v-text-2 uppercase tracking-wider'
const inputClass =
  'h-11 w-full rounded-xl border border-v-border bg-white px-4 text-sm text-v-text placeholder:text-v-text-3 focus:border-v-purple focus:outline-none focus:ring-2 focus:ring-v-purple/12'

const REWARD_KINDS: { id: CouponRewardKind; label: string }[] = [
  { id: 'flat', label: 'Flat ₹' },
  { id: 'percent', label: '% Off' },
]

interface CouponOfferEditorProps {
  config: CouponConfigUi
  setConfig: (config: CouponConfigUi) => void
  readOnly?: boolean
}

export function CouponOfferEditor({ config, setConfig, readOnly }: CouponOfferEditorProps) {
  const patch = (partial: Partial<CouponConfigUi>) => setConfig({ ...config, ...partial })

  if (readOnly) {
    return (
      <div className="rounded-xl border border-v-border bg-v-surface-2 p-4 space-y-2 text-sm">
        <p className="font-semibold text-v-purple">{formatCouponSentence(config)}</p>
        {config.termsAndConditions.trim() && (
          <p className="text-v-text-3 text-xs whitespace-pre-wrap">{config.termsAndConditions}</p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-v-text">Coupon Codes — Offer Terms</h2>
        <p className="text-sm text-v-text-3 mt-1">
          Set how many coupons are available, what they&apos;re worth, and when they expire.
        </p>
      </div>

      <Stepper
        label="No. of Coupons"
        hint="coupons available"
        value={config.totalCoupons}
        min={1}
        max={10000}
        step={1}
        onChange={v => patch({ totalCoupons: v })}
      />

      <div>
        <label className={`${labelClass} mb-2 block`}>Coupon Value</label>
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
          {config.rewardKind === 'flat' ? 'Discount Amount (₹)' : 'Discount %'}
        </label>
        <input
          className={inputClass}
          placeholder={config.rewardKind === 'flat' ? 'e.g. 50' : 'e.g. 20'}
          value={config.rewardValue}
          onChange={e => patch({ rewardValue: e.target.value })}
        />
      </div>

      <div>
        <label className={`${labelClass} mb-1.5 block`}>Terms & Conditions</label>
        <textarea
          className={`${inputClass} h-28 py-3 resize-none`}
          placeholder="e.g. Valid on bills above ₹500. One coupon per customer. Not valid with other offers. Show coupon at billing to redeem."
          value={config.termsAndConditions}
          onChange={e => patch({ termsAndConditions: e.target.value })}
        />
        <p className="text-xs text-v-text-3 mt-1.5">
          Qualifying conditions and redemption instructions shown to customers before they claim.
        </p>
      </div>

      <div className="rounded-xl bg-v-purple/5 border border-v-purple/15 px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-v-text-3 mb-1">Preview</p>
        <p className="text-sm font-bold text-v-purple">{formatCouponSentence(config)}</p>
      </div>
    </div>
  )
}
