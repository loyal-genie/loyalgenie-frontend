import { CampaignPinDetailShell, CampaignDetailCoverChip } from '@/components/customer/CampaignPinDetailShell'
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
      onBack={onBack}
      loading={loading}
      coverExtra={
        <>
          {overallWinners != null && userCap != null && (
            <CampaignDetailCoverChip>✨ {formatShakeWinLabel(overallWinners, userCap)}</CampaignDetailCoverChip>
          )}
          {overallWinners == null && winRatePercent != null && (
            <CampaignDetailCoverChip>✨ {winRatePercent}% of rolls win</CampaignDetailCoverChip>
          )}
          {playsUsedToday != null && playsPerDay != null && (
            <CampaignDetailCoverChip>{playsUsedToday}/{playsPerDay} rolls today</CampaignDetailCoverChip>
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
          submitLabel="Roll the dice"
          submitColor={theme.accent}
        />
      }
    >
      {prizeChips.length > 0 && (
        <div className="rounded-2xl border border-[#ffe4e6] bg-[#fff1f2] px-3.5 py-3">
          <p className="mb-2.5 text-center text-[10px] font-bold uppercase tracking-[0.14em] text-[#9f1239]/70">
            Winning faces
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {prizeChips.map((chip, i) => (
              <span
                key={`${chip.reward}-${i}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold leading-tight text-[#9f1239] shadow-sm"
              >
                <span className="size-3.5 shrink-0" aria-hidden>
                  <DiceFace value={chip.value} pipColor="#9f1239" />
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
