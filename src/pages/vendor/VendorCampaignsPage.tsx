import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Search, LayoutList, LayoutGrid, ArrowUpDown,
  CalendarDays, Users, Trophy, TrendingUp, Gift,
  Eye, Loader2, RefreshCw, Pencil,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, ProgressBar } from '@/components/ui/card'
import { MechanicBadge, StatusBadge } from '@/components/ui/badge'
import { MechanicComingSoonBadge } from '@/components/vendor/MechanicComingSoonBanner'
import { LivePIN } from '@/components/vendor/live-pin'
import { useCampaigns } from '@/hooks/useCampaigns'
import { getMechanicEmoji, getMechanicColor, formatDate, capPercent } from '@/lib/utils'
import { ApiErrorBanner } from '@/components/shared/ApiErrorBanner'
import type { CampaignDto } from '@/lib/api'
import {
  campaignDaysLeft,
  campaignDaysLeftLabel,
  effectiveCampaignStatus,
  todayInCampaignTz,
} from '@/lib/campaign-dates'

function engagementRate(c: CampaignDto) {
  return c.userCap > 0 ? Math.round((c.currentUsers / c.userCap) * 100) : 0
}
function redemptionRate(c: CampaignDto) {
  return c.rewardsClaimed > 0 ? Math.round((c.redeemedCount / c.rewardsClaimed) * 100) : 0
}
import type { CampaignStatus } from '@/lib/types'

// ── Helpers ──────────────────────────────────────────────────────────────────
const TODAY = todayInCampaignTz()
const TODAY_DATE = new Date(`${TODAY}T12:00:00`)

function daysLeft(endDate: string) {
  return campaignDaysLeft(endDate, TODAY)
}
function daysLeftLabel(endDate: string) {
  return campaignDaysLeftLabel(endDate, TODAY)
}
function winRate(c: CampaignDto) {
  return c.participations > 0 ? Math.round((c.rewardsClaimed / c.participations) * 100) : 0
}

// ── Date-window filter ────────────────────────────────────────────────────────
type DateWindow = 'all' | '7d' | '30d' | '90d' | '1y'
const DATE_WINDOWS: { key: DateWindow; label: string; days: number | null }[] = [
  { key: 'all', label: 'All time',  days: null },
  { key: '7d',  label: '7 Days',    days: 7    },
  { key: '30d', label: 'Month',     days: 30   },
  { key: '90d', label: '3 Months',  days: 90   },
  { key: '1y',  label: 'Year',      days: 365  },
]

function campaignsInWindow(campaigns: CampaignDto[], days: number | null) {
  if (days === null) return campaigns
  const windowStart = new Date(TODAY_DATE.getTime() - days * 86400000)
  return campaigns.filter(c =>
    new Date(c.startDate) <= TODAY_DATE && new Date(c.endDate) >= windowStart
  )
}

// ── Constants ─────────────────────────────────────────────────────────────────
const FILTERS: { label: string; value: CampaignStatus | 'all' }[] = [
  { label: 'All',    value: 'all'    },
  { label: 'Active', value: 'active' },
  { label: 'Draft',  value: 'draft'  },
  { label: 'Paused', value: 'paused' },
  { label: 'Ended',  value: 'ended'  },
]

const SORTS = [
  { label: 'Newest first',  value: 'newest'  },
  { label: 'Ending soon',   value: 'ending'  },
  { label: 'Most active',   value: 'popular' },
]

type SortKey = 'newest' | 'ending' | 'popular'
type ViewMode = 'list' | 'grid'

const activeCampaignsCount = (list: CampaignDto[]) =>
  list.filter(c => effectiveCampaignStatus(c.status as CampaignStatus, c.endDate, TODAY) === 'active').length

// ── Campaign row actions (always visible — no clipped dropdown) ───────────────
function CampaignCardActions({ id }: { id: string }) {
  return (
    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 shrink-0 self-start">
      <Link
        to={`/vendor/campaigns/${id}`}
        title="View details"
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-v-text-2 hover:text-v-purple hover:bg-v-purple/8 transition-colors no-underline"
      >
        <Eye className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">View</span>
      </Link>
      <Link
        to={`/vendor/campaigns/${id}/edit`}
        title="Edit & Pause"
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-v-purple bg-v-purple/10 hover:bg-v-purple/15 border border-v-purple/20 transition-colors no-underline"
      >
        <Pencil className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Edit</span>
      </Link>
    </div>
  )
}

// ── List card ─────────────────────────────────────────────────────────────────
function ListCard({ c }: { c: CampaignDto }) {
  const status = effectiveCampaignStatus(c.status as CampaignStatus, c.endDate, TODAY)
  const wr    = winRate(c)
  const er    = engagementRate(c)
  const rr    = redemptionRate(c)
  const dl    = status === 'active' ? daysLeft(c.endDate) : null
  const urgent = dl !== null && dl >= 0 && dl <= 3
  const muted  = status === 'ended'
  const color  = getMechanicColor(c.mechanic as 'shake')

  return (
    <div className={`vendor-card vendor-card-hover rounded-2xl overflow-visible ${muted ? 'opacity-60' : ''}`}>
        <div className="flex items-stretch">
          {/* Status stripe */}
          <div className={`w-1 shrink-0`}
            style={{ background: status === 'active' ? '#16A34A' : status === 'draft' ? '#F59E0B' : status === 'paused' ? '#F97316' : '#C4B8FF' }} />

          <div className="flex-1 px-5 py-4">
            <div className="flex items-start gap-4">
              {/* Mechanic icon */}
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0 mt-0.5"
                style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
                {getMechanicEmoji(c.mechanic as 'shake')}
              </div>

              {/* Main info */}
              <div className="flex-1 min-w-0">
                {/* Row 1: name + badges */}
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <Link to={`/vendor/campaigns/${c.id}`} className="text-sm font-bold text-v-text hover:text-v-purple transition-colors">
                    {c.name}
                  </Link>
                  <StatusBadge status={status} />
                  <MechanicBadge mechanic={c.mechanic as 'shake'} />
                  <MechanicComingSoonBadge mechanic={c.mechanic} />
                  {urgent && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-v-danger border border-red-200">
                      ⚠ {daysLeftLabel(c.endDate)}
                    </span>
                  )}
                </div>

                {/* Row 2: dates */}
                <div className="flex items-center gap-1.5 text-xs text-v-text-3 mb-3">
                  <CalendarDays className="w-3 h-3" />
                  <span>{formatDate(c.startDate)} → {formatDate(c.endDate)}</span>
                  {dl !== null && dl > 3 && (
                    <span className="text-v-text-2 font-medium">· {daysLeftLabel(c.endDate)}</span>
                  )}
                </div>

                {/* Row 3: key rates */}
                <div className="flex items-center gap-6 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3 h-3 text-v-purple" />
                    <span className="text-sm font-bold text-v-purple">{er}%</span>
                    <span className="text-[10px] text-v-text-3">engagement</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                    <span className="text-sm font-bold text-emerald-600">{wr}%</span>
                    <span className="text-[10px] text-v-text-3">win rate</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Trophy className="w-3 h-3 text-amber-500" />
                    <span className="text-sm font-bold text-amber-600">{rr}%</span>
                    <span className="text-[10px] text-v-text-3">redeemed</span>
                  </div>
                  {/* Cap bar */}
                  <div className="flex items-center gap-2 ml-auto hidden sm:flex">
                    <div className="text-right">
                      <div className="text-[10px] text-v-text-3 mb-1">
                        {c.currentUsers.toLocaleString()} / {c.userCap.toLocaleString()} users
                      </div>
                      <div className="w-28">
                        <ProgressBar
                          value={c.currentUsers}
                          max={c.userCap}
                          color={capPercent(c.currentUsers, c.userCap) > 85 ? '#DC2626' : capPercent(c.currentUsers, c.userCap) > 60 ? '#D97706' : '#7C3AED'}
                        />
                      </div>
                      <div className="text-[10px] text-v-text-3 mt-0.5 text-right">{capPercent(c.currentUsers, c.userCap)}% cap</div>
                    </div>
                  </div>
                </div>
              </div>

              {status === 'active' && (
                <div className="shrink-0" onClick={e => e.preventDefault()}>
                  <LivePIN campaignId={c.id} active compact />
                </div>
              )}

              {/* Actions */}
              <CampaignCardActions id={c.id} />
            </div>
        </div>
      </div>
    </div>
  )
}

// ── Grid card ─────────────────────────────────────────────────────────────────
function GridCard({ c }: { c: CampaignDto }) {
  const status = effectiveCampaignStatus(c.status as CampaignStatus, c.endDate, TODAY)
  const wr    = winRate(c)
  const er    = engagementRate(c)
  const rr    = redemptionRate(c)
  const dl    = status === 'active' ? daysLeft(c.endDate) : null
  const urgent = dl !== null && dl >= 0 && dl <= 3
  const muted  = status === 'ended'
  const color  = getMechanicColor(c.mechanic as 'shake')

  return (
    <div className={`vendor-card vendor-card-hover rounded-2xl h-full flex flex-col overflow-visible ${muted ? 'opacity-60' : ''}`}>
        {/* Status stripe top */}
        <div className="h-1 w-full"
          style={{ background: status === 'active' ? '#16A34A' : status === 'draft' ? '#F59E0B' : status === 'paused' ? '#F97316' : '#C4B8FF' }} />

        <div className="p-4 flex-1 flex flex-col gap-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
              style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
              {getMechanicEmoji(c.mechanic)}
            </div>
            <div className="flex items-center gap-1.5">
              <StatusBadge status={status} />
              <CampaignCardActions id={c.id} />
            </div>
          </div>

          {/* Name + mechanic */}
          <div>
            <Link to={`/vendor/campaigns/${c.id}`} className="text-sm font-bold text-v-text hover:text-v-purple transition-colors leading-snug block">
              {c.name}
            </Link>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <MechanicBadge mechanic={c.mechanic} />
              <MechanicComingSoonBadge mechanic={c.mechanic} />
            </div>
          </div>

          {/* Date + urgency */}
          <div className="flex items-center gap-1.5 text-xs text-v-text-3">
            <CalendarDays className="w-3 h-3 shrink-0" />
            <span className="truncate">{formatDate(c.startDate)} → {formatDate(c.endDate)}</span>
          </div>

          {dl !== null && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold self-start ${urgent ? 'bg-red-50 text-v-danger border border-red-200' : 'bg-v-surface-3 text-v-text-2 border border-v-border'}`}>
              {urgent ? '⚠' : '⏱'} {daysLeftLabel(c.endDate)}
            </span>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-1.5 mt-auto">
            {[
              { label: 'Engage', value: `${er}%`, color: '#7C3AED', bg: 'bg-purple-50', border: 'border-purple-100' },
              { label: 'Win',    value: `${wr}%`, color: '#16A34A', bg: 'bg-green-50',  border: 'border-green-100'  },
              { label: 'Redeem', value: `${rr}%`, color: '#D97706', bg: 'bg-amber-50',  border: 'border-amber-100'  },
            ].map(s => (
              <div key={s.label} className={`${s.bg} border ${s.border} rounded-lg p-2 text-center`}>
                <div className="text-sm font-bold" style={{ color: s.color }}>{s.value}</div>
                <div className="text-[9px] text-v-text-3 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {status === 'active' && (
            <div className="rounded-xl bg-v-surface-2 border border-v-border p-3 flex items-center justify-between" onClick={e => e.preventDefault()}>
              <p className="uppercase tracking-[0.18em] text-[10px] text-v-text-3 font-semibold">Staff PIN</p>
              <LivePIN campaignId={c.id} active compact />
            </div>
          )}

          {/* Cap bar */}
          <div>
            <div className="flex justify-between text-[10px] text-v-text-3 mb-1">
              <span>{c.currentUsers.toLocaleString()} / {c.userCap.toLocaleString()} users</span>
              <span>{capPercent(c.currentUsers, c.userCap)}%</span>
            </div>
            <ProgressBar
              value={c.currentUsers}
              max={c.userCap}
              color={capPercent(c.currentUsers, c.userCap) > 85 ? '#DC2626' : capPercent(c.currentUsers, c.userCap) > 60 ? '#D97706' : '#7C3AED'}
            />
          </div>
        </div>
      </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export function VendorCampaignsPage() {
  const { data: campaigns = [], isLoading, isError, error, refetch, isFetching } = useCampaigns()
  const [filter,      setFilter]      = useState<CampaignStatus | 'all'>('all')
  const [search,      setSearch]      = useState('')
  const [sort,        setSort]        = useState<SortKey>('newest')
  const [view,        setView]        = useState<ViewMode>('list')
  const [dateWindow,  setDateWindow]  = useState<DateWindow>('all')

  const activeCampaigns = activeCampaignsCount(campaigns)

  // ── Window-scoped metrics ───────────────────────────────────────────────────
  const windowDays = DATE_WINDOWS.find(w => w.key === dateWindow)!.days
  const wCampaigns = campaignsInWindow(campaigns, windowDays)

  const wPlayers  = wCampaigns.reduce((s, c) => s + c.currentUsers, 0)
  const wRewards  = wCampaigns.reduce((s, c) => s + c.rewardsClaimed, 0)
  const wRedeemed = wCampaigns.reduce((s, c) => s + c.redeemedCount, 0)

  const filtered = campaigns
    .filter(c => {
      const status = effectiveCampaignStatus(c.status as CampaignStatus, c.endDate, TODAY)
      return (filter === 'all' || status === filter) && c.name.toLowerCase().includes(search.toLowerCase())
    })
    .sort((a, b) => {
      if (sort === 'newest')  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      if (sort === 'ending')  return new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
      if (sort === 'popular') return b.participations - a.participations
      return 0
    })

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-v-text">Campaigns</h1>
          <p className="text-v-text-2 text-sm mt-0.5">
            {isLoading ? 'Loading…' : `${campaigns.length} total · ${activeCampaigns} running now`}
          </p>
        </div>
        <Link to="/vendor/campaigns/create">
          <Button variant="primary"><Plus className="w-4 h-4" /> New Campaign</Button>
        </Link>
      </motion.div>

      {/* ── Date filter ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}
        className="flex items-center gap-1 bg-v-surface-2 border border-v-border rounded-xl p-1 w-fit mb-5">
        {DATE_WINDOWS.map(w => (
          <button key={w.key} onClick={() => setDateWindow(w.key)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${dateWindow === w.key ? 'bg-white text-v-text shadow-sm border border-v-border' : 'text-v-text-3 hover:text-v-text-2'}`}>
            {w.label}
          </button>
        ))}
      </motion.div>

      {/* ── Metric cards ── */}
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

        <Card className="p-5 border border-purple-100 bg-gradient-to-br from-white to-purple-50">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 text-v-purple" />
            </div>
            <span className="text-xs font-semibold text-v-text-2">Total Players</span>
          </div>
          <div className="text-4xl font-black text-v-purple leading-none mb-2">{wPlayers.toLocaleString()}</div>
          <p className="text-xs text-v-text-3">unique players in this window</p>
        </Card>

        <Card className="p-5 border border-green-100 bg-gradient-to-br from-white to-green-50">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
              <Trophy className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-xs font-semibold text-v-text-2">Total Winners</span>
          </div>
          <div className="text-4xl font-black text-green-600 leading-none mb-2">{wRewards.toLocaleString()}</div>
          <p className="text-xs text-v-text-3">rewards won</p>
        </Card>

        <Card className="p-5 border border-amber-100 bg-gradient-to-br from-white to-amber-50">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
              <Gift className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-xs font-semibold text-v-text-2">Redemptions</span>
          </div>
          <div className="text-4xl font-black text-amber-600 leading-none mb-2">{wRedeemed.toLocaleString()}</div>
          <p className="text-xs text-v-text-3">claimed at the counter</p>
        </Card>

      </motion.div>

      {/* ── Controls row ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
        className="flex items-center gap-3 mb-5 flex-wrap">

        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-v-text-3" />
          <input type="text" placeholder="Search campaigns…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border border-v-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-v-text placeholder:text-v-text-3 focus:outline-none focus:border-v-purple transition-all" />
        </div>

        {/* Sort */}
        <div className="relative">
          <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-v-text-3 pointer-events-none" />
          <select value={sort} onChange={e => setSort(e.target.value as SortKey)}
            className="pl-8 pr-8 py-2.5 bg-white border border-v-border rounded-xl text-sm text-v-text focus:outline-none focus:border-v-purple appearance-none cursor-pointer transition-all">
            {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-0.5 bg-v-surface-2 border border-v-border rounded-xl p-1">
          {FILTERS.map(f => {
            const count = f.value === 'all' ? campaigns.length : campaigns.filter(c => c.status === f.value).length
            return (
              <button key={f.value} onClick={() => setFilter(f.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${filter === f.value ? 'bg-white text-v-text shadow-sm border border-v-border' : 'text-v-text-3 hover:text-v-text-2'}`}>
                {f.label}
                {count > 0 && (
                  <span className={`text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold ${filter === f.value ? 'bg-v-purple text-white' : 'bg-v-border text-v-text-3'}`}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-0.5 bg-v-surface-2 border border-v-border rounded-xl p-1">
          {([['list', LayoutList], ['grid', LayoutGrid]] as const).map(([v, Icon]) => (
            <button key={v} onClick={() => setView(v)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${view === v ? 'bg-white text-v-text shadow-sm border border-v-border' : 'text-v-text-3 hover:text-v-text-2'}`}>
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Campaign list / grid ── */}
      <AnimatePresence mode="wait">
        <motion.div key={view} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 text-v-purple animate-spin" />
              <p className="text-sm text-v-text-3">Loading campaigns…</p>
            </div>
          ) : isError ? (
            <div className="text-center py-20 max-w-md mx-auto">
              <div className="text-5xl mb-4">⚠️</div>
              <p className="text-sm font-semibold text-v-text-2 mb-3">Could not load campaigns</p>
              <ApiErrorBanner error={error} fallback="Please try again" className="mb-4 text-left" />
              <Button variant="secondary" onClick={() => refetch()} disabled={isFetching}>
                <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} /> Retry
              </Button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-sm font-semibold text-v-text-2">No campaigns match</p>
              <p className="text-xs text-v-text-3 mt-1">Try adjusting your search or filter</p>
              {filter !== 'all' && (
                <button onClick={() => { setFilter('all'); setSearch('') }} className="mt-4 text-xs text-v-purple font-semibold hover:underline">
                  Clear filters
                </button>
              )}
            </div>
          ) : view === 'list' ? (
            <div className="space-y-3 overflow-visible">
              {filtered.map((c, i) => (
                <motion.div key={c.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <ListCard c={c} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((c, i) => (
                <motion.div key={c.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <GridCard c={c} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
