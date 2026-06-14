import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bell, Search, Star } from 'lucide-react'
import { BottomNav } from '@/components/customer/bottom-nav'
import { customerBusinesses } from '@/lib/mock-data'
import { MECHANIC_META } from '@/lib/utils'
import { useCustomerSession } from '@/hooks/useCustomerSession'
import type { CustomerBusiness } from '@/lib/types'
const CATEGORIES = ['All', 'Cafe', 'Salon', 'Gym', 'Restaurant', 'Jewellery'] as const
type Category = typeof CATEGORIES[number]

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
      <span className="text-xs font-semibold text-gray-700">{rating.toFixed(1)}</span>
    </span>
  )
}

function BusinessCard({ biz }: { biz: CustomerBusiness }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
    >
      <Link to={`/customer/business/${biz.id}`} className="no-underline">
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow active:scale-[0.98]">
          <div
            className="relative h-[180px] flex items-end p-3"
            style={{ background: `linear-gradient(135deg, ${biz.coverFrom}, ${biz.coverTo})` }}
          >
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl opacity-30 select-none">
              {biz.coverEmoji}
            </span>
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-bold text-gray-800">{biz.rating.toFixed(1)}</span>
            </div>
            <div className="flex flex-wrap gap-1 z-10">
              {biz.mechanics.map((m) => {
                const meta = MECHANIC_META[m.type]
                return (
                  <span
                    key={m.type}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: meta.badgeBg, color: meta.badgeText }}
                  >
                    {meta.label}
                  </span>
                )
              })}
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-gray-900">{biz.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{biz.tagline}</p>
              </div>
              <span className="text-xs text-gray-400 shrink-0">{biz.distance}</span>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <StarRating rating={biz.rating} />
              <span className="text-xs text-gray-400">({biz.reviews} reviews)</span>
              <span className="text-xs text-gray-400">· {biz.location.split(',')[0]}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export function CustomerPage() {
  const { firstName, customer, activeRewards, redeemedRewards } = useCustomerSession()
  const activeCount = activeRewards.length
  const redeemedCount = redeemedRewards.length

  const REWARD_ICONS = [
    { emoji: '🧾', label: 'Stamps', count: customer.rewards.filter((r) => r.mechanic === 'stamp').length },
    { emoji: '🎴', label: 'Cards', count: customer.rewards.filter((r) => r.mechanic === 'spin' || r.mechanic === 'shake').length },
    { emoji: '📦', label: 'Mystery', count: customer.rewards.filter((r) => r.mechanic === 'dice').length },
    { emoji: '🎡', label: 'Spins', count: customer.rewards.filter((r) => r.mechanic === 'spin').length },
    { emoji: '🎟️', label: 'Lottery', count: customer.rewards.filter((r) => r.mechanic === 'lottery').length },
  ]

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<Category>('All')

  const filtered = customerBusinesses.filter((b) => {
    const matchCat = category === 'All' || b.category === category
    const matchSearch =
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.location.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="px-5 pt-12 pb-6" style={{ background: 'linear-gradient(135deg, #4C1D95, #5B21B6)' }}>
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-4">
          <div>
            <p className="text-purple-300 text-xs font-medium">Welcome Back</p>
            <h1 className="text-white text-xl font-extrabold">Hello, {firstName} 👋</h1>
          </div>
          <button type="button" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border-0 cursor-pointer">
            <Bell className="w-5 h-5 text-white" />
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white/10 rounded-2xl p-4 mb-4">
          <p className="text-purple-200 text-xs mb-1">Your Rewards</p>
          <p className="text-white font-semibold text-sm">
            {activeCount} active · {redeemedCount} redeemed
          </p>
          <div className="flex items-center gap-4 mt-3">
            {REWARD_ICONS.map((r) => (
              <div key={r.label} className="flex flex-col items-center gap-0.5">
                <span className="text-xl">{r.emoji}</span>
                <span className="text-[10px] text-purple-200 font-medium">{r.count}</span>
                <span className="text-[9px] text-purple-300">{r.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="px-5 pt-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cafes, salons, gyms…"
            className="w-full pl-9 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100 transition"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                category === cat
                  ? 'bg-purple-800 text-white border-purple-800'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">No businesses found.</div>
          ) : (
            filtered.map((biz) => <BusinessCard key={biz.id} biz={biz} />)
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
