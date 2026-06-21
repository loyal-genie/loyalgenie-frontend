import { Gift } from 'lucide-react'

interface StampPinRowProps {
  collected: number
  total: number
  prefill?: number
}

export function StampPinRow({ collected, total, prefill = 0 }: StampPinRowProps) {
  return (
    <div className="flex gap-1 justify-center flex-wrap py-2">
      {Array.from({ length: total }, (_, i) => {
        const n = i + 1
        const filled = n <= collected
        const isPrefill = n <= prefill && !filled
        const isGiftSlot = n === total || n === Math.ceil(total / 2)

        let bg = '#e4e4e4'
        if (filled) bg = '#5b0e81'
        else if (isPrefill) bg = 'rgba(91,14,129,0.15)'
        else if (isGiftSlot) {
          bg = filled
            ? '#5b0e81'
            : 'linear-gradient(141deg, rgba(91,14,129,0.58) 11%, rgba(91,14,129,0.22) 96%)'
        }

        return (
          <div
            key={n}
            className="size-11 rounded-2xl shadow-[4px_4px_14px_rgba(0,0,0,0.08)] flex items-center justify-center shrink-0"
            style={{ background: bg }}
          >
            {filled ? (
              <span className="text-white text-lg">☕</span>
            ) : isGiftSlot ? (
              <Gift className="size-5 text-[#5b0e81]" />
            ) : isPrefill ? (
              <span className="text-[#5b0e81]/40 text-xs font-bold">{n}</span>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
