import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { CountdownRing } from '@/components/customer/wallet/CountdownRing'
import {
  getCampaignGradient,
  getMechanicHeaderChipShort,
  walletFmtDateTime,
} from '@/lib/customer-ui'
import type { CustomerRewardDto } from '@/lib/api'

export interface WalletRedemptionView {
  reward: CustomerRewardDto
  businessName: string
  businessEmoji?: string
  bgFrom?: string
  bgTo?: string
}

interface RedemptionScreenProps {
  view: WalletRedemptionView
  countdown: number
  redeemedAt: string | null
  onClose: () => void
}

export function RedemptionScreen({ view, countdown, redeemedAt, onClose }: RedemptionScreenProps) {
  const { reward, businessName, businessEmoji } = view
  const meta = getCampaignGradient(reward.mechanic)
  const bgFrom = view.bgFrom ?? meta.from
  const bgTo = view.bgTo ?? meta.to
  const isDone = redeemedAt !== null

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{
        background: isDone
          ? 'linear-gradient(145deg, #052E16, #14532D)'
          : `linear-gradient(145deg, ${bgFrom}, ${bgTo})`,
      }}
    >
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)',
          backgroundSize: '22px 22px',
        }}
      />

      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${isDone ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.10)'} 0%, transparent 70%)`,
          filter: 'blur(40px)',
        }}
      />

      <div className="relative flex items-center justify-between px-5 pt-12 pb-4">
        <div>
          <p className="text-white/50 text-[10px] font-semibold uppercase tracking-widest">
            {businessName}
          </p>
          <p className="text-white/70 text-xs mt-0.5">{reward.campaignName}</p>
        </div>
        {!isDone && (
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border-0 cursor-pointer"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        )}
      </div>

      {!isDone && (
        <div className="relative flex-1 flex flex-col items-center justify-between px-6 pb-14">
          <div className="text-center mt-4 mb-auto">
            <span className="text-5xl block mb-4">{businessEmoji ?? reward.icon ?? meta.emoji}</span>
            <p className="text-3xl font-black text-white leading-tight">{reward.reward}</p>
            <span
              className="inline-block mt-3 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider"
              style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.80)' }}
            >
              {getMechanicHeaderChipShort(reward.mechanic)}
            </span>
            {reward.code && (
              <div
                className="mt-5 rounded-2xl px-5 py-3"
                style={{ background: 'rgba(0,0,0,0.22)', border: '1px solid rgba(255,255,255,0.15)' }}
              >
                <p className="text-white/50 text-[10px] font-semibold uppercase tracking-widest mb-1">
                  Reward code
                </p>
                <p className="font-mono text-2xl font-black text-white tracking-[0.2em]">{reward.code}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center my-6">
            <div className="relative">
              <CountdownRing seconds={countdown} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  key={countdown}
                  initial={{ scale: 1.15, opacity: 0.6 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`text-6xl font-black leading-none ${countdown <= 10 ? 'text-red-300' : 'text-white'}`}
                >
                  {countdown}
                </motion.span>
                <span className="text-white/40 text-xs font-semibold tracking-widest mt-1">SEC</span>
              </div>
            </div>
            <p className="text-white/60 text-sm font-medium mt-4 text-center">
              Show this screen to staff at
              <br />
              <span className="text-white font-bold">{businessName}</span>
            </p>
          </div>

          <p className="text-white/30 text-xs text-center">
            Staff will confirm your redemption at the counter
          </p>
        </div>
      )}

      {isDone && (
        <div className="relative flex-1 flex flex-col items-center justify-center px-6 pb-14 gap-6">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="w-28 h-28 rounded-full bg-green-400 flex items-center justify-center"
            style={{ boxShadow: '0 0 60px rgba(34,197,94,0.5)' }}
          >
            <span className="text-5xl text-white font-black">✓</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <p className="text-4xl font-black text-white mb-2">
              {reward.status === 'redeemed' ? 'Redeemed!' : 'Confirmed!'}
            </p>
            <p className="text-xl font-bold text-green-300">{reward.reward}</p>
            <p className="text-green-400/70 text-sm font-medium mt-1">{businessName}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-2xl px-5 py-4 text-center"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            <p className="text-white/40 text-[10px] font-semibold uppercase tracking-widest mb-1">
              {reward.status === 'redeemed' ? 'Redeemed on' : 'Shown on'}
            </p>
            <p className="text-white font-bold text-base">{walletFmtDateTime(redeemedAt!)}</p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={onClose}
            className="w-full py-4 rounded-2xl text-sm font-bold text-white mt-2 border-0 cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)' }}
          >
            Done
          </motion.button>
        </div>
      )}
    </motion.div>
  )
}
