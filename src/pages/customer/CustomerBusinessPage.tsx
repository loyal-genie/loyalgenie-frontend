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
  LotteryCardActions,
  LoyaltyCampaignSectionHeader,
} from '@/components/customer/CampaignListingCard'
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
import { formatCampaignDayMonth } from '@/lib/customer-ui'

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
    stampState?.enrolled && stampState.totalStamps
      ? `${stampState.stampsCollected}/${stampState.totalStamps} stamps collected`
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
      statsLine={
        stampState
          ? `${stampState.currentUsers}/${stampState.userCap} playing today`
          : undefined
      }
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
      blockedLabel={
        quotaUsed
          ? `✓ All plays used today · ${playState!.playsUsedToday}/${playState!.playsPerDay}`
          : playState?.message
      }
      playingToday={playState?.playingToday}
      statsLine={
        playState
          ? `${playState.playsUsedToday}/${playState.playsPerDay} attempts today`
          : `${campaign.playsPerDay ?? 1} play per day`
      }
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
      blockedLabel={
        quotaUsed
          ? `✓ All spins used today · ${playState!.playsUsedToday}/${playState!.playsPerDay}`
          : playState?.message
      }
      playingToday={playState?.playingToday}
      statsLine={
        playState
          ? `${playState.playsUsedToday}/${playState.playsPerDay} spins today`
          : `${campaign.playsPerDay ?? 1} spin per day`
      }
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
      blockedLabel={
        quotaUsed
          ? `✓ All rolls used today · ${playState!.playsUsedToday}/${playState!.playsPerDay}`
          : playState?.message
      }
      playingToday={playState?.playingToday}
      statsLine={
        playState
          ? `${playState.playsUsedToday}/${playState.playsPerDay} rolls today`
          : `${campaign.playsPerDay ?? 1} roll per day`
      }
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
  const drawLabel = formatCampaignDayMonth(lotteryState?.drawDate ?? campaign.endDate)
  const ticketCount = lotteryState?.ticketCount ?? 0
  const playsPerDay = lotteryState?.playsPerDay ?? campaign.playsPerDay ?? 1
  const playsUsedToday = lotteryState?.playsUsedToday ?? 0
  const entriesClosed = Boolean(lotteryState && !canClaim && !hasTicket)

  const statsLine = lotteryState?.drawCompleted
    ? `Draw complete · ${ticketCount} ticket${ticketCount === 1 ? '' : 's'}`
    : hasTicket
      ? `${ticketCount} ticket${ticketCount === 1 ? '' : 's'} · ${playsUsedToday}/${playsPerDay} today · Draw ${drawLabel}`
      : `Draw on ${drawLabel}${lotteryState?.totalTickets ? ` · ${lotteryState.totalTickets} entered` : ''}`

  return (
    <CampaignListingCard
      campaign={campaign}
      href={`/customer/campaigns/${campaign.id}`}
      blocked={entriesClosed}
      blockedLabel={lotteryState?.drawCompleted ? 'Draw complete' : 'Entries closed'}
      playingToday={lotteryState?.playingToday}
      statsLine={statsLine}
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
  }
  offerState?: {
    rewardLabel?: string
    canClaim?: boolean
    hasClaimed?: boolean
    spotsRemaining?: number
    active?: boolean
  }
}) {
  const blocked = Boolean(offerState && !offerState.canClaim && !offerState.hasClaimed)

  return (
    <CampaignListingCard
      campaign={campaign}
      href={`/customer/campaigns/${campaign.id}`}
      blocked={blocked}
      blockedLabel={offerState?.hasClaimed ? 'Already claimed' : 'Offer closed'}
      statsLine={
        offerState?.hasClaimed
          ? `✓ Claimed · ${offerState.rewardLabel ?? 'Reward'}`
          : `${offerState?.rewardLabel ?? 'Reward'}${offerState?.spotsRemaining != null ? ` · ${offerState.spotsRemaining} left` : ''}`
      }
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
  }
  offerState?: {
    rewardLabel?: string
    canClaim?: boolean
    hasClaimed?: boolean
    spotsRemaining?: number
    active?: boolean
  }
}) {
  // Claimed or sold out → show status on card (no PIN / details navigation)
  const blocked = Boolean(offerState && !offerState.canClaim)

  return (
    <CampaignListingCard
      campaign={campaign}
      href={`/customer/campaigns/${campaign.id}`}
      blocked={blocked}
      blockedLabel={offerState?.hasClaimed ? 'Already claimed' : 'Coupons gone'}
      statsLine={
        offerState?.hasClaimed
          ? `✓ Claimed · ${offerState.rewardLabel ?? 'Coupon'}`
          : `${offerState?.rewardLabel ?? 'Coupon'}${offerState?.spotsRemaining != null ? ` · ${offerState.spotsRemaining} left` : ''}`
      }
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
  }
  offerState?: {
    rewardLabel?: string
    canClaim?: boolean
    hasClaimed?: boolean
    spotsRemaining?: number
    active?: boolean
  }
}) {
  const blocked = Boolean(offerState && !offerState.canClaim)

  return (
    <CampaignListingCard
      campaign={campaign}
      href={`/customer/campaigns/${campaign.id}`}
      blocked={blocked}
      blockedLabel={offerState?.hasClaimed ? 'Already claimed' : 'Spots gone'}
      statsLine={
        offerState?.hasClaimed
          ? `✓ Claimed · ${offerState.rewardLabel ?? 'Flash Deal'}`
          : `${offerState?.rewardLabel ?? 'Flash Deal'}${offerState?.spotsRemaining != null ? ` · ${offerState.spotsRemaining} left` : ''}`
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
  }
  offerState?: {
    rewardLabel?: string
    canClaim?: boolean
    hasClaimed?: boolean
    spotsRemaining?: number
    active?: boolean
  }
}) {
  // Claimed or sold out → show status on card (no PIN / details navigation)
  const blocked = Boolean(offerState && !offerState.canClaim)

  return (
    <CampaignListingCard
      campaign={campaign}
      href={`/customer/campaigns/${campaign.id}`}
      blocked={blocked}
      blockedLabel={offerState?.hasClaimed ? 'Already claimed' : 'Spots gone'}
      statsLine={
        offerState?.hasClaimed
          ? `✓ Claimed · ${offerState.rewardLabel ?? 'Combo Deal'}`
          : `${offerState?.rewardLabel ?? 'Combo Deal'}${offerState?.spotsRemaining != null ? ` · ${offerState.spotsRemaining} left` : ''}`
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
  }
  offerState?: {
    rewardLabel?: string
    canClaim?: boolean
    hasClaimed?: boolean
    spotsRemaining?: number
    active?: boolean
  }
}) {
  const blocked = Boolean(offerState && !offerState.canClaim)

  return (
    <CampaignListingCard
      campaign={campaign}
      href={`/customer/campaigns/${campaign.id}`}
      blocked={blocked}
      blockedLabel={offerState?.hasClaimed ? 'Already claimed' : 'Claims full'}
      statsLine={
        offerState?.hasClaimed
          ? `✓ Claimed · ${offerState.rewardLabel ?? 'Bring a Friend'}`
          : `${offerState?.rewardLabel ?? 'Bring a Friend'}${offerState?.spotsRemaining != null ? ` · ${offerState.spotsRemaining} left` : ''}`
      }
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
  }
  offerState?: {
    rewardLabel?: string
    canClaim?: boolean
    hasClaimed?: boolean
    spotsRemaining?: number
    groupJoined?: number
    targetParticipants?: number
    active?: boolean
  }
}) {
  const blocked = Boolean(offerState && !offerState.canClaim)

  return (
    <CampaignListingCard
      campaign={campaign}
      href={`/customer/campaigns/${campaign.id}`}
      blocked={blocked}
      blockedLabel={offerState?.hasClaimed ? 'Already reserved' : 'Spots gone'}
      statsLine={
        offerState?.hasClaimed
          ? `✓ Reserved · ${offerState.rewardLabel ?? 'Community Offer'}`
          : `${offerState?.rewardLabel ?? 'Community Offer'}${offerState?.spotsRemaining != null ? ` · ${offerState.spotsRemaining} left` : ''}`
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

  return (
    <CampaignListingCard
      campaign={campaign}
      href={checkedInToday ? '#' : `/customer/campaigns/${campaign.id}`}
      blocked={checkedInToday}
      blockedLabel={`✓ Checked in today · ${state?.loyaltyPoints ?? 0} pts`}
      extraBadge={state ? `${state.loyaltyPoints} pts` : undefined}
      statsLine={state ? `${state.loyaltyPoints} pts · ${state.currentUsers}/${state.userCap} players` : undefined}
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
                      spotsRemaining?: number
                      groupJoined?: number
                      targetParticipants?: number
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
