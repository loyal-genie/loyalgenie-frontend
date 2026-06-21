import { useNavigate, useParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { BottomNav } from '@/components/customer/bottom-nav'
import { BusinessDetailHero } from '@/components/customer/BusinessDetailHero'
import {
  CampaignListingCard,
  LoyaltyCampaignSectionHeader,
} from '@/components/customer/CampaignListingCard'
import { useBusinessesWithCampaigns } from '@/hooks/useCustomerData'
import { fetchLoyaltyState, fetchPlayState, fetchStampState } from '@/lib/api'

function StampCampaignBlock({
  campaign,
}: {
  campaign: { id: string; name: string; mechanic: string; startDate: string; endDate: string }
}) {
  const { data: stampState, isLoading } = useQuery({
    queryKey: ['stamp-state', campaign.id],
    queryFn: () => fetchStampState(campaign.id),
  })

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
        isLoading || !stampState
          ? undefined
          : `${stampState.currentUsers}/${stampState.userCap} playing today`
      }
    />
  )
}

function ShakeCampaignBlock({
  campaign,
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
}) {
  const { data: playState } = useQuery({
    queryKey: ['play-state', campaign.id],
    queryFn: () => fetchPlayState(campaign.id),
  })

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
}: {
  campaign: { id: string; name: string; mechanic: string; startDate: string; endDate: string }
}) {
  const { data: state } = useQuery({
    queryKey: ['loyalty-state', campaign.id],
    queryFn: () => fetchLoyaltyState(campaign.id),
  })

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

export function CustomerBusinessPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: businesses, isLoading } = useBusinessesWithCampaigns()
  const biz = businesses?.find(b => b.id === id)

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
    <div className="min-h-dvh bg-white pb-[calc(5rem+env(safe-area-inset-bottom))]">
      <BusinessDetailHero biz={biz} onBack={() => navigate('/customer')} />

      <div className="px-5">
        <LoyaltyCampaignSectionHeader count={biz.campaigns.length}>
          {biz.campaigns.length === 0 ? (
            <p className="text-sm text-[#99a1af] text-center py-12">No active campaigns right now.</p>
          ) : (
            <div className="flex flex-col gap-4 pb-4">
              {stampCampaigns.map(c => (
                <StampCampaignBlock key={c.id} campaign={c} />
              ))}
              {shakeCampaigns.map(c => (
                <ShakeCampaignBlock key={c.id} campaign={c} />
              ))}
              {loyaltyCampaigns.map(c => (
                <LoyaltyCampaignBlock key={c.id} campaign={c} />
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
  )
}
