import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  formatCampaignDateRange,
  formatExpiry,
  getCampaignGradient,
  getCampaignSubtitle,
  getCustomerMechanicChipLabel,
} from '@/lib/customer-ui'

interface CampaignListingCardProps {
  campaign: {
    id: string
    name: string
    mechanic: string
    startDate: string
    endDate: string
    winRatePercent?: number
    playsPerDay?: number
  }
  href: string
  blocked?: boolean
  blockedLabel?: string
  extraBadge?: string
  statsLine?: string
  progressLine?: string
  className?: string
  comingSoon?: boolean
}

export function CampaignListingCard({
  campaign,
  href,
  blocked = false,
  blockedLabel,
  extraBadge,
  statsLine,
  progressLine,
  className,
  comingSoon = false,
}: CampaignListingCardProps) {
  const gradient = getCampaignGradient(campaign.mechanic)
  const mechanicLabel = getCustomerMechanicChipLabel(campaign.mechanic)

  return (
    <div
      className={cn(
        'bg-white border border-[#f3f4f6] rounded-3xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.1)]',
        className,
      )}
    >
      <div
        className="relative h-44 overflow-hidden"
        style={{ background: `linear-gradient(130deg, ${gradient.from}, ${gradient.to})` }}
      >
        <div className="absolute inset-0 opacity-20 flex items-center justify-center text-6xl select-none">
          {gradient.emoji}
        </div>
        <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#f3e8ff] text-[#6b21a8]">
          {mechanicLabel.toUpperCase()}
        </span>
        <span className="absolute top-3 right-3 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#d1fae5] text-[#065f46]">
          {comingSoon ? 'Live soon' : 'Active'}
        </span>
      </div>

      <div className="p-4 flex flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-bold text-[#101828]">{campaign.name}</h3>
          {extraBadge && (
            <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f3e8ff] text-[#8200db]">
              {extraBadge}
            </span>
          )}
        </div>
        <p className="text-xs text-[#6a7282] leading-5">
          {getCampaignSubtitle(campaign.mechanic, campaign.name)}
        </p>
        {progressLine && (
          <p className="text-[10px] font-semibold text-[#6a7282] text-right">{progressLine}</p>
        )}
        {(statsLine || campaign.endDate) && (
          <div className="flex flex-wrap items-center gap-2 text-[10px] text-[#6a7282] pt-1 pb-2">
            {statsLine && <span className="font-semibold">{statsLine}</span>}
            {statsLine && campaign.endDate && <span className="text-[#e5e7eb]">·</span>}
            {campaign.startDate && campaign.endDate ? (
              <span className="text-[#99a1af]">
                {formatCampaignDateRange(campaign.startDate, campaign.endDate)}
              </span>
            ) : (
              <span className="text-[#99a1af]">{formatExpiry(campaign.endDate)}</span>
            )}
          </div>
        )}

        {blocked || comingSoon ? (
          <div
            className={cn(
              'w-full py-2.5 rounded-[20px] text-xs font-bold text-center',
              comingSoon ? 'bg-[#faf5ff] text-[#5b0e81] border border-[#e9d5ff]' : 'bg-[#f3f4f6] text-[#6a7282]',
            )}
          >
            {comingSoon ? '✨ Live soon — not playable yet' : blockedLabel ?? '✓ Played today — come back tomorrow'}
          </div>
        ) : (
          <Link
            to={href}
            className={cn(
              'flex items-center justify-center w-full py-2.5 rounded-[20px] text-xs font-bold text-white no-underline',
              campaign.mechanic === 'check-in-loyalty'
                ? 'bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed]'
                : 'bg-gradient-to-r from-[#631cbb] to-[#43036d]',
            )}
          >
            Play Now
          </Link>
        )}
      </div>
    </div>
  )
}

export function LoyaltyCampaignSectionHeader({
  count,
  children,
}: {
  count: number
  children?: ReactNode
}) {
  return (
    <div className="pt-5">
      <div className="flex items-baseline justify-between mb-1">
        <h2 className="text-base font-extrabold text-[#101828]">Loyalty Campaigns</h2>
        <span className="text-[11px] text-[#99a1af]">{count} active</span>
      </div>
      <p className="text-xs text-[#99a1af] mb-3">
        Ask the staff for a code and tap a campaign to participate
      </p>
      {children}
    </div>
  )
}
