import type { ReactNode } from 'react'
import { Gift, Zap } from 'lucide-react'

const ACTIVE = '#5b0e81'
const INACTIVE = '#8c8a8d'

type BusinessTabBarProps = {
  activeTab: 'campaigns' | 'rewards'
  onChange: (tab: 'campaigns' | 'rewards') => void
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative inline-flex items-center gap-1.5 border-0 bg-transparent px-0 pb-3 pt-3 cursor-pointer"
    >
      {icon}
      <span
        className="text-[15px] font-medium leading-none whitespace-nowrap"
        style={{ color: active ? ACTIVE : INACTIVE }}
      >
        {label}
      </span>
      {active && (
        <span
          className="absolute inset-x-0 -bottom-px h-0.5"
          style={{ background: ACTIVE }}
          aria-hidden
        />
      )}
    </button>
  )
}

export function BusinessTabBar({ activeTab, onChange }: BusinessTabBarProps) {
  const campaignsActive = activeTab === 'campaigns'
  const rewardsActive = activeTab === 'rewards'

  return (
    <div className="border-b border-[#ece9f4] px-5">
      <div className="flex items-center gap-8">
        <TabButton
          active={campaignsActive}
          onClick={() => onChange('campaigns')}
          label="Campaigns"
          icon={
            <Zap
              className="size-[18px] shrink-0"
              strokeWidth={2}
              fill={campaignsActive ? ACTIVE : 'none'}
              color={campaignsActive ? ACTIVE : INACTIVE}
            />
          }
        />

        <TabButton
          active={rewardsActive}
          onClick={() => onChange('rewards')}
          label="Rewards"
          icon={
            <Gift
              className="size-[17px] shrink-0"
              strokeWidth={1.75}
              color={rewardsActive ? ACTIVE : INACTIVE}
            />
          }
        />
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
