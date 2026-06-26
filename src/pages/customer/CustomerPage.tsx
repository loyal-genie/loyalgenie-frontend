import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bell, Loader2, Search } from 'lucide-react'
import { BottomNav } from '@/components/customer/bottom-nav'
import { BusinessListingCard } from '@/components/customer/BusinessListingCard'
import { CategoryFilter } from '@/components/customer/CategoryFilter'
import { PromoHeroBanner } from '@/components/customer/PromoHeroBanner'
import { categoryMatches, type CustomerCategory } from '@/lib/customer-ui'
import { sortBusinessesByDistance } from '@/lib/business-display'
import { useCustomerSession } from '@/hooks/useCustomerSession'
import { useBusinessesWithCampaigns, useCustomerNotifications } from '@/hooks/useCustomerData'
import { useUserLocation } from '@/hooks/useUserLocation'

export function CustomerPage() {
  const navigate = useNavigate()
  const { firstName } = useCustomerSession()
  const { data: businesses, isLoading } = useBusinessesWithCampaigns()
  const { data: notificationData } = useCustomerNotifications()
  const notificationCount = notificationData?.unreadCount ?? 0
  const userCoords = useUserLocation()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<CustomerCategory>('All')

  const sortedBusinesses = useMemo(
    () => sortBusinessesByDistance(businesses ?? [], userCoords?.lat, userCoords?.lng),
    [businesses, userCoords],
  )

  const filtered = useMemo(() => {
    return sortedBusinesses.filter(b => {
      const matchSearch =
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.city.toLowerCase().includes(search.toLowerCase()) ||
        b.tagline?.toLowerCase().includes(search.toLowerCase())
      return matchSearch && categoryMatches(b.businessType, category)
    })
  }, [sortedBusinesses, search, category])

  return (
    <div className="min-h-dvh bg-gray-50 pb-[calc(5rem+env(safe-area-inset-bottom))]">
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
            onClick={() => navigate('/customer/notifications')}
            className="relative w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border-0 cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-white" />
            {notificationCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-red-500 text-[9px] font-black text-white flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="relative"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-[18px] text-[#9ca3af] pointer-events-none" />
          <input
            type="search"
            placeholder="Search cafes, restaurants…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 rounded-full text-[15px] border-0 shadow-[0_4px_20px_rgba(0,0,0,0.08)] focus:outline-none focus:ring-2 focus:ring-white/40 bg-white text-[#2b2827] placeholder:text-[#9ca3af]"
          />
        </motion.div>
      </div>

      <div className="bg-white rounded-t-3xl -mt-3 px-5 pt-5 min-h-[50vh]">
        <PromoHeroBanner businesses={sortedBusinesses} className="mb-4" />

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
            filtered.map(biz => (
              <BusinessListingCard key={biz.id} biz={biz} userCoords={userCoords} />
            ))
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
