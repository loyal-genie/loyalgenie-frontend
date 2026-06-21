import { Calendar, Users } from 'lucide-react'
import { formatCampaignDateRange } from '@/lib/customer-ui'

interface CampaignMetaRowProps {
  startDate: string
  endDate: string
  playsPerDay?: number
  winRatePercent?: number
}

export function CampaignMetaRow({ startDate, endDate, playsPerDay, winRatePercent }: CampaignMetaRowProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#99a1af] w-full">
      <span className="inline-flex items-center gap-1">
        <Calendar className="size-3.5 shrink-0" />
        {formatCampaignDateRange(startDate, endDate)}
      </span>
      {(playsPerDay != null || winRatePercent != null) && (
        <>
          <span className="text-[#e5e7eb]">|</span>
          <span className="inline-flex items-center gap-1">
            <Users className="size-3.5 shrink-0" />
            {playsPerDay != null
              ? `${playsPerDay} attempt${playsPerDay !== 1 ? 's' : ''} per day`
              : `${winRatePercent}% win chance`}
          </span>
        </>
      )}
    </div>
  )
}
