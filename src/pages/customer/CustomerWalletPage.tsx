import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell } from 'lucide-react'
import { BottomNav } from '@/components/customer/bottom-nav'
import { MECHANIC_META, formatDate } from '@/lib/utils'
import { useCustomerSession } from '@/hooks/useCustomerSession'
import type { CustomerReward } from '@/lib/types'
type Tab = 'active' | 'history'

// Stamp grid visualiser (shows 10 cells, filled = earned)
function StampGrid({ filled }: { filled: number }) {
  return (
    <div className="grid grid-cols-5 gap-1.5 px-1 py-2">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className={`h-8 rounded-lg flex items-center justify-center text-sm transition-all ${
            i < filled
              ? 'bg-amber-400 shadow-sm'
              : 'bg-gray-100 border border-gray-200'
          }`}
        >
          {i < filled ? '✓' : ''}
        </div>
      ))}
    </div>
  )
}

function ActiveRewardCard({ reward }: { reward: CustomerReward }) {
  const meta = MECHANIC_META[reward.mechanic]
  const isStamp = reward.mechanic === 'stamp'
  // Fake stamp count for demo
  const stampsFilled = 6

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
    >
      {/* Cover */}
      <div
        className="relative h-28 flex items-end p-3"
        style={{ background: `linear-gradient(135deg, ${meta.cardFrom}, ${meta.cardTo})` }}
      >
        <span
          className="absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: meta.badgeBg, color: meta.badgeText }}
        >
          {meta.label}
        </span>
        <div className="absolute bottom-3 right-3 text-2xl">{meta.emoji}</div>
      </div>
      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-gray-400 mb-0.5">{reward.campaignName}</p>
        <h3 className="text-sm font-bold text-gray-900 mb-1">{reward.reward}</h3>
        {isStamp && <StampGrid filled={stampsFilled} />}
        <p className="text-[10px] text-gray-400 mt-2">Expires {formatDate('2026-06-30')}</p>
      </div>
    </motion.div>
  )
}

function HistoryRewardCard({ reward }: { reward: CustomerReward }) {
  const meta = MECHANIC_META[reward.mechanic]
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
    >
      <div className="flex gap-3 p-4">
        {/* Mini mechanic image */}
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0"
          style={{ background: `linear-gradient(135deg, ${meta.cardFrom}, ${meta.cardTo})` }}
        >
          {meta.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: meta.badgeBg, color: meta.badgeText }}
            >
              {meta.label}
            </span>
            <span className="text-[10px] bg-orange-50 text-orange-500 font-semibold px-1.5 py-0.5 rounded-full">
              Expiring soon
            </span>
          </div>
          <p className="text-xs font-bold text-gray-900 truncate">{reward.campaignName}</p>
          <p className="text-[10px] text-gray-400">Last Visit: 5 days ago</p>
          <p className="text-xs text-gray-700 mt-1 font-medium">{reward.reward}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-mono text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-600">{reward.code}</span>
            <span className="text-[10px] text-gray-400">· Expires {formatDate('2026-06-30')}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function CustomerWalletPage() {
  const [tab, setTab] = useState<Tab>('active')
  const { firstName, activeRewards, redeemedRewards } = useCustomerSession()
  const historyRewards = redeemedRewards
  const shown = tab === 'active' ? activeRewards : historyRewards

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Purple header */}
      <div
        className="px-5 pt-12 pb-6"
        style={{ background: 'linear-gradient(135deg, #4C1D95, #5B21B6)' }}
      >
        {/* Top row */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-purple-300 text-xs">Welcome Back</p>
            <h1 className="text-white text-xl font-extrabold">
              {firstName} 👋
            </h1>
          </div>
          <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* White wallet summary card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-5"
        >
          <p className="text-xs text-gray-400 text-center mb-3 font-medium uppercase tracking-widest">Your Wallet</p>
          <div className="flex items-center">
            <div className="flex-1 text-center">
              <p className="text-2xl font-black text-gray-900">{activeRewards.length}</p>
              <p className="text-xs text-gray-500 mt-0.5">Active rewards</p>
            </div>
            <div className="w-px h-10 bg-gray-200" />
            <div className="flex-1 text-center">
              <p className="text-2xl font-black text-gray-900">{historyRewards.length}</p>
              <p className="text-xs text-gray-500 mt-0.5">Redeemed</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs + content */}
      <div className="px-5 pt-5">
        {/* Pill tabs */}
        <div className="flex items-center gap-2 mb-5 bg-gray-100 rounded-xl p-1">
          {(['active', 'history'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                tab === t ? 'bg-white text-purple-800 shadow-sm' : 'text-gray-500'
              }`}
            >
              {t === 'active' ? 'Active' : 'History'}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {shown.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-16 text-gray-400 text-sm"
              >
                {tab === 'active' ? 'No active rewards. Play games to win!' : 'No redeemed rewards yet.'}
              </motion.div>
            ) : (
              shown.map(r =>
                tab === 'active'
                  ? <ActiveRewardCard key={r.id} reward={r} />
                  : <HistoryRewardCard key={r.id} reward={r} />
              )
            )}
          </AnimatePresence>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
