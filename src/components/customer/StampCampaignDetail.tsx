import { ArrowLeft, Loader2 } from 'lucide-react'
import { PinKeypad } from '@/components/customer/PinKeypad'
import { StampLoyaltyGrid } from '@/components/customer/StampLoyaltyGrid'
import { getCustomerMechanicChipLabel } from '@/lib/customer-ui'
import type { PublicCampaign, StampState } from '@/lib/api'

interface StampCampaignDetailProps {
  campaign: PublicCampaign
  businessName: string
  stampState: StampState
  pin: string
  error?: string
  loading?: boolean
  onBack: () => void
  onKey: (digit: string) => void
  onDelete: () => void
  onSubmit: () => void
}

export function StampCampaignDetail({
  campaign,
  businessName,
  stampState,
  pin,
  error,
  loading,
  onBack,
  onKey,
  onDelete,
  onSubmit,
}: StampCampaignDetailProps) {
  const collected = stampState.stampsCollected
  const total = stampState.totalStamps
  const remaining = Math.max(0, total - collected)
  const progressPct = total > 0 ? Math.round((collected / total) * 100) : 0

  return (
    <div className="h-dvh flex flex-col bg-[#43036d] max-w-[440px] mx-auto overflow-hidden relative">
      <div className="relative shrink-0 px-4 pb-4 pt-[max(2.75rem,env(safe-area-inset-top))]">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(255,255,255,0.06) 10px, rgba(255,255,255,0.06) 20px)',
          }}
        />
        <div className="relative flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex size-9 items-center justify-center rounded-full border-0 bg-black/25 backdrop-blur-sm cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft className="size-4 text-white" />
          </button>
          <span className="rounded-full bg-[#fef3c7] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#92400e]">
            {getCustomerMechanicChipLabel('stamp')}
          </span>
        </div>
        <div className="relative mt-3">
          <span className="inline-flex rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#c084fc]">
            Surprise card
          </span>
          <h1 className="mt-1.5 text-xl font-extrabold leading-tight text-white">{campaign.name}</h1>
          <p className="mt-1 text-xs text-white/70">Every stamp gets you closer to your free reward.</p>
          <span className="mt-2 inline-flex items-center rounded-full bg-[#631cbb]/70 px-2.5 py-0.5 text-[11px] font-bold text-white">
            {collected} / {total} ★
          </span>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-[28px] bg-white shadow-[0_-8px_32px_rgba(0,0,0,0.12)]">
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-2">
          <p className="mb-3 text-xs text-[#6a7282]">Open me. You&apos;ll like what&apos;s inside.</p>

          <div className="relative mb-3 overflow-hidden rounded-2xl bg-[#43036d] p-4">
            <div className="pointer-events-none absolute bottom-[-28px] right-[-28px] size-[96px] rounded-full bg-[#631cbb]/50" />

            <div className="relative">
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[8px] tracking-widest text-[#c084fc]">LOYALTY CARD</p>
                  <p className="truncate text-sm font-bold text-white">{businessName}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[8px] text-[#c084fc]">STAMPS</p>
                  <p className="text-2xl font-bold leading-none text-[#e8b050]">
                    {collected}/{total}
                  </p>
                </div>
              </div>

              <StampLoyaltyGrid
                total={total}
                collected={collected}
                surpriseDrops={stampState.surpriseDrops}
                bigRewards={stampState.bigRewards}
                dropTriggers={stampState.dropTriggers}
              />

              <div className="mt-3 flex items-center justify-between gap-2">
                <p className="text-[10px] text-[#c084fc]">
                  {collected} collected · {remaining} more surprises await
                </p>
                <p className="text-[10px] font-semibold text-[#c084fc]">{progressPct}%</p>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[#e8b050] transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#f0ebf8] bg-[#faf8fc] px-3 py-2.5">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#43036d]">Progress</span>
              <span className="text-[10px] text-[#43036d]">{progressPct}% complete</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#f0ebf8]">
              <div
                className="h-full rounded-full bg-[#631cbb] transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            {collected > 0 ? (
              <div className="mt-2.5 flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-xl bg-[#43036d] text-sm">
                  ☕
                </div>
                <div>
                  <p className="text-[11px] font-bold text-[#43036d]">Stamp #{collected} earned</p>
                  <p className="text-[9px] text-[#9b59e8]">Today · at {businessName}</p>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-[11px] text-[#9b59e8]">Collect your first stamp today!</p>
            )}
          </div>
        </div>

        <div className="shrink-0 border-t border-[#f0ebf8] bg-[#faf8fc] px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <PinKeypad
            pin={pin}
            error={error}
            loading={loading}
            compact
            onKey={onKey}
            onDelete={onDelete}
            onSubmit={onSubmit}
            submitLabel="Collect stamp"
          />
        </div>
      </div>

      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20">
          <Loader2 className="size-10 text-[#43036d] animate-spin" />
        </div>
      )}
    </div>
  )
}
