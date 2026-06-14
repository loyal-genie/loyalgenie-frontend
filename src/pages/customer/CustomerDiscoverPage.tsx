import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Search, MapPin, Star } from 'lucide-react'
import { BottomNav } from '@/components/customer/bottom-nav'
import { customerBusinesses } from '@/lib/mock-data'
import { MECHANIC_META } from '@/lib/utils'
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
      <Link to={`/customer/business/${biz.id}`}>
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow active:scale-[0.98]">
          {/* Cover */}
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
              {biz.mechanics.map(m => {
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
          {/* Info */}
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
              <span className="text-xs text-gray-400 flex items-center gap-0.5">
                <MapPin className="w-3 h-3" />
                {biz.location.split(',')[0]}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export function CustomerDiscoverPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<Category>('All')
  const [mapView, setMapView] = useState(false)

  const filtered = customerBusinesses.filter(b => {
    const matchCat = category === 'All' || b.category === category
    const matchSearch =
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.location.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-5 pt-12 pb-4">
        <div className="flex items-center justify-between mb-1">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-base font-extrabold text-gray-900">Discover</h1>
          <button
            onClick={() => setMapView(v => !v)}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-purple-700 transition-colors"
          >
            <span className={`w-2 h-2 rounded-full ${mapView ? 'bg-green-400' : 'bg-gray-300'}`} />
            {mapView ? 'List view' : 'Map view'}
          </button>
        </div>
      </div>

      <div className="px-5 pt-4">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search cafes, salons, gyms…"
            className="w-full pl-9 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100 transition"
          />
        </div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                category === cat
                  ? 'bg-purple-800 text-white border-purple-800'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">No businesses found.</div>
          ) : (
            filtered.map(biz => <BusinessCard key={biz.id} biz={biz} />)
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
