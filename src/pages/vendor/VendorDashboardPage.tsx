import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Plus, ArrowRight, TrendingUp, TrendingDown, Minus,
  AlertTriangle, Crown, Zap, RotateCcw, ShieldCheck,
} from 'lucide-react'
import { Card, ProgressBar } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MechanicBadge } from '@/components/ui/badge'
import { campaigns, customers } from '@/lib/mock-data'
import { useBusinessProfile } from '@/hooks/useBusinessProfile'
import { getMechanicEmoji, capPercent } from '@/lib/utils'
import { LivePIN } from '@/components/vendor/live-pin'
import { RedemptionQueue } from '@/components/vendor/redemption-queue'
import type { Customer } from '@/lib/types'

// ── Helpers ───────────────────────────────────────────────────────────────────
const TODAY_DATE  = new Date('2026-06-13')
const VALUE_PER_VISIT = 300

function daysSince(iso: string) {
  return Math.floor((TODAY_DATE.getTime() - new Date(iso).getTime()) / 86400000)
}
function getSegment(c: Customer): 'loyalist' | 'regular' | 'at-risk' | 'inactive' {
  const d = daysSince(c.lastVisit)
  if (d > 45)            return 'inactive'
  if (d > 14)            return 'at-risk'
  if (c.totalVisits >= 15) return 'loyalist'
  return 'regular'
}

// Synthetic last-month baseline for trend arrows
const LM = {
  repeatVisitRate: 60, activeRate: 58, loyalistCount: 2,
  avgEngagement: 38,   avgWinRate: 48, avgRedemption: 46, retentionRate: 68,
}

// ── Trend chip ────────────────────────────────────────────────────────────────
function Trend({ now, prev, unit = 'pp', invert = false, suffix = '' }: {
  now: number; prev: number; unit?: string; invert?: boolean; suffix?: string
}) {
  const diff = now - prev
  const isUp = invert ? diff < 0 : diff > 0
  if (diff === 0) return (
    <span className="inline-flex items-center gap-0.5 text-[10px] text-v-text-3 font-medium">
      <Minus className="w-2.5 h-2.5" /> No change vs last month
    </span>
  )
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold ${isUp ? 'text-v-success' : 'text-v-danger'}`}>
      {isUp ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
      {diff > 0 ? '+' : ''}{diff}{unit}{suffix} vs last month
    </span>
  )
}

const fadeUp = (i: number) => ({ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { delay: i * 0.06 } } })

// ── Page ──────────────────────────────────────────────────────────────────────
export function VendorDashboardPage() {
  const { data: profile } = useBusinessProfile()
  const businessName = profile?.name ?? 'Brew & Bite Café'

  // Segments
  const withSeg = customers.map(c => ({ ...c, seg: getSegment(c) }))
  const seg = {
    loyalist: withSeg.filter(c => c.seg === 'loyalist'),
    regular:  withSeg.filter(c => c.seg === 'regular'),
    atRisk:   withSeg.filter(c => c.seg === 'at-risk'),
    inactive: withSeg.filter(c => c.seg === 'inactive'),
  }
  const n = customers.length

  // Key rates
  const visitedLast30   = withSeg.filter(c => daysSince(c.lastVisit) <= 30)
  const repeatVisitRate = Math.round((visitedLast30.length / n) * 100)          // 71%

  // ₹ at risk & by segment
  const churnRisk = [...seg.atRisk, ...seg.inactive]
    .reduce((s, c) => s + c.totalVisits * VALUE_PER_VISIT, 0)                   // ₹6,900
  const segVal = {
    loyalist: seg.loyalist.reduce((s, c) => s + c.totalVisits * VALUE_PER_VISIT, 0),  // ₹29,700
    regular:  seg.regular.reduce((s, c)  => s + c.totalVisits * VALUE_PER_VISIT, 0),  // ₹6,000
    atRisk:   seg.atRisk.reduce((s, c)   => s + c.totalVisits * VALUE_PER_VISIT, 0),  // ₹5,400
    inactive: seg.inactive.reduce((s, c) => s + c.totalVisits * VALUE_PER_VISIT, 0),  // ₹1,500
  }
  const totalVal = Object.values(segVal).reduce((s, v) => s + v, 0)

  // Campaign effectiveness (active only)
  const activeCamps   = campaigns.filter(c => c.status === 'active')
  const avgEngagement = Math.round(activeCamps.reduce((s, c) => s + (c.userCap > 0 ? c.currentUsers / c.userCap * 100 : 0), 0) / activeCamps.length)
  const avgWinRate    = Math.round(activeCamps.reduce((s, c) => s + (c.participations > 0 ? c.rewardsClaimed / c.participations * 100 : 0), 0) / activeCamps.length)
  const avgRedemption = Math.round(activeCamps.reduce((s, c) => s + (c.rewardsClaimed > 0 ? c.redeemedCount / c.rewardsClaimed * 100 : 0), 0) / activeCamps.length)

  // Synthetic retention metrics
  const retentionRate = 71
  const atRiskSaved   = 2
  const incrVisits    = 3

  return (
    <div className="p-8 max-w-7xl space-y-6">

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-v-text">Good morning, {businessName} ☕</h1>
          <p className="text-v-text-2 text-sm mt-1">Friday, 13 June 2026 · {activeCamps.length} campaigns running</p>
        </div>
        <Link to="/vendor/campaigns/create">
          <Button variant="primary"><Plus className="w-4 h-4" /> New Campaign</Button>
        </Link>
      </motion.div>

      {/* ── Hero: Repeat Visit Rate + Retention Rate ── */}
      <motion.div variants={fadeUp(1)} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Repeat Visit Rate */}
        <Card className="p-6 bg-gradient-to-br from-v-surface to-purple-50 border-purple-200 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-v-purple/5 -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <RotateCcw className="w-4 h-4 text-v-purple" />
              <span className="text-sm font-semibold text-v-text-2">Repeat Visit Rate</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-v-purple/10 text-v-purple font-semibold">Hero</span>
            </div>
            <div className="text-6xl font-black text-v-purple leading-none mb-2">{repeatVisitRate}%</div>
            <Trend now={repeatVisitRate} prev={LM.repeatVisitRate} />
            <p className="text-xs text-v-text-3 mt-2">
              {visitedLast30.length} of {n} customers visited in the last 30 days
            </p>
          </div>
        </Card>

        {/* Customer Retention Rate */}
        <Card className="p-6 bg-gradient-to-br from-v-surface to-green-50 border-green-200 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-green-500/5 -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-v-text-2">Customer Retention Rate</span>
            </div>
            <div className="text-6xl font-black text-green-600 leading-none mb-2">{retentionRate}%</div>
            <Trend now={retentionRate} prev={LM.retentionRate} />
            <p className="text-xs text-v-text-3 mt-2">
              of last month's customers came back this month
            </p>
          </div>
        </Card>

      </motion.div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Left 2/3 */}
        <div className="xl:col-span-2 space-y-6">

          {/* Campaign Effectiveness */}
          <motion.div variants={fadeUp(2)} initial="hidden" animate="show">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-v-text flex items-center gap-2">
                <Zap className="w-4 h-4 text-v-purple" /> Campaign Effectiveness
              </h2>
              <span className="text-[11px] text-v-text-3">Across {activeCamps.length} active campaigns</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Avg Engagement',  value: avgEngagement, prev: LM.avgEngagement, sub: 'players of cap used',   color: '#7C3AED', bg: 'bg-purple-50', border: 'border-purple-200' },
                { label: 'Avg Win Rate',     value: avgWinRate,    prev: LM.avgWinRate,    sub: 'rewards per 100 plays', color: '#16A34A', bg: 'bg-green-50',  border: 'border-green-200'  },
                { label: 'Avg Redemption',   value: avgRedemption, prev: LM.avgRedemption, sub: 'rewards claimed at counter', color: '#D97706', bg: 'bg-amber-50',  border: 'border-amber-200'  },
              ].map((m, i) => (
                <motion.div key={m.label} variants={fadeUp(3 + i)} initial="hidden" animate="show">
                  <div className={`vendor-card p-5 ${m.bg} border ${m.border}`}>
                    <div className="text-3xl font-black leading-none mb-2" style={{ color: m.color }}>{m.value}%</div>
                    <div className="text-xs font-semibold text-v-text mb-0.5">{m.label}</div>
                    <div className="text-[10px] text-v-text-3 mb-2">{m.sub}</div>
                    <Trend now={m.value} prev={m.prev} />
                    <div className="mt-2 h-1.5 rounded-full bg-white/60">
                      <div className="h-full rounded-full" style={{ width: `${m.value}%`, background: m.color }} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Retention Proof */}
          <motion.div variants={fadeUp(6)} initial="hidden" animate="show">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-v-purple" />
              <h2 className="text-sm font-bold text-v-text">Retention Proof</h2>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: 'Customer Retention',
                  value: `${retentionRate}%`,
                  sub: 'of last month\'s customers returned',
                  icon: '🔁', color: '#7C3AED',
                  trend: <Trend now={retentionRate} prev={LM.retentionRate} />,
                },
                {
                  label: 'At-Risk Saved',
                  value: atRiskSaved,
                  sub: 'customers re-engaged via campaigns',
                  icon: '🛟', color: '#16A34A',
                  trend: <span className="text-[10px] text-v-success font-semibold">this month</span>,
                },
                {
                  label: 'Incremental Visits',
                  value: incrVisits,
                  sub: 'returned within 7 days of winning',
                  icon: '📍', color: '#D97706',
                  trend: <span className="text-[10px] text-v-text-3">campaign-driven</span>,
                },
              ].map(m => (
                <Card key={m.label} className="p-4">
                  <div className="text-2xl mb-2">{m.icon}</div>
                  <div className="text-2xl font-black text-v-text leading-none">{m.value}</div>
                  <div className="text-xs font-semibold text-v-text-2 mt-0.5">{m.label}</div>
                  <div className="text-[10px] text-v-text-3 mt-0.5 mb-2">{m.sub}</div>
                  {m.trend}
                </Card>
              ))}
            </div>
          </motion.div>

          {/* Active Campaigns */}
          <motion.div variants={fadeUp(9)} initial="hidden" animate="show">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-v-text">Active Campaigns</h2>
              <Link to="/vendor/campaigns" className="text-xs text-v-purple hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-2.5">
              {activeCamps.map((c, i) => {
                const engRate = c.userCap > 0 ? Math.round(c.currentUsers / c.userCap * 100) : 0
                const wr      = c.participations > 0 ? Math.round(c.rewardsClaimed / c.participations * 100) : 0
                const rr      = c.rewardsClaimed > 0 ? Math.round(c.redeemedCount  / c.rewardsClaimed * 100) : 0
                return (
                  <Link to={`/vendor/campaigns/${c.id}`} key={c.id}>
                    <motion.div variants={fadeUp(10 + i)} initial="hidden" animate="show"
                      className="vendor-card vendor-card-hover p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-v-surface-3 flex items-center justify-center text-xl shrink-0">
                          {getMechanicEmoji(c.mechanic)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-bold text-v-text truncate">{c.name}</span>
                            <MechanicBadge mechanic={c.mechanic} />
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-xs text-v-purple font-bold">{engRate}% engaged</span>
                            <span className="text-xs text-emerald-600 font-bold">{wr}% win</span>
                            <span className="text-xs text-amber-600 font-bold">{rr}% redeemed</span>
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <ProgressBar value={c.currentUsers} max={c.userCap} className="flex-1" />
                            <span className="text-[10px] text-v-text-3 shrink-0">{capPercent(c.currentUsers, c.userCap)}% cap</span>
                          </div>
                        </div>
                        <div className="shrink-0">
                          <LivePIN campaign={c} compact />
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                )
              })}
            </div>
          </motion.div>
        </div>

        {/* Right 1/3 */}
        <div className="space-y-6">

          {/* Churn Warning */}
          <motion.div variants={fadeUp(2)} initial="hidden" animate="show">
            <Card className="p-5 bg-red-50 border-red-200">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-v-danger" />
                <h3 className="text-sm font-bold text-v-danger">Churn Warning</h3>
              </div>
              <div className="text-3xl font-black text-v-danger leading-none mb-1">
                ₹{churnRisk.toLocaleString()}
              </div>
              <p className="text-xs text-red-600 mb-4">
                estimated lifetime value at risk from {seg.atRisk.length + seg.inactive.length} slipping customers
              </p>
              <div className="space-y-2">
                {[...seg.atRisk, ...seg.inactive].map(c => (
                  <Link to={`/vendor/customers/${c.id}`} key={c.id}>
                    <div className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-red-200 hover:border-red-400 transition-colors">
                      <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center text-xs font-bold text-v-danger shrink-0">
                        {c.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-v-text truncate">{c.name}</p>
                        <p className="text-[10px] text-v-text-3">{daysSince(c.lastVisit)}d since last visit</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold text-v-danger">₹{(c.totalVisits * VALUE_PER_VISIT).toLocaleString()}</p>
                        <p className={`text-[9px] font-semibold ${c.seg === 'inactive' ? 'text-gray-500' : 'text-orange-500'}`}>
                          {c.seg === 'inactive' ? 'Inactive' : 'At-Risk'}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <Link to="/vendor/customers">
                <button className="mt-3 w-full text-xs text-v-danger font-semibold border border-red-300 rounded-xl py-2 hover:bg-red-100 transition-colors">
                  View all at-risk customers →
                </button>
              </Link>
            </Card>
          </motion.div>

          {/* Revenue by Segment */}
          <motion.div variants={fadeUp(4)} initial="hidden" animate="show">
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Crown className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-v-text">Estimated ₹ Value by Segment</h3>
              </div>
              <p className="text-[10px] text-v-text-3 mb-4">Based on ₹{VALUE_PER_VISIT}/visit proxy · {n} customers · ₹{totalVal.toLocaleString()} total</p>
              <div className="space-y-3">
                {[
                  { label: 'Loyalists',  value: segVal.loyalist, count: seg.loyalist.length, color: '#B45309', bar: 'bg-amber-400', atRisk: false },
                  { label: 'Regulars',   value: segVal.regular,  count: seg.regular.length,  color: '#1D4ED8', bar: 'bg-blue-400',  atRisk: false },
                  { label: 'At-Risk',    value: segVal.atRisk,   count: seg.atRisk.length,   color: '#C2410C', bar: 'bg-orange-400',atRisk: true  },
                  { label: 'Inactive',   value: segVal.inactive, count: seg.inactive.length,  color: '#6B7280', bar: 'bg-gray-300',  atRisk: true  },
                ].map(s => (
                  <div key={s.label}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold" style={{ color: s.color }}>{s.label}</span>
                        <span className="text-[10px] text-v-text-3">({s.count})</span>
                        {s.atRisk && <span className="text-[9px] text-v-danger font-bold">at risk</span>}
                      </div>
                      <span className="text-xs font-bold text-v-text">₹{s.value.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 bg-v-surface-3 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${s.bar}`} style={{ width: `${totalVal > 0 ? s.value / totalVal * 100 : 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Redemption queue */}
          <motion.div variants={fadeUp(6)} initial="hidden" animate="show">
            <Card className="p-5">
              <RedemptionQueue />
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
