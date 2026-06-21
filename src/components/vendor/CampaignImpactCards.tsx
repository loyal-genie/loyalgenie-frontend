import { TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import {
  calcDailyWinners,
  calcLoyaltyMaxRewards,
  calcStampMaxRewards,
  calcTotalWinners,
  formatWinnerCount,
} from '@/lib/campaign-impact'
import { fmtCampaignDate } from '@/lib/campaign-duration'

interface WinBasedImpactProps {
  userCap: number
  perDayUserLimit: number
  playsPerDay: number
  winRatePercent: number
  campaignDays: number
  startDate: string
  endDate: string
  isSingleDay?: boolean
  variant?: 'light' | 'muted'
}

export function WinBasedCampaignImpact({
  userCap,
  perDayUserLimit,
  playsPerDay,
  winRatePercent,
  campaignDays,
  startDate,
  endDate,
  isSingleDay = false,
  variant = 'light',
}: WinBasedImpactProps) {
  const totalWinners = calcTotalWinners(userCap, playsPerDay, winRatePercent)
  const dailyWinners = calcDailyWinners(isSingleDay ? userCap : perDayUserLimit, playsPerDay, winRatePercent)
  const dailyUsers = isSingleDay ? userCap : perDayUserLimit
  const tileClass = variant === 'light' ? 'bg-white rounded-xl p-3.5' : 'bg-v-surface-2 rounded-xl p-3.5'

  return (
    <Card className="p-5 bg-v-surface-3 border-v-border-b">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-v-purple" />
        <h3 className="text-sm font-bold text-v-text">Expected Campaign Impact</h3>
      </div>
      <div className={`grid gap-3 ${isSingleDay ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`}>
        <div className={tileClass}>
          <div className="text-xl font-black text-v-purple">{formatWinnerCount(totalWinners, true)}</div>
          <div className="text-xs font-semibold text-v-text-2 mt-1">Total Winners</div>
          <div className="text-[10px] text-v-text-3 mt-0.5">
            {userCap.toLocaleString()} players × {winRatePercent}% win rate
          </div>
        </div>
        {!isSingleDay && (
          <div className={tileClass}>
            <div className="text-xl font-black text-v-text">{formatWinnerCount(dailyWinners)}</div>
            <div className="text-xs font-semibold text-v-text-2 mt-1">Winners / Day</div>
            <div className="text-[10px] text-v-text-3 mt-0.5">
              {dailyUsers.toLocaleString()} players × {winRatePercent}% win rate
            </div>
          </div>
        )}
        {!isSingleDay && (
          <div className={tileClass}>
            <div className="text-xl font-black text-v-text">{campaignDays}d</div>
            <div className="text-xs font-semibold text-v-text-2 mt-1">Duration</div>
            <div className="text-[10px] text-v-text-3 mt-0.5">{fmtCampaignDate(startDate)} → {fmtCampaignDate(endDate)}</div>
          </div>
        )}
      </div>
      <p className="text-[11px] text-v-text-3 mt-3">
        Numbers assume your user cap fills. Adjust winners above or change your user cap to update projections.
      </p>
    </Card>
  )
}

interface StampImpactProps {
  userCap: number
  totalStamps: number
  variant?: 'light' | 'muted'
}

export function StampCampaignImpact({ userCap, totalStamps, variant = 'light' }: StampImpactProps) {
  const maxRewards = calcStampMaxRewards(userCap)
  const tileClass = variant === 'light' ? 'bg-white rounded-xl p-3.5' : 'bg-v-surface-2 rounded-xl p-3.5'

  return (
    <Card className="p-5 bg-v-surface-3 border-v-border-b">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-v-purple" />
        <h3 className="text-sm font-bold text-v-text">Expected Campaign Impact</h3>
      </div>
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
        <div className={tileClass}>
          <div className="text-xl font-black text-v-purple">{userCap.toLocaleString()}</div>
          <div className="text-xs font-semibold text-v-text-2 mt-1">Customers Enrolled</div>
          <div className="text-[10px] text-v-text-3 mt-0.5">Max if user cap fills</div>
        </div>
        <div className={tileClass}>
          <div className="text-xl font-black text-v-text">{formatWinnerCount(maxRewards)}</div>
          <div className="text-xs font-semibold text-v-text-2 mt-1">Max Rewards</div>
          <div className="text-[10px] text-v-text-3 mt-0.5">Up to 2 rewards per customer (surprise + big)</div>
        </div>
        <div className={tileClass}>
          <div className="text-xl font-black text-v-text">{totalStamps}</div>
          <div className="text-xs font-semibold text-v-text-2 mt-1">Stamps to Complete</div>
          <div className="text-[10px] text-v-text-3 mt-0.5">Per enrolled customer</div>
        </div>
      </div>
    </Card>
  )
}

interface LoyaltyImpactProps {
  userCap: number | null
  userCapLimited: boolean
  pointsPerCheckIn: number
  milestoneCount: number
  variant?: 'light' | 'muted'
}

export function LoyaltyCampaignImpact({
  userCap,
  userCapLimited,
  pointsPerCheckIn,
  milestoneCount,
  variant = 'light',
}: LoyaltyImpactProps) {
  const tileClass = variant === 'light' ? 'bg-white rounded-xl p-3.5' : 'bg-v-surface-2 rounded-xl p-3.5'
  const maxRewards = userCapLimited && userCap ? calcLoyaltyMaxRewards(userCap, milestoneCount) : null

  return (
    <Card className="p-5 bg-v-surface-3 border-v-border-b">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-v-purple" />
        <h3 className="text-sm font-bold text-v-text">Expected Campaign Impact</h3>
      </div>
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
        <div className={tileClass}>
          <div className="text-xl font-black text-v-purple">+{pointsPerCheckIn}</div>
          <div className="text-xs font-semibold text-v-text-2 mt-1">Points / Check-in</div>
          <div className="text-[10px] text-v-text-3 mt-0.5">Earned once per day per customer</div>
        </div>
        <div className={tileClass}>
          <div className="text-xl font-black text-v-text">{milestoneCount}</div>
          <div className="text-xs font-semibold text-v-text-2 mt-1">Reward Milestones</div>
          <div className="text-[10px] text-v-text-3 mt-0.5">Unlock one reward per milestone</div>
        </div>
        <div className={tileClass}>
          <div className="text-xl font-black text-v-text">
            {maxRewards != null ? formatWinnerCount(maxRewards) : 'Open'}
          </div>
          <div className="text-xs font-semibold text-v-text-2 mt-1">Max Rewards</div>
          <div className="text-[10px] text-v-text-3 mt-0.5">
            {maxRewards != null
              ? `${userCap!.toLocaleString()} customers × ${milestoneCount} milestone${milestoneCount !== 1 ? 's' : ''}`
              : 'No enrollment cap — scales with check-ins'}
          </div>
        </div>
      </div>
    </Card>
  )
}

interface LotteryImpactProps {
  prizeCount: number
  variant?: 'light' | 'muted'
}

export function LotteryCampaignImpact({ prizeCount, variant = 'light' }: LotteryImpactProps) {
  const tileClass = variant === 'light' ? 'bg-white rounded-xl p-3.5' : 'bg-v-surface-2 rounded-xl p-3.5'

  return (
    <Card className="p-5 bg-v-surface-3 border-v-border-b">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-v-purple" />
        <h3 className="text-sm font-bold text-v-text">Expected Campaign Impact</h3>
      </div>
      <div className="grid gap-3 grid-cols-2">
        <div className={tileClass}>
          <div className="text-xl font-black text-v-purple">Open</div>
          <div className="text-xs font-semibold text-v-text-2 mt-1">Customer Enrollment</div>
          <div className="text-[10px] text-v-text-3 mt-0.5">No user cap — all customers can play</div>
        </div>
        <div className={tileClass}>
          <div className="text-xl font-black text-v-text">{prizeCount}</div>
          <div className="text-xs font-semibold text-v-text-2 mt-1">Prize Types</div>
          <div className="text-[10px] text-v-text-3 mt-0.5">Jackpot + additional prizes</div>
        </div>
      </div>
    </Card>
  )
}
