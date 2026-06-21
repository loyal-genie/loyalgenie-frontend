import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bell, Loader2, Search } from 'lucide-react'
import { BottomNav } from '@/components/customer/bottom-nav'
import { BusinessListingCard } from '@/components/customer/BusinessListingCard'
import { CategoryFilter } from '@/components/customer/CategoryFilter'
import { PromoHeroBanner } from '@/components/customer/PromoHeroBanner'
import { categoryMatches, type CustomerCategory } from '@/lib/customer-ui'
import { useCustomerSession } from '@/hooks/useCustomerSession'
import { useBusinessesWithCampaigns, useCustomerRewards } from '@/hooks/useCustomerData'

const REWARD_ICONS = [
  { emoji: '🧾', label: 'Stamps', mechanic: 'stamp' },
  { emoji: '🤳', label: 'Shake', mechanic: 'shake' },
  { emoji: '📍', label: 'Check-in', mechanic: 'check-in-loyalty' },
]

export function CustomerPage() {
  const navigate = useNavigate()
  const { firstName } = useCustomerSession()
  const { data: businesses, isLoading } = useBusinessesWithCampaigns()
  const { data: rewards = [] } = useCustomerRewards()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<CustomerCategory>('All')

  const activeCount = rewards.filter(r => r.status === 'earned' || r.status === 'pending').length
  const redeemedCount = rewards.filter(r => r.status === 'redeemed').length

  const rewardCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const r of rewards) {
      counts[r.mechanic] = (counts[r.mechanic] ?? 0) + 1
    }
    return counts
  }, [rewards])

  const filtered = useMemo(() => {
    return (businesses ?? []).filter(b => {
      const matchSearch =
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.city.toLowerCase().includes(search.toLowerCase()) ||
        b.tagline?.toLowerCase().includes(search.toLowerCase())
      return matchSearch && categoryMatches(b.businessType, category)
    })
  }, [businesses, search, category])

  return (
    <div className="min-h-dvh bg-gray-50 pb-[calc(7rem+env(safe-area-inset-bottom))]">
      <div
        className="relative px-5 pt-14 pb-5 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #43036d 0%, #5b0e81 50%, #43036d 100%)' }}
      >
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)',
            backgroundSize: '24px 24px',
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative flex items-center justify-between mb-5"
        >
          <div>
            <p className="text-purple-200 text-xs font-medium tracking-wide">Welcome back</p>
            <h1 className="text-white text-xl font-extrabold mt-0.5 flex items-center gap-2">
              Hello, {firstName}
              <span aria-hidden>👋</span>
            </h1>
          </div>
          <button
            type="button"
            onClick={() => navigate('/customer/profile/settings')}
            className="relative w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border-0 cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-white" />
          </button>
        </motion.div>

        <Link to="/customer/wallet" className="block no-underline">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            whileTap={{ scale: 0.98 }}
            className="relative rounded-2xl p-4 overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.10)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-purple-200 text-xs font-semibold uppercase tracking-wide">Your Wallet</p>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-white font-bold">
                  {activeCount} <span className="text-purple-200 font-normal">active</span>
                </span>
                <span className="text-purple-300">·</span>
                <span className="text-white font-bold">
                  {redeemedCount} <span className="text-purple-200 font-normal">redeemed</span>
                </span>
              </div>
            </div>
            <div className="flex items-center gap-5 overflow-x-auto">
              {REWARD_ICONS.map((r, i) => {
                const count = rewardCounts[r.mechanic] ?? 0
                return (
                  <motion.div
                    key={r.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.14 + i * 0.06 }}
                    className="flex flex-col items-center gap-0.5 shrink-0"
                  >
                    <motion.span
                      className="text-[22px] leading-none"
                      animate={count > 0 ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.4, delay: 0.3 + i * 0.07 }}
                    >
                      {r.emoji}
                    </motion.span>
                    <span className="text-sm font-extrabold text-white leading-none mt-1">{count}</span>
                    <span className="text-[9px] text-purple-200/80 leading-none">{r.label}</span>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </Link>
      </div>

      <div className="bg-white rounded-t-3xl -mt-3 px-5 pt-5 min-h-[50vh]">
        <PromoHeroBanner businesses={businesses} className="mb-4" />

        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#6b6461]" />
          <input
            type="text"
            placeholder="Search cafes, salons, gyms…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl text-base border border-[#e5e0dc] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5b0e81]/20 bg-white text-[#2b2827] placeholder:text-[#6b6461]"
          />
        </div>

        <CategoryFilter value={category} onChange={setCategory} className="mb-4" />

        <div className="flex flex-col gap-4 pb-4">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="size-8 text-[#5b0e81] animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 px-6 bg-white rounded-3xl border border-[#e5e0dc]">
              <p className="text-5xl mb-4">🏪</p>
              <p className="font-bold text-[#2b2827]">No vendors found</p>
              <p className="text-xs text-[#6b6461] mt-2">Try a different category or search term</p>
            </div>
          ) : (
            filtered.map(biz => <BusinessListingCard key={biz.id} biz={biz} />)
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
