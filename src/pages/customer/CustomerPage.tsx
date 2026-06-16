import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bell, Search, Loader2, Store, Sparkles, Gift } from 'lucide-react'
import { BottomNav } from '@/components/customer/bottom-nav'
import { MECHANIC_META } from '@/lib/utils'
import { useCustomerSession } from '@/hooks/useCustomerSession'
import { useBusinessesWithCampaigns } from '@/hooks/useCustomerData'
import type { BusinessWithCampaigns } from '@/lib/api'

const CATEGORY_EMOJI: Record<string, string> = {
  Cafe: '☕', Restaurant: '🍝', Salon: '✂️', Gym: '🏋️', Jewellery: '💎',
}

function BusinessCard({ biz, index }: { biz: BusinessWithCampaigns; index: number }) {
  const emoji = CATEGORY_EMOJI[biz.businessType] ?? '🏪'
  const shakeCampaigns = biz.campaigns.filter(c => c.mechanic === 'shake')
  const stampCampaigns = biz.campaigns.filter(c => c.mechanic === 'stamp')
  const badgeCampaigns = [...stampCampaigns, ...shakeCampaigns].slice(0, 2)
  const topWinRate = Math.max(...shakeCampaigns.map(c => c.winRatePercent), 0)
  const hasStamp = stampCampaigns.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22, delay: index * 0.06 }}
    >
      <Link to={`/customer/business/${biz.id}`} className="no-underline block group">
        <div className="relative bg-white rounded-3xl overflow-hidden border border-white/80 shadow-[0_8px_30px_rgba(76,29,149,0.08)] hover:shadow-[0_16px_40px_rgba(76,29,149,0.14)] transition-all duration-300 active:scale-[0.98]">
          <div
            className="relative h-[170px] lg:h-[190px] flex items-end p-4 overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${biz.brandColor} 0%, ${biz.brandColor}cc 50%, #1e1b4b 100%)` }}
          >
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/30 to-transparent" />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-7xl opacity-25 select-none group-hover:scale-110 transition-transform duration-500">
              {emoji}
            </span>
            <div className="flex flex-wrap gap-1.5 z-10">
              {badgeCampaigns.map(c => {
                const meta = MECHANIC_META[c.mechanic as keyof typeof MECHANIC_META] ?? MECHANIC_META.shake
                return (
                  <span
                    key={c.id}
                    className="text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm"
                    style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.25)' }}
                  >
                    {meta.label}
                  </span>
                )
              })}
            </div>
          </div>
          <div className="p-4 lg:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-base font-extrabold text-gray-900 truncate">{biz.name}</h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{biz.tagline || biz.businessType}</p>
              </div>
              {topWinRate > 0 ? (
                <span className="shrink-0 text-[10px] font-bold px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                  Up to {topWinRate}% win
                </span>
              ) : hasStamp ? (
                <span className="shrink-0 text-[10px] font-bold px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                  Stamp card
                </span>
              ) : null}
            </div>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-400">{biz.city} · {biz.campaigns.length} live</span>
              <span className="text-xs font-bold text-purple-600 group-hover:text-purple-800 transition-colors">
                Play now →
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export function CustomerPage() {
  const { firstName } = useCustomerSession()
  const { data: businesses, isLoading } = useBusinessesWithCampaigns()
  const [search, setSearch] = useState('')

  const filtered = (businesses ?? []).filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.city.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="min-h-dvh bg-[#f8f6ff] pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
      <div className="relative overflow-hidden">
        <div
          className="px-5 lg:px-8 pt-12 pb-8 relative z-10"
          style={{ background: 'linear-gradient(145deg, #4C1D95 0%, #6D28D9 45%, #5B21B6 100%)' }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-300/15 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />

          <div className="max-w-4xl mx-auto relative">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-purple-200 text-xs font-medium flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Welcome back
                </p>
                <h1 className="text-white text-2xl lg:text-3xl font-extrabold mt-1">{firstName} 👋</h1>
                <p className="text-purple-200/80 text-sm mt-1">Shake, win rewards & save at your favourite spots</p>
              </div>
              <button className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/15 cursor-pointer hover:bg-white/15 transition-colors">
                <Bell className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search cafes, restaurants…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm border-0 shadow-lg shadow-purple-900/20 focus:outline-none focus:ring-2 focus:ring-purple-300/50 bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 lg:px-8 -mt-4 relative z-20 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-4 shadow-sm border border-purple-100/80 mb-6 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
            <Gift className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">How to play</p>
            <p className="text-xs text-gray-500">Pick a vendor → enter staff PIN → shake to win!</p>
          </div>
        </motion.div>

        <h2 className="text-base font-extrabold text-gray-900 mb-4 flex items-center gap-2">
          <Store className="w-4 h-4 text-purple-600" />
          Vendors with live games
        </h2>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 px-6 bg-white rounded-3xl border border-gray-100">
            <p className="text-5xl mb-4">🏪</p>
            <p className="font-bold text-gray-700">No vendors with active campaigns</p>
            <p className="text-xs text-gray-400 mt-2">New shake & win games appear here when vendors launch them</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {filtered.map((biz, i) => (
              <BusinessCard key={biz.id} biz={biz} index={i} />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
