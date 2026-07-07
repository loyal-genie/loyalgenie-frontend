import { Check, Gift } from 'lucide-react'
import type { StampDropConfig, StampDropTrigger } from '@/lib/api'

interface StampLoyaltyGridProps {
  total: number
  collected: number
  surpriseDrops: StampDropConfig[]
  bigRewards: StampDropConfig[]
  dropTriggers: StampDropTrigger[]
}

function StampSlot({
  n,
  collected,
  surpriseDrops,
  bigRewards,
  dropTriggers,
}: {
  n: number
  collected: number
  surpriseDrops: StampDropConfig[]
  bigRewards: StampDropConfig[]
  dropTriggers: StampDropTrigger[]
}) {
  const filled = n <= collected

  if (filled) {
    const awardedAtN = dropTriggers.filter(t => t.awarded && t.triggerAt === n)
    const showGift = awardedAtN.length > 0

    return (
      <div className="size-9 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
        {showGift ? (
          <Gift className="size-4 text-[#fad499]" strokeWidth={2.25} />
        ) : (
          <Check className="size-4 text-white" strokeWidth={2.5} />
        )}
      </div>
    )
  }

  const inBigRange = bigRewards.some(d => n >= d.from && n <= d.to)
  const inSurpriseRange = surpriseDrops.some(d => n >= d.from && n <= d.to)
  const bigDrop = bigRewards.find(d => n >= d.from && n <= d.to)
  const surpriseDrop = surpriseDrops.find(d => n >= d.from && n <= d.to)

  return (
    <div
      className="size-9 rounded-lg border flex items-center justify-center shrink-0"
      style={
        inBigRange && bigDrop
          ? { backgroundColor: `${bigDrop.color}33`, borderColor: `${bigDrop.color}99` }
          : inSurpriseRange && surpriseDrop
            ? { backgroundColor: `${surpriseDrop.color}33`, borderColor: `${surpriseDrop.color}99` }
            : { backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.08)' }
      }
    >
      <span className="text-[11px] font-bold text-white/40">
        {inBigRange ? '🏆' : inSurpriseRange ? '?' : n}
      </span>
    </div>
  )
}

export function StampLoyaltyGrid({
  total,
  collected,
  surpriseDrops,
  bigRewards,
  dropTriggers,
}: StampLoyaltyGridProps) {
  const firstRowCount = Math.min(5, total)
  const row1 = Array.from({ length: firstRowCount }, (_, i) => i + 1)
  const row2 = Array.from({ length: Math.max(0, total - firstRowCount) }, (_, i) => i + firstRowCount + 1)

  const slotProps = {
    collected,
    surpriseDrops,
    bigRewards,
    dropTriggers,
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
