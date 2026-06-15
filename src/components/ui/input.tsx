import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import type { ComponentPropsWithoutRef } from 'react'

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

interface FieldInputProps extends ComponentPropsWithoutRef<'input'> {
  label?: string
  hint?: string
  error?: string
  icon?: React.ReactNode
}

export function FieldInput({ label, hint, error, icon, className, id, ...props }: FieldInputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-v-text-2 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-v-text-3">{icon}</span>
        )}
        <input
          id={inputId}
          className={cn(
            'w-full bg-white border border-v-border rounded-xl px-4 py-2.5 text-sm text-v-text placeholder:text-v-text-3',
            'focus:outline-none focus:border-v-purple focus:ring-2 focus:ring-v-purple/12 transition-all duration-200',
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

interface SliderProps extends ComponentPropsWithoutRef<'input'> {
  label?: string
  displayValue?: string
}

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
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          onChange={e => {
            const v = clamp(Number(e.target.value))
            if (!isNaN(v)) onChange(v)
          }}
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

export function Slider({ label, displayValue, className, ...props }: SliderProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-v-text-2 uppercase tracking-wider">{label}</label>
          {displayValue && <span className="text-sm font-bold text-v-purple">{displayValue}</span>}
        </div>
      )}
      <input
        type="range"
        className={cn(
          'w-full h-2 rounded-full appearance-none cursor-pointer',
          '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5',
          '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-v-purple [&::-webkit-slider-thumb]:cursor-pointer',
          '[&::-webkit-slider-thumb]:shadow-md',
          '[&::-webkit-slider-runnable-track]:bg-v-border [&::-webkit-slider-runnable-track]:rounded-full',
          className,
        )}
        style={{ accentColor: '#7C3AED' }}
        {...props}
      />
    </div>
  )
}
