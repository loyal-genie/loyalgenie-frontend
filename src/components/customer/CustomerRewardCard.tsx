import type { ReactNode } from 'react'
import { CalendarDays, ChevronRight, Gift, Lock } from 'lucide-react'
import { renderRewardIcon } from '@/components/vendor/IconPicker'
import type { RewardCardTheme } from '@/lib/customer-reward-themes'
import { formatRewardDate } from '@/lib/customer-reward-themes'

type CustomerRewardCardProps = {
  icon: string
  name: string
  description?: string
  pointsRequired: number
  availabilityLabel: string
  claimBefore?: string | null
  redeemBefore?: string | null
  theme: RewardCardTheme
  locked?: boolean
  onClick?: () => void
}

export function CustomerRewardCard({
  icon,
  name,
  description,
  pointsRequired,
  availabilityLabel,
  claimBefore,
  redeemBefore,
  theme,
  locked = false,
  onClick,
}: CustomerRewardCardProps) {
  const subtitle = description?.trim() || 'Any size · All locations'

  return (
    <div
      className="w-full rounded-2xl border p-4"
      style={{
        backgroundImage: theme.gradient,
        borderColor: theme.border,
      }}
    >
      <div className="mb-3 flex items-center justify-between">
        <span
          className="rounded-full px-2.5 py-1 text-[11px] font-bold"
          style={{ backgroundColor: theme.ptsBg, color: theme.accent }}
        >
          {pointsRequired} pts
        </span>
        <span
          className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
          style={{ backgroundColor: theme.claimedBg, color: theme.accent }}
        >
          <Gift className="h-3 w-3 shrink-0" strokeWidth={1.75} />
          {availabilityLabel}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
          {renderRewardIcon(icon)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold leading-tight text-[#1b1410]">{name}</p>
          <p className="mt-0.5 text-[11px] text-[#9a9088]">{subtitle}</p>
        </div>
        {locked ? (
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: theme.actionBg }}
          >
            <Lock className="h-4 w-4" style={{ color: theme.actionText }} strokeWidth={2} />
          </div>
        ) : (
          <button
            type="button"
            onClick={onClick}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-0 p-0"
            style={{ backgroundColor: theme.actionBg }}
            aria-label={`Claim ${name}`}
          >
            <ChevronRight className="h-4 w-4" style={{ color: theme.actionText }} strokeWidth={2.5} />
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-[10px]" style={{ color: theme.accent, opacity: 0.7 }}>
        <DateChip
          label="Claim Before"
          value={formatRewardDate(claimBefore)}
          icon={<CalendarDays className="h-3 w-3" strokeWidth={1.75} />}
        />
        <span className="opacity-40">|</span>
        <DateChip
          label="Redeem Before"
          value={formatRewardDate(redeemBefore)}
          icon={<Gift className="h-3 w-3" strokeWidth={1.75} />}
        />
      </div>
    </div>
  )
}

function DateChip({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon: ReactNode
}) {
  return (
    <div className="flex items-center gap-1">
      {icon}
      <span>{label}</span>
      <span className="ml-0.5 font-semibold">{value}</span>
    </div>
  )
}
