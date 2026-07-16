import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Plus, TrendingUp, TrendingDown, Minus,
  Users, UserCheck, RotateCcw, ShieldCheck, Zap, Loader2,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useBusinessProfile } from '@/hooks/useBusinessProfile'
import { useCampaigns } from '@/hooks/useCampaigns'
import { useVendorDashboardStats } from '@/hooks/useVendorAnalytics'
import { RedemptionQueue } from '@/components/vendor/redemption-queue'
import type { VendorStatsPeriod } from '@/lib/api'

type Period = VendorStatsPeriod

const PERIODS: { key: Period; label: string }[] = [
  { key: 'all', label: 'All time' },
  { key: '7d', label: '7 Days' },
  { key: 'month', label: 'Month' },
  { key: '3m', label: '3 Months' },
  { key: 'year', label: 'Year' },
]

const PERIOD_PHRASE: Record<Period, string> = {
  all: 'all time',
  '7d': 'the last 7 days',
  month: 'the last month',
  '3m': 'the last 3 months',
  year: 'the last year',
}

const COMPARISON_LABEL: Record<Period, string> = {
  all: '',
  '7d': 'last week',
  month: 'last month',
  '3m': 'last quarter',
  year: 'last year',
}

const fadeUp = (i: number) => ({
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { delay: i * 0.06 } },
})

function Trend({
  now,
  prev,
  unit = '',
  comparisonLabel,
}: {
  now: number
  prev: number
  unit?: string
  comparisonLabel: string
}) {
  const diff = now - prev
  if (diff === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] text-v-text-3 font-medium">
        <Minus className="w-2.5 h-2.5" /> No change vs {comparisonLabel}
      </span>
    )
  }
  const isUp = diff > 0
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold ${isUp ? 'text-v-success' : 'text-v-danger'}`}>
      {isUp ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
      {diff > 0 ? '+' : ''}{diff}{unit} vs {comparisonLabel}
    </span>
  )
}

function TrendOrLifetime({
  period,
  now,
  prev,
  unit = '',
}: {
  period: Period
  now: number
  prev: number
  unit?: string
}) {
  if (period === 'all') {
    return <span className="text-[10px] text-v-text-3 font-medium">Lifetime total</span>
  }
  return <Trend now={now} prev={prev} unit={unit} comparisonLabel={COMPARISON_LABEL[period]} />
}

function PeriodTabs({ value, onChange }: { value: Period; onChange: (p: Period) => void }) {
  return (
    <div className="inline-flex items-center gap-1 p-1.5 rounded-full bg-v-purple/5 border border-v-purple/10 flex-wrap">
      {PERIODS.map(p => (
        <button
          key={p.key}
          type="button"
          onClick={() => onChange(p.key)}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap border-0 cursor-pointer ${
            value === p.key ? 'bg-white text-v-text shadow-sm' : 'bg-transparent text-v-purple/50 hover:text-v-purple'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}

export function VendorDashboardPage() {
  const [period, setPeriod] = useState<Period>('all')
  const { data: profile } = useBusinessProfile()
  const { data: apiCampaigns = [] } = useCampaigns()
  const { data: stats, isLoading: statsLoading } = useVendorDashboardStats(period)
  const businessName = profile?.name ?? 'Your business'

  const todayLabel = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  const activeCamps = apiCampaigns.filter(c => c.status === 'active')
  const totalCustomers = stats?.totalCustomers ?? 0
  const activeCustomers = stats?.activeCustomers ?? 0
  // Total Players = unique customers for the business (never sum of campaign enrollments / plays)
  const uniquePlayers = totalCustomers
  const repeatVisitRate = stats?.repeatVisitRate ?? 0
  const retentionRate = stats?.retentionRate ?? 0
  const totalWins = stats?.totalWins ?? 0
  const totalRedemptions = stats?.totalRedeemed ?? 0
  const multiPlayCount = stats?.multiPlayCustomers ?? 0
  const prev = stats?.previous

  if (statsLoading && !stats) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-v-purple animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-v-text">Good morning, {businessName} ☕</h1>
          <p className="text-v-text-2 text-sm mt-1">{todayLabel} · {activeCamps.length} campaigns running</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <PeriodTabs value={period} onChange={setPeriod} />
          <Link to="/vendor/campaigns/create">
            <Button variant="primary"><Plus className="w-4 h-4" /> New Campaign</Button>
          </Link>
        </div>
      </motion.div>

      <motion.div variants={fadeUp(1)} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-gradient-to-br from-v-surface to-indigo-50 border-indigo-200 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-28 h-28 rounded-full bg-indigo-500/5 -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <Users className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-semibold text-v-text-2">Total Users</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-600 font-semibold">all-time</span>
            </div>
            <div className="text-4xl font-black text-indigo-600 leading-none mb-2">{totalCustomers}</div>
            <Trend
              now={totalCustomers}
              prev={prev?.totalCustomers ?? totalCustomers}
              unit=""
              comparisonLabel="last month"
            />
            <p className="text-xs text-v-text-3 mt-2">customers who&apos;ve ever played a campaign</p>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-v-surface to-blue-50 border-blue-200 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-28 h-28 rounded-full bg-blue-500/5 -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-v-text-2">Current Users</span>
            </div>
            <div className="text-4xl font-black text-blue-600 leading-none mb-2">{activeCustomers}</div>
            <TrendOrLifetime period={period} now={activeCustomers} prev={prev?.activeCustomers ?? activeCustomers} />
            <p className="text-xs text-v-text-3 mt-2">
              {period === 'all' ? 'active at any point' : `active in ${PERIOD_PHRASE[period]}`}
            </p>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-v-surface to-purple-50 border-purple-200 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-28 h-28 rounded-full bg-v-purple/5 -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <RotateCcw className="w-4 h-4 text-v-purple" />
              <span className="text-sm font-semibold text-v-text-2">Repeat Visits</span>
            </div>
            <div className="text-4xl font-black text-v-purple leading-none mb-2">{repeatVisitRate}%</div>
            <TrendOrLifetime period={period} now={repeatVisitRate} prev={prev?.repeatVisitRate ?? repeatVisitRate} unit="pp" />
            <p className="text-xs text-v-text-3 mt-2">
              {multiPlayCount} of {uniquePlayers} played more than once
              {period !== 'all' ? ` in ${PERIOD_PHRASE[period]}` : ''}
            </p>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-v-surface to-green-50 border-green-200 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-28 h-28 rounded-full bg-green-500/5 -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-v-text-2">Retention</span>
            </div>
            <div className="text-4xl font-black text-green-600 leading-none mb-2">{retentionRate}%</div>
            <TrendOrLifetime period={period} now={retentionRate} prev={prev?.retentionRate ?? retentionRate} unit="pp" />
            <p className="text-xs text-v-text-3 mt-2">
              {period === 'all'
                ? 'of all customers have returned at least once'
                : `of prior-period customers came back`}
            </p>
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <motion.div variants={fadeUp(2)} initial="hidden" animate="show">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-v-text flex items-center gap-2">
                <Zap className="w-4 h-4 text-v-purple" /> All Campaigns, Consolidated
              </h2>
              <span className="text-[11px] text-v-text-3">Across {activeCamps.length} active campaigns</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  label: 'Total Players',
                  value: uniquePlayers,
                  prev: prev?.totalCustomers ?? uniquePlayers,
                  sub: 'unique customers',
                  color: '#7C3AED',
                  bg: 'bg-purple-50',
                  border: 'border-purple-200',
                },
                {
                  label: 'Total Wins',
                  value: totalWins,
                  prev: prev?.totalWins ?? totalWins,
                  sub: 'rewards won',
                  color: '#16A34A',
                  bg: 'bg-green-50',
                  border: 'border-green-200',
                },
                {
                  label: 'Total Redemptions',
                  value: totalRedemptions,
                  prev: prev?.totalRedeemed ?? totalRedemptions,
                  sub: 'claimed at the counter',
                  color: '#D97706',
                  bg: 'bg-amber-50',
                  border: 'border-amber-200',
                },
              ].map((m, i) => (
                <motion.div key={m.label} variants={fadeUp(3 + i)} initial="hidden" animate="show">
                  <div className={`vendor-card p-5 ${m.bg} border ${m.border}`}>
                    <div className="text-3xl font-black leading-none mb-2" style={{ color: m.color }}>
                      {m.value.toLocaleString()}
                    </div>
                    <div className="text-xs font-semibold text-v-text mb-0.5">{m.label}</div>
                    <div className="text-[10px] text-v-text-3 mb-2">{m.sub}</div>
                    <TrendOrLifetime period={period} now={m.value} prev={m.prev} />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div variants={fadeUp(2)} initial="hidden" animate="show">
            <Card className="p-5">
              <RedemptionQueue />
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
