import { CampaignPinDetailShell, CampaignDetailCoverChip } from '@/components/customer/CampaignPinDetailShell'
import { PinKeypad } from '@/components/customer/PinKeypad'
import { formatShakeWinLabel } from '@/lib/campaign-impact'
import { getCampaignTheme } from '@/lib/campaign-themes'
import { SPIN_SOLID_COLORS, spinRewardChipStyle } from '@/lib/spin-segment-colors'
import type { PublicCampaign } from '@/lib/api'

interface SpinCampaignDetailProps {
  campaign: PublicCampaign
  pin: string
  error?: string
  loading?: boolean
  winRatePercent?: number
  overallWinners?: number
  userCap?: number
  playsUsedToday?: number
  playsPerDay?: number
  onBack: () => void
  onKey: (digit: string) => void
  onDelete: () => void
  onSubmit: () => void
}

export function SpinCampaignDetail({
  campaign,
  pin,
  error,
  loading,
  winRatePercent,
  overallWinners,
  userCap,
  playsUsedToday,
  playsPerDay,
  onBack,
  onKey,
  onDelete,
  onSubmit,
}: SpinCampaignDetailProps) {
  const theme = getCampaignTheme('spin')
  const winSegments = campaign.spinConfig?.segments.filter(s => s.isWin && (s.reward || s.label)) ?? []
  const prizeChips = winSegments.length > 0
    ? winSegments.map(s => ({
        label: s.label,
        reward: s.reward ?? s.label,
        color: s.color,
      }))
    : campaign.rewards.map((r, i) => ({
        label: r.name,
        reward: r.name,
        color: SPIN_SOLID_COLORS[i % SPIN_SOLID_COLORS.length]!.value,
      }))

  return (
    <CampaignPinDetailShell
      mechanic="spin"
      title={campaign.name}
      subtitle="A flick of fortune at every checkout."
      onBack={onBack}
      loading={loading}
      coverExtra={
        <>
          {overallWinners != null && userCap != null && (
            <CampaignDetailCoverChip>✨ {formatShakeWinLabel(overallWinners, userCap)}</CampaignDetailCoverChip>
          )}
          {overallWinners == null && winRatePercent != null && (
            <CampaignDetailCoverChip>✨ {winRatePercent}% of spins win</CampaignDetailCoverChip>
          )}
          {playsUsedToday != null && playsPerDay != null && (
            <CampaignDetailCoverChip>{playsUsedToday}/{playsPerDay} spins today</CampaignDetailCoverChip>
          )}
        </>
      }
      footer={
        <PinKeypad
          pin={pin}
          error={error}
          loading={loading}
          compact
          onKey={onKey}
          onDelete={onDelete}
          onSubmit={onSubmit}
          submitLabel="Spin the wheel"
          submitColor={theme.accent}
        />
      }
    >
      {prizeChips.length > 0 && (
        <div className="rounded-2xl border border-[#e8eef9] bg-[#f8fafc] px-3.5 py-3">
          <p className="mb-2.5 text-center text-[10px] font-bold uppercase tracking-[0.14em] text-[#64748b]">
            Possible rewards
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {prizeChips.map((seg, i) => {
              const chip = spinRewardChipStyle(seg.color)
              const label = seg.reward ?? seg.label
              return (
                <span
                  key={`${label}-${i}`}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold leading-tight"
                  style={{
                    background: chip.background,
                    border: `1px solid ${chip.borderColor}`,
                    color: chip.textColor,
                  }}
                >
                  <span
                    className="size-2 shrink-0 rounded-full ring-1 ring-white/30"
                    style={{ background: chip.dotBackground }}
                    aria-hidden
                  />
                  {label}
                </span>
              )
            })}
          </div>
        </div>
      )}
    </CampaignPinDetailShell>
  )
}
