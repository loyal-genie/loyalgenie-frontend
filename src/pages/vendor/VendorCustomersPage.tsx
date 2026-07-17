import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Crown, TrendingUp, Clock, Users, CalendarDays, Gamepad2, CheckCircle2, Loader2, Trophy } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { formatRelativeTime } from '@/lib/utils'
import { useVendorCustomers, useVendorDashboardStats } from '@/hooks/useVendorAnalytics'
import { daysSince, getCustomerSegment, type CustomerSegment } from '@/lib/vendor-customers'
import type { VendorCustomerSummary, VendorStatsPeriod } from '@/lib/api'

const SEGMENTS: { key: CustomerSegment | 'all'; label: string; icon: React.ReactNode; color: string; bg: string; border: string }[] = [
  { key: 'all',      label: 'All',      icon: <Users className="w-3.5 h-3.5" />,     color: '#6B68A8', bg: 'bg-v-surface-2',   border: 'border-v-border' },
  { key: 'loyalist', label: 'Loyalists', icon: <Crown className="w-3.5 h-3.5" />,     color: '#B45309', bg: 'bg-amber-50',       border: 'border-amber-200' },
  { key: 'regular',  label: 'Regulars',  icon: <TrendingUp className="w-3.5 h-3.5" />, color: '#1D4ED8', bg: 'bg-blue-50',        border: 'border-blue-200' },
  { key: 'at-risk',  label: 'At-Risk',   icon: <Clock className="w-3.5 h-3.5" />,      color: '#C2410C', bg: 'bg-orange-50',      border: 'border-orange-200' },
  { key: 'inactive', label: 'Inactive',  icon: null,                                    color: '#6B7280', bg: 'bg-gray-50',        border: 'border-gray-200' },
]

const BADGE: Record<CustomerSegment, { label: string; className: string }> = {
  loyalist: { label: 'Loyalist', className: 'bg-amber-100 text-amber-700 border border-amber-200' },
  regular:  { label: 'Regular',  className: 'bg-blue-100 text-blue-700 border border-blue-200' },
  'at-risk':{ label: 'At-Risk',  className: 'bg-orange-100 text-orange-700 border border-orange-200' },
  inactive: { label: 'Inactive', className: 'bg-gray-100 text-gray-500 border border-gray-200' },
}

type VisitWindow = 'all' | '7d' | '30d' | '3m' | '1y'

const VISIT_WINDOWS: { key: VisitWindow; label: string; days: number | null; statsPeriod: VendorStatsPeriod }[] = [
  { key: 'all', label: 'All time',  days: null, statsPeriod: 'all' },
  { key: '7d',  label: '7 Days',    days: 7,    statsPeriod: '7d' },
  { key: '30d', label: 'Month',     days: 30,   statsPeriod: 'month' },
  { key: '3m',  label: '3 Months',  days: 90,   statsPeriod: '3m' },
  { key: '1y',  label: 'Year',      days: 365,  statsPeriod: 'year' },
]

function winRate(c: VendorCustomerSummary) {
  return c.gamesPlayed > 0 ? Math.round((c.rewardsEarned / c.gamesPlayed) * 100) : 0
}

export function VendorCustomersPage() {
  const { data: customers = [], isLoading } = useVendorCustomers()
  const [search, setSearch] = useState('')
  const [segment, setSegment] = useState<CustomerSegment | 'all'>('all')
  const [visitWindow, setVisitWindow] = useState<VisitWindow>('all')

  const windowMeta = VISIT_WINDOWS.find(w => w.key === visitWindow)!
  const { data: stats } = useVendorDashboardStats(windowMeta.statsPeriod)

  const withSegments = customers.map(c => ({ ...c, segment: getCustomerSegment(c) }))

  const counts: Record<CustomerSegment | 'all', number> = {
    all: withSegments.length,
    loyalist: withSegments.filter(c => c.segment === 'loyalist').length,
    regular: withSegments.filter(c => c.segment === 'regular').length,
    'at-risk': withSegments.filter(c => c.segment === 'at-risk').length,
    inactive: withSegments.filter(c => c.segment === 'inactive').length,
  }

  const windowDays = windowMeta.days

  const filtered = withSegments.filter(c => {
    const matchSeg = segment === 'all' || c.segment === segment
    const q = search.toLowerCase()
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.phone.includes(q)
    const matchVisit = windowDays === null || daysSince(c.lastVisit) <= windowDays
    return matchSeg && matchSearch && matchVisit
  })

  const isFiltered = segment !== 'all' || visitWindow !== 'all' || search.length > 0

  const clearFilters = () => {
    setSegment('all')
    setVisitWindow('all')
    setSearch('')
  }

  // Same vendor metrics as Dashboard / Campaigns (Total Check-ins removed)
  const totalVisits = stats?.totalVisits ?? 0
  const totalPlays = stats?.totalPlays ?? 0
  const totalWins = stats?.totalWins ?? 0
  const totalRedeemed = stats?.totalRedeemed ?? 0

  const SUMMARY = [
    {
      label: 'Total Visits',
      value: totalVisits,
      sub: visitWindow === 'all'
        ? 'sum of customer days visited'
        : `distinct customer visit-days in ${windowMeta.label.toLowerCase()}`,
      icon: <CalendarDays className="w-4 h-4" />,
      color: 'text-v-purple',
      bg: 'bg-purple-50',
      border: 'border-purple-100',
    },
    {
      label: 'Total Plays',
      value: totalPlays,
      sub: visitWindow === 'all'
        ? 'all play events across the vendor'
        : `play events in ${windowMeta.label.toLowerCase()}`,
      icon: <Gamepad2 className="w-4 h-4" />,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-100',
    },
    {
      label: 'Total Wins',
      value: totalWins,
      sub: totalPlays > 0
        ? `${totalWins} of ${totalPlays} plays · rewards won`
        : 'rewards won',
      icon: <Trophy className="w-4 h-4" />,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
    },
    {
      label: 'Total Redemptions',
      value: totalRedeemed,
      sub: totalWins > 0
        ? `${totalRedeemed} of ${totalWins} wins claimed at the counter`
        : 'claimed at the counter',
      icon: <CheckCircle2 className="w-4 h-4" />,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-100',
    },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-extrabold text-v-text">Customers</h1>
        <p className="text-v-text-2 text-sm mt-1">
          {isLoading
            ? 'Loading…'
            : isFiltered
              ? `${filtered.length} of ${customers.length} registered`
              : `${customers.length} registered`}
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.03 }}
        className="flex flex-wrap items-center gap-1 bg-v-surface-2 border border-v-border rounded-xl p-1 w-fit mb-5">
        {VISIT_WINDOWS.map(w => (
          <button key={w.key} onClick={() => setVisitWindow(w.key)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all border-0 cursor-pointer ${visitWindow === w.key ? 'bg-white text-v-text shadow-sm border border-v-border' : 'text-v-text-3 hover:text-v-text-2'}`}>
            {w.label}
          </button>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.04 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7"
      >
        {SUMMARY.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 + i * 0.04 }}>
            <Card className={`p-4 border ${s.border} ${s.bg} flex flex-col gap-2 h-full`}>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center bg-white shadow-sm ${s.color}`}>
                {s.icon}
              </div>
              <div className={`text-2xl font-black ${s.color}`}>{s.value.toLocaleString()}</div>
              <div className="text-[11px] font-semibold text-v-text leading-tight">{s.label}</div>
              <div className="text-[10px] font-medium text-v-text-3 leading-tight">{s.sub}</div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }} className="flex flex-wrap gap-2 mb-6">
        {SEGMENTS.map(seg => {
          const active = segment === seg.key
          return (
            <button
              key={seg.key}
              onClick={() => setSegment(seg.key)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border-2 text-xs font-semibold transition-all border-0 cursor-pointer ${
                active ? `${seg.bg} ${seg.border} border-2` : 'bg-white border-v-border text-v-text-3 hover:border-v-border-b hover:text-v-text-2'
              }`}
              style={active ? { color: seg.color } : {}}
            >
              {seg.icon}
              {seg.label}
              <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${active ? '' : 'bg-v-surface-2 text-v-text-3'}`}
                style={active ? { background: `${seg.color}18`, color: seg.color } : {}}>
                {counts[seg.key]}
              </span>
            </button>
          )
        })}
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }}
        className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-v-text-3" />
          <input
            type="text"
            placeholder="Search by name or phone…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-v-surface border border-v-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-v-text placeholder:text-v-text-3 focus:outline-none focus:border-v-purple transition-all"
          />
        </div>
        {isFiltered && (
          <button onClick={clearFilters}
            className="text-xs text-v-purple font-semibold hover:underline shrink-0 border-0 bg-transparent cursor-pointer">
            Clear filters
          </button>
        )}
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-v-purple animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">{customers.length === 0 ? '👥' : '🔍'}</div>
              <p className="text-sm font-semibold text-v-text-2">
                {customers.length === 0 ? 'No customers yet' : 'No customers match'}
              </p>
              <p className="text-xs text-v-text-3 mt-1">
                {customers.length === 0
                  ? 'Customers appear here after they play your campaigns'
                  : 'Try a different segment or visit window'}
              </p>
              {isFiltered && (
                <button onClick={clearFilters}
                  className="mt-3 text-xs text-v-purple font-semibold hover:underline border-0 bg-transparent cursor-pointer">
                  Clear all filters
                </button>
              )}
            </div>
          )}
          {filtered.map((c, i) => {
            const badge = BADGE[c.segment]
            const days = daysSince(c.lastVisit)
            const rate = winRate(c)
            return (
              <motion.div key={c.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Link to={`/vendor/customers/${c.id}`}>
                  <Card hover className="px-5 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-v-purple/20 border border-v-purple/30 flex items-center justify-center text-base font-extrabold text-v-purple shrink-0">
                        {c.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-v-text">{c.name}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${badge.className}`}>
                            {badge.label}
                          </span>
                        </div>
                        <p className="text-xs text-v-text-3 mt-0.5">
                          {c.phone || c.email} · Joined {formatRelativeTime(c.joinedAt)}
                        </p>
                      </div>
                      <div className="hidden md:flex items-center gap-7 text-right shrink-0">
                        <div>
                          <div className="text-sm font-bold text-v-text">{c.totalVisits}</div>
                          <div className="text-[10px] text-v-text-3">Visits</div>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-v-text">{c.gamesPlayed}</div>
                          <div className="text-[10px] text-v-text-3">Games</div>
                        </div>
                        <div>
                          <div className={`text-sm font-bold ${rate >= 50 ? 'text-v-success' : rate > 0 ? 'text-v-gold' : 'text-v-text-3'}`}>{rate}%</div>
                          <div className="text-[10px] text-v-text-3">Win rate</div>
                        </div>
                        <div>
                          <div className={`text-sm font-bold ${days > 45 ? 'text-gray-400' : days > 14 ? 'text-orange-500' : 'text-v-text'}`}>
                            {!c.lastVisit ? '—' : days === 0 ? 'Today' : `${days}d ago`}
                          </div>
                          <div className="text-[10px] text-v-text-3">Last visit</div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
