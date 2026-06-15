import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Loader2 } from 'lucide-react'
import { BottomNav } from '@/components/customer/bottom-nav'
import { MECHANIC_META, formatDate } from '@/lib/utils'
import { useCustomerSession } from '@/hooks/useCustomerSession'
import { useCustomerRewards } from '@/hooks/useCustomerData'
import type { CustomerRewardDto } from '@/lib/api'

type Tab = 'active' | 'history'

function ActiveRewardCard({ reward }: { reward: CustomerRewardDto }) {
  const meta = MECHANIC_META[reward.mechanic as keyof typeof MECHANIC_META] ?? MECHANIC_META.shake

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
    >
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
        <div className="absolute bottom-3 right-3 text-2xl">{reward.icon || meta.emoji}</div>
      </div>
      <div className="p-4">
        <p className="text-xs text-gray-400 mb-0.5">{reward.campaignName}</p>
        <h3 className="text-sm font-bold text-gray-900 mb-1">{reward.reward}</h3>
        <span className="font-mono text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-600">{reward.code}</span>
        <p className="text-[10px] text-gray-400 mt-2">Earned {formatDate(reward.earnedAt.slice(0, 10))}</p>
      </div>
    </motion.div>
  )
}

function HistoryRewardCard({ reward }: { reward: CustomerRewardDto }) {
  const meta = MECHANIC_META[reward.mechanic as keyof typeof MECHANIC_META] ?? MECHANIC_META.shake
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm opacity-75"
    >
      <div className="flex gap-3 p-4">
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0"
          style={{ background: `linear-gradient(135deg, ${meta.cardFrom}, ${meta.cardTo})` }}
        >
          {reward.icon || meta.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-gray-900 truncate">{reward.campaignName}</p>
          <p className="text-xs text-gray-700 mt-1 font-medium">{reward.reward}</p>
          <span className="font-mono text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-600 mt-1 inline-block">{reward.code}</span>
        </div>
      </div>
    </motion.div>
  )
}

export function CustomerWalletPage() {
  const [tab, setTab] = useState<Tab>('active')
  const { firstName } = useCustomerSession()
  const { data: rewards = [], isLoading } = useCustomerRewards()

  const activeRewards = rewards.filter(r => r.status === 'pending')
  const historyRewards = rewards.filter(r => r.status === 'redeemed')
  const shown = tab === 'active' ? activeRewards : historyRewards

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div
        className="px-5 lg:px-8 pt-12 pb-6"
        style={{ background: 'linear-gradient(135deg, #4C1D95, #5B21B6)' }}
      >
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-purple-300 text-xs">Welcome Back</p>
              <h1 className="text-white text-xl font-extrabold">{firstName} 👋</h1>
            </div>
            <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border-0 cursor-pointer">
              <Bell className="w-5 h-5 text-white" />
            </button>
          </div>

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
      </div>

      <div className="px-5 lg:px-8 pt-5 max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-5 bg-gray-100 rounded-xl p-1">
          {(['active', 'history'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all border-0 cursor-pointer ${
                tab === t ? 'bg-white text-purple-800 shadow-sm' : 'text-gray-500'
              }`}
            >
              {t === 'active' ? 'Active' : 'History'}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {shown.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
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
        )}
      </div>

      <BottomNav />
    </div>
  )
}
