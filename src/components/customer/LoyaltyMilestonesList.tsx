import { cn } from '@/lib/utils'
import { getCampaignTheme } from '@/lib/campaign-themes'
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
  const theme = getCampaignTheme('check-in-loyalty')
  const sorted = [...milestones].sort((a, b) => a.pointsThreshold - b.pointsThreshold)

  if (sorted.length === 0) {
    return (
      <p className={cn('text-xs text-gray-400', className)}>
        Rewards will appear here once the business sets them up.
      </p>
    )
  }

  return (
    <div className={cn(compact ? 'space-y-1.5' : 'space-y-2', className)}>
      <p
        className="text-[10px] font-bold uppercase tracking-wide"
        style={{ color: theme.accent }}
      >
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
            )}
            style={{
              background: unlocked ? `${theme.accent}14` : '#FFFFFF',
              border: `1px solid ${unlocked ? `${theme.accent}33` : `${theme.accent}18`}`,
            }}
          >
            <span className={cn('leading-none shrink-0', compact ? 'text-base' : 'text-xl')} aria-hidden>
              {milestone.icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className={cn('truncate font-bold text-gray-900', compact ? 'text-xs' : 'text-sm')}>
                {milestone.name}
              </p>
              <p className="text-[10px] text-gray-500">{milestone.pointsThreshold} pts</p>
            </div>
            {unlocked ? (
              <span className="shrink-0 text-[10px] font-bold" style={{ color: theme.accent }}>
                {milestone.redeemed ? 'Redeemed' : '✓'}
              </span>
            ) : (
              <span className="shrink-0 text-[10px] font-semibold" style={{ color: theme.accent }}>
                {pointsAway} away
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
