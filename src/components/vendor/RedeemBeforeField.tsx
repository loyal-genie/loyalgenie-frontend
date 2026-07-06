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

const labelClass = 'text-[10px] font-semibold text-v-text-2 uppercase tracking-wider mb-1 block'

export function isRedeemBeforeValid(value: RedeemBeforeValue): boolean {
  if (value.redeemExpiryMode === 'fixed') return Boolean(value.redeemFixedDate)
  return value.redeemRelativeAmount > 0
}

export function RedeemBeforeField({ value, onChange, compact }: RedeemBeforeFieldProps) {
  const inputClass = compact
    ? 'h-8 w-full rounded-lg border border-v-border bg-white px-2 text-xs text-v-text focus:border-v-purple focus:outline-none focus:ring-1 focus:ring-v-purple/20'
    : 'h-9 w-full rounded-lg border border-v-border bg-white px-2.5 text-xs text-v-text focus:border-v-purple focus:outline-none focus:ring-1 focus:ring-v-purple/20'

  return (
    <div>
      <label className={labelClass}>Redeem Before *</label>
      {value.redeemExpiryMode === 'fixed' ? (
        <input
          type="date"
          value={value.redeemFixedDate}
          onChange={e => onChange({ ...value, redeemFixedDate: e.target.value, redeemExpiryMode: 'fixed' })}
          className={inputClass}
        />
      ) : (
        <div className="flex gap-2">
          <input
            type="number"
            min={1}
            value={value.redeemRelativeAmount}
            onChange={e => onChange({
              ...value,
              redeemRelativeAmount: Number(e.target.value),
              redeemExpiryMode: 'relative',
            })}
            className={`${inputClass} w-16 shrink-0`}
          />
          <select
            value={value.redeemRelativeUnit}
            onChange={e => onChange({
              ...value,
              redeemRelativeUnit: e.target.value as RedeemRelativeUnit,
              redeemExpiryMode: 'relative',
            })}
            className={`${inputClass} flex-1`}
          >
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
          </select>
        </div>
      )}
      <div className="mt-1.5 flex rounded-lg border border-v-border bg-v-surface-2 p-0.5">
        {([
          { key: 'fixed' as const, label: 'Fixed date' },
          { key: 'relative' as const, label: 'Relative expiry' },
        ]).map(opt => (
          <button
            key={opt.key}
            type="button"
            onClick={() => onChange({ ...value, redeemExpiryMode: opt.key })}
            className={`flex-1 rounded-md py-1 text-[10px] font-semibold transition-all ${
              value.redeemExpiryMode === opt.key
                ? 'bg-white text-v-text shadow-sm'
                : 'text-v-text-3 hover:text-v-text-2'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
