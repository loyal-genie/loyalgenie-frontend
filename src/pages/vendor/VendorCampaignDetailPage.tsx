import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, Pencil, Loader2, Target, Trophy, Clock } from 'lucide-react'
import { Card, ProgressBar } from '@/components/ui/card'
import { MechanicBadge, StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LivePIN } from '@/components/vendor/live-pin'
import { useCampaign } from '@/hooks/useCampaigns'
import { getMechanicEmoji, formatDate, capPercent } from '@/lib/utils'
import { effectiveCampaignStatus, fmtCampaignDate } from '@/lib/campaign-dates'
import type { CampaignStatus } from '@/lib/types'

export function VendorCampaignDetailPage() {
  const { id } = useParams()
  const { data: campaign, isLoading, isError } = useCampaign(id)

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-v-purple animate-spin" />
      </div>
    )
  }

  if (isError || !campaign) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 text-center py-20">
        <p className="text-v-text-2">Campaign not found</p>
        <Link to="/vendor/campaigns" className="text-v-purple text-sm mt-4 inline-block">← Back to campaigns</Link>
      </div>
    )
  }

  const isStamp = campaign.mechanic === 'stamp'
  const stampStats = campaign.stampStats
  const engRate = campaign.userCap > 0
    ? Math.round((campaign.currentUsers / campaign.userCap) * 100) : 0
  const winRate = campaign.participations > 0
    ? Math.round((campaign.rewardsClaimed / campaign.participations) * 100) : 0
  const redRate = campaign.rewardsClaimed > 0
    ? Math.round((campaign.redeemedCount / campaign.rewardsClaimed) * 100) : 0

  const status = effectiveCampaignStatus(campaign.status as CampaignStatus, campaign.endDate)
  const pinActive = isStamp ? (stampStats?.pinActive ?? false) : status === 'active'

  const stampMetrics = isStamp && stampStats ? [
    { label: 'Completion Rate', pct: stampStats.completionRate, sub: `${stampStats.completed} / ${stampStats.enrolled} cards complete`, color: '#16A34A' },
    { label: 'Enrollment', pct: engRate, sub: `${campaign.currentUsers} / ${campaign.userCap} users`, color: '#7C3AED' },
    { label: 'Rewards Issued', pct: Math.min(100, stampStats.totalRewardsIssued * 5), sub: `${stampStats.surpriseAwards} surprise · ${stampStats.bigAwards} big`, color: '#D97706' },
  ] : [
    { label: 'Engagement', pct: engRate, sub: `${campaign.currentUsers} / ${campaign.userCap} users`, color: '#7C3AED' },
    { label: 'Win Rate', pct: winRate, sub: `${campaign.rewardsClaimed} wins / ${campaign.participations} plays`, color: '#16A34A' },
    { label: 'Redeemed', pct: redRate, sub: `${campaign.redeemedCount} redeemed`, color: '#D97706' },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <Link to="/vendor/campaigns" className="inline-flex items-center gap-1.5 text-sm text-v-text-2 hover:text-v-text mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Campaigns
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-v-surface-3 flex items-center justify-center text-3xl shrink-0">
              {getMechanicEmoji(campaign.mechanic)}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h1 className="text-xl font-extrabold text-v-text">{campaign.name}</h1>
                <StatusBadge status={status} />
                {isStamp && stampStats && !stampStats.enrollmentOpen && stampStats.pinActive && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">Claim window</span>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <MechanicBadge mechanic={campaign.mechanic as 'shake'} />
                <span className="text-xs text-v-text-3 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(campaign.startDate)} – {formatDate(campaign.endDate)}
                </span>
              </div>
            </div>
          </div>
          <Link to={`/vendor/campaigns/${campaign.id}/edit`}>
            <Button variant="secondary" size="sm"><Pencil className="w-3.5 h-3.5" /> Edit</Button>
          </Link>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stampMetrics.map(m => (
              <Card key={m.label} className="p-4">
                <p className="text-xs text-v-text-3 mb-1">{m.label}</p>
                <p className="text-2xl font-black" style={{ color: m.color }}>{m.pct}%</p>
                <p className="text-[10px] text-v-text-3 mt-1">{m.sub}</p>
              </Card>
            ))}
          </div>

          {isStamp && stampStats && (
            <Card className="p-5">
              <h3 className="text-sm font-bold text-v-text mb-4">Stamp Card Analytics</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                {[
                  { label: 'Avg stamps', value: String(stampStats.avgStampsCollected), icon: Target },
                  { label: 'Active cards', value: String(stampStats.active), icon: Clock },
                  { label: 'Expired', value: String(stampStats.expired), icon: Clock },
                  { label: 'Total rewards', value: String(stampStats.totalRewardsIssued), icon: Trophy },
                ].map(item => (
                  <div key={item.label} className="p-3 rounded-xl bg-v-surface-2">
                    <item.icon className="w-4 h-4 text-v-purple mb-1" />
                    <p className="text-lg font-black text-v-text">{item.value}</p>
                    <p className="text-[10px] text-v-text-3">{item.label}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-v-border">
                  <span className="text-v-text-3">Claim deadline</span>
                  <span className="font-semibold text-v-text">{fmtCampaignDate(stampStats.claimDeadline)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-v-border">
                  <span className="text-v-text-3">Enrollment closed</span>
                  <span className="font-semibold text-v-text">{fmtCampaignDate(stampStats.enrollmentCloseDate)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-v-text-3">Claim period</span>
                  <span className="font-semibold text-v-text">{stampStats.claimPeriodDays} days</span>
                </div>
              </div>
              {stampStats.stampConfig && (
                <div className="mt-4 p-3 rounded-xl bg-v-surface-2 text-xs text-v-text-2">
                  {stampStats.stampConfig.totalStamps} stamps · Surprise {stampStats.stampConfig.surpriseRange.join('–')} · Big {stampStats.stampConfig.bigRange.join('–')}
                </div>
              )}
            </Card>
          )}

          <Card className="p-5">
            <h3 className="text-sm font-bold text-v-text mb-4">Campaign Settings</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {(isStamp ? [
                { label: 'User Cap', value: String(campaign.userCap) },
                { label: 'Claim Period', value: `${stampStats?.claimPeriodDays ?? campaign.claimPeriodDays ?? 30} days` },
                { label: 'Total Stamps', value: String(stampStats?.stampConfig?.totalStamps ?? '—') },
                { label: 'Stamps / Day', value: '1 per customer' },
              ] : [
                { label: 'Win Rate', value: `${campaign.winRatePercent}%` },
                { label: 'Plays / Day', value: String(campaign.playsPerDay) },
                { label: 'Daily User Limit', value: String(campaign.perDayUserLimit) },
                { label: 'User Cap', value: String(campaign.userCap) },
              ]).map(row => (
                <div key={row.label} className="flex justify-between py-2 border-b border-v-border last:border-0">
                  <span className="text-v-text-3">{row.label}</span>
                  <span className="font-semibold text-v-text">{row.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <p className="text-xs text-v-text-3 mb-2">User cap usage</p>
              <ProgressBar
                value={campaign.currentUsers}
                max={campaign.userCap}
                color={capPercent(campaign.currentUsers, campaign.userCap) > 85 ? '#DC2626' : '#7C3AED'}
              />
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-bold text-v-text mb-4">{isStamp ? 'Reward Tiers' : 'Reward Distribution'}</h3>
            <div className="space-y-3">
              {campaign.rewards.map(r => (
                <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl bg-v-surface-2">
                  <span className="text-2xl">{r.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-v-text">{r.name}</p>
                    {r.description && <p className="text-xs text-v-text-3 truncate">{r.description}</p>}
                    {r.rewardTier && (
                      <p className="text-[10px] text-v-purple font-semibold uppercase mt-0.5">{r.rewardTier} drop</p>
                    )}
                  </div>
                  <span className="text-sm font-bold text-v-purple">{r.sharePercent}%</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 flex flex-col items-center">
            <h3 className="text-sm font-bold text-v-text mb-1">Live Staff PIN</h3>
            <p className="text-xs text-v-text-3 mb-4 text-center">
              {isStamp ? 'Rotates every 2 min · Active during claim window' : 'Show this PIN to customers at the counter'}
            </p>
            <LivePIN campaignId={campaign.id} active={pinActive} />
            {!pinActive && (
              <p className="text-xs text-v-text-3 mt-2">PIN inactive — campaign ended</p>
            )}
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-bold text-v-text mb-2">
              {isStamp ? 'How stamp cards work' : 'How probability works'}
            </h3>
            <p className="text-xs text-v-text-3 leading-relaxed">
              {isStamp ? (
                <>
                  Customers collect <strong className="text-v-text">1 stamp per visit</strong> (PIN required).
                  Surprise rewards unlock between stamps {stampStats?.stampConfig?.surpriseRange.join('–') ?? '3–5'};
                  big rewards between {stampStats?.stampConfig?.bigRange.join('–') ?? '8–10'}.
                  Each customer gets random trigger positions within those ranges.
                </>
              ) : (
                <>
                  Each play has a <strong className="text-v-text">{campaign.winRatePercent}%</strong> chance to win (server-side).
                  Winners receive a reward picked by share:{' '}
                  {campaign.rewards.map(r => `${r.name} ${r.sharePercent}%`).join(', ')}.
                </>
              )}
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
