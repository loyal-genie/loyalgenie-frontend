import { CampaignPinDetailShell } from '@/components/customer/CampaignPinDetailShell'
import { PinKeypad } from '@/components/customer/PinKeypad'
import { formatShakeWinLabel } from '@/lib/campaign-impact'
import { getCampaignTheme } from '@/lib/campaign-themes'
import {
  SPIN_SOLID_COLORS,
  spinRewardChipStyleLight,
  spinSegmentAccentHex,
} from '@/lib/spin-segment-colors'
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
  businessName?: string
  onBack: () => void
  onKey: (digit: string) => void
  onDelete: () => void
  onSubmit: () => void
}

function prizeLabel(seg: { label?: string; reward?: string | null; icon?: string }): string {
  const raw = (seg.reward ?? seg.label ?? '').trim()
  return raw || 'Prize'
}

function prizeIcon(seg: { icon?: string; reward?: string | null; label?: string }, index: number): string {
  if (seg.icon?.trim()) return seg.icon.trim()
  const FALLBACKS = ['☕', '🏷️', '🧁', '⭐', '🎁', '🍪']
  return FALLBACKS[index % FALLBACKS.length]!
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
  businessName,
  onBack,
  onKey,
  onDelete,
  onSubmit,
}: SpinCampaignDetailProps) {
  const theme = getCampaignTheme('spin')

  const winSegments =
    campaign.spinConfig?.segments.filter(s => s.isWin && ((s.reward ?? '').trim() || (s.label ?? '').trim())) ??
    []

  const prizeChips =
    winSegments.length > 0
      ? winSegments.map((s, i) => ({
          label: prizeLabel(s),
          icon: prizeIcon(s, i),
          color: s.color || SPIN_SOLID_COLORS[i % SPIN_SOLID_COLORS.length]!.value,
        }))
      : (campaign.rewards ?? [])
          .filter(r => (r.name ?? '').trim())
          .map((r, i) => ({
            label: r.name.trim(),
            icon: r.icon?.trim() || prizeIcon({}, i),
            color: SPIN_SOLID_COLORS[i % SPIN_SOLID_COLORS.length]!.value,
          }))

  return (
    <CampaignPinDetailShell
      mechanic="spin"
      title={campaign.name}
      subtitle="Spin at checkout for a shot at instant happiness."
      businessName={businessName}
      onBack={onBack}
      loading={loading}
      headerRight={
        overallWinners != null && userCap != null
          ? formatShakeWinLabel(overallWinners, userCap)
          : winRatePercent != null
            ? `${winRatePercent}% win rate`
            : undefined
      }
      coverExtra={
        playsUsedToday != null && playsPerDay != null ? (
          <span
            className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold"
            style={{ background: `${theme.accent}18`, color: theme.accent }}
          >
            {playsUsedToday}/{playsPerDay} tries
          </span>
        ) : undefined
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
          submitLabel="Play Now"
          submitColor={theme.accent}
          submitColorTo={theme.accentTo}
        />
      }
    >
      {prizeChips.length > 0 ? (
        <div>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-wide text-gray-500">
            What you could win
          </p>
          <div className="grid grid-cols-2 gap-2">
            {prizeChips.slice(0, 4).map((seg, i) => {
              const chip = spinRewardChipStyleLight(seg.color)
              const accent = spinSegmentAccentHex(seg.color)
              return (
                <div
                  key={`${seg.label}-${i}`}
                  className="rounded-2xl p-3 flex items-center gap-2.5 min-w-0"
                  style={{ background: `${accent}0F` }}
                >
                  <div
                    className="size-8 rounded-full flex items-center justify-center text-sm shrink-0"
                    style={{ background: `${accent}1F` }}
                  >
                    {seg.icon}
                  </div>
                  <span
                    className="text-xs font-bold leading-tight truncate"
                    style={{ color: chip.textColor }}
                  >
                    {seg.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div
          className="rounded-xl p-3 text-center text-xs text-gray-500"
          style={{ background: `${theme.accent}0C`, border: `1px solid ${theme.accent}22` }}
        >
          Rewards will appear here once the wheel is configured.
        </div>
      )}
    </CampaignPinDetailShell>
  )
}
