import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, Pencil, Loader2 } from 'lucide-react'
import { Card, ProgressBar } from '@/components/ui/card'
import { MechanicBadge, StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LivePIN } from '@/components/vendor/live-pin'
import { useCampaign } from '@/hooks/useCampaigns'
import { getMechanicEmoji, formatDate, capPercent } from '@/lib/utils'
import { effectiveCampaignStatus } from '@/lib/campaign-dates'
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

  const engRate = campaign.userCap > 0
    ? Math.round((campaign.currentUsers / campaign.userCap) * 100) : 0
  const winRate = campaign.participations > 0
    ? Math.round((campaign.rewardsClaimed / campaign.participations) * 100) : 0
  const redRate = campaign.rewardsClaimed > 0
    ? Math.round((campaign.redeemedCount / campaign.rewardsClaimed) * 100) : 0

  const status = effectiveCampaignStatus(campaign.status as CampaignStatus, campaign.endDate)
  const isActive = status === 'active'

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
            {[
              { label: 'Engagement', pct: engRate, sub: `${campaign.currentUsers} / ${campaign.userCap} users`, color: '#7C3AED' },
              { label: 'Win Rate', pct: winRate, sub: `${campaign.rewardsClaimed} wins / ${campaign.participations} plays`, color: '#16A34A' },
              { label: 'Redeemed', pct: redRate, sub: `${campaign.redeemedCount} redeemed`, color: '#D97706' },
            ].map(m => (
              <Card key={m.label} className="p-4">
                <p className="text-xs text-v-text-3 mb-1">{m.label}</p>
                <p className="text-2xl font-black" style={{ color: m.color }}>{m.pct}%</p>
                <p className="text-[10px] text-v-text-3 mt-1">{m.sub}</p>
              </Card>
            ))}
          </div>

          <Card className="p-5">
            <h3 className="text-sm font-bold text-v-text mb-4">Campaign Settings</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {[
                { label: 'Win Rate', value: `${campaign.winRatePercent}%` },
                { label: 'Plays / Day', value: String(campaign.playsPerDay) },
                { label: 'Daily User Limit', value: String(campaign.perDayUserLimit) },
                { label: 'User Cap', value: String(campaign.userCap) },
              ].map(row => (
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
            <h3 className="text-sm font-bold text-v-text mb-4">Reward Distribution</h3>
            <div className="space-y-3">
              {campaign.rewards.map(r => (
                <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl bg-v-surface-2">
                  <span className="text-2xl">{r.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-v-text">{r.name}</p>
                    {r.description && <p className="text-xs text-v-text-3 truncate">{r.description}</p>}
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
            <p className="text-xs text-v-text-3 mb-4 text-center">Show this PIN to customers at the counter</p>
            <LivePIN campaignId={campaign.id} active={isActive} />
            {!isActive && (
              <p className="text-xs text-v-text-3 mt-2">PIN inactive — campaign not running</p>
            )}
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-bold text-v-text mb-2">How probability works</h3>
            <p className="text-xs text-v-text-3 leading-relaxed">
              Each play has a <strong className="text-v-text">{campaign.winRatePercent}%</strong> chance to win (server-side).
              Winners receive a reward picked by share:{' '}
              {campaign.rewards.map(r => `${r.name} ${r.sharePercent}%`).join(', ')}.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
