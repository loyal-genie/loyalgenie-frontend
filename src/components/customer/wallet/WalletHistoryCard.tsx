import { motion } from 'framer-motion'
import {
  getCampaignGradient,
  getMechanicHeaderChipShort,
  walletFmtDateTime,
} from '@/lib/customer-ui'
import type { CustomerRewardDto } from '@/lib/api'
import type { WalletCardContext } from '@/components/customer/wallet/WalletActiveCard'
import { renderRewardIcon } from '@/components/vendor/IconPicker'

interface WalletHistoryCardProps {
  reward: CustomerRewardDto
  context: WalletCardContext
  index: number
}

export function WalletHistoryCard({ reward, context, index }: WalletHistoryCardProps) {
  const meta = getCampaignGradient(reward.mechanic)
  const bgFrom = context.bgFrom ?? meta.from
  const bgTo = context.bgTo ?? meta.to

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22, delay: index * 0.06 }}
    >
      <div className="rounded-3xl overflow-hidden" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.09)' }}>
        <div
          className="relative px-4 pt-4 pb-4 overflow-hidden"
          style={{ background: `linear-gradient(145deg, ${bgFrom}, ${bgTo})` }}
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

          <div className="relative flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-green-400 flex items-center justify-center shrink-0">
              <span className="text-white font-black text-xs">✓</span>
            </div>
            <div>
              <p className="text-green-300 text-xs font-extrabold">Redeemed</p>
              <p className="text-green-400/60 text-[10px]">
                {reward.redeemedAt ? walletFmtDateTime(reward.redeemedAt) : ''}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 px-4 py-2">
          <p className="text-[10px] text-green-600 font-medium">
            Thanks for visiting {context.businessName}! 🎉
          </p>
        </div>
      </div>
    </motion.div>
  )
}
