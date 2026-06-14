import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, ArrowRight, TrendingUp, TrendingDown, Minus, AlertTriangle, Crown, Zap, RotateCcw, ShieldCheck } from 'lucide-react'
import { Card, ProgressBar } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MechanicBadge } from '@/components/ui/badge'
import { campaigns, customers, redemptionQueue } from '@/lib/mock-data'
import { capPercent, getMechanicEmoji } from '@/lib/utils'
import { business } from '@/lib/mock-data'
import type { Customer } from '@/lib/types'

const TODAY = new Date('2026-06-13')
const VALUE_PER_VISIT = 300
const LM = { repeatVisitRate: 60, retentionRate: 68, avgEngagement: 38, avgWinRate: 48, avgRedemption: 46, loyalistCount: 2 }

function daysSince(iso: string) {
  return Math.floor((TODAY.getTime() - new Date(iso).getTime()) / 86400000)
}

function getSegment(c: Customer): 'loyalist' | 'regular' | 'at-risk' | 'inactive' {
  const d = daysSince(c.lastVisit)
  if (d > 45) return 'inactive'
  if (d > 14) return 'at-risk'
  if (c.totalVisits >= 15) return 'loyalist'
  return 'regular'
}

function Trend({ now, prev, unit = 'pp' }: { now: number; prev: number; unit?: string }) {
  const diff = now - prev
  if (diff === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] text-v-text-3 font-medium">
        <Minus className="w-2.5 h-2.5" /> No change vs last month
      </span>
    )
  }
  const isUp = diff > 0
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold ${isUp ? 'text-v-success' : 'text-v-danger'}`}>
      {isUp ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
      {diff > 0 ? '+' : ''}{diff}{unit} vs last month
    </span>
  )
}

function LivePIN({ pin, expiresAt }: { pin: string; expiresAt: number }) {
  const [remaining, setRemaining] = useState(Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)))

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)))
    }, 1000)
    return () => clearInterval(id)
  }, [expiresAt])

  return (
    <div className="text-center shrink-0">
      <p className="text-[9px] font-bold text-v-text-3 uppercase tracking-wider mb-1">Live PIN</p>
      <p className="text-2xl font-black text-v-purple tracking-[0.2em]">{pin}</p>
      <p className="text-[9px] text-v-text-3 mt-1">{remaining}s left</p>
    </div>
  )
}

export function VendorDashboardPage() {
  const withSeg = customers.map((c) => ({ ...c, seg: getSegment(c) }))
  const seg = {
    loyalist: withSeg.filter((c) => c.seg === 'loyalist'),
    regular: withSeg.filter((c) => c.seg === 'regular'),
    atRisk: withSeg.filter((c) => c.seg === 'at-risk'),
    inactive: withSeg.filter((c) => c.seg === 'inactive'),
  }
  const n = customers.length
  const visitedLast30 = withSeg.filter((c) => daysSince(c.lastVisit) <= 30)
  const repeatVisitRate = Math.round((visitedLast30.length / n) * 100)
  const retentionRate = 71
  const activeCamps = campaigns.filter((c) => c.status === 'active')
  const avgEngagement = Math.round(activeCamps.reduce((s, c) => s + (c.userCap > 0 ? (c.currentUsers / c.userCap) * 100 : 0), 0) / activeCamps.length)
  const avgWinRate = Math.round(activeCamps.reduce((s, c) => s + (c.participations > 0 ? (c.rewardsClaimed / c.participations) * 100 : 0), 0) / activeCamps.length)
  const avgRedemption = Math.round(activeCamps.reduce((s, c) => s + (c.rewardsClaimed > 0 ? (c.redeemedCount / c.rewardsClaimed) * 100 : 0), 0) / activeCamps.length)
  const churnRisk = [...seg.atRisk, ...seg.inactive].reduce((s, c) => s + c.totalVisits * VALUE_PER_VISIT, 0)
  const segVal = {
    loyalist: seg.loyalist.reduce((s, c) => s + c.totalVisits * VALUE_PER_VISIT, 0),
    regular: seg.regular.reduce((s, c) => s + c.totalVisits * VALUE_PER_VISIT, 0),
    atRisk: seg.atRisk.reduce((s, c) => s + c.totalVisits * VALUE_PER_VISIT, 0),
    inactive: seg.inactive.reduce((s, c) => s + c.totalVisits * VALUE_PER_VISIT, 0),
  }
  const totalVal = Object.values(segVal).reduce((s, v) => s + v, 0)

  return (
    <div className="p-6 lg:p-8 max-w-7xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-v-text">Good morning, {business.name} ☕</h1>
          <p className="text-v-text-2 text-sm mt-1">Friday, 13 June 2026 · {activeCamps.length} campaigns running</p>
        </div>
        <Link to="/vendor/campaigns/create">
          <Button variant="primary"><Plus className="w-4 h-4" /> New Campaign</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <p className="text-xs text-v-text-3 mt-2">{visitedLast30.length} of {n} customers visited in the last 30 days</p>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-v-surface to-green-50 border-green-200 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-green-500/5 -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-v-text-2">Customer Retention Rate</span>
            </div>
            <div className="text-6xl font-black text-green-600 leading-none mb-2">{retentionRate}%</div>
            <Trend now={retentionRate} prev={LM.retentionRate} />
            <p className="text-xs text-v-text-3 mt-2">of last month&apos;s customers came back this month</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-v-text flex items-center gap-2">
                <Zap className="w-4 h-4 text-v-purple" /> Campaign Effectiveness
              </h2>
              <span className="text-[11px] text-v-text-3">Across {activeCamps.length} active campaigns</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: 'Avg Engagement', value: avgEngagement, prev: LM.avgEngagement, sub: 'players of cap used', color: '#7C3AED', bg: 'bg-purple-50', border: 'border-purple-200' },
                { label: 'Avg Win Rate', value: avgWinRate, prev: LM.avgWinRate, sub: 'rewards per 100 plays', color: '#16A34A', bg: 'bg-green-50', border: 'border-green-200' },
                { label: 'Avg Redemption', value: avgRedemption, prev: LM.avgRedemption, sub: 'rewards claimed at counter', color: '#D97706', bg: 'bg-amber-50', border: 'border-amber-200' },
              ].map((m) => (
                <div key={m.label} className={`vendor-card p-5 ${m.bg} border ${m.border}`}>
                  <div className="text-3xl font-black leading-none mb-2" style={{ color: m.color }}>{m.value}%</div>
                  <div className="text-xs font-semibold text-v-text mb-0.5">{m.label}</div>
                  <div className="text-[10px] text-v-text-3 mb-2">{m.sub}</div>
                  <Trend now={m.value} prev={m.prev} />
                  <div className="mt-2 h-1.5 rounded-full bg-white/60">
                    <div className="h-full rounded-full" style={{ width: `${m.value}%`, background: m.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-v-text">Active Campaigns</h2>
              <Link to="/vendor/campaigns" className="text-xs text-v-purple hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-2.5">
              {activeCamps.map((c) => {
                const engRate = c.userCap > 0 ? Math.round((c.currentUsers / c.userCap) * 100) : 0
                const wr = c.participations > 0 ? Math.round((c.rewardsClaimed / c.participations) * 100) : 0
                const rr = c.rewardsClaimed > 0 ? Math.round((c.redeemedCount / c.rewardsClaimed) * 100) : 0
                return (
                  <Link to={`/vendor/campaigns/${c.id}`} key={c.id} className="block no-underline">
                    <div className="vendor-card vendor-card-hover p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-v-surface-3 flex items-center justify-center text-xl shrink-0">
                          {getMechanicEmoji(c.mechanic)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="text-sm font-bold text-v-text truncate">{c.name}</span>
                            <MechanicBadge mechanic={c.mechanic} />
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
                        <LivePIN pin={c.pin} expiresAt={c.pinExpiresAt} />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="p-5 bg-red-50 border-red-200">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-v-danger" />
              <h3 className="text-sm font-bold text-v-danger">Churn Warning</h3>
            </div>
            <div className="text-3xl font-black text-v-danger leading-none mb-1">₹{churnRisk.toLocaleString()}</div>
            <p className="text-xs text-red-600 mb-4">
              estimated lifetime value at risk from {seg.atRisk.length + seg.inactive.length} slipping customers
            </p>
            <div className="space-y-2">
              {[...seg.atRisk, ...seg.inactive].map((c) => (
                <Link to={`/vendor/customers/${c.id}`} key={c.id} className="block no-underline">
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
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Crown className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-v-text">Estimated ₹ Value by Segment</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Loyalists', value: segVal.loyalist, count: seg.loyalist.length, bar: 'bg-amber-400', color: '#B45309' },
                { label: 'Regulars', value: segVal.regular, count: seg.regular.length, bar: 'bg-blue-400', color: '#1D4ED8' },
                { label: 'At-Risk', value: segVal.atRisk, count: seg.atRisk.length, bar: 'bg-orange-400', color: '#C2410C' },
                { label: 'Inactive', value: segVal.inactive, count: seg.inactive.length, bar: 'bg-gray-300', color: '#6B7280' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold" style={{ color: s.color }}>{s.label}</span>
                      <span className="text-[10px] text-v-text-3">({s.count})</span>
                    </div>
                    <span className="text-xs font-bold text-v-text">₹{s.value.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 bg-v-surface-3 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${s.bar}`} style={{ width: `${totalVal > 0 ? (s.value / totalVal) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-bold text-v-text mb-4">Redemption Queue</h3>
            <div className="space-y-2">
              {redemptionQueue.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-v-surface-2 border border-v-border">
                  <div>
                    <p className="text-xs font-semibold text-v-text">{r.customerName}</p>
                    <p className="text-[10px] text-v-text-3">{r.reward} · {r.campaignName}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'}`}>
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
