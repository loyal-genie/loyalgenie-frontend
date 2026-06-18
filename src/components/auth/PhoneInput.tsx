import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string
  onChange: (value: string) => void
  error?: string
}

export function formatPhoneDisplay(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10)
  if (digits.length <= 5) return digits
  return `${digits.slice(0, 5)} ${digits.slice(5)}`
}

export function PhoneInput({ value, onChange, className, error, ...props }: PhoneInputProps) {
  return (
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-v-text-2 text-sm font-medium pointer-events-none">
        +91
      </span>
      <Input
        type="tel"
        inputMode="numeric"
        autoComplete="tel"
        placeholder="98765 43210"
        className={cn('pl-14', className)}
        value={formatPhoneDisplay(value)}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 10))}
        {...props}
      />
      {error && <p className="text-xs text-v-danger mt-1">{error}</p>}
    </div>
  )
}
