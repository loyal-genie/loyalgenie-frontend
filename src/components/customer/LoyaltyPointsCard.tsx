import { cn } from '@/lib/utils'
import type { LoyaltyState } from '@/lib/api'

interface LoyaltyPointsCardProps {
  businessName: string
  points: number
  pointsPerCheckIn: number
  milestones: LoyaltyState['milestones']
  nextMilestone: LoyaltyState['nextMilestone']
  className?: string
}

export function LoyaltyPointsCard({
  businessName,
  points,
  pointsPerCheckIn,
  milestones,
  nextMilestone,
  className,
}: LoyaltyPointsCardProps) {
  const sorted = [...milestones].sort((a, b) => a.pointsThreshold - b.pointsThreshold)
  const maxThreshold = sorted.at(-1)?.pointsThreshold ?? 100
  const progressPct = maxThreshold > 0 ? Math.min(100, Math.round((points / maxThreshold) * 100)) : 0

  return (
    <div className={cn('relative overflow-hidden rounded-2xl bg-[#43036d] p-4', className)}>
      <div className="pointer-events-none absolute bottom-[-28px] right-[-28px] size-[96px] rounded-full bg-[#631cbb]/50" />

      <div className="relative">
        <div className="mb-4 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[8px] tracking-widest text-[#c084fc]">LOYALTY CARD</p>
            <p className="truncate text-sm font-bold text-white">{businessName}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[8px] text-[#c084fc]">POINTS</p>
            <p className="text-2xl font-bold leading-none text-[#e8b050]">{points}</p>
          </div>
        </div>

        {sorted.length > 0 && (
          <div className="mb-3">
            <div className="mb-2 flex items-end justify-between gap-1">
              {sorted.map(milestone => {
                const unlocked = points >= milestone.pointsThreshold
                return (
                  <div key={milestone.id} className="flex min-w-0 flex-1 flex-col items-center gap-0.5">
                    <span
                      className={cn(
                        'flex size-8 items-center justify-center rounded-lg text-base',
                        unlocked ? 'bg-white/25' : 'bg-white/10',
                      )}
                      aria-hidden
                    >
                      {milestone.icon}
                    </span>
                    <span className="max-w-full truncate text-[8px] font-semibold text-white/90">
                      {milestone.name}
                    </span>
                    <span className="text-[8px] text-[#c084fc]">{milestone.pointsThreshold}</span>
                  </div>
                )
              })}
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[#e8b050] transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        <p className="text-[10px] text-[#c084fc]">
          +{pointsPerCheckIn} pts per check-in
          {nextMilestone
            ? ` · ${nextMilestone.pointsNeeded} pts to ${nextMilestone.name}`
            : sorted.length > 0
              ? ' · All rewards unlocked!'
              : ''}
        </p>
      </div>
    </div>
  )
}
