import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Loader2, Search } from 'lucide-react'
import { BottomNav } from '@/components/customer/bottom-nav'
import { BusinessListingCard } from '@/components/customer/BusinessListingCard'
import { CategoryFilter } from '@/components/customer/CategoryFilter'
import { categoryMatches, type CustomerCategory } from '@/lib/customer-ui'
import { useBusinessesWithCampaigns, useCustomerRewards } from '@/hooks/useCustomerData'

const WALLET_SUMMARY = [
  { label: 'Stamps', emoji: '🧾', countKey: 'stamp' as const },
  { label: 'Shake', emoji: '🤳', countKey: 'shake' as const },
  { label: 'Check-in', emoji: '📍', countKey: 'check-in-loyalty' as const },
]

export function CustomerDiscoverPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<CustomerCategory>('All')
  const { data: businesses, isLoading } = useBusinessesWithCampaigns()
  const { data: rewards = [] } = useCustomerRewards()

  const walletCounts = useMemo(() => {
    const active = rewards.filter(r => r.status === 'earned' || r.status === 'pending')
    const counts: Record<string, number> = {}
    for (const r of active) {
      counts[r.mechanic] = (counts[r.mechanic] ?? 0) + 1
    }
    return counts
  }, [rewards])

  const filtered = useMemo(() => {
    return (businesses ?? []).filter(b => {
      const matchSearch =
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.city.toLowerCase().includes(search.toLowerCase()) ||
        b.businessType.toLowerCase().includes(search.toLowerCase())
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

        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="relative mb-5">
          <p className="text-purple-200 text-xs font-medium tracking-wide">Explore nearby</p>
          <h1 className="text-white text-xl font-extrabold mt-0.5">Discover</h1>
        </motion.div>

        <Link to="/customer/wallet" className="block no-underline mb-1">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            whileTap={{ scale: 0.98 }}
            className="relative rounded-2xl p-3 overflow-hidden flex gap-3 overflow-x-auto"
            style={{
              background: 'rgba(255,255,255,0.10)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            {WALLET_SUMMARY.map(item => (
              <div key={item.label} className="shrink-0 flex flex-col items-center min-w-[56px]">
                <span className="text-xl">{item.emoji}</span>
                <span className="text-sm font-extrabold text-white">{walletCounts[item.countKey] ?? 0}</span>
                <span className="text-[9px] text-purple-200/80">{item.label}</span>
              </div>
            ))}
          </motion.div>
        </Link>
      </div>

      <div className="bg-white rounded-t-3xl -mt-3 px-5 pt-5 min-h-[50vh]">
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#6b6461]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search cafes, salons, gyms…"
            className="w-full pl-11 pr-4 py-3 rounded-2xl text-base border border-[#e5e0dc] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5b0e81]/20 bg-white"
          />
        </div>

        <CategoryFilter value={category} onChange={setCategory} className="mb-4" />

        <div className="flex flex-col gap-4 pb-4">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="size-8 text-[#5b0e81] animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-[#6b6461] text-sm">No businesses found.</div>
          ) : (
            filtered.map(biz => <BusinessListingCard key={biz.id} biz={biz} />)
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
