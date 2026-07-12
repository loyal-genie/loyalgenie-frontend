import { Link } from 'react-router-dom'
import { Gift, Ticket } from 'lucide-react'
import { CampaignPinDetailShell, CampaignDetailCoverChip } from '@/components/customer/CampaignPinDetailShell'
import { PinKeypad } from '@/components/customer/PinKeypad'
import { formatCampaignDayMonth } from '@/lib/customer-ui'
import { getCampaignTheme } from '@/lib/campaign-themes'
import type { PublicCampaign } from '@/lib/api'

interface LotteryCampaignDetailProps {
  campaign: PublicCampaign
  pin: string
  error?: string
  loading?: boolean
  hasTicket?: boolean
  canClaimTicket?: boolean
  ticketCount?: number
  playsRemaining?: number
  playsPerDay?: number
  drawDate?: string
  totalTickets?: number
  onBack: () => void
  onKey: (digit: string) => void
  onDelete: () => void
  onSubmit: () => void
}

export function LotteryCampaignDetail({
  campaign,
  pin,
  error,
  loading,
  hasTicket,
  canClaimTicket = true,
  ticketCount = 0,
  playsRemaining,
  playsPerDay,
  drawDate,
  totalTickets,
  onBack,
  onKey,
  onDelete,
  onSubmit,
}: LotteryCampaignDetailProps) {
  const theme = getCampaignTheme('lottery')
  const prizes = campaign.lotteryConfig?.prizes ?? campaign.rewards.map((r, i) => ({
    tier: (r.tier === 'jackpot' ? 'jackpot' : 'prize') as 'jackpot' | 'prize',
    name: r.description || (r.tier === 'jackpot' ? 'Grand Prize' : `Prize ${i + 1}`),
    reward: r.name,
    icon: r.icon,
  }))
  const draw = drawDate ?? campaign.drawDate ?? campaign.endDate
  const showPin = Boolean(canClaimTicket)

  return (
    <CampaignPinDetailShell
      mechanic="lottery"
      title={campaign.name}
      subtitle="Enter for a chance at big rewards."
      onBack={onBack}
      loading={loading}
      coverExtra={
        <>
          <CampaignDetailCoverChip>
            <Ticket className="mr-1 size-3" /> Draw {formatCampaignDayMonth(draw)}
          </CampaignDetailCoverChip>
          {totalTickets != null && totalTickets > 0 && (
            <CampaignDetailCoverChip>{totalTickets} tickets entered</CampaignDetailCoverChip>
          )}
          {hasTicket && (
            <CampaignDetailCoverChip>
              ✓ {ticketCount} ticket{ticketCount === 1 ? '' : 's'} claimed
            </CampaignDetailCoverChip>
          )}
          {playsPerDay != null && playsRemaining != null && (
            <CampaignDetailCoverChip>{playsRemaining}/{playsPerDay} left today</CampaignDetailCoverChip>
          )}
        </>
      }
      footer={
        showPin ? (
          <div className="space-y-2">
            <PinKeypad
              pin={pin}
              error={error}
              loading={loading}
              compact
              onKey={onKey}
              onDelete={onDelete}
              onSubmit={onSubmit}
              submitLabel="Claim ticket 🎟️"
              submitColor={theme.accent}
            />
            {hasTicket && (
              <Link
                to={`/customer/campaigns/${campaign.id}/lottery-status`}
                className="flex w-full items-center justify-center rounded-full border border-amber-200 bg-amber-50 py-2.5 text-xs font-bold text-amber-900 no-underline"
              >
                Check Status
              </Link>
            )}
          </div>
        ) : (
          <div className="rounded-2xl bg-white p-4 text-center">
            <p className="text-sm font-semibold text-amber-900">
              {hasTicket ? 'No claims left today' : 'Entries closed'}
            </p>
            <p className="mt-1 text-xs text-[#6a7282]">
              {hasTicket
                ? 'Come back tomorrow for another ticket, or check your tickets now.'
                : 'This lottery is no longer accepting entries.'}
            </p>
            {hasTicket && (
              <Link
                to={`/customer/campaigns/${campaign.id}/lottery-status`}
                className="mt-3 flex w-full items-center justify-center rounded-full py-2.5 text-xs font-bold text-white no-underline"
                style={{ backgroundColor: theme.accent }}
              >
                Check Status
              </Link>
            )}
          </div>
        )
      }
    >
      {prizes.length > 0 && (
        <div className="rounded-2xl border border-amber-100 bg-amber-50/80 p-4">
          <p className="mb-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-800/70">
            <Gift className="size-3.5" /> Prizes up for grabs
          </p>
          <div className="space-y-2">
            {prizes.map((p, i) => (
              <div
                key={`${p.name}-${i}`}
                className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2.5 shadow-sm"
              >
                <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-[#101828]">
                  <span>{p.icon ?? (p.tier === 'jackpot' ? '👑' : '🎁')}</span>
                  <span className="truncate">{p.name}</span>
                </span>
                <span className="shrink-0 text-xs font-medium text-amber-800">{p.reward}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </CampaignPinDetailShell>
  )
}
