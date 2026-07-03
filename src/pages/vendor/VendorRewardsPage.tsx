import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Filter, Search } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RewardPreviewCard } from '@/components/vendor/RewardPreviewCard'
import { RedeemedRewardsList } from '@/components/vendor/RedeemedRewardsList'
import { getApiErrorMessage } from '@/lib/api'
import { useBusinessRewards, useDeleteBusinessReward, useRedeemedRewards, useRewardsOverview } from '@/hooks/useRewards'

type Tab = 'active' | 'redeemed'

export function VendorRewardsPage() {
  const navigate = useNavigate()
  const [activeQuery, setActiveQuery] = useState('')
  const [tab, setTab] = useState<Tab>('active')
  const [redeemedDateFrom, setRedeemedDateFrom] = useState<string>()
  const [redeemedDateTo, setRedeemedDateTo] = useState<string>()

  const { data: overview } = useRewardsOverview()
  const { data: rewards = [] } = useBusinessRewards()
  const { data: redeemed = [], isLoading: redeemedLoading } = useRedeemedRewards({
    fromDate: redeemedDateFrom,
    toDate: redeemedDateTo,
  })
  const deleteRewardMutation = useDeleteBusinessReward()
  const [deleteError, setDeleteError] = useState('')

  const filteredRewards = useMemo(() => {
    const q = activeQuery.toLowerCase().trim()
    return rewards.filter(reward => {
      if (tab === 'active' && reward.status !== 'active') return false
      if (!q) return true
      return reward.name.toLowerCase().includes(q)
    })
  }, [rewards, activeQuery, tab])

  const handleDeleteReward = async (rewardId: string, rewardName: string) => {
    const confirmed = window.confirm(`Delete "${rewardName}"? This cannot be undone.`)
    if (!confirmed) return

    setDeleteError('')
    try {
      await deleteRewardMutation.mutateAsync(rewardId)
    } catch (err) {
      setDeleteError(getApiErrorMessage(err, 'Failed to delete reward'))
    }
  }

  const handleRedeemedDateRangeChange = (from?: string, to?: string) => {
    setRedeemedDateFrom(from)
    setRedeemedDateTo(to)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-v-text">Rewards Galore</h1>
          <p className="mt-1 text-sm text-v-text-2">Manage custom rewards for your customers</p>
        </div>
        <Button className="rounded-full px-6 py-2.5 text-sm" onClick={() => navigate('/vendor/rewards/create')}>+ Create Reward</Button>
      </div>

      <h2 className="mb-3 text-xl font-semibold text-v-text">Overview</h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        {[
          { label: 'Total Rewards', value: overview?.totalRewards ?? 0, sub: 'Across all categories' },
          { label: 'Active Rewards', value: overview?.activeRewards ?? 0, sub: 'Currently claimable' },
          { label: 'Total Redeemed', value: overview?.totalRedeemed ?? 0, sub: 'Successfully redeemed' },
          { label: 'Expired', value: overview?.expiredRewards ?? 0, sub: 'Expired or depleted' },
        ].map(card => (
          <Card key={card.label} className="rounded-2xl border-[#e5e0f8] p-4">
            <p className={`text-sm ${card.label === 'Expired' ? 'text-[#9a1818]' : 'text-[#6c68a7]'}`}>{card.label}</p>
            <p className="mt-1 text-4xl font-extrabold leading-none text-v-text">{card.value}</p>
            <p className="mt-1 text-xs text-v-text-3">{card.sub}</p>
          </Card>
        ))}
      </div>

      {tab === 'active' && (
        <div className="mt-5 flex gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-v-text-3" />
            <input
              value={activeQuery}
              onChange={e => setActiveQuery(e.target.value)}
              placeholder="Search For Rewards...."
              className="h-11 w-full rounded-xl border border-v-border bg-white pl-10 pr-3 text-sm"
            />
          </div>
          <button type="button" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-v-border bg-white">
            <Filter className="h-4 w-4 text-v-text-2" />
          </button>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="grid flex-1 grid-cols-2 rounded-xl border border-[rgba(156,147,199,0.25)] bg-[rgba(156,147,199,0.09)] p-1">
          {(['active', 'redeemed'] as Tab[]).map(key => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                tab === key ? 'bg-white text-v-purple shadow' : 'text-[#9c93c7]'
              }`}
            >
              {key === 'active' ? 'Active Rewards' : 'Redeemed'}
            </button>
          ))}
        </div>
      </div>

      {deleteError && <p className="mt-3 text-sm text-v-danger">{deleteError}</p>}

      {tab === 'active' ? (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredRewards.map(reward => (
            <RewardPreviewCard
              key={reward.id}
              variant="list"
              icon={reward.icon}
              name={reward.name}
              description={reward.description}
              pointsRequired={reward.pointsRequired}
              availableRewards={reward.maxClaims ?? undefined}
              expiryLabel={reward.claimBefore ?? '31 Dec 2026'}
              claimBefore={reward.claimBefore ?? '31 Dec 2026'}
              claimedCount={reward.claimsCount}
              maxClaims={reward.maxClaims}
              onEdit={() => navigate(`/vendor/rewards/${reward.id}/edit`)}
              onDelete={() => void handleDeleteReward(reward.id, reward.name)}
            />
          ))}
        </div>
      ) : (
        <RedeemedRewardsList
          items={redeemed}
          isLoading={redeemedLoading}
          onRedeemedDateRangeChange={handleRedeemedDateRangeChange}
        />
      )}
    </div>
  )
}
