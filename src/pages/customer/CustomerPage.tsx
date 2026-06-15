import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bell, Search, Loader2, Store } from 'lucide-react'
import { BottomNav } from '@/components/customer/bottom-nav'
import { MECHANIC_META } from '@/lib/utils'
import { useCustomerSession } from '@/hooks/useCustomerSession'
import { useBusinessesWithCampaigns } from '@/hooks/useCustomerData'
import type { BusinessWithCampaigns } from '@/lib/api'

const CATEGORY_EMOJI: Record<string, string> = {
  Cafe: '☕', Restaurant: '🍝', Salon: '✂️', Gym: '🏋️', Jewellery: '💎',
}

function BusinessCard({ biz }: { biz: BusinessWithCampaigns }) {
  const emoji = CATEGORY_EMOJI[biz.businessType] ?? '🏪'
  const shakeCampaigns = biz.campaigns.filter(c => c.mechanic === 'shake')

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
    >
      <Link to={`/customer/business/${biz.id}`} className="no-underline">
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow active:scale-[0.98]">
          <div
            className="relative h-[160px] lg:h-[180px] flex items-end p-3"
            style={{ background: `linear-gradient(135deg, ${biz.brandColor}, ${biz.brandColor}99)` }}
          >
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl opacity-30 select-none">
              {emoji}
            </span>
            <div className="flex flex-wrap gap-1 z-10">
              {shakeCampaigns.map(c => {
                const meta = MECHANIC_META.shake
                return (
                  <span
                    key={c.id}
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
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{biz.tagline || biz.businessType}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
              <span>{biz.city}</span>
              <span>·</span>
              <span>{biz.campaigns.length} active campaign{biz.campaigns.length !== 1 ? 's' : ''}</span>
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
    <div className="min-h-screen bg-gray-50 pb-24">
      <div
        className="px-5 lg:px-8 pt-12 pb-6"
        style={{ background: 'linear-gradient(135deg, #4C1D95, #5B21B6)' }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-purple-300 text-xs">Welcome back</p>
              <h1 className="text-white text-xl lg:text-2xl font-extrabold">{firstName} 👋</h1>
            </div>
            <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border-0 cursor-pointer">
              <Bell className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search vendors…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl text-sm border-0 focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>
        </div>
      </div>

      <div className="px-5 lg:px-8 pt-6 max-w-4xl mx-auto">
        <h2 className="text-base font-extrabold text-gray-900 mb-4 flex items-center gap-2">
          <Store className="w-4 h-4 text-purple-600" />
          Vendors near you
        </h2>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            <p className="text-4xl mb-3">🏪</p>
            <p className="font-semibold text-gray-600">No vendors with active campaigns yet</p>
            <p className="text-xs mt-1">Check back soon — new campaigns launch daily!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
            {filtered.map(biz => (
              <BusinessCard key={biz.id} biz={biz} />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
