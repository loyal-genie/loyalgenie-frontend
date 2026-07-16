import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Loader2, Ticket } from 'lucide-react'
import {
  claimLotteryWinToWallet,
  fetchLotteryState,
  getApiErrorMessage,
  type LotteryTicketDto,
} from '@/lib/api'
import { fmtCampaignDate } from '@/lib/campaign-dates'
import { getCampaignTheme, getPlayScreenBackground } from '@/lib/campaign-themes'
import { getUser } from '@/lib/auth'

function padTicketNo(n: number) {
  return String(n).padStart(4, '0')
}

function ticketStatusLabel(ticket: LotteryTicketDto, drawCompleted: boolean): {
  label: string
  tone: string
} {
  if (ticket.status === 'won') {
    if (ticket.walletRewardId) {
      return { label: 'Won · In wallet', tone: 'bg-emerald-100 text-emerald-800' }
    }
    return { label: 'Won · Claim to wallet', tone: 'bg-emerald-100 text-emerald-800' }
  }
  if (ticket.status === 'lost' || ticket.status === 'loss_viewed') {
    return { label: 'No win', tone: 'bg-gray-100 text-gray-600' }
  }
  if (drawCompleted) {
    return { label: 'Results pending', tone: 'bg-[#EDE9FE] text-[#4C3FA8]' }
  }
  return { label: 'Awaiting draw', tone: 'bg-[#EDE9FE] text-[#4C3FA8]' }
}

export function CustomerLotteryStatusPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const customerId = getUser('customer')?.userId
  const theme = getCampaignTheme('lottery')

  const { data: state, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['lottery-state', id, customerId],
    queryFn: () => fetchLotteryState(id!),
    enabled: Boolean(id) && Boolean(customerId),
  })

  const claimWinMutation = useMutation({
    mutationFn: (ticketId: string) => claimLotteryWinToWallet(ticketId),
    onSuccess: result => {
      void queryClient.invalidateQueries({ queryKey: ['lottery-state', id] })
      void queryClient.invalidateQueries({ queryKey: ['customer-rewards'] })
      navigate('/customer/wallet', {
        state: { highlightRewardId: result.walletRewardId },
      })
    },
  })

  const tickets = useMemo(() => state?.tickets ?? [], [state?.tickets])

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center" style={{ background: getPlayScreenBackground('lottery') }}>
        <Loader2 className="size-8 animate-spin" style={{ color: theme.accent }} />
      </div>
    )
  }

  if (isError || !state) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-3 px-6" style={{ background: getPlayScreenBackground('lottery') }}>
        <p className="text-sm text-v-text-2 text-center">
          {getApiErrorMessage(error, 'Could not load lottery status.')}
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="px-4 py-2 rounded-full text-white text-sm font-bold border-0 cursor-pointer"
          style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentTo})` }}
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div
      className="min-h-dvh max-w-[440px] mx-auto flex flex-col"
      style={{ background: getPlayScreenBackground('lottery') }}
    >
      <div
        className="relative px-4 pt-[max(3rem,env(safe-area-inset-top))] pb-5"
        style={{ background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accentTo} 100%)` }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute top-[max(3rem,env(safe-area-inset-top))] left-4 size-9 rounded-full bg-black/20 flex items-center justify-center border-0 cursor-pointer"
          aria-label="Go back"
        >
          <ArrowLeft className="size-4 text-white" />
        </button>
        <div className="pt-10 text-center text-white">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/75">Check Status</p>
          <h1 className="text-xl font-bold mt-1">{state.campaignName}</h1>
          <p className="text-sm text-white/80 mt-1">{state.businessName}</p>
          <p className="text-xs text-white/70 mt-2">
            Draw {fmtCampaignDate(state.drawDate)}
            {state.drawCompleted ? ' · Complete' : ''}
          </p>
        </div>
      </div>

      <div className="flex-1 px-4 py-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        {tickets.length === 0 ? (
          <div
            className="rounded-2xl bg-white p-6 text-center shadow-sm"
            style={{ border: `1px solid ${theme.accent}22` }}
          >
            <Ticket className="size-8 mx-auto" style={{ color: theme.accent }} />
            <p className="mt-3 text-sm font-semibold text-v-text">No tickets yet</p>
            <p className="mt-1 text-xs text-v-text-3">Claim a ticket with staff PIN to enter the draw.</p>
            {state.canClaimTicket && (
              <Link
                to={`/customer/campaigns/${state.campaignId}`}
                className="mt-4 inline-flex px-4 py-2.5 rounded-full text-white text-xs font-bold no-underline"
                style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentTo})` }}
              >
                Enter PIN & Claim
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs font-semibold px-1" style={{ color: `${theme.accentTo}B3` }}>
              Your tickets ({tickets.length})
            </p>
            {tickets.map(ticket => {
              const status = ticketStatusLabel(ticket, state.drawCompleted)
              const claiming = claimWinMutation.isPending && claimWinMutation.variables === ticket.id
              return (
                <div
                  key={ticket.id}
                  className="rounded-2xl bg-white p-4 shadow-sm"
                  style={{ border: `1px solid ${theme.accent}22` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-black" style={{ color: theme.accentTo }}>
                        #{padTicketNo(ticket.ticketNumber)}
                      </p>
                      <p className="text-[11px] text-v-text-3 mt-0.5">Serial {ticket.serialCode}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${status.tone}`}>
                      {status.label}
                    </span>
                  </div>

                  {ticket.status === 'won' && (
                    <div className="mt-3 rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-2">
                      <p className="text-sm font-semibold text-emerald-900">
                        {ticket.prizeIcon ?? '🎉'} {ticket.prizeName ?? 'You won!'}
                      </p>
                      {ticket.canClaimToWallet ? (
                        <button
                          type="button"
                          disabled={claimWinMutation.isPending}
                          onClick={() => claimWinMutation.mutate(ticket.id)}
                          className="mt-3 w-full py-2.5 rounded-full bg-emerald-600 text-white text-xs font-bold border-0 cursor-pointer disabled:opacity-60"
                        >
                          {claiming ? (
                            <span className="inline-flex items-center gap-2 justify-center">
                              <Loader2 className="size-3.5 animate-spin" /> Claiming…
                            </span>
                          ) : (
                            'Claim to Wallet'
                          )}
                        </button>
                      ) : (
                        <Link
                          to="/customer/wallet"
                          className="mt-3 flex w-full items-center justify-center py-2.5 rounded-full bg-emerald-600 text-white text-xs font-bold no-underline"
                        >
                          Open Wallet to Redeem →
                        </Link>
                      )}
                    </div>
                  )}

                  {(ticket.status === 'lost' || ticket.status === 'loss_viewed') && (
                    <p className="mt-3 text-xs text-v-text-3">
                      This ticket didn&apos;t win. Thanks for playing!
                    </p>
                  )}

                  {ticket.status === 'pending_draw' && !state.drawCompleted && (
                    <p className="mt-3 text-xs" style={{ color: `${theme.accentTo}CC` }}>
                      Waiting for draw on {fmtCampaignDate(state.drawDate)}.
                    </p>
                  )}
                </div>
              )
            })}

            {claimWinMutation.isError && (
              <p className="text-center text-xs text-red-600">
                {getApiErrorMessage(claimWinMutation.error, 'Could not claim win.')}
              </p>
            )}

            {state.canClaimTicket && (
              <Link
                to={`/customer/campaigns/${state.campaignId}`}
                className="flex w-full items-center justify-center py-3 rounded-full text-white text-xs font-bold no-underline"
                style={{
                  background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentTo})`,
                  boxShadow: `0 8px 20px ${theme.accent}4D`,
                }}
              >
                Enter PIN & Claim another
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
