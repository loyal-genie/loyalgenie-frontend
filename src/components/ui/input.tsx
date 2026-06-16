import { forwardRef, useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import type { ComponentPropsWithoutRef } from 'react'

// ── Standard Input ────────────────────────────────────────────────────────────
export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        'flex h-11 w-full rounded-xl border border-v-border bg-white px-4 py-2 text-sm text-v-text',
        'placeholder:text-v-text-3 focus:outline-none focus:ring-2 focus:ring-v-purple/30 focus:border-v-purple',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
)
Input.displayName = 'Input'

// ── Label ─────────────────────────────────────────────────────────────────────
export const Label = forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn('text-sm font-semibold text-v-text', className)}
      {...props}
    />
  ),
)
Label.displayName = 'Label'

// ── Field Input (FIXED: Added explicitly styled backgrounds & layout structures) ──
interface FieldInputProps extends ComponentPropsWithoutRef<'input'> {
  label?: string
  hint?: string
  error?: string
  icon?: React.ReactNode
}

export function FieldInput({ label, hint, error, icon, className, id, ...props }: FieldInputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-v-text-2 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-v-text-3 z-10 flex items-center justify-center">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={cn(
            // Added explicit bg-white, robust text colors, and better default width behaviors
            'w-full bg-white text-v-text border border-v-border rounded-xl px-4 py-2.5 text-sm placeholder:text-v-text-3',
            'focus:outline-none focus:border-v-purple focus:ring-2 focus:ring-v-purple/12 transition-all duration-200',
            'disabled:opacity-50 disabled:bg-slate-50',
            icon && 'pl-10',
            error && 'border-v-danger focus:border-v-danger focus:ring-v-danger/12',
            className,
          )}
          {...props}
        />
      </div>
      {hint && !error && <p className="text-xs text-v-text-3">{hint}</p>}
      {error && <p className="text-xs text-v-danger">{error}</p>}
    </div>
  )
}

// ── Select Dropdown ───────────────────────────────────────────────────────────
interface SelectProps extends ComponentPropsWithoutRef<'select'> {
  label?: string
  hint?: string
}

export function Select({ label, hint, className, id, children, ...props }: SelectProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-v-text-2 uppercase tracking-wider">
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={cn(
          'w-full bg-white border border-v-border rounded-xl px-4 py-2.5 text-sm text-v-text',
          'focus:outline-none focus:border-v-purple focus:ring-2 focus:ring-v-purple/12',
          'transition-all duration-200 appearance-none cursor-pointer',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {hint && <p className="text-xs text-v-text-3">{hint}</p>}
    </div>
  )
}

// ── Stepper ───────────────────────────────────────────────────────────────────
interface StepperProps {
  label: string
  hint?: string
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (v: number) => void
  disabled?: boolean
}

export function Stepper({ label, hint, value, min = 1, max = 20, step = 1, onChange, disabled }: StepperProps) {
  const clamp = (v: number) => Math.max(min, Math.min(max, v))
  const [inputValue, setInputValue] = useState<string>(value.toString())

  useEffect(() => {
    setInputValue(value.toString())
  }, [value])

  const handleInputChange = (rawString: string) => {
    setInputValue(rawString)
    if (rawString === '') return
    const parsed = parseInt(rawString, 10)
    if (isNaN(parsed)) return

    if (parsed > max) {
      onChange(max)
      setInputValue(max.toString())
    } else {
      onChange(parsed)
    }
  }

  const handleInputBlur = () => {
    const parsed = parseInt(inputValue, 10)
    if (isNaN(parsed) || parsed < min) {
      onChange(min)
      setInputValue(min.toString())
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-v-text-2 uppercase tracking-wider">{label}</label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(clamp(value - step))}
          disabled={disabled || value <= min}
          className="w-9 h-9 rounded-xl border border-v-border bg-white text-v-text flex items-center justify-center text-lg font-bold hover:border-v-border-b disabled:opacity-30 disabled:cursor-not-allowed transition-all select-none"
        >
          −
        </button>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={inputValue}
          disabled={disabled}
          onChange={e => handleInputChange(e.target.value)}
          onBlur={handleInputBlur}
          onFocus={e => e.target.select()}
          className="w-16 text-center bg-white border border-v-border rounded-xl py-2 text-sm font-bold text-v-text focus:outline-none focus:border-v-purple disabled:opacity-50"
        />
        <button
          type="button"
          onClick={() => onChange(clamp(value + step))}
          disabled={disabled || value >= max}
          className="w-9 h-9 rounded-xl border border-v-border bg-white text-v-text flex items-center justify-center text-lg font-bold hover:border-v-border-b disabled:opacity-30 disabled:cursor-not-allowed transition-all select-none"
        >
          +
        </button>
        {hint && <span className="text-xs text-v-text-3 ml-1">{hint}</span>}
      </div>
    </div>
  )
}

// ── Slider ────────────────────────────────────────────────────────────────────
interface SliderProps extends ComponentPropsWithoutRef<'input'> {
  label?: string
  displayValue?: string
}

export function Slider({ label, displayValue, className, ...props }: SliderProps) {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-v-text-2 uppercase tracking-wider">{label}</label>
          {displayValue && (
            <span className="text-sm font-black text-v-purple bg-v-purple/10 px-2.5 py-0.5 rounded-md border border-v-purple/20">
              {displayValue}
            </span>
          )}
        </div>
      )}
      <div className="relative flex items-center h-6">
        <input
          type="range"
          className={cn(
            'w-full h-2 rounded-full appearance-none cursor-pointer bg-slate-200/80 outline-none transition-all',
            '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5',
            '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-v-purple [&::-webkit-slider-thumb]:cursor-pointer',
            '[&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white',
            '[&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:active:scale-110',
            '[&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-slate-200',
            '[&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-moz-range-thumb]:border-0',
            '[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-v-purple [&::-moz-range-thumb]:cursor-pointer',
            '[&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white',
            '[&::-moz-range-track]:h-2 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-slate-200',
            className,
          )}
          style={{ accentColor: '#7C3AED' }}
          {...props}
        />
      </div>
    </div>
  )
}