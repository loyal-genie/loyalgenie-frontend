import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { CampaignCoverBadge, CampaignCoverHero } from '@/components/customer/CampaignCoverHero'
import { CampaignPlayButton } from '@/components/customer/CampaignPlayButton'
import { formatCampaignDateRange, getCampaignSubtitle } from '@/lib/customer-ui'
import { formatShakeWinLabel } from '@/lib/campaign-impact'
import { getCampaignTheme } from '@/lib/campaign-themes'

interface CampaignListingCardProps {
  campaign: {
    id: string
    name: string
    mechanic: string
    startDate: string
    endDate: string
    winRatePercent?: number
    overallWinners?: number
    userCap?: number
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

function formatEndDate(end: string): string {
  return new Date(end).toISOString().slice(0, 10)
}

function getHeaderRightBadge(
  campaign: CampaignListingCardProps['campaign'],
  extraBadge?: string,
  comingSoon?: boolean,
): string | undefined {
  if (comingSoon) return 'Live soon'
  if (campaign.mechanic === 'shake' && campaign.overallWinners != null && campaign.userCap != null) {
    return formatShakeWinLabel(campaign.overallWinners, campaign.userCap)
  }
  if (campaign.mechanic === 'shake' && campaign.winRatePercent != null) {
    return `${campaign.winRatePercent}% of players win`
  }
  if ((campaign.mechanic === 'spin' || campaign.mechanic === 'dice') && campaign.winRatePercent != null) {
    return `${campaign.winRatePercent}% win rate`
  }
  if (campaign.mechanic === 'stamp') return 'Surprise + big rewards'
  if (extraBadge) return extraBadge
  return 'Active'
}

function getMetaLine(campaign: CampaignListingCardProps['campaign'], statsLine?: string): string {
  if (statsLine) return `${statsLine} · ends ${formatEndDate(campaign.endDate)}`
  if (campaign.mechanic === 'stamp') {
    return `1 stamp per day · ends ${formatEndDate(campaign.endDate)}`
  }
  if (campaign.mechanic === 'shake' && campaign.playsPerDay != null) {
    return `${campaign.playsPerDay} play per day · ends ${formatEndDate(campaign.endDate)}`
  }
  if (campaign.mechanic === 'spin' && campaign.playsPerDay != null) {
    return `${campaign.playsPerDay} spin per day · ends ${formatEndDate(campaign.endDate)}`
  }
  if (campaign.mechanic === 'dice' && campaign.playsPerDay != null) {
    return `${campaign.playsPerDay} roll per day · ends ${formatEndDate(campaign.endDate)}`
  }
  if (campaign.startDate && campaign.endDate) {
    return formatCampaignDateRange(campaign.startDate, campaign.endDate)
  }
  return `ends ${formatEndDate(campaign.endDate)}`
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
  const headerRight = getHeaderRightBadge(campaign, extraBadge, comingSoon)
  const theme = getCampaignTheme(campaign.mechanic)

  return (
    <div
      className={cn(
        'bg-white border border-[#f3f4f6] rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.08)]',
        className,
      )}
    >
      <CampaignCoverHero mechanic={campaign.mechanic}>
        <CampaignCoverBadge mechanic={campaign.mechanic} />
        {headerRight && (
          <span className="absolute top-3 right-3 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-black/25 backdrop-blur-sm text-white">
            {headerRight}
          </span>
        )}
      </CampaignCoverHero>

      <div className="p-4 flex flex-col gap-2">
        <h3 className="text-base font-bold text-[#101828] leading-tight">{campaign.name}</h3>
        <p className="text-xs text-[#6a7282] leading-5">
          {getCampaignSubtitle(campaign.mechanic, campaign.name)}
        </p>
        <p className="text-[11px] text-[#99a1af] leading-5">{getMetaLine(campaign, statsLine)}</p>
        {progressLine && (
          <p className="text-[11px] font-semibold" style={{ color: theme.accent }}>
            {progressLine}
          </p>
        )}

        {blocked || comingSoon ? (
          <div
            className={cn(
              'w-full py-3 rounded-full text-xs font-bold text-center',
              comingSoon ? 'bg-[#faf5ff] text-[#5b0e81] border border-[#e9d5ff]' : 'bg-[#f3f4f6] text-[#6a7282]',
            )}
          >
            {comingSoon ? '✨ Live soon — not playable yet' : blockedLabel ?? '✓ Played today — come back tomorrow'}
          </div>
        ) : (
          <CampaignPlayButton mechanic={campaign.mechanic} href={href} />
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
