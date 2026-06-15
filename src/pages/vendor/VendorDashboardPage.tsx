import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Plus, ArrowRight,
  AlertTriangle, Crown, Zap, RotateCcw, ShieldCheck, Loader2,
} from 'lucide-react'
import { Card, ProgressBar } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MechanicBadge } from '@/components/ui/badge'
import { useBusinessProfile } from '@/hooks/useBusinessProfile'
import { useCampaigns } from '@/hooks/useCampaigns'
import { useVendorDashboardStats, useVendorCustomers } from '@/hooks/useVendorAnalytics'
import { getMechanicEmoji, capPercent } from '@/lib/utils'
import { daysSince, getCustomerSegment, estimateLifetimeValue, VALUE_PER_VISIT } from '@/lib/vendor-customers'
import { LivePIN } from '@/components/vendor/live-pin'
import { RedemptionQueue } from '@/components/vendor/redemption-queue'

const fadeUp = (i: number) => ({ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { delay: i * 0.06 } } })

export function VendorDashboardPage() {
  const { data: profile } = useBusinessProfile()
  const { data: apiCampaigns = [] } = useCampaigns()
  const { data: stats, isLoading: statsLoading } = useVendorDashboardStats()
  const { data: customers = [] } = useVendorCustomers()
  const businessName = profile?.name ?? 'Your business'

  const todayLabel = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  const withSeg = customers.map(c => ({ ...c, seg: getCustomerSegment(c) }))
  const seg = {
    loyalist: withSeg.filter(c => c.seg === 'loyalist'),
    regular: withSeg.filter(c => c.seg === 'regular'),
    atRisk: withSeg.filter(c => c.seg === 'at-risk'),
    inactive: withSeg.filter(c => c.seg === 'inactive'),
  }
  const n = customers.length

  const churnRisk = [...seg.atRisk, ...seg.inactive]
    .reduce((s, c) => s + estimateLifetimeValue(c.totalVisits), 0)
  const segVal = {
    loyalist: seg.loyalist.reduce((s, c) => s + estimateLifetimeValue(c.totalVisits), 0),
    regular: seg.regular.reduce((s, c) => s + estimateLifetimeValue(c.totalVisits), 0),
    atRisk: seg.atRisk.reduce((s, c) => s + estimateLifetimeValue(c.totalVisits), 0),
    inactive: seg.inactive.reduce((s, c) => s + estimateLifetimeValue(c.totalVisits), 0),
  }
  const totalVal = Object.values(segVal).reduce((s, v) => s + v, 0)

  const activeCamps = apiCampaigns.filter(c => c.status === 'active')
  const campCount = Math.max(activeCamps.length, 1)
  const avgEngagement = Math.round(activeCamps.reduce((s, c) => s + (c.userCap > 0 ? c.currentUsers / c.userCap * 100 : 0), 0) / campCount)
  const avgWinRate = Math.round(activeCamps.reduce((s, c) => s + (c.participations > 0 ? c.rewardsClaimed / c.participations * 100 : 0), 0) / campCount)
  const avgRedemption = Math.round(activeCamps.reduce((s, c) => s + (c.rewardsClaimed > 0 ? c.redeemedCount / c.rewardsClaimed * 100 : 0), 0) / campCount)

  const repeatVisitRate = stats?.repeatVisitRate ?? 0
  const retentionRate = stats?.retentionRate ?? 0
  const activeCustomers30d = stats?.activeCustomers30d ?? 0
  const pendingRedemptions = stats?.pendingRedemptions ?? 0
  const returningCustomers30d = stats?.returningCustomers30d ?? 0
  const atRiskList = stats?.atRiskCustomers ?? [...seg.atRisk, ...seg.inactive].slice(0, 6)

  if (statsLoading) {
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
          <p className="text-v-text-2 text-sm mt-1">{todayLabel} · {activeCamps.length} campaigns running · {n} customers</p>
        </div>
        <Link to="/vendor/campaigns/create">
          <Button variant="primary"><Plus className="w-4 h-4" /> New Campaign</Button>
        </Link>
      </motion.div>

      <motion.div variants={fadeUp(1)} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-6 bg-gradient-to-br from-v-surface to-purple-50 border-purple-200 overflow-hidden relative">
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <RotateCcw className="w-4 h-4 text-v-purple" />
              <span className="text-sm font-semibold text-v-text-2">Repeat Visit Rate</span>
            </div>
            <div className="text-6xl font-black text-v-purple leading-none mb-2">{repeatVisitRate}%</div>
            <p className="text-xs text-v-text-3 mt-2">
              {customers.filter(c => c.totalVisits > 1).length} of {n} customers played more than once
            </p>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-v-surface to-green-50 border-green-200 overflow-hidden relative">
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-v-text-2">30-Day Retention</span>
            </div>
            <div className="text-6xl font-black text-green-600 leading-none mb-2">{retentionRate}%</div>
            <p className="text-xs text-v-text-3 mt-2">
              {returningCustomers30d} customers returned after playing last month
            </p>
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <motion.div variants={fadeUp(2)} initial="hidden" animate="show">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-v-text flex items-center gap-2">
                <Zap className="w-4 h-4 text-v-purple" /> Campaign Effectiveness
              </h2>
              <span className="text-[11px] text-v-text-3">Across {activeCamps.length} active campaigns</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: 'Avg Engagement', value: avgEngagement, sub: 'players of cap used', color: '#7C3AED', bg: 'bg-purple-50', border: 'border-purple-200' },
                { label: 'Avg Win Rate', value: avgWinRate, sub: 'rewards per 100 plays', color: '#16A34A', bg: 'bg-green-50', border: 'border-green-200' },
                { label: 'Avg Redemption', value: avgRedemption, sub: 'rewards claimed at counter', color: '#D97706', bg: 'bg-amber-50', border: 'border-amber-200' },
              ].map((m, i) => (
                <motion.div key={m.label} variants={fadeUp(3 + i)} initial="hidden" animate="show">
                  <div className={`vendor-card p-5 ${m.bg} border ${m.border}`}>
                    <div className="text-3xl font-black leading-none mb-2" style={{ color: m.color }}>{m.value}%</div>
                    <div className="text-xs font-semibold text-v-text mb-0.5">{m.label}</div>
                    <div className="text-[10px] text-v-text-3 mb-2">{m.sub}</div>
                    <div className="mt-2 h-1.5 rounded-full bg-white/60">
                      <div className="h-full rounded-full" style={{ width: `${m.value}%`, background: m.color }} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeUp(6)} initial="hidden" animate="show">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-v-purple" />
              <h2 className="text-sm font-bold text-v-text">Activity Snapshot</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: 'Active (30d)', value: activeCustomers30d, sub: 'customers played recently', icon: '🔁' },
                { label: 'Pending Redemptions', value: pendingRedemptions, sub: 'rewards awaiting pickup', icon: '🎁' },
                { label: 'Plays (30d)', value: stats?.playsLast30d ?? 0, sub: 'total game plays', icon: '🎮' },
              ].map(m => (
                <Card key={m.label} className="p-4">
                  <div className="text-2xl mb-2">{m.icon}</div>
                  <div className="text-2xl font-black text-v-text leading-none">{m.value}</div>
                  <div className="text-xs font-semibold text-v-text-2 mt-0.5">{m.label}</div>
                  <div className="text-[10px] text-v-text-3 mt-0.5">{m.sub}</div>
                </Card>
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeUp(9)} initial="hidden" animate="show">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-v-text">Active Campaigns</h2>
              <Link to="/vendor/campaigns" className="text-xs text-v-purple hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {activeCamps.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-sm text-v-text-2">No active campaigns</p>
                <Link to="/vendor/campaigns/create" className="text-xs text-v-purple font-semibold mt-2 inline-block">Launch your first campaign →</Link>
              </Card>
            ) : (
              <div className="space-y-2.5">
                {activeCamps.map((c, i) => {
                  const engRate = c.userCap > 0 ? Math.round(c.currentUsers / c.userCap * 100) : 0
                  const wr = c.participations > 0 ? Math.round(c.rewardsClaimed / c.participations * 100) : 0
                  const rr = c.rewardsClaimed > 0 ? Math.round(c.redeemedCount / c.rewardsClaimed * 100) : 0
                  return (
                    <Link to={`/vendor/campaigns/${c.id}`} key={c.id}>
                      <motion.div variants={fadeUp(10 + i)} initial="hidden" animate="show" className="vendor-card vendor-card-hover p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-v-surface-3 flex items-center justify-center text-xl shrink-0">
                            {getMechanicEmoji(c.mechanic as 'shake')}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className="text-sm font-bold text-v-text truncate">{c.name}</span>
                              <MechanicBadge mechanic={c.mechanic as 'shake'} />
                            </div>
                            <div className="flex items-center gap-4 flex-wrap">
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
                            <LivePIN campaignId={c.id} active={c.status === 'active'} compact />
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  )
                })}
              </div>
            )}
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div variants={fadeUp(2)} initial="hidden" animate="show">
            <Card className="p-5 bg-red-50 border-red-200">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-v-danger" />
                <h3 className="text-sm font-bold text-v-danger">Churn Warning</h3>
              </div>
              {atRiskList.length === 0 ? (
                <p className="text-xs text-red-600">No at-risk customers — great retention!</p>
              ) : (
                <>
                  <div className="text-3xl font-black text-v-danger leading-none mb-1">
                    ₹{churnRisk.toLocaleString()}
                  </div>
                  <p className="text-xs text-red-600 mb-4">
                    estimated value at risk from {seg.atRisk.length + seg.inactive.length} slipping customers
                  </p>
                  <div className="space-y-2">
                    {atRiskList.map(c => {
                      const segLabel = getCustomerSegment(c)
                      const d = daysSince(c.lastVisit)
                      return (
                        <Link to={`/vendor/customers/${c.id}`} key={c.id}>
                          <div className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-red-200 hover:border-red-400 transition-colors">
                            <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center text-xs font-bold text-v-danger shrink-0">
                              {c.name[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-v-text truncate">{c.name}</p>
                              <p className="text-[10px] text-v-text-3">{d >= 999 ? 'Never played' : `${d}d since last visit`}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-xs font-bold text-v-danger">₹{estimateLifetimeValue(c.totalVisits).toLocaleString()}</p>
                              <p className="text-[9px] font-semibold text-orange-500 capitalize">{segLabel}</p>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </>
              )}
              <Link to="/vendor/customers">
                <button className="mt-3 w-full text-xs text-v-danger font-semibold border border-red-300 rounded-xl py-2 hover:bg-red-100 transition-colors cursor-pointer bg-transparent">
                  View all customers →
                </button>
              </Link>
            </Card>
          </motion.div>

          {n > 0 && (
            <motion.div variants={fadeUp(4)} initial="hidden" animate="show">
              <Card className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Crown className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-bold text-v-text">Estimated ₹ Value by Segment</h3>
                </div>
                <p className="text-[10px] text-v-text-3 mb-4">Based on ₹{VALUE_PER_VISIT}/visit proxy · {n} customers</p>
                <div className="space-y-3">
                  {[
                    { label: 'Loyalists', value: segVal.loyalist, count: seg.loyalist.length, color: '#B45309', bar: 'bg-amber-400', atRisk: false },
                    { label: 'Regulars', value: segVal.regular, count: seg.regular.length, color: '#1D4ED8', bar: 'bg-blue-400', atRisk: false },
                    { label: 'At-Risk', value: segVal.atRisk, count: seg.atRisk.length, color: '#C2410C', bar: 'bg-orange-400', atRisk: true },
                    { label: 'Inactive', value: segVal.inactive, count: seg.inactive.length, color: '#6B7280', bar: 'bg-gray-300', atRisk: true },
                  ].map(s => (
                    <div key={s.label}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold" style={{ color: s.color }}>{s.label}</span>
                          <span className="text-[10px] text-v-text-3">({s.count})</span>
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
          )}

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
