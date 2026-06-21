import { Calendar, Users } from 'lucide-react'
import { formatCampaignDateRange } from '@/lib/customer-ui'
import { formatShakeWinLabel } from '@/lib/campaign-impact'

interface CampaignMetaRowProps {
  startDate: string
  endDate: string
  playsPerDay?: number
  overallWinners?: number
  userCap?: number
  winRatePercent?: number
}

export function CampaignMetaRow({
  startDate,
  endDate,
  playsPerDay,
  overallWinners,
  userCap,
  winRatePercent,
}: CampaignMetaRowProps) {
  const winLabel = overallWinners != null && userCap != null
    ? formatShakeWinLabel(overallWinners, userCap)
    : winRatePercent != null
      ? `${winRatePercent}% of players win`
      : null

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#99a1af] w-full">
      <span className="inline-flex items-center gap-1">
        <Calendar className="size-3.5 shrink-0" />
        {formatCampaignDateRange(startDate, endDate)}
      </span>
      {(playsPerDay != null || winLabel) && (
        <>
          <span className="text-[#e5e7eb]">|</span>
          <span className="inline-flex items-center gap-1">
            <Users className="size-3.5 shrink-0" />
            {playsPerDay != null
              ? `${playsPerDay} attempt${playsPerDay !== 1 ? 's' : ''} per day`
              : winLabel}
          </span>
        </>
      )}
    </div>
  )
}
