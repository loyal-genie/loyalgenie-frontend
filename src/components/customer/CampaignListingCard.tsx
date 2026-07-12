import { type KeyboardEvent, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { CampaignCoverBadge, CampaignCoverHero } from '@/components/customer/CampaignCoverHero'
import { CampaignPlayButton } from '@/components/customer/CampaignPlayButton'
import { formatCampaignCardSchedule, getCampaignSubtitle } from '@/lib/customer-ui'
import { formatShakeWinLabel } from '@/lib/campaign-impact'
import { getCampaignTheme } from '@/lib/campaign-themes'

interface CampaignListingCardProps {
  campaign: {
    id: string
    name: string
    mechanic: string
    startDate: string
    endDate: string
    startTime?: string
    endTime?: string
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
  /** Shown on the right of the name row (shake / spin / dice / lottery). */
  playingToday?: number
  className?: string
  comingSoon?: boolean
  /** When set, replaces the default single play button (e.g. lottery dual CTAs). */
  actions?: ReactNode
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
  const schedule = formatCampaignCardSchedule(
    campaign.startDate,
    campaign.endDate,
    campaign.startTime,
    campaign.endTime,
  )
  if (statsLine) return `${statsLine} · ${schedule}`
  if (campaign.mechanic === 'stamp') {
    return `1 stamp per day · ${schedule}`
  }
  if (campaign.mechanic === 'shake' && campaign.playsPerDay != null) {
    return `${campaign.playsPerDay} play per day · ${schedule}`
  }
  if (campaign.mechanic === 'spin' && campaign.playsPerDay != null) {
    return `${campaign.playsPerDay} spin per day · ${schedule}`
  }
  if (campaign.mechanic === 'dice' && campaign.playsPerDay != null) {
    return `${campaign.playsPerDay} roll per day · ${schedule}`
  }
  return schedule
}

export function CampaignListingCard({
  campaign,
  href,
  blocked = false,
  blockedLabel,
  extraBadge,
  statsLine,
  progressLine,
  playingToday,
  className,
  comingSoon = false,
  actions,
}: CampaignListingCardProps) {
  const navigate = useNavigate()
  const headerRight = getHeaderRightBadge(campaign, extraBadge, comingSoon)
  const theme = getCampaignTheme(campaign.mechanic)
  const navigable = !blocked && !comingSoon && Boolean(href) && href !== '#'

  const openCard = () => {
    if (navigable) navigate(href)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!navigable) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      navigate(href)
    }
  }

  return (
    <div
      role={navigable ? 'link' : undefined}
      tabIndex={navigable ? 0 : undefined}
      onClick={openCard}
      onKeyDown={onKeyDown}
      className={cn(
        'bg-white border border-[#f3f4f6] rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.08)]',
        navigable && 'cursor-pointer active:scale-[0.995] transition-transform',
        className,
      )}
    >
      <CampaignCoverHero mechanic={campaign.mechanic}>
        <CampaignCoverBadge mechanic={campaign.mechanic} />
        {headerRight && (
          <span
            className={cn(
              'absolute top-3 right-3 text-[10px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-sm',
              campaign.mechanic === 'lottery' || campaign.mechanic === 'buy-x-get-y'
                ? 'bg-white/75 text-[#78350f]'
                : 'bg-black/25 text-white',
            )}
          >
            {headerRight}
          </span>
        )}
      </CampaignCoverHero>

      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-baseline gap-2 min-w-0">
          <h3 className="text-base font-bold text-[#101828] leading-tight truncate flex-1 min-w-0">
            {campaign.name}
          </h3>
          {playingToday != null && playingToday > 0 && (
            <span className="shrink-0 text-[10px] font-semibold text-[#5b0e81] leading-none whitespace-nowrap">
              {playingToday} playing today
            </span>
          )}
        </div>
        <p className="text-xs text-[#6a7282] leading-5">
          {getCampaignSubtitle(campaign.mechanic, campaign.name)}
        </p>
        <p className="text-[11px] text-[#99a1af] leading-5">{getMetaLine(campaign, statsLine)}</p>
        {progressLine && (
          <p className="text-[11px] font-semibold" style={{ color: theme.accent }}>
            {progressLine}
          </p>
        )}

        {actions ? (
          <div onClick={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()}>
            {actions}
          </div>
        ) : blocked || comingSoon ? (
          <div
            className={cn(
              'w-full py-3 rounded-full text-xs font-bold text-center',
              comingSoon ? 'bg-[#faf5ff] text-[#5b0e81] border border-[#e9d5ff]' : 'bg-[#f3f4f6] text-[#6a7282]',
            )}
          >
            {comingSoon ? '✨ Live soon — not playable yet' : blockedLabel ?? '✓ Played today — come back tomorrow'}
          </div>
        ) : (
          // Decorative CTA — whole card navigates (avoid nested links)
          <CampaignPlayButton mechanic={campaign.mechanic} />
        )}
      </div>
    </div>
  )
}

/** Shared dual-CTA row for lottery: Check Status | Enter PIN & Claim */
export function LotteryCardActions({
  campaignId,
  canClaim,
  hasTicket,
  claimHref,
}: {
  campaignId: string
  canClaim: boolean
  hasTicket: boolean
  claimHref: string
}) {
  const statusHref = `/customer/campaigns/${campaignId}/lottery-status`
  const statusBtn =
    'flex flex-1 items-center justify-center py-3 rounded-full text-xs font-bold no-underline border border-amber-300 bg-amber-50 text-amber-900'
  const claimBtn =
    'flex flex-1 items-center justify-center py-3 rounded-full text-xs font-bold no-underline bg-gradient-to-r from-[#fef08a] to-[#fde047] text-amber-950 shadow-[0_8px_20px_rgba(250,204,21,0.28)]'

  if (!hasTicket && !canClaim) {
    return (
      <div className="w-full py-3 rounded-full text-xs font-bold text-center bg-[#f3f4f6] text-[#6a7282]">
        Entries closed
      </div>
    )
  }

  if (hasTicket && !canClaim) {
    return (
      <Link to={statusHref} className={cn(statusBtn, 'w-full')}>
        Check Status
      </Link>
    )
  }

  if (!hasTicket && canClaim) {
    return (
      <Link to={claimHref} className={cn(claimBtn, 'w-full')}>
        Enter PIN & Claim
      </Link>
    )
  }

  return (
    <div className="flex gap-2 w-full">
      <Link to={statusHref} className={statusBtn}>
        Check Status
      </Link>
      <Link to={claimHref} className={claimBtn}>
        Enter PIN & Claim
      </Link>
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
