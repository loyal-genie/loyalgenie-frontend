import { ChevronDown, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'
import { uploadImageFile, uploadImageFiles, type UploadPurpose } from '@/lib/file-upload'

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

// 1. Updated Label Component to render a red asterisk if the field is required
export function OnboardingLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-semibold mb-1.5" style={{ color: onboardingTheme.label }}>
      {children}
      {required && <span className="text-red-400 ml-1">*</span>}
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
      <div
        className="flex w-full items-center rounded-xl transition-all"
        style={{
          background: onboardingTheme.input,
          border: `1px solid ${error ? '#DC2626' : onboardingTheme.inputBorder}`,
        }}
      >
        {prefix && (
          <span
            className="shrink-0 pl-4 text-sm font-medium select-none"
            style={{ color: onboardingTheme.textMuted }}
          >
            {prefix}
          </span>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          readOnly={readOnly}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'min-w-0 flex-1 bg-transparent py-3 text-sm outline-none',
            prefix ? 'pl-1 pr-4' : 'px-4',
          )}
          style={{ color: onboardingTheme.text }}
          onFocus={(e) => {
            const wrapper = e.currentTarget.parentElement
            if (wrapper) wrapper.style.borderColor = onboardingTheme.inputFocus
          }}
          onBlur={(e) => {
            const wrapper = e.currentTarget.parentElement
            if (wrapper) wrapper.style.borderColor = error ? '#DC2626' : onboardingTheme.inputBorder
          }}
        />
      </div>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  )
}

export function OnboardingTextarea({ placeholder, value, onChange, rows = 3, error }: FieldProps & { rows?: number }) {
  return (
    <div>
      <textarea
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none transition-all"
        style={{
          background: onboardingTheme.input,
          border: `1px solid ${error ? '#DC2626' : onboardingTheme.inputBorder}`,
          color: onboardingTheme.text,
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = onboardingTheme.inputFocus }}
        onBlur={(e) => { e.currentTarget.style.borderColor = error ? '#DC2626' : onboardingTheme.inputBorder }}
      />
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  )
}

// 2. Updated Select Component to fix invisible white text / option backgrounds
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
          {placeholder && (
            <option value="" style={{ background: onboardingTheme.card, color: onboardingTheme.textMuted }}>
              {placeholder}
            </option>
          )}
          {options.map((o) => (
            <option key={o} value={o} style={{ background: onboardingTheme.card, color: onboardingTheme.text }}>
              {o}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: onboardingTheme.textMuted }} />
      </div>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  )
}

export function OnboardingUpload({
  label,
  hint,
  value,
  values,
  onChange,
  onMultiChange,
  purpose,
  accept = 'image/png,image/jpeg,image/webp,image/svg+xml',
  multiple = false,
}: {
  label: string
  hint?: string
  value?: string
  values?: string[]
  onChange?: (dataUrl: string) => void
  onMultiChange?: (dataUrls: string[]) => void
  purpose: UploadPurpose
  accept?: string
  multiple?: boolean
}) {
  const previews = multiple ? (values ?? []) : value ? [value] : []

  async function handleFiles(fileList: FileList | null) {
    if (!fileList?.length) return
    try {
      if (multiple && onMultiChange) {
        const urls = await uploadImageFiles(fileList, purpose, { onboarding: true })
        onMultiChange([...(values ?? []), ...urls])
      } else if (onChange) {
        const url = await uploadImageFile(fileList[0], purpose, { onboarding: true })
        onChange(url)
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload failed')
    }
  }

  return (
    <div>
      <OnboardingLabel>{label}</OnboardingLabel>
      <label
        className="w-full rounded-xl flex items-center gap-3 px-5 py-5 cursor-pointer transition-all hover:opacity-80"
        style={{ background: onboardingTheme.input, border: `1px dashed ${onboardingTheme.inputBorder}` }}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          className="sr-only"
          onChange={(e) => {
            handleFiles(e.target.files)
            e.target.value = ''
          }}
        />
        <Upload className="w-5 h-5 shrink-0" style={{ color: onboardingTheme.textMuted }} />
        <span className="text-sm" style={{ color: onboardingTheme.textMuted }}>
          {hint ?? 'Click to upload or drag & drop'}
        </span>
      </label>
      {previews.length > 0 && (
        <div className={cn('mt-3 flex flex-wrap gap-2', multiple && 'grid grid-cols-2 sm:grid-cols-3')}>
          {previews.map((src, i) => (
            <div key={i} className="relative rounded-lg overflow-hidden border border-white/10">
              <img src={src} alt="" className={cn('object-cover', multiple ? 'w-full h-24' : 'h-20 w-auto max-w-full')} />
              {(onChange || onMultiChange) && (
                <button
                  type="button"
                  onClick={() => {
                    if (multiple && onMultiChange) {
                      onMultiChange((values ?? []).filter((_, idx) => idx !== i))
                    } else if (onChange) {
                      onChange('')
                    }
                  }}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-xs flex items-center justify-center cursor-pointer border-0"
                  aria-label="Remove"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}
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