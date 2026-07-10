import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  getCampaignGradient,
  getMechanicHeaderChipShort,
  isWalletRewardPastRedeem,
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

const EXPIRED_COVER_FROM = '#7F1D1D'
const EXPIRED_COVER_TO = '#B91C1C'

export function WalletHistoryCard({ reward, context, index }: WalletHistoryCardProps) {
  const [showExpiredStatus, setShowExpiredStatus] = useState(false)
  const meta = getCampaignGradient(reward.mechanic)
  const isExpired =
    reward.status === 'expired'
    || (reward.status !== 'redeemed' && isWalletRewardPastRedeem(reward.redeemBefore ?? context.expiresAt))

  const bgFrom = isExpired ? EXPIRED_COVER_FROM : (context.bgFrom ?? meta.from)
  const bgTo = isExpired ? EXPIRED_COVER_TO : (context.bgTo ?? meta.to)
  const expiredOn = reward.redeemBefore ?? context.expiresAt

  return (
    <>
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

            <div className="relative flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    isExpired ? 'bg-red-400' : 'bg-green-400'
                  }`}
                >
                  <span className="text-white font-black text-xs">{isExpired ? '✕' : '✓'}</span>
                </div>
                <div className="min-w-0">
                  <p className={`text-xs font-extrabold ${isExpired ? 'text-red-200' : 'text-green-300'}`}>
                    {isExpired ? 'Expired' : 'Redeemed'}
                  </p>
                  <p className={`text-[10px] truncate ${isExpired ? 'text-red-200/70' : 'text-green-400/60'}`}>
                    {isExpired
                      ? expiredOn
                        ? `Expired ${walletFmtDateTime(expiredOn)}`
                        : 'Redeem window passed'
                      : reward.redeemedAt
                        ? walletFmtDateTime(reward.redeemedAt)
                        : ''}
                  </p>
                </div>
              </div>

              {isExpired && (
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  type="button"
                  onClick={() => setShowExpiredStatus(true)}
                  className="shrink-0 px-4 py-1.5 rounded-xl text-[12px] font-extrabold border-0 cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.95)', color: EXPIRED_COVER_FROM }}
                >
                  Status →
                </motion.button>
              )}
            </div>
          </div>

          <div className={`px-4 py-2 ${isExpired ? 'bg-red-50' : 'bg-green-50'}`}>
            <p className={`text-[10px] font-medium ${isExpired ? 'text-red-600' : 'text-green-600'}`}>
              {isExpired
                ? 'This reward expired before it could be redeemed.'
                : `Thanks for visiting ${context.businessName}! 🎉`}
            </p>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showExpiredStatus && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowExpiredStatus(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md rounded-3xl bg-white shadow-xl p-6"
            >
              <p className="text-lg font-bold text-v-text">{reward.reward}</p>
              <p className="text-sm text-v-text-3 mt-1">{reward.campaignName}</p>
              <div className="mt-4 rounded-2xl bg-red-50 border border-red-200 p-4 text-center">
                <p className="text-xs font-semibold text-red-800 uppercase tracking-wide">Expired</p>
                <p className="text-sm text-red-900 mt-2 font-medium">
                  {expiredOn
                    ? `This reward expired on ${walletFmtDateTime(expiredOn)}.`
                    : 'This reward expired before it could be redeemed.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowExpiredStatus(false)}
                className="w-full py-3 rounded-xl bg-v-purple text-white font-bold border-0 cursor-pointer mt-6"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
