import { Loader2, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getCustomerMechanicChipLabel } from '@/lib/customer-ui'
import { formatDate } from '@/lib/utils'
import type { CustomerRewardDto } from '@/lib/api'

interface WalletRewardCardProps {
  reward: CustomerRewardDto
  businessName?: string
  coverImage?: string
  variant?: 'grid' | 'horizontal'
  className?: string
  onRedeem?: (rewardId: string) => void
  redeeming?: boolean
}

export function WalletRewardCard({
  reward,
  businessName,
  coverImage,
  variant = 'grid',
  className,
  onRedeem,
  redeeming,
}: WalletRewardCardProps) {
  const mechanicLabel = getCustomerMechanicChipLabel(reward.mechanic)
  const expiry = formatDate(reward.earnedAt.slice(0, 10))
  const canRedeem = reward.status === 'earned' && onRedeem
  const isPending = reward.status === 'pending'

  const codeBlock = reward.code ? (
    <div className="mt-2 bg-[#f5f0ff] rounded-lg px-2.5 py-1.5">
      <p className="text-[8px] text-[#9b59e8] uppercase tracking-wide mb-0.5">Reward code</p>
      <p className="font-mono text-xs font-bold text-[#5b0e81] tracking-wider">{reward.code}</p>
    </div>
  ) : null

  const redeemButton = canRedeem ? (
    <button
      type="button"
      onClick={() => onRedeem(reward.id)}
      disabled={redeeming}
      className="mt-2 w-full py-2 rounded-full text-[10px] font-semibold text-white bg-[#5b0e81] border-0 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1"
    >
      {redeeming ? <Loader2 className="size-3 animate-spin" /> : 'Request redemption'}
    </button>
  ) : isPending ? (
    <p className="mt-2 text-[9px] font-medium text-[#92400e] bg-[#fef3c7] rounded-full px-2 py-1 text-center">
      Redemption pending — show code at counter
    </p>
  ) : null

  if (variant === 'horizontal') {
    return (
      <div
        className={cn(
          'relative bg-white rounded-[10px] shadow-[4px_4px_41px_7px_rgba(0,0,0,0.08)] overflow-hidden flex min-h-[132px]',
          className,
        )}
      >
        <div className="relative w-[149px] shrink-0 rounded-bl-[20px] rounded-tl-[20px] overflow-hidden">
          {coverImage ? (
            <img src={coverImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#5b0e81] to-[#92400e]" />
          )}
          <div className="absolute inset-0 bg-black/50" />
          {businessName && (
            <span className="absolute top-2.5 left-2.5 bg-white rounded-xl px-2.5 py-1 text-[10px] text-black capitalize">
              {businessName}
            </span>
          )}
        </div>
        <div className="flex-1 p-3 flex flex-col justify-center min-w-0">
          <span className="inline-flex self-start bg-[#5b0e81] text-white text-[8px] px-2.5 py-0.5 rounded-[10px] mb-2 capitalize">
            {mechanicLabel}
          </span>
          <p className="text-xs font-semibold text-[#2b2827] truncate">{reward.reward}</p>
          <div className="flex items-center gap-1 text-[10px] text-[#6b6461] mt-1">
            <MapPin className="size-3 shrink-0" />
            <span className="truncate">{reward.campaignName}</span>
          </div>
          {codeBlock}
          {redeemButton}
          <p className="text-[8px] text-[#909090] text-right mt-auto pt-1">Earned {expiry}</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'bg-white rounded-[10px] shadow-[4px_4px_4px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col',
        className,
      )}
    >
      <div className="relative h-24 shrink-0">
        {coverImage ? (
          <img src={coverImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#5b0e81] to-[#431407]" />
        )}
        <div className="absolute inset-0 bg-black/33" />
        {businessName && (
          <span className="absolute top-3 left-2.5 bg-white rounded-xl px-2.5 py-1 text-[10px] text-black capitalize">
            {businessName}
          </span>
        )}
        <span className="absolute bottom-2 right-2 size-6 rounded-full bg-[#fff5f0] flex items-center justify-center text-[10px]">
          {reward.icon || '🎁'}
        </span>
      </div>
      <div className="p-2.5 flex flex-col flex-1">
        <span className="inline-flex self-start bg-[#5b0e81] text-white text-[8px] px-2.5 py-0.5 rounded-[10px] mb-1 capitalize">
          {mechanicLabel}
        </span>
        <p className="text-xs font-semibold text-[#2b2827] line-clamp-2">{reward.reward}</p>
        {codeBlock}
        {redeemButton}
        <p className="text-[8px] text-[#909090] text-right mt-auto pt-1">Earned {expiry}</p>
      </div>
    </div>
  )
}
