import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import {
  getCampaignGradient,
  getMechanicHeaderChipShort,
  isWalletRewardPastRedeem,
  walletExpiryChip,
  walletFmtDateTime,
  walletTimeAgo,
} from '@/lib/customer-ui'
import type { CustomerRewardDto } from '@/lib/api'
import { renderRewardIcon } from '@/components/vendor/IconPicker'

export interface WalletCardContext {
  businessName: string
  businessEmoji?: string
  bgFrom?: string
  bgTo?: string
  expiresAt?: string | null
}

interface WalletActiveCardProps {
  reward: CustomerRewardDto
  context: WalletCardContext
  index: number
  isRedeemed: boolean
  redeemedAt: string | null
  redeeming?: boolean
  onRedeem: () => void
  onCheckLotteryStatus?: () => void
  onDismissLotteryLoss?: () => void
  onExpiredStatus?: () => void
}

const EXPIRED_COVER_FROM = '#7F1D1D'
const EXPIRED_COVER_TO = '#B91C1C'

export function WalletActiveCard({
  reward,
  context,
  index,
  isRedeemed,
  redeemedAt,
  redeeming,
  onRedeem,
  onCheckLotteryStatus,
  onDismissLotteryLoss,
  onExpiredStatus,
}: WalletActiveCardProps) {
  const meta = getCampaignGradient(reward.mechanic)
  const isExpired =
    !isRedeemed
    && (reward.status === 'expired' || isWalletRewardPastRedeem(context.expiresAt ?? reward.redeemBefore))
  const bgFrom = isExpired ? EXPIRED_COVER_FROM : (context.bgFrom ?? meta.from)
  const bgTo = isExpired ? EXPIRED_COVER_TO : (context.bgTo ?? meta.to)
  const chip = walletExpiryChip(context.expiresAt)
  const urgent = !isExpired && chip?.style.color === '#DC2626'
  const isLotteryPending = reward.status === 'lottery_pending'
  const isLotteryLost = reward.status === 'lottery_lost'
  const canRedeem = !isExpired && (reward.status === 'earned' || reward.status === 'pending')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22, delay: index * 0.07 }}
      layout
    >
      <div
        className="rounded-3xl overflow-hidden"
        style={{
          boxShadow: isRedeemed
            ? '0 4px 20px rgba(34,197,94,0.20)'
            : isExpired || urgent
              ? '0 4px 20px rgba(239,68,68,0.20)'
              : '0 4px 16px rgba(0,0,0,0.09)',
        }}
      >
        <div
          className="relative px-4 pt-4 pb-4 overflow-hidden"
          style={{
            background: isRedeemed
              ? 'linear-gradient(145deg, #052E16, #14532D)'
              : `linear-gradient(145deg, ${bgFrom}, ${bgTo})`,
          }}
        >
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '18px 18px',
            }}
          />

          <div className="relative flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0 pr-2">
              <p className="text-white/55 text-[10px] font-semibold uppercase tracking-widest truncate">
                {context.businessName}
              </p>
              <p className="text-white/50 text-[10px] mt-0.5 truncate">{reward.campaignName}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span
                className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgba(0,0,0,0.28)', color: 'rgba(255,255,255,0.85)' }}
              >
                {getMechanicHeaderChipShort(reward.mechanic)}
              </span>
              <span className="text-lg leading-none">
                {context.businessEmoji ?? (reward.icon?.length <= 2 ? reward.icon : null) ?? meta.emoji}
                {reward.icon && reward.icon.length > 2 && <span className="inline-flex">{renderRewardIcon(reward.icon, 'h-4 w-4', '#ffffff')}</span>}
              </span>
            </div>
          </div>

          <p className="relative text-white text-lg font-extrabold leading-tight mb-3">{reward.reward}</p>

          {isRedeemed ? (
            <div className="relative flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-green-400 flex items-center justify-center shrink-0">
                <span className="text-white font-black text-xs">✓</span>
              </div>
              <div>
                <p className="text-green-300 text-xs font-extrabold">Redeemed</p>
                <p className="text-green-400/60 text-[10px]">{walletFmtDateTime(redeemedAt!)}</p>
              </div>
            </div>
          ) : (
            <div className="relative flex items-center justify-between gap-2">
              {chip && !isLotteryPending && !isLotteryLost && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={chip.style}>
                  {chip.text}
                </span>
              )}
              {isLotteryPending && onCheckLotteryStatus && (
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  type="button"
                  onClick={onCheckLotteryStatus}
                  className="ml-auto px-4 py-1.5 rounded-xl text-[12px] font-extrabold border-0 cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.95)', color: bgFrom }}
                >
                  Check status →
                </motion.button>
              )}
              {isLotteryLost && onDismissLotteryLoss && (
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  type="button"
                  onClick={onDismissLotteryLoss}
                  className="ml-auto px-4 py-1.5 rounded-xl text-[12px] font-extrabold border-0 cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.95)', color: bgFrom }}
                >
                  Got it
                </motion.button>
              )}
              {isExpired && onExpiredStatus && (
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  type="button"
                  onClick={onExpiredStatus}
                  className="ml-auto px-4 py-1.5 rounded-xl text-[12px] font-extrabold border-0 cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.95)', color: EXPIRED_COVER_FROM }}
                >
                  Status →
                </motion.button>
              )}
              {canRedeem && (
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  type="button"
                  onClick={onRedeem}
                  disabled={redeeming}
                  className="ml-auto px-4 py-1.5 rounded-xl text-[12px] font-extrabold border-0 cursor-pointer disabled:opacity-70 flex items-center gap-1.5"
                  style={{ background: 'rgba(255,255,255,0.95)', color: bgFrom }}
                >
                  {redeeming && <Loader2 className="size-3 animate-spin" />}
                  {reward.status === 'pending' ? 'Show code →' : 'Redeem →'}
                </motion.button>
              )}
            </div>
          )}
        </div>

        {!isRedeemed && (
          <div className={`px-4 py-2.5 ${isExpired ? 'bg-red-50' : 'bg-white'}`}>
            <p className={`text-[10px] ${isExpired ? 'text-red-600 font-medium' : 'text-gray-400'}`}>
              {isExpired
                ? 'This reward expired before it could be redeemed.'
                : isLotteryPending
                  ? `Ticket · Draw ${reward.lottery?.drawDate ?? 'pending'}`
                  : isLotteryLost
                    ? 'Better luck next time'
                    : `Won ${walletTimeAgo(reward.earnedAt)}`}
            </p>
          </div>
        )}
        {isRedeemed && (
          <div className="bg-green-50 px-4 py-2">
            <p className="text-[10px] text-green-600 font-medium">
              Thanks for visiting {context.businessName}! 🎉
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
