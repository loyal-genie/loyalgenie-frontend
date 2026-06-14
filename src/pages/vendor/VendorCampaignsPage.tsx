import { Link } from 'react-router-dom'
import { Plus, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MechanicBadge, StatusBadge } from '@/components/ui/badge'
import { ProgressBar } from '@/components/ui/card'
import { campaigns } from '@/lib/mock-data'
import { capPercent, getMechanicEmoji } from '@/lib/utils'

export function VendorCampaignsPage() {
  return (
    <div className="p-6 lg:p-8 max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-v-text">Campaigns</h1>
          <p className="text-v-text-2 text-sm mt-1">Manage your loyalty mechanics and rewards</p>
        </div>
        <Link to="/vendor/campaigns/create">
          <Button variant="primary"><Plus className="w-4 h-4" /> New Campaign</Button>
        </Link>
      </div>

      <div className="space-y-3">
        {campaigns.map((c) => (
          <Link to={`/vendor/campaigns/${c.id}`} key={c.id} className="block no-underline">
            <div className="vendor-card vendor-card-hover p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-v-surface-3 flex items-center justify-center text-2xl shrink-0">
                  {getMechanicEmoji(c.mechanic)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h2 className="text-base font-bold text-v-text">{c.name}</h2>
                    <MechanicBadge mechanic={c.mechanic} />
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="text-xs text-v-text-3 mb-3">{c.startDate} → {c.endDate}</p>
                  <ProgressBar value={c.currentUsers} max={c.userCap} />
                  <p className="text-[10px] text-v-text-3 mt-1">{c.currentUsers} / {c.userCap} players ({capPercent(c.currentUsers, c.userCap)}%)</p>
                </div>
                <ArrowRight className="w-4 h-4 text-v-text-3 shrink-0 mt-1" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
