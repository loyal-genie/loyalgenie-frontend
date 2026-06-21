import { Check, Gift } from 'lucide-react'

interface StampLoyaltyGridProps {
  total: number
  collected: number
  surpriseFrom: number
  surpriseTo: number
  bigFrom: number
  bigTo: number
  surpriseTriggerAt: number | null
  bigTriggerAt: number | null
  surpriseAwarded: boolean
  bigAwarded: boolean
}

function StampSlot({
  n,
  collected,
  surpriseFrom,
  surpriseTo,
  bigFrom,
  bigTo,
  surpriseTriggerAt,
  bigTriggerAt,
  surpriseAwarded,
  bigAwarded,
}: {
  n: number
  collected: number
  surpriseFrom: number
  surpriseTo: number
  bigFrom: number
  bigTo: number
  surpriseTriggerAt: number | null
  bigTriggerAt: number | null
  surpriseAwarded: boolean
  bigAwarded: boolean
}) {
  const filled = n <= collected
  const inSurprise = n >= surpriseFrom && n <= surpriseTo
  const inBig = n >= bigFrom && n <= bigTo
  const isBigRewardSlot = inBig && n === bigTo

  if (filled) {
    const showSurpriseGift = surpriseAwarded && surpriseTriggerAt === n
    const showBigGift = bigAwarded && bigTriggerAt === n
    const showGiftHint = !showSurpriseGift && !showBigGift && inSurprise

    return (
      <div className="size-9 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
        {showSurpriseGift || showBigGift || showGiftHint ? (
          <Gift className="size-4 text-[#fad499]" strokeWidth={2.25} />
        ) : (
          <Check className="size-4 text-white" strokeWidth={2.5} />
        )}
      </div>
    )
  }

  if (isBigRewardSlot) {
    return (
      <div className="size-9 rounded-lg bg-[#e8b050] flex items-center justify-center shrink-0">
        <Gift className="size-4 text-[#43036d]" strokeWidth={2.25} />
      </div>
    )
  }

  if (inSurprise) {
    return (
      <div className="size-9 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
        <Gift className="size-4 text-[#fad499]/80" strokeWidth={2.25} />
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
  surpriseFrom,
  surpriseTo,
  bigFrom,
  bigTo,
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
    surpriseFrom,
    surpriseTo,
    bigFrom,
    bigTo,
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
