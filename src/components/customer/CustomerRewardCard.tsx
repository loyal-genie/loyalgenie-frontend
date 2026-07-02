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
      className="relative h-[131px] w-full overflow-hidden rounded-[18px] border"
      style={{
        backgroundImage: theme.gradient,
        borderColor: theme.border,
      }}
    >
      <div
        className="absolute left-3 top-3 h-5 rounded-xl px-2.5 flex items-center"
        style={{ backgroundColor: theme.ptsBg }}
      >
        <span className="text-[8px] font-bold leading-none" style={{ color: theme.accent }}>
          {pointsRequired} pts
        </span>
      </div>

      <div
        className="absolute right-3 top-3.5 flex h-5 items-center gap-1 rounded-xl px-2"
        style={{ backgroundColor: theme.claimedBg }}
      >
        <Gift className="h-3.5 w-3.5 shrink-0" style={{ color: theme.accent }} strokeWidth={1.75} />
        <span className="text-[8px] font-normal leading-none" style={{ color: theme.accent }}>
          {availabilityLabel}
        </span>
      </div>

      <div className="absolute left-[9px] top-[27px] flex h-[60px] w-[60px] items-center justify-center rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.08)]">
        <span className="text-[32px] leading-none">{renderRewardIcon(icon)}</span>
      </div>

      <div className="absolute left-[90px] right-[52px] top-[46px]">
        <p className="text-[14px] font-medium leading-tight text-[#1b1410]">{name}</p>
        <p className="mt-1 text-[8px] leading-tight text-[#9a9088]">{subtitle}</p>
      </div>

      <div className="absolute bottom-[14px] left-[90px] right-[52px] flex items-center gap-4">
        <DateChip
          label="Claim Before"
          value={formatRewardDate(claimBefore)}
          accent={theme.accent}
          icon={<CalendarDays className="h-3.5 w-3.5" style={{ color: theme.accent }} strokeWidth={1.75} />}
        />
        <div className="h-5 w-px bg-[rgba(56,56,56,0.15)]" />
        <DateChip
          label="Redeem Before"
          value={formatRewardDate(redeemBefore)}
          accent={theme.accent}
          icon={<Gift className="h-3.5 w-3.5" style={{ color: theme.accent }} strokeWidth={1.75} />}
        />
      </div>

      {locked ? (
        <div
          className="absolute bottom-[14px] right-3 flex h-[22px] w-[22px] items-center justify-center rounded-full"
          style={{ backgroundColor: theme.actionBg }}
        >
          <Lock className="h-3 w-3" style={{ color: theme.actionText }} strokeWidth={2} />
        </div>
      ) : (
        <button
          type="button"
          onClick={onClick}
          className="absolute bottom-[14px] right-3 flex h-[22px] w-[22px] items-center justify-center rounded-full border-0 p-0"
          style={{ backgroundColor: theme.actionBg }}
          aria-label={`Claim ${name}`}
        >
          <ChevronRight className="h-3.5 w-3.5" style={{ color: theme.actionText }} strokeWidth={2.5} />
        </button>
      )}
    </div>
  )
}

function DateChip({
  label,
  value,
  accent,
  icon,
}: {
  label: string
  value: string
  accent: string
  icon: ReactNode
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1">
        {icon}
        <span className="text-[6px] text-[rgba(56,56,56,0.38)]">{label}</span>
      </div>
      <p className="mt-0.5 pl-4 text-[8px] font-medium leading-none" style={{ color: accent }}>
        {value}
      </p>
    </div>
  )
}
