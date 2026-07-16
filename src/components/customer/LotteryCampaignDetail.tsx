import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Gift, Ticket, Users } from 'lucide-react'
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
  businessName?: string
  onBack: () => void
  onKey: (digit: string) => void
  onDelete: () => void
  onSubmit: () => void
}

function LotteryDetailStat({
  icon,
  label,
  value,
  accent,
}: {
  icon: ReactNode
  label: string
  value: string
  accent: string
}) {
  return (
    <div
      className="rounded-xl bg-white px-3 py-2.5"
      style={{ border: `1px solid ${accent}18` }}
    >
      <p className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
        {icon}
        {label}
      </p>
      <p className="text-sm font-bold text-gray-900 leading-tight">{value}</p>
    </div>
  )
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
  businessName,
  onBack,
  onKey,
  onDelete,
  onSubmit,
}: LotteryCampaignDetailProps) {
  const theme = getCampaignTheme('lottery')
  const prizes = (campaign.lotteryConfig?.prizes ?? campaign.rewards.map((r, i) => ({
    tier: (r.tier === 'jackpot' ? 'jackpot' : 'prize') as 'jackpot' | 'prize',
    name: r.description || (r.tier === 'jackpot' ? 'Grand Prize' : `Prize ${i + 1}`),
    reward: r.name,
    icon: r.icon,
  }))).slice().sort((a, b) => {
    if (a.tier === 'jackpot' && b.tier !== 'jackpot') return -1
    if (b.tier === 'jackpot' && a.tier !== 'jackpot') return 1
    return 0
  })
  const draw = drawDate ?? campaign.drawDate ?? campaign.endDate
  const showPin = Boolean(canClaimTicket)
  const showYourTickets = hasTicket && ticketCount > 0
  const showClaimsToday = playsPerDay != null && playsRemaining != null

  return (
    <CampaignPinDetailShell
      mechanic="lottery"
      title={campaign.name}
      subtitle="Enter for a chance at big rewards."
      businessName={businessName}
      onBack={onBack}
      loading={loading}
      coverExtra={
        showYourTickets ? (
          <CampaignDetailCoverChip>
            ✓ {ticketCount} ticket{ticketCount === 1 ? '' : 's'} entered
          </CampaignDetailCoverChip>
        ) : showClaimsToday && playsRemaining === 0 ? (
          <CampaignDetailCoverChip>No claims left today</CampaignDetailCoverChip>
        ) : undefined
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
              submitLabel="Claim Now"
              submitColor={theme.accent}
              submitColorTo={theme.accentTo}
            />
            {hasTicket && (
              <Link
                to={`/customer/campaigns/${campaign.id}/lottery-status`}
                className="flex w-full items-center justify-center rounded-full border py-2.5 text-xs font-bold no-underline"
                style={{
                  borderColor: `${theme.accent}44`,
                  background: `${theme.accent}0C`,
                  color: theme.accent,
                }}
              >
                Check Status
              </Link>
            )}
          </div>
        ) : (
          <div className="rounded-2xl bg-white p-4 text-center">
            <p className="text-sm font-semibold" style={{ color: theme.accent }}>
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
      <div className="space-y-4">
        <div
          className="rounded-2xl p-4"
          style={{ background: `${theme.accent}0C`, border: `1px solid ${theme.accent}22` }}
        >
          <p
            className="mb-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em]"
            style={{ color: theme.accent }}
          >
            <Ticket className="size-3.5" /> Draw details
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <LotteryDetailStat
              icon={<CalendarDays className="size-3" />}
              label="Draw date"
              value={formatCampaignDayMonth(draw)}
              accent={theme.accent}
            />
            {totalTickets != null && (
              <LotteryDetailStat
                icon={<Users className="size-3" />}
                label="Pool"
                value={`${totalTickets} ticket${totalTickets === 1 ? '' : 's'}`}
                accent={theme.accent}
              />
            )}
            {showYourTickets && (
              <LotteryDetailStat
                icon={<Ticket className="size-3" />}
                label="Your tickets"
                value={String(ticketCount)}
                accent={theme.accent}
              />
            )}
            {showClaimsToday && (
              <LotteryDetailStat
                icon={<Ticket className="size-3" />}
                label="Claims today"
                value={`${playsRemaining}/${playsPerDay} left`}
                accent={theme.accent}
              />
            )}
          </div>
        </div>

        {prizes.length > 0 && (
          <div
            className="rounded-2xl p-4"
            style={{ background: `${theme.accent}0C`, border: `1px solid ${theme.accent}22` }}
          >
            <p
              className="mb-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em]"
              style={{ color: theme.accent }}
            >
              <Gift className="size-3.5" /> Prizes up for grabs
            </p>
            <div className="space-y-2">
              {prizes.map((p, i) => (
                <div
                  key={`${p.name}-${i}`}
                  className="flex items-start gap-3 rounded-xl bg-white px-3 py-2.5 shadow-sm"
                >
                  <span className="text-lg leading-none pt-0.5 shrink-0">
                    {p.icon ?? (p.tier === 'jackpot' ? '👑' : '🎁')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 leading-snug">{p.name}</p>
                    <p className="mt-0.5 text-xs font-medium leading-snug" style={{ color: theme.accent }}>
                      {p.reward}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </CampaignPinDetailShell>
  )
}
