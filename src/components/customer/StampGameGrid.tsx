import { motion } from 'framer-motion'
import { Gift } from 'lucide-react'

interface StampGameGridProps {
  total: number
  stamps: number
  prefill: number
  surpriseFrom: number
  surpriseTo: number
  bigFrom: number
  bigTo: number
  surpriseTriggerAt: number | null
  bigTriggerAt: number | null
  surpriseAwarded: boolean
  bigAwarded: boolean
  highlightStamp?: number | null
}

export function StampGameGrid({
  total,
  stamps,
  prefill,
  surpriseFrom,
  surpriseTo,
  bigFrom,
  bigTo,
  surpriseTriggerAt,
  bigTriggerAt,
  surpriseAwarded,
  bigAwarded,
  highlightStamp,
}: StampGameGridProps) {
  function slotContent(n: number, isFilled: boolean): string {
    if (!isFilled) {
      if (n >= surpriseFrom && n <= surpriseTo) return '🎁'
      if (n >= bigFrom && n <= bigTo) return '🏆'
      return ''
    }
    if (surpriseTriggerAt === n && surpriseAwarded) return '🎁'
    if (bigTriggerAt === n && bigAwarded) return '🏆'
    return '☕'
  }

  return (
    <div className="flex flex-wrap gap-1 justify-center mb-4">
      {Array.from({ length: total }, (_, i) => {
        const n = i + 1
        const isFilled = n <= stamps
        const isPrefilled = n <= prefill && !isFilled
        const isGiftSlot = (n >= surpriseFrom && n <= surpriseTo) || (n >= bigFrom && n <= bigTo)
        const isHighlighted = highlightStamp === n

        let bg = '#e4e4e4'
        if (isFilled) bg = '#5b0e81'
        else if (isPrefilled) bg = 'rgba(91,14,129,0.15)'
        else if (isGiftSlot) {
          bg = 'linear-gradient(141deg, rgba(91,14,129,0.58) 11%, rgba(91,14,129,0.22) 96%)'
        }

        return (
          <motion.div
            key={n}
            animate={isHighlighted ? { scale: [1, 1.15, 1] } : {}}
            transition={{ duration: 0.6, repeat: isHighlighted ? 2 : 0 }}
            className="size-11 rounded-2xl shadow-[4px_4px_14px_rgba(0,0,0,0.08)] flex items-center justify-center shrink-0"
            style={{ background: bg }}
          >
            {isFilled ? (
              <span className="text-lg">{slotContent(n, true)}</span>
            ) : isGiftSlot ? (
              <Gift className="size-5 text-[#5b0e81]" />
            ) : isPrefilled ? (
              <span className="text-[#5b0e81]/50 text-xs font-bold">{n}</span>
            ) : null}
          </motion.div>
        )
      })}
    </div>
  )
}
