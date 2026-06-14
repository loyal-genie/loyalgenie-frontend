import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Users, Gift, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MechanicBadge, StatusBadge } from '@/components/ui/badge'
import { Card, ProgressBar } from '@/components/ui/card'
import { campaigns } from '@/lib/mock-data'
import { capPercent, getMechanicEmoji } from '@/lib/utils'

export function VendorCampaignDetailPage() {
  const { id } = useParams()
  const campaign = campaigns.find((c) => c.id === id)

  if (!campaign) {
    return (
      <div className="p-8 text-center">
        <p className="text-v-text-2">Campaign not found.</p>
        <Link to="/vendor/campaigns"><Button variant="secondary" className="mt-4">Back to campaigns</Button></Link>
      </div>
    )
  }

  const winRate = campaign.participations > 0 ? Math.round((campaign.rewardsClaimed / campaign.participations) * 100) : 0
  const redeemRate = campaign.rewardsClaimed > 0 ? Math.round((campaign.redeemedCount / campaign.rewardsClaimed) * 100) : 0

  return (
    <div className="p-6 lg:p-8 max-w-4xl space-y-6">
      <Link to="/vendor/campaigns" className="inline-flex items-center gap-1 text-sm text-v-purple hover:underline no-underline">
        <ArrowLeft className="w-4 h-4" /> All campaigns
      </Link>

      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-v-surface-3 flex items-center justify-center text-3xl">
          {getMechanicEmoji(campaign.mechanic)}
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h1 className="text-2xl font-extrabold text-v-text">{campaign.name}</h1>
            <MechanicBadge mechanic={campaign.mechanic} />
            <StatusBadge status={campaign.status} />
          </div>
          <p className="text-v-text-2 text-sm">{campaign.startDate} → {campaign.endDate}</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { icon: Users, label: 'Players', value: `${campaign.currentUsers}/${campaign.userCap}` },
          { icon: Gift, label: 'Win Rate', value: `${winRate}%` },
          { icon: CheckCircle, label: 'Redemption', value: `${redeemRate}%` },
        ].map((s) => (
          <Card key={s.label} className="p-5">
            <s.icon className="w-4 h-4 text-v-purple mb-2" />
            <p className="text-2xl font-black text-v-text">{s.value}</p>
            <p className="text-xs text-v-text-2 font-semibold">{s.label}</p>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h2 className="text-sm font-bold text-v-text mb-4">Capacity</h2>
        <ProgressBar value={campaign.currentUsers} max={campaign.userCap} className="h-2" />
        <p className="text-xs text-v-text-3 mt-2">{capPercent(campaign.currentUsers, campaign.userCap)}% of player cap used</p>
      </Card>

      <Card className="p-6 bg-v-purple/5 border-v-purple/20">
        <h2 className="text-sm font-bold text-v-text mb-2">Live Counter PIN</h2>
        <p className="text-5xl font-black text-v-purple tracking-[0.3em]">{campaign.pin}</p>
        <p className="text-xs text-v-text-3 mt-2">Share this PIN with customers redeeming rewards at your counter today.</p>
      </Card>
    </div>
  )
}
