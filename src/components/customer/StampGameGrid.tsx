import { motion } from 'framer-motion'

interface StampGameGridProps {
  total: number
  stamps: number
  prefill: number
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
  surpriseTriggerAt,
  bigTriggerAt,
  surpriseAwarded,
  bigAwarded,
  highlightStamp,
}: StampGameGridProps) {
  function slotContent(n: number): string {
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
        const isHighlighted = highlightStamp === n

        let bg = '#e4e4e4'
        if (isFilled) bg = '#5b0e81'
        else if (isPrefilled) bg = 'rgba(91,14,129,0.15)'

        return (
          <motion.div
            key={n}
            animate={isHighlighted ? { scale: [1, 1.15, 1] } : {}}
            transition={{ duration: 0.6, repeat: isHighlighted ? 2 : 0 }}
            className="size-11 rounded-2xl shadow-[4px_4px_14px_rgba(0,0,0,0.08)] flex items-center justify-center shrink-0"
            style={{ background: bg }}
          >
            {isFilled ? (
              <span className="text-lg">{slotContent(n)}</span>
            ) : isPrefilled ? (
              <span className="text-[#5b0e81]/50 text-xs font-bold">{n}</span>
            ) : (
              <span className="text-[#9ca3af]/50 text-xs font-bold">{n}</span>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}
