import { CampaignPinDetailShell } from '@/components/customer/CampaignPinDetailShell'
import { PinKeypad } from '@/components/customer/PinKeypad'
import { formatShakeWinLabel } from '@/lib/campaign-impact'
import { getCampaignTheme } from '@/lib/campaign-themes'
import type { PublicCampaign } from '@/lib/api'

interface ShakeCampaignDetailProps {
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

export function ShakeCampaignDetail({
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
}: ShakeCampaignDetailProps) {
  const theme = getCampaignTheme('shake')
  const headerRight =
    overallWinners != null && userCap != null
      ? formatShakeWinLabel(overallWinners, userCap)
      : winRatePercent != null
        ? `${winRatePercent}% of players win`
        : undefined

  return (
    <CampaignPinDetailShell
      mechanic="shake"
      title={campaign.name}
      subtitle="Shake your phone to reveal your reward."
      businessName={businessName}
      onBack={onBack}
      loading={loading}
      headerRight={headerRight}
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
      <div
        className="rounded-xl p-3 text-center"
        style={{ background: `${theme.accent}0C`, border: `1px solid ${theme.accent}22` }}
      >
        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1">
          How to play
        </p>
        <p className="text-xs text-gray-600 leading-relaxed">
          Enter the staff code, then shake your phone to reveal a prize.
        </p>
      </div>
    </CampaignPinDetailShell>
  )
}
