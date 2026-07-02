import { Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { renderRewardIcon } from '@/components/vendor/IconPicker'

type RewardPreviewCardProps = {
  icon: string
  name: string
  description: string
  pointsRequired: number | string
  availableRewards: number | string
  expiryLabel: string
  variant?: 'create' | 'list'
  claimBefore?: string
  claimedCount?: number
  maxClaims?: number | null
  redemptionInstructions?: string
  className?: string
  onEdit?: () => void
  onDelete?: () => void
}

function formatClaimBefore(value?: string) {
  if (!value) return '31 Dec 2026'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function RewardPreviewCard({
  icon,
  name,
  description,
  pointsRequired,
  availableRewards,
  expiryLabel,
  variant = 'create',
  claimBefore,
  claimedCount = 0,
  maxClaims,
  redemptionInstructions,
  className,
  onEdit,
  onDelete,
}: RewardPreviewCardProps) {
  const isList = variant === 'list'
  const progress = maxClaims && maxClaims > 0
    ? Math.min(100, (claimedCount / maxClaims) * 100)
    : 0
  const claimedLabel = maxClaims != null ? `${claimedCount}/${maxClaims}` : `${claimedCount}`

  return (
    <div className={cn('w-full overflow-hidden rounded-2xl border border-[#e5e0f8] bg-white', className)}>
      <div className="relative bg-[#e5e3f4] px-4 pb-3 pt-3">
        <div className="flex justify-end">
          <span className="rounded-full bg-[rgba(39,255,100,0.33)] px-[18px] py-1 text-[10px] font-medium text-[#0a6122]">
            Active
          </span>
        </div>

        <div className="flex justify-center py-3">
          <span className="text-4xl leading-none">{renderRewardIcon(icon)}</span>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-[10px] font-medium text-black">
            {isList ? `Claim Before : ${formatClaimBefore(claimBefore)}` : `Expires: ${expiryLabel}`}
          </p>
          <div className="flex items-center gap-3 text-[#090611]">
            {onEdit && (
              <button
                type="button"
                onClick={e => { e.stopPropagation(); onEdit() }}
                className="rounded p-0.5 transition-colors hover:text-v-purple"
                aria-label="Edit reward"
              >
                <Pencil className="h-4 w-4" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={e => { e.stopPropagation(); onDelete() }}
                className="rounded p-0.5 transition-colors hover:text-v-danger"
                aria-label="Delete reward"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            {!onEdit && !onDelete && (
              <>
                <Pencil className="h-4 w-4" />
                <Trash2 className="h-4 w-4" />
              </>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-black">{name || 'Reward Name'}</p>
          {(description || !isList) && (
            <p className="mt-1 text-[10px] leading-snug text-[#928d8d]">
              {description || 'Reward description will appear here'}
            </p>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <StatChip label="Points Required" value={pointsRequired} />
          <StatChip label={isList ? 'Available Rewards' : 'Available Rewards'} value={availableRewards} />
        </div>

        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-[10px] font-medium text-[#6c68a7]">
            <span>{isList ? 'Claimed' : 'Redeemed'}</span>
            <span>{isList ? claimedLabel : ''}</span>
          </div>
          {isList && (
            <div className="h-1.5 rounded-full bg-[#e5e3f4]">
              <div className="h-1.5 rounded-full bg-[#27ff64]" style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>

        {!isList && (
          <div className="mt-4 rounded-[10px] border border-[#8b7cfb] bg-[rgba(228,235,255,0.38)] px-4 py-3">
            <p className="text-xs font-medium text-[#6c68a7]">How to Redeem</p>
            <p className="mt-1 text-[10px] leading-relaxed text-[rgba(108,104,167,0.54)]">
              {redemptionInstructions || 'Redemption instructions will appear here'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function StatChip({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex h-11 items-center justify-between rounded-[20px] bg-[rgba(229,227,244,0.34)] px-3">
      <span className="text-[10px] font-medium text-[#b7aed1]">{label}</span>
      <span className="flex h-10 w-10 items-center justify-center rounded-[20px] bg-white text-[15px] font-medium text-[#7c3aed]">
        {value}
      </span>
    </div>
  )
}
