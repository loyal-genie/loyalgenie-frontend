import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { BottomNav } from '@/components/customer/bottom-nav'
import { BusinessDetailHero } from '@/components/customer/BusinessDetailHero'
import {
  BusinessTabBar,
  LockedRewardsSectionHeader,
  RewardsSectionHeader,
} from '@/components/customer/BusinessTabBar'
import { CustomerRewardCard } from '@/components/customer/CustomerRewardCard'
import { PullToRefresh } from '@/components/customer/PullToRefresh'
import {
  CampaignListingCard,
  GroupUnlockCardActions,
  LotteryCardActions,
  LoyaltyCampaignSectionHeader,
} from '@/components/customer/CampaignListingCard'
import { CountdownTimer } from '@/components/customer/CountdownTimer'
import { useBusinessesWithCampaigns, useBusinessCampaignStatesRealtime } from '@/hooks/useCustomerData'
import { useCustomerBusinessRewards } from '@/hooks/useRewards'
import { getClaimableTheme, getLockedTheme } from '@/lib/customer-reward-themes'
import {
  fetchBusinessCampaignStates,
  type BusinessCampaignStateItem,
  type LoyaltyState,
  type PlayState,
  type StampState,
} from '@/lib/api'
import { formatCampaignTimeShort } from '@/lib/customer-ui'
import { currentTimeInCampaignTz, nextDailyDeadline } from '@/lib/campaign-dates'
import { getCampaignTheme } from '@/lib/campaign-themes'

function isFullDayWindow(startTime: string | undefined, endTime: string) {
  const start = (startTime ?? '00:00').slice(0, 5)
  return (start === '00:00' || start === '0:00') && (endTime === '23:59' || endTime === '24:00')
}

function formatClockAmPm(hhmm: string) {
  const [hRaw, mRaw] = hhmm.split(':')
  const h = Number(hRaw)
  const m = Number(mRaw ?? 0)
  if (!Number.isFinite(h)) return formatCampaignTimeShort(hhmm)
  const ap = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${ap}`
}

function hasActiveHoursWindow(startTime?: string, endTime?: string): boolean {
  const end = (endTime ?? '23:59').slice(0, 5)
  return !isFullDayWindow(startTime, end)
}

/** e.g. "Today · Active Hours 4:00 PM–9:00 PM" */
function activeHoursBlockedLabel(startTime?: string, endTime?: string): string {
  const start = (startTime ?? '00:00').slice(0, 5)
  const end = (endTime ?? '23:59').slice(0, 5)
  if (isFullDayWindow(start, end)) return 'Outside active hours'
  return `Today · Active Hours ${formatClockAmPm(start)}–${formatClockAmPm(end)}`
}

/** Listing CTA when canClaim is false — capacity vs Active Hours. */
function claimBlockedLabel(opts: {
  hasClaimed?: boolean
  active?: boolean
  spotsRemaining?: number
  claimedCount?: number
  total?: number
  exhaustedLabel: string
  startTime?: string
  endTime?: string
}): string {
  if (opts.hasClaimed) return 'Already claimed'
  const exhausted =
    (opts.spotsRemaining != null && opts.spotsRemaining <= 0)
    || (
      opts.claimedCount != null
      && opts.total != null
      && opts.total > 0
      && opts.claimedCount >= opts.total
    )
  if (exhausted) return opts.exhaustedLabel
  if (opts.active === false && hasActiveHoursWindow(opts.startTime, opts.endTime)) {
    return activeHoursBlockedLabel(opts.startTime, opts.endTime)
  }
  if (opts.active === false) return 'Not available now'
  return opts.exhaustedLabel
}

function playOutsideHoursLabel(opts: {
  blockReason?: string | null
  message?: string
  quotaUsed: boolean
  quotaLabel: string
  startTime?: string
  endTime?: string
}): string | undefined {
  if (opts.quotaUsed) return opts.quotaLabel
  if (opts.blockReason === 'campaign_inactive' && hasActiveHoursWindow(opts.startTime, opts.endTime)) {
    return activeHoursBlockedLabel(opts.startTime, opts.endTime)
  }
  return opts.message
}

/** Countdown to window open if before Active Hours today; otherwise to daily end. */
function flashCountdownTarget(startTime: string | undefined, endTime: string): string {
  const start = (startTime ?? '00:00').slice(0, 5)
  const end = endTime.slice(0, 5)
  if (isFullDayWindow(start, end)) return nextDailyDeadline(end)
  const time = currentTimeInCampaignTz()
  if (time < start) return nextDailyDeadline(start)
  return nextDailyDeadline(end)
}

function StampCampaignBlock({
  campaign,
  stampState,
}: {
  campaign: { id: string; name: string; mechanic: string; startDate: string; endDate: string }
  stampState?: StampState
}) {
  const collectedToday = Boolean(
    stampState?.enrolled && !stampState.canCollectToday && !stampState.cardComplete,
  )
  const cardComplete = Boolean(stampState?.cardComplete)
  const blocked =
    collectedToday ||
    cardComplete ||
    stampState?.status === 'expired' ||
    Boolean(stampState && !stampState.enrolled && !stampState.enrollmentOpen)

  const progressLine =
    stampState?.totalStamps
      ? `${stampState.stampsCollected}/${stampState.totalStamps}`
      : undefined

  return (
    <CampaignListingCard
      campaign={campaign}
      href={`/customer/campaigns/${campaign.id}`}
      blocked={blocked}
      blockedLabel={
        collectedToday
          ? `✓ Stamp collected today · ${stampState!.stampsCollected}/${stampState!.totalStamps}`
          : cardComplete
            ? `✓ Card complete · ${stampState!.stampsCollected}/${stampState!.totalStamps}`
            : stampState?.status === 'expired'
              ? 'Your stamp card has expired'
              : 'Enrollment closed — no spots left'
      }
      progressLine={progressLine}
      playingToday={stampState?.playingToday}
    />
  )
}

function ShakeCampaignBlock({
  campaign,
  playState,
}: {
  campaign: {
    id: string
    name: string
    mechanic: string
    startDate: string
    endDate: string
    startTime?: string
    endTime?: string
    winRatePercent?: number
    playsPerDay?: number
    overallWinners?: number
    userCap?: number
  }
  playState?: PlayState
}) {
  const blocked = Boolean(playState && !playState.canPlay)
  const quotaUsed = playState?.blockReason === 'no_plays_remaining'

  return (
    <CampaignListingCard
      campaign={campaign}
      href={`/customer/campaigns/${campaign.id}`}
      blocked={blocked}
      blockedLabel={playOutsideHoursLabel({
        blockReason: playState?.blockReason,
        message: playState?.message,
        quotaUsed,
        quotaLabel: `✓ All plays used today · ${playState!.playsUsedToday}/${playState!.playsPerDay}`,
        startTime: campaign.startTime,
        endTime: campaign.endTime,
      })}
      playingToday={playState?.playingToday}
      possibleRewards={playState?.possibleRewards}
    />
  )
}

function SpinCampaignBlock({
  campaign,
  playState,
}: {
  campaign: {
    id: string
    name: string
    mechanic: string
    startDate: string
    endDate: string
    startTime?: string
    endTime?: string
    winRatePercent?: number
    playsPerDay?: number
  }
  playState?: PlayState
}) {
  const blocked = Boolean(playState && !playState.canPlay)
  const quotaUsed = playState?.blockReason === 'no_plays_remaining'

  return (
    <CampaignListingCard
      campaign={campaign}
      href={`/customer/campaigns/${campaign.id}`}
      blocked={blocked}
      blockedLabel={playOutsideHoursLabel({
        blockReason: playState?.blockReason,
        message: playState?.message,
        quotaUsed,
        quotaLabel: `✓ All spins used today · ${playState!.playsUsedToday}/${playState!.playsPerDay}`,
        startTime: campaign.startTime,
        endTime: campaign.endTime,
      })}
      titleSuffix={
        playState
          ? `(${playState.playsUsedToday}/${playState.playsPerDay})`
          : campaign.playsPerDay != null
            ? `(0/${campaign.playsPerDay})`
            : undefined
      }
      playingToday={playState?.playingToday}
      possibleRewards={playState?.possibleRewards}
    />
  )
}

function DiceCampaignBlock({
  campaign,
  playState,
}: {
  campaign: {
    id: string
    name: string
    mechanic: string
    startDate: string
    endDate: string
    startTime?: string
    endTime?: string
    winRatePercent?: number
    playsPerDay?: number
  }
  playState?: PlayState
}) {
  const blocked = Boolean(playState && !playState.canPlay)
  const quotaUsed = playState?.blockReason === 'no_plays_remaining'

  return (
    <CampaignListingCard
      campaign={campaign}
      href={`/customer/campaigns/${campaign.id}`}
      blocked={blocked}
      blockedLabel={playOutsideHoursLabel({
        blockReason: playState?.blockReason,
        message: playState?.message,
        quotaUsed,
        quotaLabel: `✓ All rolls used today · ${playState!.playsUsedToday}/${playState!.playsPerDay}`,
        startTime: campaign.startTime,
        endTime: campaign.endTime,
      })}
      titleSuffix={
        playState
          ? `(${playState.playsUsedToday}/${playState.playsPerDay})`
          : campaign.playsPerDay != null
            ? `(0/${campaign.playsPerDay})`
            : undefined
      }
      playingToday={playState?.playingToday}
      possibleRewards={playState?.possibleRewards}
    />
  )
}

function LotteryCampaignBlock({
  campaign,
  lotteryState,
}: {
  campaign: {
    id: string
    name: string
    mechanic: string
    startDate: string
    endDate: string
    startTime?: string
    endTime?: string
    playsPerDay?: number
  }
  lotteryState?: {
    drawDate?: string
    hasTicket?: boolean
    canClaimTicket?: boolean
    totalTickets?: number
    drawCompleted?: boolean
    ticketCount?: number
    playsUsedToday?: number
    playsPerDay?: number
    playsRemaining?: number
    playingToday?: number
  }
}) {
  const canClaim = Boolean(lotteryState?.canClaimTicket)
  const hasTicket = Boolean(lotteryState?.hasTicket)
  const drawDate = lotteryState?.drawDate ?? campaign.endDate
  const ticketCount = lotteryState?.ticketCount ?? 0
  const entriesClosed = Boolean(lotteryState && !canClaim && !hasTicket)

  return (
    <CampaignListingCard
      campaign={campaign}
      href={`/customer/campaigns/${campaign.id}`}
      blocked={entriesClosed}
      blockedLabel={lotteryState?.drawCompleted ? 'Draw complete' : 'Entries closed'}
      playingToday={lotteryState?.playingToday}
      lotteryDrawDate={drawDate}
      lotteryTicketCount={ticketCount}
      actions={
        entriesClosed && !hasTicket
          ? undefined
          : (
            <LotteryCardActions
              campaignId={campaign.id}
              canClaim={canClaim}
              hasTicket={hasTicket}
              claimHref={`/customer/campaigns/${campaign.id}`}
            />
          )
      }
    />
  )
}

function BuyXGetYCampaignBlock({
  campaign,
  offerState,
}: {
  campaign: {
    id: string
    name: string
    mechanic: string
    startDate: string
    endDate: string
    startTime?: string
    endTime?: string
  }
  offerState?: {
    rewardLabel?: string
    canClaim?: boolean
    hasClaimed?: boolean
    spotsRemaining?: number
    claimedCount?: number
    userCap?: number
    redeemBefore?: string | null
    active?: boolean
  }
}) {
  const blocked = Boolean(offerState && !offerState.canClaim)

  return (
    <CampaignListingCard
      campaign={campaign}
      href={`/customer/campaigns/${campaign.id}`}
      blocked={blocked}
      blockedLabel={claimBlockedLabel({
        hasClaimed: offerState?.hasClaimed,
        active: offerState?.active,
        spotsRemaining: offerState?.spotsRemaining,
        claimedCount: offerState?.claimedCount,
        total: offerState?.userCap,
        exhaustedLabel: 'Offer closed',
        startTime: campaign.startTime,
        endTime: campaign.endTime,
      })}
      rewardLabel={offerState?.rewardLabel}
      claimProgress={
        offerState?.claimedCount != null && offerState?.userCap != null
          ? { current: offerState.claimedCount, total: offerState.userCap, label: 'claimed' }
          : undefined
      }
      claimBefore={campaign.endDate}
      redeemBefore={offerState?.redeemBefore ?? undefined}
    />
  )
}

function CouponCampaignBlock({
  campaign,
  offerState,
}: {
  campaign: {
    id: string
    name: string
    mechanic: string
    startDate: string
    endDate: string
    startTime?: string
    endTime?: string
  }
  offerState?: {
    rewardLabel?: string
    canClaim?: boolean
    hasClaimed?: boolean
    spotsRemaining?: number
    claimedCount?: number
    totalCoupons?: number
    redeemBefore?: string | null
    active?: boolean
  }
}) {
  const blocked = Boolean(offerState && !offerState.canClaim)

  return (
    <CampaignListingCard
      campaign={campaign}
      href={`/customer/campaigns/${campaign.id}`}
      blocked={blocked}
      blockedLabel={claimBlockedLabel({
        hasClaimed: offerState?.hasClaimed,
        active: offerState?.active,
        spotsRemaining: offerState?.spotsRemaining,
        claimedCount: offerState?.claimedCount,
        total: offerState?.totalCoupons,
        exhaustedLabel: 'Coupons gone',
        startTime: campaign.startTime,
        endTime: campaign.endTime,
      })}
      rewardLabel={offerState?.rewardLabel}
      claimProgress={
        offerState?.claimedCount != null && offerState?.totalCoupons != null
          ? { current: offerState.claimedCount, total: offerState.totalCoupons, label: 'claimed' }
          : undefined
      }
      claimBefore={campaign.endDate}
      redeemBefore={offerState?.redeemBefore ?? undefined}
    />
  )
}

function FlashCampaignBlock({
  campaign,
  offerState,
}: {
  campaign: {
    id: string
    name: string
    mechanic: string
    startDate: string
    endDate: string
    startTime?: string
    endTime?: string
  }
  offerState?: {
    rewardLabel?: string
    canClaim?: boolean
    hasClaimed?: boolean
    spotsRemaining?: number
    claimedCount?: number
    totalSlots?: number
    redeemBefore?: string | null
    active?: boolean
  }
}) {
  const blocked = Boolean(offerState && !offerState.canClaim)
  const theme = getCampaignTheme('flash')
  const startTime = (campaign.startTime ?? '00:00').slice(0, 5)
  const endTime = (campaign.endTime ?? '23:59').slice(0, 5)
  const hasWindowedHours = hasActiveHoursWindow(startTime, endTime)

  return (
    <CampaignListingCard
      campaign={campaign}
      href={`/customer/campaigns/${campaign.id}`}
      blocked={blocked}
      blockedLabel={claimBlockedLabel({
        hasClaimed: offerState?.hasClaimed,
        active: offerState?.active,
        spotsRemaining: offerState?.spotsRemaining,
        claimedCount: offerState?.claimedCount,
        total: offerState?.totalSlots,
        exhaustedLabel: 'Spots gone',
        startTime,
        endTime,
      })}
      rewardLabel={offerState?.rewardLabel}
      claimProgress={
        offerState?.claimedCount != null && offerState?.totalSlots != null
          ? { current: offerState.claimedCount, total: offerState.totalSlots, label: 'claimed' }
          : undefined
      }
      claimBefore={campaign.endDate}
      claimTime={hasWindowedHours ? formatClockAmPm(endTime) : undefined}
      redeemBefore={offerState?.redeemBefore ?? undefined}
      titleAccessory={
        <CountdownTimer
          target={flashCountdownTarget(startTime, endTime)}
          color={theme.accent}
        />
      }
    />
  )
}

function ComboCampaignBlock({
  campaign,
  offerState,
}: {
  campaign: {
    id: string
    name: string
    mechanic: string
    startDate: string
    endDate: string
    startTime?: string
    endTime?: string
  }
  offerState?: {
    rewardLabel?: string
    canClaim?: boolean
    hasClaimed?: boolean
    spotsRemaining?: number
    claimedCount?: number
    totalSpots?: number
    redeemBefore?: string | null
    variant?: 'discount' | 'freeitem'
    originalPrice?: number
    bundlePrice?: number
    active?: boolean
  }
}) {
  const blocked = Boolean(offerState && !offerState.canClaim)
  const theme = getCampaignTheme('combo')
  const showDiscountPrices =
    offerState?.variant === 'discount'
    && offerState.originalPrice != null
    && offerState.bundlePrice != null
  const savePct = showDiscountPrices && offerState.originalPrice! > offerState.bundlePrice!
    ? Math.round(((offerState.originalPrice! - offerState.bundlePrice!) / offerState.originalPrice!) * 100)
    : null

  return (
    <CampaignListingCard
      campaign={campaign}
      href={`/customer/campaigns/${campaign.id}`}
      blocked={blocked}
      blockedLabel={claimBlockedLabel({
        hasClaimed: offerState?.hasClaimed,
        active: offerState?.active,
        spotsRemaining: offerState?.spotsRemaining,
        claimedCount: offerState?.claimedCount,
        total: offerState?.totalSpots,
        exhaustedLabel: 'No bundles left',
        startTime: campaign.startTime,
        endTime: campaign.endTime,
      })}
      rewardLabel={offerState?.rewardLabel ?? campaign.name}
      claimProgress={
        offerState?.claimedCount != null && offerState?.totalSpots != null
          ? { current: offerState.claimedCount, total: offerState.totalSpots, label: 'claimed' }
          : undefined
      }
      claimBefore={campaign.endDate}
      redeemBefore={offerState?.redeemBefore ?? undefined}
      claimExtra={
        showDiscountPrices ? (
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs text-gray-400 line-through">₹{offerState!.originalPrice}</span>
              <span className="text-sm font-bold" style={{ color: theme.accent }}>₹{offerState!.bundlePrice}</span>
            </div>
            {savePct != null && savePct > 0 && (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white"
                style={{ color: theme.accent }}
              >
                Save {savePct}%
              </span>
            )}
          </div>
        ) : undefined
      }
    />
  )
}

function FriendCampaignBlock({
  campaign,
  offerState,
}: {
  campaign: {
    id: string
    name: string
    mechanic: string
    startDate: string
    endDate: string
    startTime?: string
    endTime?: string
  }
  offerState?: {
    rewardLabel?: string
    canClaim?: boolean
    hasClaimed?: boolean
    spotsRemaining?: number
    claimedCount?: number
    userCap?: number
    minFriends?: number
    redeemBefore?: string | null
    active?: boolean
  }
}) {
  const blocked = Boolean(offerState && !offerState.canClaim)
  const minFriends = offerState?.minFriends
  const friendsProgress =
    minFriends != null
      ? {
          current: offerState?.hasClaimed ? minFriends : 0,
          total: minFriends,
          label: 'friends',
        }
      : offerState?.claimedCount != null && offerState?.userCap != null
        ? { current: offerState.claimedCount, total: offerState.userCap, label: 'claimed' }
        : undefined

  return (
    <CampaignListingCard
      campaign={campaign}
      href={`/customer/campaigns/${campaign.id}`}
      blocked={blocked}
      blockedLabel={claimBlockedLabel({
        hasClaimed: offerState?.hasClaimed,
        active: offerState?.active,
        spotsRemaining: offerState?.spotsRemaining,
        claimedCount: offerState?.claimedCount,
        total: offerState?.userCap,
        exhaustedLabel: 'Claims full',
        startTime: campaign.startTime,
        endTime: campaign.endTime,
      })}
      rewardLabel={offerState?.rewardLabel}
      claimProgress={friendsProgress}
      claimBefore={campaign.endDate}
      redeemBefore={offerState?.redeemBefore ?? undefined}
    />
  )
}

function GroupUnlockCampaignBlock({
  campaign,
  offerState,
}: {
  campaign: {
    id: string
    name: string
    mechanic: string
    startDate: string
    endDate: string
    startTime?: string
    endTime?: string
  }
  offerState?: {
    rewardLabel?: string
    canClaim?: boolean
    hasClaimed?: boolean
    unlocked?: boolean
    spotsRemaining?: number
    groupJoined?: number
    targetParticipants?: number
    redeemBefore?: string | null
    active?: boolean
  }
}) {
  const hasClaimed = Boolean(offerState?.hasClaimed)
  const canClaim = Boolean(offerState?.canClaim)
  const unlocked = Boolean(offerState?.unlocked)
  const claimHref = `/customer/campaigns/${campaign.id}`
  const outsideHours =
    offerState?.active === false
    && hasActiveHoursWindow(campaign.startTime, campaign.endTime)

  return (
    <CampaignListingCard
      campaign={campaign}
      href={hasClaimed ? `/customer/campaigns/${campaign.id}/groupunlock-status` : claimHref}
      rewardLabel={offerState?.rewardLabel}
      claimProgress={
        offerState?.groupJoined != null && offerState?.targetParticipants != null
          ? { current: offerState.groupJoined, total: offerState.targetParticipants, label: 'joined' }
          : undefined
      }
      claimBefore={campaign.endDate}
      redeemBefore={offerState?.redeemBefore ?? undefined}
      actions={
        <GroupUnlockCardActions
          campaignId={campaign.id}
          canClaim={canClaim}
          hasClaimed={hasClaimed}
          unlocked={unlocked}
          claimHref={claimHref}
          outsideHoursLabel={
            outsideHours
              ? activeHoursBlockedLabel(campaign.startTime, campaign.endTime)
              : undefined
          }
        />
      }
    />
  )
}

function LoyaltyCampaignBlock({
  campaign,
  state,
}: {
  campaign: { id: string; name: string; mechanic: string; startDate: string; endDate: string }
  state?: LoyaltyState
}) {
  const checkedInToday = state?.checkedInToday ?? false
  const pointsPer = state?.pointsPerCheckIn

  return (
    <CampaignListingCard
      campaign={campaign}
      href={checkedInToday ? '#' : `/customer/campaigns/${campaign.id}`}
      blocked={checkedInToday}
      blockedLabel={`✓ Checked in today · ${state?.loyaltyPoints ?? 0} pts`}
      titleAccessory={
        pointsPer != null ? (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
            +{pointsPer} pts
          </span>
        ) : state ? (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
            {state.loyaltyPoints} pts
          </span>
        ) : undefined
      }
      checkInPointsPer={pointsPer}
      checkInTotalPoints={state?.loyaltyPoints}
      playingToday={state?.playingToday}
    />
  )
}

function stateMapFromItems(items: BusinessCampaignStateItem[] | undefined) {
  const map = new Map<string, BusinessCampaignStateItem>()
  for (const item of items ?? []) map.set(item.campaignId, item)
  return map
}

function rewardAvailabilityLabel(reward: {
  maxClaims: number | null
  claimsCount: number
  availableCount: number | null
}) {
  if (reward.maxClaims != null) {
    return `${reward.claimsCount}/${reward.maxClaims} Claimed`
  }
  if (reward.availableCount != null) {
    return `${reward.availableCount} available`
  }
  return 'Available'
}

export function CustomerBusinessPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: businesses, isLoading, refetch } = useBusinessesWithCampaigns()
  const biz = businesses?.find(b => b.id === id)

  useBusinessCampaignStatesRealtime(id)

  const { data: campaignStates, isLoading: statesLoading } = useQuery({
    queryKey: ['business-campaign-states', id],
    queryFn: () => fetchBusinessCampaignStates(id!),
    enabled: Boolean(id && biz),
    staleTime: 0,
    refetchInterval: 15_000,
  })
  const [activeTab, setActiveTab] = useState<'campaigns' | 'rewards'>('campaigns')
  const { data: businessRewards } = useCustomerBusinessRewards(id)

  const stateByCampaignId = useMemo(
    () => stateMapFromItems(campaignStates),
    [campaignStates],
  )

  const claimableRewards = useMemo(
    () => (businessRewards?.rewards ?? []).filter(item => item.claimable),
    [businessRewards?.rewards],
  )
  const lockedRewards = useMemo(
    () => (businessRewards?.rewards ?? []).filter(item => !item.claimable),
    [businessRewards?.rewards],
  )

  const handleRefresh = async () => {
    await refetch()
    if (id) {
      await queryClient.invalidateQueries({ queryKey: ['business-campaign-states', id] })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-white">
        <Loader2 className="size-8 text-[#5b0e81] animate-spin" />
      </div>
    )
  }

  if (!biz) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-5 text-center bg-white">
        <p className="text-[#6b6461] font-semibold mb-4">Vendor not found</p>
        <button
          type="button"
          onClick={() => navigate('/customer')}
          className="text-[#5b0e81] text-sm font-semibold bg-transparent border-0 cursor-pointer"
        >
          ← Back home
        </button>
      </div>
    )
  }

  const stampCampaigns = biz.campaigns.filter(c => c.mechanic === 'stamp')
  const shakeCampaigns = biz.campaigns.filter(c => c.mechanic === 'shake')
  const spinCampaigns = biz.campaigns.filter(c => c.mechanic === 'spin')
  const diceCampaigns = biz.campaigns.filter(c => c.mechanic === 'dice')
  const lotteryCampaigns = biz.campaigns.filter(c => c.mechanic === 'lottery')
  const buyXGetYCampaigns = biz.campaigns.filter(c => c.mechanic === 'buy-x-get-y')
  const couponCampaigns = biz.campaigns.filter(c => c.mechanic === 'coupon')
  const flashCampaigns = biz.campaigns.filter(c => c.mechanic === 'flash')
  const comboCampaigns = biz.campaigns.filter(c => c.mechanic === 'combo')
  const friendCampaigns = biz.campaigns.filter(c => c.mechanic === 'friend')
  const groupUnlockCampaigns = biz.campaigns.filter(c => c.mechanic === 'groupunlock')
  const loyaltyCampaigns = biz.campaigns.filter(c => c.mechanic === 'check-in-loyalty')
  const otherCampaigns = biz.campaigns.filter(
    c => !['stamp', 'shake', 'spin', 'dice', 'lottery', 'buy-x-get-y', 'coupon', 'flash', 'combo', 'friend', 'groupunlock', 'check-in-loyalty'].includes(c.mechanic),
  )

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-dvh bg-white pb-[calc(5rem+env(safe-area-inset-bottom))]">
        <BusinessDetailHero biz={biz} points={businessRewards?.points ?? 0} />

        <BusinessTabBar activeTab={activeTab} onChange={setActiveTab} />

        <div className="flex w-full flex-col px-5">
          {activeTab === 'campaigns' ? (
          <LoyaltyCampaignSectionHeader count={biz.campaigns.length}>
            {biz.campaigns.length === 0 ? (
              <p className="text-sm text-[#99a1af] text-center py-12">No active campaigns right now.</p>
            ) : statesLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="size-6 text-[#5b0e81] animate-spin" />
              </div>
            ) : (
              <div className="flex flex-col gap-4 pb-4">
                {stampCampaigns.map(c => (
                  <StampCampaignBlock
                    key={c.id}
                    campaign={c}
                    stampState={stateByCampaignId.get(c.id)?.state as StampState | undefined}
                  />
                ))}
                {shakeCampaigns.map(c => (
                  <ShakeCampaignBlock
                    key={c.id}
                    campaign={c}
                    playState={stateByCampaignId.get(c.id)?.state as PlayState | undefined}
                  />
                ))}
                {spinCampaigns.map(c => (
                  <SpinCampaignBlock
                    key={c.id}
                    campaign={c}
                    playState={stateByCampaignId.get(c.id)?.state as PlayState | undefined}
                  />
                ))}
                {diceCampaigns.map(c => (
                  <DiceCampaignBlock
                    key={c.id}
                    campaign={c}
                    playState={stateByCampaignId.get(c.id)?.state as PlayState | undefined}
                  />
                ))}
                {lotteryCampaigns.map(c => (
                  <LotteryCampaignBlock
                    key={c.id}
                    campaign={c}
                    lotteryState={stateByCampaignId.get(c.id)?.state as {
                      drawDate?: string
                      hasTicket?: boolean
                      canClaimTicket?: boolean
                      totalTickets?: number
                      drawCompleted?: boolean
                      ticketCount?: number
                      playsUsedToday?: number
                      playsPerDay?: number
                      playsRemaining?: number
                      playingToday?: number
                    } | undefined}
                  />
                ))}
                {buyXGetYCampaigns.map(c => (
                  <BuyXGetYCampaignBlock
                    key={c.id}
                    campaign={c}
                    offerState={stateByCampaignId.get(c.id)?.state as {
                      rewardLabel?: string
                      canClaim?: boolean
                      hasClaimed?: boolean
                      spotsRemaining?: number
                      claimedCount?: number
                      userCap?: number
                      redeemBefore?: string | null
                      active?: boolean
                    } | undefined}
                  />
                ))}
                {couponCampaigns.map(c => (
                  <CouponCampaignBlock
                    key={c.id}
                    campaign={c}
                    offerState={stateByCampaignId.get(c.id)?.state as {
                      rewardLabel?: string
                      canClaim?: boolean
                      hasClaimed?: boolean
                      spotsRemaining?: number
                      claimedCount?: number
                      totalCoupons?: number
                      redeemBefore?: string | null
                      active?: boolean
                    } | undefined}
                  />
                ))}
                {flashCampaigns.map(c => (
                  <FlashCampaignBlock
                    key={c.id}
                    campaign={c}
                    offerState={stateByCampaignId.get(c.id)?.state as {
                      rewardLabel?: string
                      canClaim?: boolean
                      hasClaimed?: boolean
                      spotsRemaining?: number
                      claimedCount?: number
                      totalSlots?: number
                      redeemBefore?: string | null
                      active?: boolean
                    } | undefined}
                  />
                ))}
                {comboCampaigns.map(c => (
                  <ComboCampaignBlock
                    key={c.id}
                    campaign={c}
                    offerState={stateByCampaignId.get(c.id)?.state as {
                      rewardLabel?: string
                      canClaim?: boolean
                      hasClaimed?: boolean
                      spotsRemaining?: number
                      claimedCount?: number
                      totalSpots?: number
                      redeemBefore?: string | null
                      variant?: 'discount' | 'freeitem'
                      originalPrice?: number
                      bundlePrice?: number
                      active?: boolean
                    } | undefined}
                  />
                ))}
                {friendCampaigns.map(c => (
                  <FriendCampaignBlock
                    key={c.id}
                    campaign={c}
                    offerState={stateByCampaignId.get(c.id)?.state as {
                      rewardLabel?: string
                      canClaim?: boolean
                      hasClaimed?: boolean
                      spotsRemaining?: number
                      claimedCount?: number
                      userCap?: number
                      minFriends?: number
                      redeemBefore?: string | null
                      active?: boolean
                    } | undefined}
                  />
                ))}
                {groupUnlockCampaigns.map(c => (
                  <GroupUnlockCampaignBlock
                    key={c.id}
                    campaign={c}
                    offerState={stateByCampaignId.get(c.id)?.state as {
                      rewardLabel?: string
                      canClaim?: boolean
                      hasClaimed?: boolean
                      unlocked?: boolean
                      spotsRemaining?: number
                      groupJoined?: number
                      targetParticipants?: number
                      redeemBefore?: string | null
                      active?: boolean
                    } | undefined}
                  />
                ))}
                {loyaltyCampaigns.map(c => (
                  <LoyaltyCampaignBlock
                    key={c.id}
                    campaign={c}
                    state={stateByCampaignId.get(c.id)?.state as LoyaltyState | undefined}
                  />
                ))}
                {otherCampaigns.map(c => (
                  <CampaignListingCard
                    key={c.id}
                    campaign={c}
                    href={`/customer/campaigns/${c.id}`}
                    comingSoon
                    statsLine="Launching soon"
                  />
                ))}
              </div>
            )}
          </LoyaltyCampaignSectionHeader>
          ) : (
            <div className="flex flex-col gap-4 pb-4">
              <RewardsSectionHeader count={claimableRewards.length} />

              {claimableRewards.map((reward, index) => (
                <CustomerRewardCard
                  key={reward.id}
                  icon={reward.icon}
                  name={reward.name}
                  description={reward.description}
                  pointsRequired={reward.pointsRequired}
                  availabilityLabel={rewardAvailabilityLabel(reward)}
                  claimBefore={reward.claimBefore}
                  redeemBefore={reward.redeemBefore}
                  theme={getClaimableTheme(index)}
                  onClick={() => navigate(`/customer/rewards/${reward.id}/claim?businessId=${id}`)}
                />
              ))}

              {lockedRewards.length > 0 && (
                <>
                  <LockedRewardsSectionHeader />
                  {lockedRewards.map((reward, index) => (
                    <CustomerRewardCard
                      key={reward.id}
                      icon={reward.icon}
                      name={reward.name}
                      description={reward.description}
                      pointsRequired={reward.pointsRequired}
                      availabilityLabel={`${Math.max(0, reward.pointsRequired - (businessRewards?.points ?? 0))} pts needed`}
                      claimBefore={reward.claimBefore}
                      redeemBefore={reward.redeemBefore}
                      theme={getLockedTheme(index)}
                      locked
                    />
                  ))}
                </>
              )}

              {(businessRewards?.rewards ?? []).length === 0 && (
                <p className="py-12 text-center text-sm text-[#99a1af]">No rewards available yet.</p>
              )}
            </div>
          )}
        </div>

        <BottomNav />
      </div>
    </PullToRefresh>
  )
}
