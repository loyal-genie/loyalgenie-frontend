import { useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface OtpInputProps {
  value: string
  onChange: (value: string) => void
  length?: number
  disabled?: boolean
  className?: string
}

export function OtpInput({ value, onChange, length = 6, disabled, className }: OtpInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputsRef.current[0]?.focus()
  }, [])

  const digits = value.padEnd(length, ' ').slice(0, length).split('')

  function updateAt(index: number, char: string) {
    const next = value.split('')
    next[index] = char
    onChange(next.join('').slice(0, length))
    if (char && index < length - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  return (
    <div className={cn('flex gap-2 sm:gap-3 justify-center', className)}>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { inputsRef.current[i] = el }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          disabled={disabled}
          value={digit.trim()}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, '').slice(-1)
            updateAt(i, v)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !digits[i]?.trim() && i > 0) {
              inputsRef.current[i - 1]?.focus()
            }
          }}
          onPaste={(e) => {
            e.preventDefault()
            const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
            if (pasted) onChange(pasted)
          }}
          className="w-11 h-12 sm:w-12 sm:h-14 text-center text-lg font-bold rounded-xl border border-v-border bg-white text-v-text focus:outline-none focus:ring-2 focus:ring-v-purple/40 focus:border-v-purple disabled:opacity-50"
        />
      ))}
    </div>
  )
}
