import { CampaignPinDetailShell } from '@/components/customer/CampaignPinDetailShell'
import { PinKeypad } from '@/components/customer/PinKeypad'
import { DiceFace } from '@/components/shared/DiceFace'
import { formatShakeWinLabel } from '@/lib/campaign-impact'
import { getCampaignTheme } from '@/lib/campaign-themes'
import type { PublicCampaign } from '@/lib/api'

interface DiceCampaignDetailProps {
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

export function DiceCampaignDetail({
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
}: DiceCampaignDetailProps) {
  const theme = getCampaignTheme('dice')
  const winFaces = campaign.diceConfig?.outcomes
    ?.filter(o => o.isWin && (o.reward ?? '').trim())
    .sort((a, b) => a.value - b.value) ?? []
  const prizeChips = winFaces.length > 0
    ? winFaces.map(o => ({ value: o.value, reward: o.reward ?? `Roll ${o.value}` }))
    : campaign.rewards.map((r, i) => ({ value: i + 1, reward: r.name }))

  return (
    <CampaignPinDetailShell
      mechanic="dice"
      title={campaign.name}
      subtitle="Roll the dice for surprise perks."
      businessName={businessName}
      onBack={onBack}
      loading={loading}
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
      headerRight={
        overallWinners != null && userCap != null
          ? formatShakeWinLabel(overallWinners, userCap)
          : winRatePercent != null
            ? `${winRatePercent}% win rate`
            : undefined
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
      {prizeChips.length > 0 && (
        <div
          className="rounded-2xl px-3.5 py-3"
          style={{ background: `${theme.accent}0C`, border: `1px solid ${theme.accent}22` }}
        >
          <p
            className="mb-2.5 text-center text-[10px] font-bold uppercase tracking-[0.14em]"
            style={{ color: theme.accent, opacity: 0.7 }}
          >
            Winning faces
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {prizeChips.map((chip, i) => (
              <span
                key={`${chip.reward}-${i}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold leading-tight shadow-sm"
                style={{ color: theme.accent }}
              >
                <span className="size-3.5 shrink-0" aria-hidden>
                  <DiceFace value={chip.value} pipColor={theme.accent} />
                </span>
                {chip.reward}
              </span>
            ))}
          </div>
        </div>
      )}
    </CampaignPinDetailShell>
  )
}
