import { cn } from '@/lib/utils'
import type { LoyaltyState } from '@/lib/api'
import { getCampaignTheme } from '@/lib/campaign-themes'

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
  const theme = getCampaignTheme('check-in-loyalty')
  const accent = theme.accent
  const sorted = [...milestones].sort((a, b) => a.pointsThreshold - b.pointsThreshold)
  const maxThreshold = sorted.at(-1)?.pointsThreshold ?? 100
  const progressPct = maxThreshold > 0 ? Math.min(100, Math.round((points / maxThreshold) * 100)) : 0

  return (
    <div
      className={cn('relative overflow-hidden rounded-2xl p-4', className)}
      style={{
        background: `${accent}0C`,
        border: `1px solid ${accent}22`,
      }}
    >
      <div
        className="pointer-events-none absolute bottom-[-28px] right-[-28px] size-[96px] rounded-full"
        style={{ background: `${accent}18` }}
      />

      <div className="relative">
        <div className="mb-4 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[8px] tracking-widest uppercase text-gray-400">LOYALTY CARD</p>
            <p className="truncate text-sm font-bold text-gray-900">{businessName}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[8px] uppercase text-gray-400">POINTS</p>
            <p className="text-2xl font-bold leading-none" style={{ color: accent }}>
              {points}
            </p>
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
                      className="flex size-8 items-center justify-center rounded-lg text-base"
                      style={{
                        background: unlocked ? `${accent}22` : `${accent}0F`,
                        border: `1px solid ${unlocked ? `${accent}40` : `${accent}18`}`,
                      }}
                      aria-hidden
                    >
                      {milestone.icon}
                    </span>
                    <span className="max-w-full truncate text-[8px] font-semibold text-gray-700">
                      {milestone.name}
                    </span>
                    <span className="text-[8px] text-gray-400">{milestone.pointsThreshold}</span>
                  </div>
                )
              })}
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%`, background: accent }}
              />
            </div>
          </div>
        )}

        <p className="text-[10px] text-gray-400">
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
