import { Gift, Ticket } from 'lucide-react'
import { CampaignPinDetailShell, CampaignDetailCoverChip } from '@/components/customer/CampaignPinDetailShell'
import { PinKeypad } from '@/components/customer/PinKeypad'
import { getCampaignTheme } from '@/lib/campaign-themes'
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
  const theme = getCampaignTheme('coupon')
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
    <CampaignPinDetailShell
      mechanic="coupon"
      title={campaign.name}
      subtitle="Claim a limited coupon and redeem at the counter."
      onBack={onBack}
      loading={loading && !hasClaimed}
      coverExtra={
        remaining != null && total != null ? (
          <CampaignDetailCoverChip>{remaining} of {total} left</CampaignDetailCoverChip>
        ) : undefined
      }
      footer={
        hasClaimed ? (
          <div className="rounded-2xl bg-white p-4 text-center">
            <p className="text-sm font-semibold" style={{ color: theme.accent }}>Already claimed</p>
            <p className="mt-1 text-xs text-[#6a7282]">Check your wallet to redeem.</p>
          </div>
        ) : (
          <PinKeypad
            pin={pin}
            error={error}
            loading={loading}
            compact
            onKey={onKey}
            onDelete={onDelete}
            onSubmit={onSubmit}
            submitLabel="Claim coupon"
            submitColor={theme.accent}
          />
        )
      }
    >
      <div
        className="relative overflow-hidden rounded-2xl border border-teal-100 p-4"
        style={{ background: 'linear-gradient(160deg, #fffbeb 0%, #fef3c7 60%, #fde68a 100%)' }}
      >
        <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-800/65">
          <Gift className="size-3.5" /> Your coupon
        </p>
        <p className="text-2xl font-black tracking-tight text-teal-950">{rewardName}</p>
        {terms ? (
          <div className="mt-3 rounded-xl border border-amber-700/10 bg-white/55 px-3 py-2.5">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-amber-900/55">Terms</p>
            <p className="whitespace-pre-wrap text-xs leading-relaxed text-teal-950/85">{terms}</p>
          </div>
        ) : null}
        {remaining != null && total != null && (
          <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-teal-900/70">
            <Ticket className="size-3.5" /> {remaining} of {total} left
          </p>
        )}
      </div>
    </CampaignPinDetailShell>
  )
}
