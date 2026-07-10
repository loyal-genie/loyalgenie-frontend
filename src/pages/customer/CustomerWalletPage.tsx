import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useQueryClient } from '@tanstack/react-query'
import { Bell, ChevronRight, Loader2 } from 'lucide-react'
import { BottomNav } from '@/components/customer/bottom-nav'
import { RedemptionScreen } from '@/components/customer/wallet/RedemptionScreen'
import { WalletActiveCard } from '@/components/customer/wallet/WalletActiveCard'
import { WalletHistoryCard } from '@/components/customer/wallet/WalletHistoryCard'
import type { WalletCardContext } from '@/components/customer/wallet/WalletActiveCard'
import {
  getCampaignGradient,
  isWalletRewardPastRedeem,
  walletDaysUntil,
} from '@/lib/customer-ui'
import { getApiErrorMessage } from '@/lib/api'
import {
  useBusinessesWithCampaigns,
  useCustomerNotifications,
  useCustomerRewards,
  useRequestRedemption,
} from '@/hooks/useCustomerData'
import { useCustomerSession } from '@/hooks/useCustomerSession'
import type { BusinessWithCampaigns, CustomerRewardDto } from '@/lib/api'
import { viewLotteryResult } from '@/lib/api'
import { fmtCampaignDate } from '@/lib/campaign-dates'

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
  const business = businesses?.find(
    b => b.id === reward.businessId || b.campaigns.some(c => c.id === reward.campaignId),
  )
  const grad = getCampaignGradient(reward.mechanic)
  const from = business?.brandColor ?? grad.from
  return {
    businessName: business?.name ?? 'Vendor',
    businessEmoji: reward.icon || grad.emoji,
    bgFrom: from,
    bgTo: business?.brandColor ? darkenHex(business.brandColor) : grad.to,
    expiresAt: reward.redeemBefore ?? null,
  }
}

export function CustomerWalletPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const { firstName } = useCustomerSession()
  const [tab, setTab] = useState<Tab>('active')
  const [redeemError, setRedeemError] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)
  const [countdowns, setCountdowns] = useState<Record<string, number>>({})
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const { data: rewards = [], isLoading, isError, error, refetch } = useCustomerRewards()
  const { data: businesses } = useBusinessesWithCampaigns()
  const { data: notificationData } = useCustomerNotifications()
  const notificationCount = notificationData?.unreadCount ?? 0
  const [lotteryStatusId, setLotteryStatusId] = useState<string | null>(null)
  const [groupStatusId, setGroupStatusId] = useState<string | null>(null)
  const redeemMutation = useRequestRedemption()

  useEffect(() => {
    const state = location.state as { highlightRewardId?: string; openLotteryStatus?: boolean } | null
    if (!state?.highlightRewardId) return
    setTab('active')
    if (state.openLotteryStatus) setLotteryStatusId(state.highlightRewardId)
    window.history.replaceState({}, document.title, location.pathname)
    void refetch()
  }, [location.state, location.pathname, refetch])

  const cardContext = useMemo(() => {
    const map = new Map<string, WalletCardContext>()
    for (const r of rewards) {
      map.set(r.id, buildCardContext(r, businesses))
    }
    return map
  }, [rewards, businesses])

  useEffect(() => {
    const running = Object.entries(countdowns).filter(([id, s]) => {
      if (s <= 0) return false
      const reward = rewards.find(r => r.id === id)
      return reward?.status !== 'redeemed'
    })
    if (running.length === 0) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }
    intervalRef.current = setInterval(() => {
      setCountdowns(prev => {
        const next = { ...prev }
        const timedOut: string[] = []
        for (const id in next) {
          const reward = rewards.find(r => r.id === id)
          if (reward?.status === 'redeemed') {
            delete next[id]
            continue
          }
          if (next[id] > 0) {
            next[id] -= 1
            if (next[id] === 0) {
              timedOut.push(id)
              delete next[id]
            }
          }
        }
        // Timer expiry is NOT a redemption — close the code screen; reward stays pending/active
        if (timedOut.length > 0) {
          setOpenId(current => (current && timedOut.includes(current) ? null : current))
        }
        return next
      })
    }, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [JSON.stringify(Object.keys(countdowns)), rewards])

  const openReward = openId ? (rewards.find(r => r.id === openId) ?? null) : null

  // Poll wallet while redemption screen is open (belt-and-suspenders with Realtime)
  useEffect(() => {
    if (!openId) return
    const poll = window.setInterval(() => {
      void queryClient.invalidateQueries({ queryKey: ['customer-rewards'] })
    }, 2000)
    return () => window.clearInterval(poll)
  }, [openId, queryClient])

  // Vendor marked redeemed → stop timer, show success, redirect to history
  useEffect(() => {
    if (!openId || openReward?.status !== 'redeemed') return

    setCountdowns(prev => {
      if (!(openId in prev)) return prev
      const { [openId]: _, ...rest } = prev
      return rest
    })

    const redirect = window.setTimeout(() => {
      setOpenId(null)
      setTab('history')
    }, 2500)

    return () => window.clearTimeout(redirect)
  }, [openId, openReward?.status, openReward?.redeemedAt])

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

  const closeScreen = () => {
    if (openId) {
      setCountdowns(prev => {
        if (!(openId in prev)) return prev
        const { [openId]: _, ...rest } = prev
        return rest
      })
    }
    setOpenId(null)
  }

  const isDateExpiredReward = (r: CustomerRewardDto) =>
    (r.status === 'earned' || r.status === 'pending' || r.status === 'group_pending')
    && isWalletRewardPastRedeem(r.redeemBefore ?? cardContext.get(r.id)?.expiresAt)

  // Active = redeemable only. Never keep client-fake or API-redeemed items here.
  const pendingRewards = rewards
    .filter(r => {
      if (r.status === 'lottery_pending' || r.status === 'lottery_lost') return true
      if (r.status === 'group_pending') return !isDateExpiredReward(r)
      if (r.status === 'earned' || r.status === 'pending') return !isDateExpiredReward(r)
      return false
    })
    .sort((a, b) => {
      const ctxA = cardContext.get(a.id)
      const ctxB = cardContext.get(b.id)
      const da = ctxA?.expiresAt ? walletDaysUntil(ctxA.expiresAt) : 999
      const db = ctxB?.expiresAt ? walletDaysUntil(ctxB.expiresAt) : 999
      return da - db
    })

  const historyRewards = rewards
    .filter(r => {
      if (r.status === 'redeemed' || r.status === 'expired' || r.status === 'lottery_archived') return true
      return isDateExpiredReward(r)
    })
    .sort(
      (a, b) =>
        new Date(b.redeemedAt ?? b.earnedAt).getTime() - new Date(a.redeemedAt ?? a.earnedAt).getTime(),
    )

  const activeCount = pendingRewards.length
  const redeemedCount = rewards.filter(r => r.status === 'redeemed').length
  const expiredCount = rewards.filter(r =>
    r.status === 'expired' || isDateExpiredReward(r),
  ).length

  const urgentCount = pendingRewards.filter(r => {
    const exp = cardContext.get(r.id)?.expiresAt
    if (!exp) return false
    const days = walletDaysUntil(exp)
    return days >= 0 && days <= 3
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

  const lotteryStatusReward = lotteryStatusId ? rewards.find(r => r.id === lotteryStatusId) ?? null : null
  const groupStatusReward = groupStatusId ? rewards.find(r => r.id === groupStatusId) ?? null : null

  // If group unlocked while modal open, close status and open redeem
  useEffect(() => {
    if (!groupStatusId || !groupStatusReward) return
    if (groupStatusReward.status !== 'earned' && groupStatusReward.status !== 'pending') return
    const reward = groupStatusReward
    setGroupStatusId(null)
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
    } else {
      openScreen()
    }
  }, [groupStatusId, groupStatusReward?.id, groupStatusReward?.status])

  // Poll while group status modal is open so progress updates
  useEffect(() => {
    if (!groupStatusId) return
    const poll = window.setInterval(() => {
      void queryClient.invalidateQueries({ queryKey: ['customer-rewards'] })
    }, 3000)
    return () => window.clearInterval(poll)
  }, [groupStatusId, queryClient])

  const dismissLotteryLoss = async (rewardId: string) => {
    try {
      await viewLotteryResult(rewardId)
      void queryClient.invalidateQueries({ queryKey: ['customer-rewards'] })
    } catch {
      /* ignore */
    }
  }

  const badgeCount = urgentCount + notificationCount

  return (
    <div className="min-h-dvh bg-gray-50 pb-[calc(5rem+env(safe-area-inset-bottom))]">
      <AnimatePresence>
        {lotteryStatusReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setLotteryStatusId(null)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md max-h-[85vh] rounded-3xl bg-white shadow-xl overflow-y-auto"
              style={{ padding: '24px' }}
            >
              <p className="text-lg font-bold text-v-text">{lotteryStatusReward.campaignName}</p>
              <p className="text-sm text-v-text-3 mt-1">Ticket #{lotteryStatusReward.lottery?.ticketNumber != null ? String(lotteryStatusReward.lottery.ticketNumber).padStart(4, '0') : '—'}</p>
              {lotteryStatusReward.status === 'lottery_pending' && lotteryStatusReward.lottery?.drawDate && (
                <div className="mt-4 rounded-2xl bg-amber-50 border border-amber-200 p-4 text-center">
                  <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide">Draw in</p>
                  <p className="text-2xl font-black text-amber-900 mt-1">
                    {walletDaysUntil(lotteryStatusReward.lottery.drawDate)} day{walletDaysUntil(lotteryStatusReward.lottery.drawDate) !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-amber-700 mt-1">{fmtCampaignDate(lotteryStatusReward.lottery.drawDate)}</p>
                </div>
              )}
              {lotteryStatusReward.status === 'lottery_lost' && (
                <p className="mt-4 text-sm text-v-text-2">Unfortunately your ticket didn&apos;t win this time. Thanks for playing!</p>
              )}
              {lotteryStatusReward.status === 'earned' && (
                <p className="mt-4 text-sm font-semibold text-emerald-700">🎉 You won! Tap Redeem on your wallet card to claim.</p>
              )}
              <button
                type="button"
                onClick={() => setLotteryStatusId(null)}
                className="w-full py-3 rounded-xl bg-v-purple text-white font-bold border-0 cursor-pointer mt-6"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {groupStatusReward && groupStatusReward.status === 'group_pending' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setGroupStatusId(null)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md max-h-[85vh] rounded-3xl bg-white shadow-xl overflow-y-auto"
              style={{ padding: '24px' }}
            >
              <p className="text-lg font-bold text-v-text">{groupStatusReward.campaignName}</p>
              <p className="text-sm text-v-text-3 mt-1">{groupStatusReward.reward}</p>

              <div className="mt-4 rounded-2xl bg-indigo-50 border border-indigo-200 p-4 text-center">
                <p className="text-xs font-semibold text-indigo-800 uppercase tracking-wide">People left to unlock</p>
                <p className="text-3xl font-black text-indigo-900 mt-1">
                  {groupStatusReward.groupUnlock?.peopleLeft ?? '—'}
                </p>
                <p className="text-xs text-indigo-700 mt-2">
                  {groupStatusReward.groupUnlock
                    ? `${groupStatusReward.groupUnlock.groupJoined} of ${groupStatusReward.groupUnlock.targetParticipants} reserved`
                    : 'Waiting for more people to reserve'}
                </p>
                {groupStatusReward.groupUnlock && (
                  <div className="mt-3 h-2 rounded-full bg-indigo-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(
                            (groupStatusReward.groupUnlock.groupJoined /
                              groupStatusReward.groupUnlock.targetParticipants) *
                              100,
                          ),
                        )}%`,
                      }}
                    />
                  </div>
                )}
              </div>

              {groupStatusReward.redeemBefore && (
                <p className="mt-3 text-center text-xs text-v-text-3">
                  Offer expires {fmtCampaignDate(groupStatusReward.redeemBefore)} if the group isn&apos;t full
                </p>
              )}

              <button
                type="button"
                onClick={() => setGroupStatusId(null)}
                className="w-full py-3 rounded-xl bg-v-purple text-white font-bold border-0 cursor-pointer mt-6"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {openView && (
          <RedemptionScreen
            view={openView}
            countdown={countdowns[openView.reward.id] ?? 0}
            redeemedAt={null}
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
            onClick={() => navigate('/customer/notifications')}
            className="relative w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border-0 cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-white" />
            {badgeCount > 0 && (
              <motion.div
                className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-red-500 flex items-center justify-center"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
              >
                <span className="text-[9px] font-black text-white">{badgeCount}</span>
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
              { value: activeCount, label: 'Active' },
              { value: redeemedCount, label: 'Redeemed' },
              { value: expiredCount, label: 'Expired' },
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
                  {t === 'active' ? `Active (${activeCount})` : `History (${historyRewards.length})`}
                </span>
              </button>
            ))}
          </div>
        </div>

        {redeemError && <p className="text-xs text-red-500 text-center px-5 mb-4">{redeemError}</p>}
        {isError && (
          <p className="text-xs text-red-500 text-center px-5 mb-4">
            {getApiErrorMessage(error, 'Could not load wallet rewards')}
          </p>
        )}

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
                          context={cardContext.get(r.id) ?? buildCardContext(r, businesses)}
                          index={i}
                          isRedeemed={false}
                          redeemedAt={null}
                          redeeming={redeemMutation.isPending && redeemMutation.variables === r.id}
                          onRedeem={() => startRedeem(r)}
                          onCheckLotteryStatus={() => setLotteryStatusId(r.id)}
                          onCheckGroupStatus={() => setGroupStatusId(r.id)}
                          onDismissLotteryLoss={() => void dismissLotteryLoss(r.id)}
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
                        context={cardContext.get(r.id) ?? buildCardContext(r, businesses)}
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
