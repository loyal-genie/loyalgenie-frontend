import { Check, Gift } from 'lucide-react'

interface StampLoyaltyGridProps {
  total: number
  collected: number
  surpriseTriggerAt: number | null
  bigTriggerAt: number | null
  surpriseAwarded: boolean
  bigAwarded: boolean
}

function StampSlot({
  n,
  collected,
  surpriseTriggerAt,
  bigTriggerAt,
  surpriseAwarded,
  bigAwarded,
}: {
  n: number
  collected: number
  surpriseTriggerAt: number | null
  bigTriggerAt: number | null
  surpriseAwarded: boolean
  bigAwarded: boolean
}) {
  const filled = n <= collected

  if (filled) {
    const showSurpriseGift = surpriseAwarded && surpriseTriggerAt === n
    const showBigGift = bigAwarded && bigTriggerAt === n

    return (
      <div className="size-9 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
        {showSurpriseGift || showBigGift ? (
          <Gift className="size-4 text-[#fad499]" strokeWidth={2.25} />
        ) : (
          <Check className="size-4 text-white" strokeWidth={2.5} />
        )}
      </div>
    )
  }

  return (
    <div className="size-9 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0">
      <span className="text-[11px] font-bold text-white/20">{n}</span>
    </div>
  )
}

export function StampLoyaltyGrid({
  total,
  collected,
  surpriseTriggerAt,
  bigTriggerAt,
  surpriseAwarded,
  bigAwarded,
}: StampLoyaltyGridProps) {
  const firstRowCount = Math.min(5, total)
  const row1 = Array.from({ length: firstRowCount }, (_, i) => i + 1)
  const row2 = Array.from({ length: Math.max(0, total - firstRowCount) }, (_, i) => i + firstRowCount + 1)

  const slotProps = {
    collected,
    surpriseTriggerAt,
    bigTriggerAt,
    surpriseAwarded,
    bigAwarded,
  }

  return (
    <div className="flex flex-col gap-2.5 w-full">
      <div className="flex justify-center gap-2.5">
        {row1.map(n => (
          <StampSlot key={n} n={n} {...slotProps} />
        ))}
      </div>
      {row2.length > 0 && (
        <div className="flex justify-center gap-2.5">
          {row2.map(n => (
            <StampSlot key={n} n={n} {...slotProps} />
          ))}
        </div>
      )}
    </div>
  )
}
