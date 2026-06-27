import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { BottomNav } from '@/components/customer/bottom-nav'
import { BusinessDetailHero } from '@/components/customer/BusinessDetailHero'
import { PullToRefresh } from '@/components/customer/PullToRefresh'
import {
  CampaignListingCard,
  LoyaltyCampaignSectionHeader,
} from '@/components/customer/CampaignListingCard'
import { useBusinessesWithCampaigns, useBusinessCampaignStatesRealtime } from '@/hooks/useCustomerData'
import {
  fetchBusinessCampaignStates,
  type BusinessCampaignStateItem,
  type LoyaltyState,
  type PlayState,
  type StampState,
} from '@/lib/api'

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
      statsLine={
        playState
          ? `${playState.playsUsedToday}/${playState.playsPerDay} attempts today`
          : `${campaign.playsPerDay ?? 1} play per day`
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

  const stateByCampaignId = useMemo(
    () => stateMapFromItems(campaignStates),
    [campaignStates],
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
  const loyaltyCampaigns = biz.campaigns.filter(c => c.mechanic === 'check-in-loyalty')
  const otherCampaigns = biz.campaigns.filter(
    c => !['stamp', 'shake', 'check-in-loyalty'].includes(c.mechanic),
  )

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-dvh bg-white pb-[calc(5rem+env(safe-area-inset-bottom))]">
        <BusinessDetailHero biz={biz} />

        <div className="px-5">
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
        </div>

        <BottomNav />
      </div>
    </PullToRefresh>
  )
}
