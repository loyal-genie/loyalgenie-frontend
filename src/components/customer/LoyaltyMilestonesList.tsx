import { cn } from '@/lib/utils'
import type { LoyaltyState } from '@/lib/api'

interface LoyaltyMilestonesListProps {
  milestones: LoyaltyState['milestones']
  currentPoints: number
  className?: string
  compact?: boolean
}

export function LoyaltyMilestonesList({
  milestones,
  currentPoints,
  className,
  compact = false,
}: LoyaltyMilestonesListProps) {
  const sorted = [...milestones].sort((a, b) => a.pointsThreshold - b.pointsThreshold)

  if (sorted.length === 0) {
    return (
      <p className={cn('text-xs text-[#888]', className)}>
        Rewards will appear here once the business sets them up.
      </p>
    )
  }

  return (
    <div className={cn(compact ? 'space-y-1.5' : 'space-y-2', className)}>
      <p className="text-[10px] font-bold uppercase tracking-wide text-[#9b59e8]">
        Rewards you&apos;ll unlock
      </p>
      {sorted.map(milestone => {
        const unlocked = milestone.unlocked || currentPoints >= milestone.pointsThreshold
        const pointsAway = Math.max(0, milestone.pointsThreshold - currentPoints)

        return (
          <div
            key={milestone.id}
            className={cn(
              'flex items-center gap-2.5 rounded-lg',
              compact ? 'px-2.5 py-2' : 'rounded-xl px-3 py-2.5 gap-3',
              unlocked
                ? 'border border-emerald-100 bg-emerald-50'
                : 'bg-[#f5f0ff]',
            )}
          >
            <span className={cn('leading-none shrink-0', compact ? 'text-base' : 'text-xl')} aria-hidden>
              {milestone.icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className={cn('truncate font-bold text-[#1a0030]', compact ? 'text-xs' : 'text-sm')}>
                {milestone.name}
              </p>
              <p className="text-[10px] text-[#888]">{milestone.pointsThreshold} pts</p>
            </div>
            {unlocked ? (
              <span className="shrink-0 text-[10px] font-bold text-emerald-600">
                {milestone.redeemed ? 'Redeemed' : '✓'}
              </span>
            ) : (
              <span className="shrink-0 text-[10px] font-semibold text-[#631cbb]">
                {pointsAway} away
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
