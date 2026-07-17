import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Calendar, Phone, Mail, TrendingUp, Gift,
  CheckCircle2, Clock, Trophy, Crown, AlertTriangle, Zap, Loader2,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { MechanicBadge } from '@/components/ui/badge'
import { getMechanicEmoji, getMechanicLabel, formatDate, formatRelativeTime } from '@/lib/utils'
import { useVendorCustomer } from '@/hooks/useVendorAnalytics'
import { daysSince, getCustomerSegment } from '@/lib/vendor-customers'
import type { VendorCustomerDetail } from '@/lib/api'
import type { MechanicType } from '@/lib/types'

type Segment = 'loyalist' | 'regular' | 'at-risk' | 'inactive'

type Period = 'all' | '7d' | 'month' | '3m' | 'year'
const PERIODS: { key: Period; label: string }[] = [
  { key: 'all', label: 'All time' },
  { key: '7d', label: '7 Days' },
  { key: 'month', label: 'Month' },
  { key: '3m', label: '3 Months' },
  { key: 'year', label: 'Year' },
]
const PERIOD_DAYS: Record<Period, number> = { all: Infinity, '7d': 7, month: 30, '3m': 90, year: 365 }
const PERIOD_LABEL: Record<Period, string> = {
  all: 'all time',
  '7d': '7 days',
  month: 'this month',
  '3m': '3 months',
  year: 'this year',
}

/** Calendar day key in IST — one day with any play = one visit. */
function visitDayKey(iso: string): string {
  return new Date(iso).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
}

const SEGMENT_META: Record<Segment, {
  label: string; icon: string; color: string
  bg: string; border: string; textColor: string
  action: string; concern: string | null
}> = {
  loyalist: {
    label: 'Loyalist', icon: '👑', color: '#B45309',
    bg: 'bg-amber-50', border: 'border-amber-300', textColor: 'text-amber-700',
    action: 'Reward with an exclusive offer to sustain loyalty',
    concern: null,
  },
  regular: {
    label: 'Regular', icon: '📈', color: '#1D4ED8',
    bg: 'bg-blue-50', border: 'border-blue-300', textColor: 'text-blue-700',
    action: 'Nudge to Loyalist with a stamp card or streak reward',
    concern: null,
  },
  'at-risk': {
    label: 'At-Risk', icon: '⚠️', color: '#C2410C',
    bg: 'bg-orange-50', border: 'border-orange-300', textColor: 'text-orange-700',
    action: 'Launch a win-back campaign — they\'re slipping away',
    concern: 'Has not visited in 15–45 days. Risk of churn is high.',
  },
  inactive: {
    label: 'Inactive', icon: '💤', color: '#6B7280',
    bg: 'bg-gray-100', border: 'border-gray-300', textColor: 'text-gray-600',
    action: 'Re-engagement needed — personalised outreach may help',
    concern: 'Has not visited in over 45 days. Likely churned.',
  },
}

type VisitEvent = {
  id: string
  type: 'game_win' | 'game_loss' | 'reward_redeemed' | 'visit'
  label: string; sub?: string; mechanic?: MechanicType
  date: string; icon: string
}

function buildVisitHistory(customer: VendorCustomerDetail): VisitEvent[] {
  const events: VisitEvent[] = []

  customer.gameHistory.forEach(g => {
    events.push({
      id: g.id,
      type: g.won ? 'game_win' : 'game_loss',
      label: g.won ? `Won ${g.reward ?? 'a reward'}` : 'Played — no win this time',
      sub: g.campaignName,
      mechanic: g.mechanic as MechanicType,
      date: g.playedAt,
      icon: g.won ? '🎁' : getMechanicEmoji(g.mechanic),
    })
  })

  customer.rewards.filter(r => r.status === 'redeemed' && r.redeemedAt).forEach(r => {
    events.push({
      id: `rd-${r.id}`,
      type: 'reward_redeemed',
      label: `Redeemed "${r.reward}"`,
      sub: r.campaignName,
      mechanic: r.mechanic as MechanicType,
      date: r.redeemedAt!,
      icon: '✅',
    })
  })

  return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

function buildCampaignActivity(customer: VendorCustomerDetail) {
  const all = customer.campaignActivity.map(c => {
    const redeems = customer.rewards.filter(
      r => r.campaignId === c.id && r.status === 'redeemed',
    ).length
    return {
      id: c.id,
      name: c.name,
      mechanic: c.mechanic as MechanicType,
      plays: c.plays,
      wins: c.wins,
      redeems,
      status: c.status,
    }
  })
  return { active: all.filter(c => c.status === 'active'), previous: all.filter(c => c.status !== 'active') }
}

function buildRedemption(customer: VendorCustomerDetail) {
  const pending = customer.rewards.filter(r => r.status === 'pending' || r.status === 'earned')
  const redeemed = customer.rewards.filter(r => r.status === 'redeemed')
  return { pending, redeemed, total: customer.rewards.length }
}

function monthsSince(iso: string) {
  return Math.max(1, (Date.now() - new Date(iso).getTime()) / (30 * 86400000))
}

const EVENT_STYLE: Record<VisitEvent['type'], string> = {
  game_win:        'text-amber-600 bg-amber-50 border-amber-200',
  game_loss:       'text-v-text-3 bg-v-surface-2 border-v-border',
  reward_redeemed: 'text-v-success bg-emerald-50 border-emerald-200',
  visit:           'text-v-purple bg-v-surface-2 border-v-border',
}

const VISIT_FILTERS = [
  { key: '7d',  label: '7 Days' },
  { key: '30d', label: 'Month'  },
  { key: '90d', label: '3 Months' },
  { key: 'all', label: 'All time' },
] as const
type VisitFilter = typeof VISIT_FILTERS[number]['key']

type Tab = 'overview' | 'visits' | 'campaigns' | 'rewards'

export function VendorCustomerDetailPage() {
  const { id } = useParams()
  const { data: customer, isLoading, isError } = useVendorCustomer(id)
  const [tab, setTab] = useState<Tab>('overview')
  const [visitFilter, setVisitFilter] = useState<VisitFilter>('all')
  const [period, setPeriod] = useState<Period>('all')

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-v-purple animate-spin" />
      </div>
    )
  }

  if (isError || !customer) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 text-center py-20">
        <p className="text-v-text-2">Customer not found</p>
        <Link to="/vendor/customers" className="text-v-purple text-sm mt-4 inline-block">← Back to customers</Link>
      </div>
    )
  }

  const segment        = getCustomerSegment(customer)
  const segMeta        = SEGMENT_META[segment]
  const visitHistory   = buildVisitHistory(customer)
  const campaignAct    = buildCampaignActivity(customer)
  const redemption     = buildRedemption(customer)
  const daysAgo        = daysSince(customer.lastVisit)
  const visitsPerMonth = Math.round((customer.totalVisits / monthsSince(customer.joinedAt)) * 10) / 10
  const winRatePct     = customer.gamesPlayed > 0
    ? Math.round((customer.rewardsEarned / customer.gamesPlayed) * 100) : 0

  const periodDays = PERIOD_DAYS[period]
  const inPeriod = (iso: string) => periodDays === Infinity || daysSince(iso) <= periodDays

  const gamesInPeriod = customer.gameHistory.filter(g => inPeriod(g.playedAt))
  const playsInPeriod = gamesInPeriod.length
  const winsInPeriod = gamesInPeriod.filter(g => g.won).length
  const redeemsInPeriod = customer.rewards.filter(r =>
    r.status === 'redeemed' && r.redeemedAt && inPeriod(r.redeemedAt)
  ).length
  // Visits = distinct calendar days with at least one play (not play count)
  const visitsInPeriod = new Set(gamesInPeriod.map(g => visitDayKey(g.playedAt))).size
  const points = customer.totalLoyaltyPoints
  const periodPhrase = PERIOD_LABEL[period]

  const filteredHistory = visitHistory.filter(e => {
    if (visitFilter === 'all') return true
    const cutoff = { '7d': 7, '30d': 30, '90d': 90 }[visitFilter]
    return daysSince(e.date) <= cutoff
  })

  const isAtRisk = segment === 'at-risk' || segment === 'inactive'
  const pendingBadgeCount = customer.rewards.filter(r => r.status === 'pending').length
  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'overview',  label: 'Overview' },
    { key: 'campaigns', label: 'Campaigns',     count: campaignAct.active.length + campaignAct.previous.length },
    { key: 'rewards',   label: 'Rewards',       count: pendingBadgeCount || undefined },
    // Badge = distinct visit days (same definition as No. of Visits), not play/event count
    { key: 'visits',    label: 'Visit History', count: customer.totalVisits },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <Link to="/vendor/customers" className="inline-flex items-center gap-1.5 text-sm text-v-text-2 hover:text-v-text mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Customers
        </Link>

        <div className="flex items-start gap-5">
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-v-surface-3 border border-v-border-b flex items-center justify-center text-2xl font-extrabold text-v-purple">
              {customer.name[0]}
            </div>
            <span className="absolute -bottom-1 -right-1 text-lg">{segMeta.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
              <h1 className="text-2xl font-extrabold text-v-text">{customer.name}</h1>
              <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-bold border ${segMeta.bg} ${segMeta.border} ${segMeta.textColor}`}>
                {segMeta.icon} {segMeta.label}
              </span>
              {pendingBadgeCount > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-semibold bg-amber-50 border border-amber-300 text-amber-700">
                  <Gift className="w-3 h-3" /> {pendingBadgeCount} reward{pendingBadgeCount > 1 ? 's' : ''} pending
                </span>
              )}
            </div>
            <div className="flex items-center gap-5 flex-wrap text-xs text-v-text-3">
              <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" />{customer.phone}</span>
              <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" />{customer.email}</span>
              <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" />Joined {formatDate(customer.joinedAt.slice(0, 10))}</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                <span className={daysAgo > 14 ? 'text-orange-500 font-semibold' : ''}>
                  Last visit {customer.lastVisit ? (daysAgo === 0 ? 'today' : `${daysAgo}d ago`) : 'never'}
                </span>
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {isAtRisk && (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className={`flex items-start gap-3 px-4 py-3 rounded-xl border mb-5 ${segMeta.bg} ${segMeta.border}`}>
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: segMeta.color }} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" style={{ color: segMeta.color }}>{segMeta.concern}</p>
            <p className="text-xs mt-0.5" style={{ color: segMeta.color }}>{segMeta.action}</p>
          </div>
          <Link to="/vendor/campaigns/create">
            <button type="button" className="text-xs px-3 py-1.5 rounded-lg font-semibold border transition-all hover:opacity-80 shrink-0 cursor-pointer"
              style={{ borderColor: segMeta.color, color: segMeta.color, background: 'white' }}>
              Launch Campaign
            </button>
          </Link>
        </motion.div>
      )}

      {/* Stat period filter */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.06 }}
        className="inline-flex items-center gap-1 p-1.5 rounded-full bg-v-purple/5 border border-v-purple/10 w-fit mb-3 flex-wrap">
        {PERIODS.map(p => (
          <button key={p.key} type="button" onClick={() => setPeriod(p.key)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap border-0 cursor-pointer ${period === p.key ? 'bg-white text-v-text shadow-sm' : 'bg-transparent text-v-purple/50 hover:text-v-purple'}`}>
            {p.label}
          </button>
        ))}
      </motion.div>

      {/* Decision Stats — matches prototype */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {[
          {
            label: 'No. of Visits',
            value: visitsInPeriod,
            sub: period === 'all'
              ? `${visitsInPeriod} distinct days visited`
              : `days visited in ${periodPhrase}`,
            icon: '📅', color: '#7C3AED',
          },
          {
            label: 'Plays',
            value: playsInPeriod,
            sub: `${playsInPeriod} play events · ${visitsInPeriod} visit days`,
            icon: '🎮', color: '#DB2777',
          },
          {
            label: 'Wins',
            value: winsInPeriod,
            sub: playsInPeriod > 0
              ? `${winsInPeriod} of ${playsInPeriod} plays`
              : 'rewards won',
            icon: '🎯', color: '#D97706',
          },
          {
            label: 'Redeems',
            value: redeemsInPeriod,
            sub: winsInPeriod > 0
              ? `${redeemsInPeriod} of ${winsInPeriod} wins claimed`
              : 'claimed at the counter',
            icon: '🎁', color: '#16A34A',
          },
          {
            label: 'Points',
            value: points.toLocaleString(),
            sub: 'available · same as customer',
            icon: '⭐', color: '#2563EB',
          },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.04 }} className="h-full">
            <Card className="p-4 h-full flex flex-col">
              <div className="text-xl mb-2">{s.icon}</div>
              <div className="text-xl font-black leading-none" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs text-v-text-3 mt-0.5 font-medium">{s.label}</div>
              <div className="text-[10px] text-v-text-3 mt-1 leading-snug line-clamp-2">{s.sub}</div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="flex gap-1 mb-6 bg-v-surface-2 border border-v-border rounded-xl p-1 flex-wrap">
        {tabs.map(t => (
          <button key={t.key} type="button" onClick={() => setTab(t.key)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border-0 cursor-pointer ${tab === t.key ? 'bg-white text-v-text shadow-sm border border-v-border' : 'bg-transparent text-v-text-2 hover:text-v-text'}`}>
            {t.label}
            {t.count !== undefined && (
              <span className={`text-[10px] min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center font-bold ${tab === t.key ? 'bg-v-purple text-white' : 'bg-v-border text-v-text-3'}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>

        {tab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Crown className="w-4 h-4 text-v-purple" />
                  <h3 className="text-sm font-bold text-v-text">Loyalty Profile</h3>
                </div>
                <div className={`rounded-xl p-4 border mb-4 ${segMeta.bg} ${segMeta.border}`}>
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="text-2xl">{segMeta.icon}</span>
                    <div>
                      <div className="text-base font-black" style={{ color: segMeta.color }}>{segMeta.label}</div>
                      <div className="text-[11px]" style={{ color: segMeta.color }}>
                        {segment === 'loyalist' ? `${customer.totalVisits} total visits · Very engaged` :
                         segment === 'regular'  ? `${customer.totalVisits} visits · Building habit` :
                         segment === 'at-risk'  ? `${daysAgo} days since last visit` :
                                                  `${daysAgo} days since last visit — churned`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5 pt-3 border-t" style={{ borderColor: `${segMeta.color}30` }}>
                    <Zap className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: segMeta.color }} />
                    <p className="text-xs font-medium" style={{ color: segMeta.color }}>{segMeta.action}</p>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {[
                    { label: 'Member since',    value: formatDate(customer.joinedAt) },
                    { label: 'Visit frequency', value: `${visitsPerMonth}× / month` },
                    { label: 'Games played',    value: `${customer.gamesPlayed} (${winRatePct}% win rate)` },
                    { label: 'Available points',  value: String(customer.totalLoyaltyPoints) },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between text-xs">
                      <span className="text-v-text-3">{row.label}</span>
                      <span className="font-semibold text-v-text">{row.value}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Gift className="w-4 h-4 text-v-purple" />
                  <h3 className="text-sm font-bold text-v-text">Reward Summary</h3>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: 'Total',    value: redemption.total,           color: 'text-v-purple', bg: 'bg-v-surface-3 border-v-border-b' },
                    { label: 'Pending',  value: redemption.pending.length,  color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
                    { label: 'Redeemed', value: redemption.redeemed.length, color: 'text-v-success', bg: 'bg-emerald-50 border-emerald-200' },
                  ].map(s => (
                    <div key={s.label} className={`rounded-xl p-3 border text-center ${s.bg}`}>
                      <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
                      <div className="text-[10px] text-v-text-3 mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>
                {redemption.total > 0 ? (
                  <div>
                    <div className="flex h-2.5 rounded-full overflow-hidden bg-v-surface-3 mb-1.5">
                      <div className="h-full bg-v-success transition-all" style={{ width: `${(redemption.redeemed.length / redemption.total) * 100}%` }} />
                      <div className="h-full bg-amber-400 transition-all" style={{ width: `${(redemption.pending.length / redemption.total) * 100}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-v-text-3">
                      <span>{Math.round((redemption.redeemed.length / Math.max(1, redemption.total)) * 100)}% redeemed</span>
                      <span>{redemption.pending.length} pending · {redemption.redeemed.length} redeemed</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-v-text-3 text-center py-2">No rewards yet</p>
                )}

                <div className="mt-4 pt-4 border-t border-v-border">
                  <div className="flex items-center justify-between mb-2.5">
                    <p className="text-xs font-semibold text-v-text">Campaigns</p>
                    <button type="button" onClick={() => setTab('campaigns')} className="text-[10px] text-v-purple font-semibold hover:underline border-0 bg-transparent cursor-pointer">
                      View all
                    </button>
                  </div>
                  {campaignAct.active.length + campaignAct.previous.length === 0 ? (
                    <p className="text-xs text-v-text-3">No campaigns yet</p>
                  ) : (
                    <div className="space-y-1.5">
                      {[...campaignAct.active.map(c => ({ ...c, live: true })), ...campaignAct.previous.map(c => ({ ...c, live: false }))].map(c => (
                        <div key={c.id} className="flex items-center gap-2.5 p-2 bg-v-surface-2 border border-v-border rounded-lg">
                          <span className="text-base shrink-0">{getMechanicEmoji(c.mechanic)}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-v-text truncate">{c.name}</p>
                            <p className="text-[10px] text-v-text-3">{c.plays} plays · {c.wins} wins</p>
                          </div>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${c.live ? 'bg-emerald-50 text-v-success border border-emerald-200' : 'bg-v-surface-3 text-v-text-3 border border-v-border'}`}>
                            {c.live ? 'Live' : 'Ended'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </div>

            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-v-purple" />
                  <h3 className="text-sm font-bold text-v-text">Recent Activity</h3>
                </div>
                <button type="button" onClick={() => setTab('visits')} className="text-xs text-v-purple font-semibold hover:underline border-0 bg-transparent cursor-pointer">
                  Full history
                </button>
              </div>
              {visitHistory.length === 0 ? (
                <p className="text-sm text-v-text-3 text-center py-4">No activity yet</p>
              ) : (
                <div className="space-y-3">
                  {visitHistory.slice(0, 5).map(event => (
                    <div key={event.id} className="flex items-start gap-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm border shrink-0 ${EVENT_STYLE[event.type]}`}>
                        {event.icon}
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className="text-xs font-semibold text-v-text">{event.label}</p>
                        {event.sub && <p className="text-[10px] text-v-text-3">{event.sub}</p>}
                      </div>
                      <span className="text-[10px] text-v-text-3 shrink-0 pt-0.5">{formatRelativeTime(event.date)}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {tab === 'campaigns' && (
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-v-success animate-pulse" />
                <h3 className="text-sm font-bold text-v-text">Active Campaigns</h3>
                <span className="text-xs text-v-text-3">({campaignAct.active.length})</span>
              </div>
              {campaignAct.active.length === 0 ? (
                <Card className="p-5 text-center">
                  <p className="text-sm text-v-text-3">Not in any active campaigns</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {campaignAct.active.map(c => (
                    <Card key={c.id} className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-v-surface-2 border border-v-border flex items-center justify-center text-xl shrink-0">
                          {getMechanicEmoji(c.mechanic)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-v-text leading-tight truncate">{c.name}</p>
                          <p className="text-xs text-v-text-3 mt-0.5">{getMechanicLabel(c.mechanic)}</p>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-v-success border border-emerald-200 shrink-0">Live</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        {[
                          { label: 'Plays',   value: c.plays },
                          { label: 'Wins',    value: c.wins },
                          { label: 'Redeems', value: c.redeems },
                        ].map(s => (
                          <div key={s.label} className="text-center p-2 bg-v-surface-2 rounded-lg border border-v-border">
                            <div className="text-sm font-bold text-v-text">{s.value}</div>
                            <div className="text-[10px] text-v-text-3">{s.label}</div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-3.5 h-3.5 text-v-text-3" />
                <h3 className="text-sm font-bold text-v-text">Previous Campaigns</h3>
                <span className="text-xs text-v-text-3">({campaignAct.previous.length})</span>
              </div>
              {campaignAct.previous.length === 0 ? (
                <Card className="p-5 text-center">
                  <p className="text-sm text-v-text-3">No previous campaign history</p>
                </Card>
              ) : (
                <div className="space-y-2">
                  {campaignAct.previous.map(c => (
                    <Card key={c.id} className="p-3.5 opacity-80">
                      <div className="flex items-center gap-3">
                        <div className="text-xl shrink-0">{getMechanicEmoji(c.mechanic)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-v-text truncate">{c.name}</p>
                          <p className="text-xs text-v-text-3">{c.plays} plays · {c.wins} wins · {c.redeems} redeems</p>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-v-surface-3 text-v-text-3 border border-v-border shrink-0">Ended</span>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'rewards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-v-text">Rewards Wallet</h3>
                <span className="text-xs text-v-text-3 ml-auto">{customer.rewards.length} total</span>
              </div>
              {customer.rewards.length === 0 ? (
                <p className="text-sm text-v-text-3 text-center py-8">No rewards yet</p>
              ) : (
                <div className="space-y-2.5">
                  {customer.rewards.map(r => (
                    <div key={r.id} className={`p-3.5 rounded-xl border transition-all ${
                      r.status === 'redeemed'
                        ? 'border-v-border bg-v-surface-2 opacity-60'
                        : 'border-amber-200 bg-amber-50'
                    }`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-sm font-bold text-v-text">{r.reward}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                              r.status === 'redeemed'
                                ? 'bg-v-surface-3 text-v-text-3'
                                : 'bg-emerald-50 text-v-success border border-emerald-200'
                            }`}>
                              {r.status}
                            </span>
                          </div>
                          <p className="text-xs text-v-text-3">{r.campaignName}</p>
                          <p className="text-[10px] text-v-text-3 font-mono mt-1">{r.code}</p>
                          {r.redeemedAt && (
                            <p className="text-[10px] text-v-text-3 mt-0.5 flex items-center gap-1">
                              <CheckCircle2 className="w-2.5 h-2.5 text-v-success" />
                              Redeemed {formatRelativeTime(r.redeemedAt)}
                            </p>
                          )}
                        </div>
                        <MechanicBadge mechanic={r.mechanic} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-v-purple" />
                <h3 className="text-sm font-bold text-v-text">Game History</h3>
                <span className="text-xs text-v-text-3 ml-auto">{customer.gameHistory.length} plays</span>
              </div>
              {customer.gameHistory.length === 0 ? (
                <p className="text-sm text-v-text-3 text-center py-8">No games played yet</p>
              ) : (
                <div className="space-y-2.5">
                  {customer.gameHistory.map(g => (
                    <div key={g.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-v-surface-2 border border-transparent hover:border-v-border transition-all">
                      <div className="w-9 h-9 rounded-xl bg-v-surface-3 border border-v-border flex items-center justify-center text-lg shrink-0">
                        {getMechanicEmoji(g.mechanic)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-v-text truncate">{g.campaignName}</p>
                        <p className="text-xs text-v-text-3">{formatRelativeTime(g.playedAt)}</p>
                      </div>
                      <div className="text-right shrink-0">
                        {g.won ? (
                          <div className="text-xs font-bold text-amber-600">🎁 Won</div>
                        ) : (
                          <div className="text-xs text-v-text-3">No win</div>
                        )}
                        {g.reward && <div className="text-[10px] text-v-text-3 mt-0.5">{g.reward}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {tab === 'visits' && (
          <Card className="p-5">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-v-purple" />
                <h3 className="text-sm font-bold text-v-text">Visit History</h3>
                <span className="text-xs text-v-text-3">
                  · {customer.totalVisits} visit day{customer.totalVisits === 1 ? '' : 's'} · {visitHistory.length} events
                </span>
              </div>
              <div className="flex items-center gap-1 bg-v-surface-2 border border-v-border rounded-xl p-1">
                {VISIT_FILTERS.map(f => (
                  <button key={f.key} type="button" onClick={() => setVisitFilter(f.key)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all border-0 cursor-pointer ${visitFilter === f.key ? 'bg-white text-v-text shadow-sm border border-v-border' : 'bg-transparent text-v-text-3 hover:text-v-text-2'}`}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            {filteredHistory.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-3xl mb-2">📭</div>
                <p className="text-sm text-v-text-3">No activity in this period</p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-[13px] top-4 bottom-4 w-px bg-v-border" />
                <div className="space-y-0">
                  {filteredHistory.map((event, i) => (
                    <motion.div key={event.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
                      className="flex gap-4 pb-4 last:pb-0">
                      <div className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-sm border-2 shrink-0 ${EVENT_STYLE[event.type]}`}>
                        {event.icon}
                      </div>
                      <div className="flex-1 pt-0.5 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-v-text">{event.label}</p>
                            {event.sub && <p className="text-xs text-v-text-3 mt-0.5">{event.sub}</p>}
                            {event.mechanic && (
                              <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 bg-v-surface-3 border border-v-border rounded-full text-v-text-2 font-medium">
                                {getMechanicEmoji(event.mechanic)} {getMechanicLabel(event.mechanic)}
                              </span>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-[10px] text-v-text-3">{formatRelativeTime(event.date)}</p>
                            <p className="text-[10px] text-v-text-3">{new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

      </motion.div>
    </div>
  )
}
