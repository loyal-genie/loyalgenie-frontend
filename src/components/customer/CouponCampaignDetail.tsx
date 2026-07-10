import { ArrowLeft, Gift, Loader2, Ticket } from 'lucide-react'
import { PinKeypad } from '@/components/customer/PinKeypad'
import { getCustomerMechanicChipLabel } from '@/lib/customer-ui'
import type { PublicCampaign } from '@/lib/api'
import { formatCouponRewardLabel } from '@/lib/coupon-campaign-config'

interface CouponCampaignDetailProps {
  campaign: PublicCampaign
  pin: string
  error?: string
  loading?: boolean
  hasClaimed?: boolean
  spotsRemaining?: number
  totalCoupons?: number
  onBack: () => void
  onKey: (digit: string) => void
  onDelete: () => void
  onSubmit: () => void
}

export function CouponCampaignDetail({
  campaign,
  pin,
  error,
  loading,
  hasClaimed,
  spotsRemaining,
  totalCoupons,
  onBack,
  onKey,
  onDelete,
  onSubmit,
}: CouponCampaignDetailProps) {
  const config = campaign.couponConfig
  const rewardName = config
    ? formatCouponRewardLabel({
        totalCoupons: config.totalCoupons,
        rewardKind: config.rewardKind,
        rewardValue: config.rewardValue,
        termsAndConditions: config.termsAndConditions ?? '',
      })
    : campaign.rewards[0]?.name ?? 'Coupon'
  const terms = config?.termsAndConditions?.trim() || ''
  const total = totalCoupons ?? config?.totalCoupons
  const remaining = spotsRemaining

  return (
    <div
      className="min-h-dvh flex flex-col relative max-w-[440px] mx-auto overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #14b8a6 0%, #0f766e 48%, #115e59 100%)' }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: 'radial-gradient(circle, white 1.2px, transparent 1.2px)',
          backgroundSize: '20px 20px',
        }}
      />

      <div className="relative shrink-0 px-4 pt-[max(3rem,env(safe-area-inset-top))] pb-2">
        <button
          type="button"
          onClick={onBack}
          className="absolute top-[max(3rem,env(safe-area-inset-top))] left-4 size-9 rounded-full bg-black/25 backdrop-blur-sm flex items-center justify-center border-0 cursor-pointer"
          aria-label="Go back"
        >
          <ArrowLeft className="size-4 text-white" />
        </button>
        <div className="absolute top-[max(3rem,env(safe-area-inset-top))] right-4 bg-white/95 px-2.5 py-0.5 rounded-full">
          <span className="text-[10px] font-bold text-teal-900">
            {getCustomerMechanicChipLabel('coupon')}
          </span>
        </div>
      </div>

      <div className="relative flex flex-col items-center px-5 pt-2 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div
          className="relative flex size-[84px] items-center justify-center rounded-[22px]"
          style={{
            background: 'linear-gradient(145deg, #fef3c7 0%, #fde68a 100%)',
            boxShadow: '0 10px 28px rgba(251,191,36,0.28)',
          }}
        >
          <Ticket className="size-9 text-amber-800" strokeWidth={2.2} />
        </div>

        <h1 className="mt-5 text-center text-xl font-extrabold text-white tracking-tight">{campaign.name}</h1>
        <p className="mt-1 text-center text-sm font-medium text-teal-100">Enter PIN to claim your coupon</p>

        <div
          className="relative mt-5 w-full overflow-hidden rounded-[22px]"
          style={{
            background: 'linear-gradient(160deg, #fffbeb 0%, #fef3c7 60%, #fde68a 100%)',
            boxShadow: '0 14px 32px rgba(0,0,0,0.18)',
          }}
        >
          <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 size-5 rounded-full bg-teal-800" />
          <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 size-5 rounded-full bg-teal-800" />

          <div className="relative px-5 py-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-800/65 mb-2 flex items-center gap-1.5">
              <Gift className="size-3.5" /> Your coupon
            </p>
            <p className="text-2xl font-black text-teal-950 tracking-tight">{rewardName}</p>

            {terms ? (
              <div className="mt-3 rounded-xl bg-white/55 border border-amber-700/10 px-3 py-2.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-900/55 mb-1">Terms</p>
                <p className="text-xs text-teal-950/85 leading-relaxed whitespace-pre-wrap">{terms}</p>
              </div>
            ) : null}

            {remaining != null && total != null && (
              <p className="text-xs font-semibold text-teal-900/70 mt-3">
                {remaining} of {total} left
              </p>
            )}
          </div>
        </div>

        <div className="mt-8 w-full">
          {hasClaimed ? (
            <div className="rounded-2xl bg-white/95 p-5 text-center">
              <p className="text-sm font-semibold text-teal-900">Already claimed</p>
              <p className="text-xs text-v-text-3 mt-1">Check your wallet to redeem.</p>
            </div>
          ) : (
            <>
              {error && <p className="mb-3 text-center text-sm text-red-100">{error}</p>}
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="size-7 animate-spin text-white" />
                </div>
              ) : (
                <PinKeypad pin={pin} onKey={onKey} onDelete={onDelete} onSubmit={onSubmit} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
