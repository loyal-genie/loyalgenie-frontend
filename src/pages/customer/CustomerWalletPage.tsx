import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, ChevronRight, Loader2 } from 'lucide-react'
import { BottomNav } from '@/components/customer/bottom-nav'
import { RedemptionScreen } from '@/components/customer/wallet/RedemptionScreen'
import { WalletActiveCard } from '@/components/customer/wallet/WalletActiveCard'
import { WalletHistoryCard } from '@/components/customer/wallet/WalletHistoryCard'
import type { WalletCardContext } from '@/components/customer/wallet/WalletActiveCard'
import {
  getCampaignGradient,
  walletDaysUntil,
} from '@/lib/customer-ui'
import { getApiErrorMessage } from '@/lib/api'
import {
  useBusinessesWithCampaigns,
  useCustomerLoyaltyProfiles,
  useCustomerRewards,
  useRequestRedemption,
} from '@/hooks/useCustomerData'
import { useCustomerSession } from '@/hooks/useCustomerSession'
import type { BusinessWithCampaigns, CustomerRewardDto } from '@/lib/api'

type Tab = 'active' | 'history'

function darkenHex(hex: string): string {
  if (!hex.startsWith('#') || hex.length < 7) return '#43036d'
  const n = parseInt(hex.slice(1), 16)
  const r = Math.max(0, ((n >> 16) & 255) - 40)
  const g = Math.max(0, ((n >> 8) & 255) - 40)
  const b = Math.max(0, (n & 255) - 40)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

function buildCardContext(
  reward: CustomerRewardDto,
  businesses: BusinessWithCampaigns[] | undefined,
): WalletCardContext {
  const business = businesses?.find(b => b.campaigns.some(c => c.id === reward.campaignId))
  const campaign = business?.campaigns.find(c => c.id === reward.campaignId)
  const grad = getCampaignGradient(reward.mechanic)
  const from = business?.brandColor ?? grad.from
  return {
    businessName: business?.name ?? 'Vendor',
    businessEmoji: reward.icon || grad.emoji,
    bgFrom: from,
    bgTo: business?.brandColor ? darkenHex(business.brandColor) : grad.to,
    expiresAt: campaign?.endDate ?? null,
  }
}

export function CustomerWalletPage() {
  const { firstName } = useCustomerSession()
  const [tab, setTab] = useState<Tab>('active')
  const [redeemError, setRedeemError] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)
  const [countdowns, setCountdowns] = useState<Record<string, number>>({})
  const [sessionRedeemed, setSessionRedeemed] = useState<Record<string, string>>({})
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const { data: rewards = [], isLoading } = useCustomerRewards()
  const { data: businesses } = useBusinessesWithCampaigns()
  const { data: loyaltyProfiles = [] } = useCustomerLoyaltyProfiles()
  const redeemMutation = useRequestRedemption()

  const cardContext = useMemo(() => {
    const map = new Map<string, WalletCardContext>()
    for (const r of rewards) {
      map.set(r.id, buildCardContext(r, businesses))
    }
    return map
  }, [rewards, businesses])

  useEffect(() => {
    const running = Object.entries(countdowns).filter(([, s]) => s > 0)
    if (running.length === 0) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }
    intervalRef.current = setInterval(() => {
      setCountdowns(prev => {
        const next = { ...prev }
        const justDone: string[] = []
        for (const id in next) {
          if (next[id] > 0) {
            next[id] -= 1
            if (next[id] === 0) justDone.push(id)
          }
        }
        if (justDone.length > 0) {
          const now = new Date().toISOString()
          justDone.forEach(id => setSessionRedeemed(sr => ({ ...sr, [id]: now })))
        }
        return next
      })
    }, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [JSON.stringify(Object.keys(countdowns))])

  const startRedeem = (reward: CustomerRewardDto) => {
    setRedeemError('')
    const openScreen = () => {
      setCountdowns(prev => ({ ...prev, [reward.id]: 60 }))
      setOpenId(reward.id)
    }

    if (reward.status === 'earned') {
      redeemMutation.mutate(reward.id, {
        onSuccess: openScreen,
        onError: err => setRedeemError(getApiErrorMessage(err, 'Could not request redemption')),
      })
      return
    }

    openScreen()
  }

  const closeScreen = () => setOpenId(null)
  const openReward = openId ? (rewards.find(r => r.id === openId) ?? null) : null

  const pendingRewards = rewards
    .filter(r => r.status === 'earned' || r.status === 'pending' || sessionRedeemed[r.id])
    .sort((a, b) => {
      if (sessionRedeemed[a.id] && !sessionRedeemed[b.id]) return 1
      if (sessionRedeemed[b.id] && !sessionRedeemed[a.id]) return -1
      const ctxA = cardContext.get(a.id)
      const ctxB = cardContext.get(b.id)
      const da = ctxA?.expiresAt ? walletDaysUntil(ctxA.expiresAt) : 999
      const db = ctxB?.expiresAt ? walletDaysUntil(ctxB.expiresAt) : 999
      return da - db
    })

  const historyRewards = rewards
    .filter(r => r.status === 'redeemed' && !sessionRedeemed[r.id])
    .sort(
      (a, b) =>
        new Date(b.redeemedAt ?? b.earnedAt).getTime() - new Date(a.redeemedAt ?? a.earnedAt).getTime(),
    )

  const toRedeemCount = pendingRewards.filter(r => !sessionRedeemed[r.id]).length
  const totalPoints = loyaltyProfiles.reduce((sum, p) => sum + p.loyaltyPoints, 0)
  const topStreak = Math.max(0, ...loyaltyProfiles.map(p => p.totalCheckIns))

  const urgentCount = pendingRewards.filter(r => {
    if (sessionRedeemed[r.id]) return false
    const exp = cardContext.get(r.id)?.expiresAt
    return exp ? walletDaysUntil(exp) <= 3 : false
  }).length

  const openView =
    openReward && cardContext.has(openReward.id)
      ? {
          reward: openReward,
          businessName: cardContext.get(openReward.id)!.businessName,
          businessEmoji: cardContext.get(openReward.id)!.businessEmoji,
          bgFrom: cardContext.get(openReward.id)!.bgFrom,
          bgTo: cardContext.get(openReward.id)!.bgTo,
        }
      : null

  return (
    <div className="min-h-dvh bg-gray-50 pb-[calc(7rem+env(safe-area-inset-bottom))]">
      <AnimatePresence>
        {openView && (
          <RedemptionScreen
            view={openView}
            countdown={countdowns[openView.reward.id] ?? 0}
            redeemedAt={sessionRedeemed[openView.reward.id] ?? null}
            onClose={closeScreen}
          />
        )}
      </AnimatePresence>

      <div
        className="relative px-5 pt-14 pb-6 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #43036d 0%, #5b0e81 50%, #43036d 100%)' }}
      >
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)',
            backgroundSize: '24px 24px',
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative flex items-center justify-between mb-5"
        >
          <div>
            <p className="text-purple-200 text-xs font-medium tracking-wide">Your Rewards</p>
            <h1 className="text-white text-xl font-extrabold mt-0.5">{firstName}&apos;s Wallet</h1>
          </div>
          <button
            type="button"
            className="relative w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border-0"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-white" />
            {urgentCount > 0 && (
              <motion.div
                className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
              >
                <span className="text-[9px] font-black text-white">{urgentCount}</span>
              </motion.div>
            )}
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 280, damping: 22 }}
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.10)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.14)',
          }}
        >
          <div className="flex divide-x divide-white/10">
            {[
              { value: toRedeemCount, label: 'To Redeem' },
              { value: topStreak, label: 'Day Streak 🔥' },
              {
                value: totalPoints >= 1000 ? `${(totalPoints / 1000).toFixed(1)}k` : totalPoints,
                label: 'Points ⭐',
              },
            ].map(({ value, label }, i) => (
              <div key={label} className="flex-1 text-center py-4 px-2">
                <motion.p
                  className="text-2xl font-black text-white"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 18, delay: 0.18 + i * 0.05 }}
                >
                  {value}
                </motion.p>
                <p className="text-[10px] text-purple-200 font-semibold mt-0.5 uppercase tracking-wide">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {urgentCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="relative mt-3 flex items-center gap-2.5 rounded-xl px-3.5 py-2.5"
            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)' }}
          >
            <motion.span
              className="text-base"
              animate={{ rotate: [0, -8, 8, -4, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2.5 }}
            >
              ⏰
            </motion.span>
            <p className="text-sm font-semibold text-red-200">
              {urgentCount} reward{urgentCount !== 1 ? 's' : ''} expiring soon — redeem before they&apos;re
              gone!
            </p>
          </motion.div>
        )}
      </div>

      <div className="bg-white rounded-t-3xl -mt-3 pt-5 min-h-[50vh]">
        <div className="px-5 mb-5">
          <div className="flex gap-1.5 bg-gray-100 rounded-xl p-1">
            {(['active', 'history'] as Tab[]).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`relative flex-1 py-2 rounded-lg text-sm font-semibold transition-colors border-0 cursor-pointer ${
                  tab === t ? 'text-[#43036d]' : 'text-gray-400'
                }`}
              >
                {tab === t && (
                  <motion.div
                    layoutId="wallet-tab"
                    className="absolute inset-0 bg-white rounded-lg shadow-sm"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">
                  {t === 'active' ? `Active (${toRedeemCount})` : `History (${historyRewards.length})`}
                </span>
              </button>
            ))}
          </div>
        </div>

        {redeemError && <p className="text-xs text-red-500 text-center px-5 mb-4">{redeemError}</p>}

        <div className="px-5">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="size-8 text-[#5b0e81] animate-spin" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {tab === 'active' ? (
                <motion.div
                  key="active"
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 24 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                  className="space-y-4 pb-6"
                >
                  {pendingRewards.length === 0 ? (
                    <div className="text-center py-16">
                      <p className="text-4xl mb-3">🎮</p>
                      <p className="text-gray-500 font-semibold">No active rewards yet</p>
                      <p className="text-gray-400 text-sm mt-1">Play games at your favourite spots to win!</p>
                      <Link to="/customer" className="no-underline">
                        <motion.div
                          whileTap={{ scale: 0.97 }}
                          className="mt-5 inline-block px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                          style={{ background: 'linear-gradient(135deg, #5b0e81, #43036d)' }}
                        >
                          Explore Campaigns →
                        </motion.div>
                      </Link>
                    </div>
                  ) : (
                    <>
                      {pendingRewards.map((r, i) => (
                        <WalletActiveCard
                          key={r.id}
                          reward={r}
                          context={cardContext.get(r.id)!}
                          index={i}
                          isRedeemed={!!sessionRedeemed[r.id]}
                          redeemedAt={sessionRedeemed[r.id] ?? null}
                          redeeming={redeemMutation.isPending && redeemMutation.variables === r.id}
                          onRedeem={() => startRedeem(r)}
                        />
                      ))}
                      <Link to="/customer" className="block no-underline">
                        <div
                          className="flex items-center justify-between rounded-2xl px-4 py-3.5"
                          style={{
                            background: 'linear-gradient(135deg, #f3e8ff, #faf5ff)',
                            border: '1px solid #e9d5ff',
                          }}
                        >
                          <div>
                            <p className="text-sm font-bold text-[#43036d]">Win more rewards</p>
                            <p className="text-xs text-[#7c3aed] mt-0.5">Campaigns ready to play today</p>
                          </div>
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #5b0e81, #43036d)' }}
                          >
                            <ChevronRight className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </Link>
                    </>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                  className="space-y-2.5 pb-6"
                >
                  {historyRewards.length === 0 ? (
                    <div className="text-center py-16 text-gray-400 text-sm">
                      <p className="text-3xl mb-3">📋</p>
                      No redeemed rewards yet.
                    </div>
                  ) : (
                    historyRewards.map((r, i) => (
                      <WalletHistoryCard
                        key={r.id}
                        reward={r}
                        context={cardContext.get(r.id)!}
                        index={i}
                      />
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
