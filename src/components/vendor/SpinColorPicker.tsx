import { useState, useRef, useEffect } from 'react'
import {
  SPIN_GRADIENT_COLORS,
  SPIN_SOLID_COLORS,
  segmentCssBackground,
} from '@/lib/spin-segment-colors'

interface SpinColorPickerProps {
  value: string
  onChange: (color: string) => void
}

export function SpinColorPicker({ value, onChange }: SpinColorPickerProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="size-8 rounded-full border-2 border-white shadow-md ring-1 ring-v-border transition-transform hover:scale-105"
        style={{ background: segmentCssBackground(value) }}
        aria-label="Pick segment color"
      />
      {open && (
        <div className="absolute left-0 top-10 z-30 w-56 rounded-xl border border-v-border bg-white p-3 shadow-xl">
          <p className="text-[10px] font-semibold text-v-text-2 uppercase tracking-wider mb-2">Solid</p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {SPIN_SOLID_COLORS.map(s => (
              <button
                key={s.value}
                type="button"
                onClick={() => { onChange(s.value); setOpen(false) }}
                className="size-6 rounded-full border-2 transition-all hover:scale-110"
                style={{
                  background: s.value,
                  borderColor: value === s.value ? '#1E1B4B' : 'transparent',
                }}
              />
            ))}
          </div>
          <p className="text-[10px] font-semibold text-v-text-2 uppercase tracking-wider mb-2">Gradients</p>
          <div className="flex flex-wrap gap-1.5">
            {SPIN_GRADIENT_COLORS.map(s => (
              <button
                key={s.value}
                type="button"
                onClick={() => { onChange(s.value); setOpen(false) }}
                className="size-6 rounded-full border-2 transition-all hover:scale-110"
                style={{
                  background: s.value,
                  borderColor: value === s.value ? '#1E1B4B' : 'transparent',
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
