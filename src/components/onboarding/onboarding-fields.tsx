import { ChevronDown, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

export const onboardingTheme = {
  bg: '#0D0B28',
  card: '#1A1840',
  cardBorder: 'rgba(255,255,255,0.08)',
  input: 'rgba(255,255,255,0.05)',
  inputBorder: 'rgba(255,255,255,0.12)',
  inputFocus: '#7C3AED',
  label: 'rgba(255,255,255,0.55)',
  text: '#FFFFFF',
  textMuted: 'rgba(255,255,255,0.45)',
  gold: '#F5C518',
  purple: '#7C3AED',
  purple2: '#9D6FF0',
} as const

export function OnboardingLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold mb-1.5" style={{ color: onboardingTheme.label }}>
      {children}
    </label>
  )
}

interface FieldProps {
  placeholder?: string
  value: string
  onChange: (v: string) => void
  type?: string
  prefix?: string
  error?: string
  readOnly?: boolean
}

export function OnboardingInput({ placeholder, value, onChange, type = 'text', prefix, error, readOnly }: FieldProps) {
  return (
    <div>
      <div className="relative">
        {prefix && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: onboardingTheme.textMuted }}>
            {prefix}
          </span>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          readOnly={readOnly}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
          style={{
            background: onboardingTheme.input,
            border: `1px solid ${error ? '#DC2626' : onboardingTheme.inputBorder}`,
            color: onboardingTheme.text,
            paddingLeft: prefix ? '2.5rem' : undefined,
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = onboardingTheme.inputFocus }}
          onBlur={(e) => { e.currentTarget.style.borderColor = error ? '#DC2626' : onboardingTheme.inputBorder }}
        />
      </div>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  )
}

export function OnboardingTextarea({ placeholder, value, onChange, rows = 3 }: FieldProps & { rows?: number }) {
  return (
    <textarea
      rows={rows}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none transition-all"
      style={{
        background: onboardingTheme.input,
        border: `1px solid ${onboardingTheme.inputBorder}`,
        color: onboardingTheme.text,
      }}
      onFocus={(e) => { e.currentTarget.style.borderColor = onboardingTheme.inputFocus }}
      onBlur={(e) => { e.currentTarget.style.borderColor = onboardingTheme.inputBorder }}
    />
  )
}

export function OnboardingSelect({ value, onChange, options, placeholder, error }: {
  value: string
  onChange: (v: string) => void
  options: string[]
  placeholder?: string
  error?: string
}) {
  return (
    <div>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl px-4 py-3 text-sm outline-none appearance-none cursor-pointer transition-all"
          style={{
            background: onboardingTheme.input,
            border: `1px solid ${error ? '#DC2626' : onboardingTheme.inputBorder}`,
            color: value ? onboardingTheme.text : onboardingTheme.textMuted,
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = onboardingTheme.inputFocus }}
          onBlur={(e) => { e.currentTarget.style.borderColor = error ? '#DC2626' : onboardingTheme.inputBorder }}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: onboardingTheme.textMuted }} />
      </div>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  )
}

export function OnboardingUpload({ label, hint }: { label: string; hint?: string }) {
  return (
    <div>
      <OnboardingLabel>{label}</OnboardingLabel>
      <div
        className="w-full rounded-xl flex items-center gap-3 px-5 py-5 cursor-pointer transition-all hover:opacity-80"
        style={{ background: onboardingTheme.input, border: `1px dashed ${onboardingTheme.inputBorder}` }}
      >
        <Upload className="w-5 h-5 shrink-0" style={{ color: onboardingTheme.textMuted }} />
        <span className="text-sm" style={{ color: onboardingTheme.textMuted }}>{hint ?? 'Click to upload or drag & drop'}</span>
      </div>
    </div>
  )
}

export function Sparkle({ className }: { className?: string }) {
  return (
    <svg className={cn(className)} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5L8 0Z" fill="rgba(255,255,255,0.3)" />
    </svg>
  )
}
