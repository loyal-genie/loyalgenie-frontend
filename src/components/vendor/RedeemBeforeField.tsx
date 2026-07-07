import { ChevronDown } from 'lucide-react'

type RedeemExpiryMode = 'fixed' | 'relative'
type RedeemRelativeUnit = 'day' | 'week' | 'month'

export type RedeemBeforeValue = {
  redeemExpiryMode: RedeemExpiryMode
  redeemFixedDate: string
  redeemRelativeAmount: number
  redeemRelativeUnit: RedeemRelativeUnit
}

type RedeemBeforeFieldProps = {
  value: RedeemBeforeValue
  onChange: (value: RedeemBeforeValue) => void
  compact?: boolean
}

const labelClass = 'text-[10px] font-semibold text-v-text-2 uppercase tracking-wider'

function unitLabel(unit: RedeemRelativeUnit, amount: number): string {
  const plural = amount === 1 ? '' : 's'
  if (unit === 'day') return `Day${plural}`
  if (unit === 'week') return `Week${plural}`
  return `Month${plural}`
}

export function formatRedeemBeforeSummary(value: RedeemBeforeValue): string {
  if (value.redeemExpiryMode === 'fixed') {
    return value.redeemFixedDate
      ? `By ${new Date(`${value.redeemFixedDate}T12:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
      : 'Fixed date not set'
  }
  const amount = value.redeemRelativeAmount || 0
  const unit = unitLabel(value.redeemRelativeUnit, amount).toLowerCase()
  return amount > 0 ? `Within ${amount} ${unit} of winning` : 'Relative period not set'
}

export function isRedeemBeforeValid(value: RedeemBeforeValue): boolean {
  if (value.redeemExpiryMode === 'fixed') return Boolean(value.redeemFixedDate)
  return value.redeemRelativeAmount > 0
}

export function RedeemBeforeField({ value, onChange, compact }: RedeemBeforeFieldProps) {
  const inputHeight = compact ? 'h-10' : 'h-11'
  const inputClass = `${inputHeight} rounded-xl border border-v-border bg-white text-sm text-v-text focus:border-v-purple focus:outline-none focus:ring-2 focus:ring-v-purple/12`
  const toggleText = compact ? 'text-[10px] py-1' : 'text-xs py-1.5'

  return (
    <div>
      <label className={`${labelClass} mb-1.5 block`}>Redeem Before *</label>

      <div className={`mb-2 flex rounded-lg border border-v-border bg-v-surface-2 p-0.5`}>
        {([
          { key: 'fixed' as const, label: 'Fixed date' },
          { key: 'relative' as const, label: 'Relative expiry' },
        ]).map(opt => (
          <button
            key={opt.key}
            type="button"
            onClick={() => onChange({ ...value, redeemExpiryMode: opt.key })}
            className={`flex-1 rounded-md font-semibold transition-all ${toggleText} ${
              value.redeemExpiryMode === opt.key
                ? 'bg-white text-v-text shadow-sm'
                : 'text-v-text-3 hover:text-v-text-2'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {value.redeemExpiryMode === 'fixed' ? (
        <input
          type="date"
          value={value.redeemFixedDate}
          onChange={e => onChange({ ...value, redeemFixedDate: e.target.value, redeemExpiryMode: 'fixed' })}
          className={`${inputClass} w-full px-3`}
        />
      ) : (
        <div>
          <div className="flex gap-2">
            <div className="shrink-0">
              <span className={`${labelClass} mb-1 block normal-case tracking-normal text-v-text-3`}>Within</span>
              <input
                type="number"
                min={1}
                value={value.redeemRelativeAmount}
                onChange={e => onChange({
                  ...value,
                  redeemRelativeAmount: Number(e.target.value),
                  redeemExpiryMode: 'relative',
                })}
                className={`${inputClass} w-20 px-3 text-center`}
                aria-label="Redeem within amount"
              />
            </div>
            <div className="min-w-0 flex-1">
              <span className={`${labelClass} mb-1 block normal-case tracking-normal text-v-text-3`}>Period</span>
              <div className="relative">
                <select
                  value={value.redeemRelativeUnit}
                  onChange={e => onChange({
                    ...value,
                    redeemRelativeUnit: e.target.value as RedeemRelativeUnit,
                    redeemExpiryMode: 'relative',
                  })}
                  className={`${inputClass} w-full appearance-none px-3 pr-9`}
                  aria-label="Redeem period unit"
                >
                  <option value="day">{unitLabel('day', value.redeemRelativeAmount)}</option>
                  <option value="week">{unitLabel('week', value.redeemRelativeAmount)}</option>
                  <option value="month">{unitLabel('month', value.redeemRelativeAmount)}</option>
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-v-text-3"
                  aria-hidden
                />
              </div>
            </div>
          </div>
          <p className="mt-1.5 text-[10px] text-v-text-3">
            Customer must redeem within{' '}
            <span className="font-semibold text-v-text-2">
              {value.redeemRelativeAmount || '—'} {unitLabel(value.redeemRelativeUnit, value.redeemRelativeAmount).toLowerCase()}
            </span>
            {' '}of winning the reward.
          </p>
        </div>
      )}
    </div>
  )
}
