import { Gift, Zap } from 'lucide-react'

const ACTIVE = '#5b0e81'
const INACTIVE = '#8c8a8d'

type BusinessTabBarProps = {
  activeTab: 'campaigns' | 'rewards'
  onChange: (tab: 'campaigns' | 'rewards') => void
}

export function BusinessTabBar({ activeTab, onChange }: BusinessTabBarProps) {
  const campaignsActive = activeTab === 'campaigns'
  const rewardsActive = activeTab === 'rewards'

  return (
    <div className="flex flex-col gap-4 pt-[13px]">
      <div className="flex w-full flex-col gap-2.5 px-5 py-3">
        <div className="flex w-full items-start gap-[3px]">
          <button
            type="button"
            onClick={() => onChange('campaigns')}
            className="inline-flex items-start gap-[3px] border-0 bg-transparent p-0 cursor-pointer"
          >
            <Zap
              className="size-[18px] shrink-0"
              strokeWidth={2}
              fill={campaignsActive ? ACTIVE : 'none'}
              color={campaignsActive ? ACTIVE : INACTIVE}
            />
            <span
              className="h-[15px] w-[142px] shrink-0 text-left text-[15px] font-medium leading-[15px]"
              style={{
                color: campaignsActive ? ACTIVE : INACTIVE,
                textDecoration: campaignsActive ? 'underline' : 'none',
                textDecorationColor: ACTIVE,
                textUnderlineOffset: '2px',
              }}
            >
              Campaigns
            </span>
          </button>

          <button
            type="button"
            onClick={() => onChange('rewards')}
            className="inline-flex items-start gap-[3px] border-0 bg-transparent p-0 cursor-pointer"
          >
            <Gift
              className="mt-px size-[17px] shrink-0"
              strokeWidth={1.75}
              color={rewardsActive ? ACTIVE : INACTIVE}
            />
            <span
              className="text-[15px] font-medium leading-[18px] whitespace-nowrap"
              style={{
                color: rewardsActive ? ACTIVE : INACTIVE,
                textDecoration: rewardsActive ? 'underline' : 'none',
                textDecorationColor: ACTIVE,
                textUnderlineOffset: '2px',
              }}
            >
              Rewards
            </span>
          </button>
        </div>

        <div className="h-px w-full bg-[#ece9f4]" />
      </div>
    </div>
  )
}

export function RewardsSectionHeader({ count }: { count: number }) {
  return (
    <div className="flex w-full items-center justify-between">
      <p className="text-[15px] font-semibold text-[#1c1033]">Rewards to claim</p>
      <span className="flex h-4 items-center rounded-[10px] bg-[#ede8f8] px-2 text-[9.5px] font-normal leading-none text-[#9e88cc]">
        {count} available
      </span>
    </div>
  )
}

export function LockedRewardsSectionHeader() {
  return (
    <div className="flex w-full items-center justify-between">
      <p className="text-[15px] font-semibold text-[#1c1033]">Locked Rewards</p>
      <span className="text-xs font-semibold text-[#5b2a8c]">See all</span>
    </div>
  )
}
