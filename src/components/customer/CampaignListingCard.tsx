import { type KeyboardEvent, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { CampaignCoverHero } from '@/components/customer/CampaignCoverHero'
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
  /** Shown inside the themed info box footer. */
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
  if (campaign.mechanic === 'stamp') return undefined // hero.badgeRight handles it
  if (extraBadge) return extraBadge
  return undefined // default Active from hero
}

function getScheduleLine(campaign: CampaignListingCardProps['campaign']): string {
  return formatCampaignCardSchedule(
    campaign.startDate,
    campaign.endDate,
    campaign.startTime,
    campaign.endTime,
  )
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
  const schedule = getScheduleLine(campaign)
  const subtitle = getCampaignSubtitle(campaign.mechanic, campaign.name)

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
        'bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm',
        navigable && 'cursor-pointer active:scale-[0.995] transition-transform',
        className,
      )}
    >
      <CampaignCoverHero
        mechanic={campaign.mechanic}
        variant="list"
        headerRight={headerRight}
        showStatusBadge
      />

      <div className="p-4 flex flex-col gap-2 min-h-[148px]">
        <div className="flex items-baseline gap-2 min-w-0">
          <h3 className="text-sm font-bold text-gray-900 leading-tight truncate flex-1 min-w-0">
            {campaign.name}
          </h3>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">{subtitle}</p>

        {/* Themed info box — consistent across mechanics */}
        <div
          className="rounded-xl p-3"
          style={{ background: `${theme.accent}0C`, border: `1px solid ${theme.accent}22` }}
        >
          {progressLine ? (
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-gray-700">
                {campaign.mechanic === 'stamp' ? 'Stamps Collected' : 'Progress'}
              </span>
              <span
                className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white shrink-0"
                style={{ color: theme.accent }}
              >
                {progressLine}
              </span>
            </div>
          ) : null}
          <div
            className={cn(
              'flex items-center gap-1.5 text-[10px] text-gray-500 flex-wrap',
              progressLine && 'mt-2 pt-2 border-t',
            )}
            style={progressLine ? { borderColor: `${theme.accent}22` } : undefined}
          >
            {playingToday != null && playingToday > 0 && (
              <>
                <span className="font-semibold" style={{ color: theme.accent }}>
                  {playingToday} playing today
                </span>
                <span className="text-gray-300">·</span>
              </>
            )}
            {statsLine && (
              <>
                <span className="font-semibold" style={{ color: theme.accent }}>
                  {statsLine}
                </span>
                <span className="text-gray-300">·</span>
              </>
            )}
            <span>{schedule}</span>
          </div>
        </div>

        {actions ? (
          <div onClick={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()}>
            {actions}
          </div>
        ) : blocked || comingSoon ? (
          <div
            className={cn(
              'w-full py-2.5 rounded-xl text-xs font-bold text-center',
              comingSoon
                ? 'bg-[#faf5ff] text-[#5b0e81] border border-[#e9d5ff]'
                : 'bg-[#f3f4f6] text-[#6a7282]',
            )}
          >
            {comingSoon ? '✨ Live soon — not playable yet' : blockedLabel ?? '✓ Played today — come back tomorrow'}
          </div>
        ) : (
          <CampaignPlayButton mechanic={campaign.mechanic} />
        )}
      </div>
    </div>
  )
}

/** Shared dual-CTA row for lottery: Check Status | Claim Now */
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
  const theme = getCampaignTheme('lottery')
  const statusBtn =
    'flex flex-1 items-center justify-center py-2.5 rounded-xl text-xs font-bold no-underline border border-[#c4b5fd] bg-[#EDE9FE] text-[#4C3FA8]'
  const claimBtn =
    'flex flex-1 items-center justify-center py-2.5 rounded-xl text-xs font-bold no-underline text-white'

  if (!hasTicket && !canClaim) {
    return (
      <div className="w-full py-2.5 rounded-xl text-xs font-bold text-center bg-[#f3f4f6] text-[#6a7282]">
        Entries closed
      </div>
    )
  }

  if (hasTicket && !canClaim) {
    return (
      <Link to={`/customer/campaigns/${campaignId}/lottery-status`} className={cn(statusBtn, 'w-full')}>
        Check Status
      </Link>
    )
  }

  if (!hasTicket && canClaim) {
    return (
      <Link
        to={claimHref}
        className={cn(claimBtn, 'w-full')}
        style={{
          background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentTo})`,
          boxShadow: `0 8px 20px ${theme.accent}40`,
        }}
      >
        Claim Now
      </Link>
    )
  }

  return (
    <div className="flex gap-2 w-full">
      <Link to={`/customer/campaigns/${campaignId}/lottery-status`} className={statusBtn}>
        Check Status
      </Link>
      <Link
        to={claimHref}
        className={claimBtn}
        style={{
          background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentTo})`,
          boxShadow: `0 8px 20px ${theme.accent}40`,
        }}
      >
        Claim Now
      </Link>
    </div>
  )
}

/** Dual-CTA row for community offer: Check Status | Reserve Spot */
export function GroupUnlockCardActions({
  campaignId,
  canClaim,
  hasClaimed,
  claimHref,
}: {
  campaignId: string
  canClaim: boolean
  hasClaimed: boolean
  claimHref: string
}) {
  const theme = getCampaignTheme('groupunlock')
  const statusBtn =
    'flex flex-1 items-center justify-center py-2.5 rounded-xl text-xs font-bold no-underline border border-[#99F6E4] bg-[#CCFBF1] text-[#115E59]'
  const claimBtn =
    'flex flex-1 items-center justify-center py-2.5 rounded-xl text-xs font-bold no-underline text-white'

  if (hasClaimed) {
    return (
      <Link to={`/customer/campaigns/${campaignId}/groupunlock-status`} className={cn(statusBtn, 'w-full')}>
        Check Status
      </Link>
    )
  }

  if (!canClaim) {
    return (
      <div className="w-full py-2.5 rounded-xl text-xs font-bold text-center bg-[#f3f4f6] text-[#6a7282]">
        Spots full
      </div>
    )
  }

  return (
    <Link
      to={claimHref}
      className={cn(claimBtn, 'w-full')}
      style={{
        background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentTo})`,
        boxShadow: `0 8px 20px ${theme.accent}40`,
      }}
    >
      Reserve Spot
    </Link>
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
