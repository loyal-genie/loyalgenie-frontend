import { Input } from '@/components/ui/input'

const MONTHS = [
  { value: '1', label: 'Jan' },
  { value: '2', label: 'Feb' },
  { value: '3', label: 'Mar' },
  { value: '4', label: 'Apr' },
  { value: '5', label: 'May' },
  { value: '6', label: 'Jun' },
  { value: '7', label: 'Jul' },
  { value: '8', label: 'Aug' },
  { value: '9', label: 'Sep' },
  { value: '10', label: 'Oct' },
  { value: '11', label: 'Nov' },
  { value: '12', label: 'Dec' },
]

export function buildDateOfBirth(day: string, month: string, year: string): string | null {
  const d = parseInt(day, 10)
  const m = parseInt(month, 10)
  const y = parseInt(year, 10)
  if (!d || !m || !y || y < 1900) return null

  const today = new Date()
  if (y > today.getFullYear()) return null

  const date = new Date(y, m - 1, d)
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null
  if (date > today) return null

  return `${y.toString().padStart(4, '0')}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`
}

export function validateDateOfBirth(day: string, month: string, year: string): string | true {
  if (!day.trim() || !month || !year.trim()) return 'Date of birth is required'
  if (year.length < 4) return 'Enter a 4-digit year'
  if (!buildDateOfBirth(day, month, year)) return 'Enter a valid date of birth'
  return true
}

interface DateOfBirthFieldsProps {
  day: string
  month: string
  year: string
  onDayChange: (value: string) => void
  onMonthChange: (value: string) => void
  onYearChange: (value: string) => void
  disabled?: boolean
  error?: string
}

export function DateOfBirthFields({
  day,
  month,
  year,
  onDayChange,
  onMonthChange,
  onYearChange,
  disabled,
  error,
}: DateOfBirthFieldsProps) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[1fr_1.2fr_1.2fr] gap-2">
        <div className="space-y-1">
          <label htmlFor="dob-day" className="text-xs font-medium text-v-text-2">Day</label>
          <Input
            id="dob-day"
            inputMode="numeric"
            placeholder="DD"
            maxLength={2}
            value={day}
            disabled={disabled}
            className="rounded-full text-center px-2"
            onChange={e => onDayChange(e.target.value.replace(/\D/g, '').slice(0, 2))}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="dob-month" className="text-xs font-medium text-v-text-2">Month</label>
          <select
            id="dob-month"
            value={month}
            disabled={disabled}
            className="w-full h-11 rounded-full border border-v-border bg-white px-3 text-sm text-v-text focus:outline-none focus:ring-2 focus:ring-v-purple/40"
            onChange={e => onMonthChange(e.target.value)}
          >
            <option value="">Month</option>
            {MONTHS.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="dob-year" className="text-xs font-medium text-v-text-2">Year</label>
          <Input
            id="dob-year"
            inputMode="numeric"
            placeholder="YYYY"
            maxLength={4}
            value={year}
            disabled={disabled}
            className="rounded-full text-center px-2"
            onChange={e => onYearChange(e.target.value.replace(/\D/g, '').slice(0, 4))}
          />
        </div>
      </div>
      {error && <p className="text-xs text-v-danger">{error}</p>}
    </div>
  )
}
