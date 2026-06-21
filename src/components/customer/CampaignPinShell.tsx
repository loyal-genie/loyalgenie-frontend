import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { getMechanicHeaderChip, getCampaignGradient, getCampaignSubtitle } from '@/lib/customer-ui'
import { getMechanicEmoji } from '@/lib/utils'
import type { MechanicType } from '@/lib/types'
import { PinKeypad } from './PinKeypad'

interface CampaignPinShellProps {
  businessName: string
  campaignName: string
  mechanic: MechanicType | string
  pin: string
  error?: string
  loading?: boolean
  disabled?: boolean
  onBack: () => void
  onKey: (digit: string) => void
  onDelete: () => void
  onSubmit: () => void
  submitLabel?: string
  statusChips?: ReactNode
  heroContent?: ReactNode
  children?: ReactNode
}

export function CampaignPinShell({
  businessName,
  campaignName,
  mechanic,
  pin,
  error,
  loading,
  disabled,
  onBack,
  onKey,
  onDelete,
  onSubmit,
  submitLabel,
  statusChips,
  heroContent,
  children,
}: CampaignPinShellProps) {
  const grad = getCampaignGradient(mechanic)
  const subtitle = getCampaignSubtitle(mechanic, campaignName)

  return (
    <div className="min-h-dvh bg-white flex flex-col">
      <div className="px-5 pt-[max(3rem,env(safe-area-inset-top))] pb-3 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="size-[50px] rounded-full bg-[#f5f0ff] flex items-center justify-center border-0 cursor-pointer shrink-0"
          aria-label="Go back"
        >
          <ArrowLeft className="size-[18px] text-[#5b0e81]" />
        </button>
        <h1
          className="text-lg font-bold text-[#2b2827]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {businessName}
        </h1>
      </div>

      <div className="flex-1 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-[#e5e0dc] rounded-3xl shadow-[0px_8px_30px_rgba(0,0,0,0.06)] overflow-hidden"
        >
          <div
            className="relative h-[180px] overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${grad.from}, ${grad.to})` }}
          >
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(134deg, rgba(91,14,129,0.8) 0%, rgba(91,14,129,0) 60%)' }}
            />
            <div className="absolute top-4 left-3 bg-white/90 px-2.5 py-0.5 rounded-full shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wide text-[#2b2827]">
                {getMechanicHeaderChip(mechanic)}
              </span>
            </div>
            <div className="absolute bottom-3 right-3 size-11 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm">
              {getMechanicEmoji(mechanic)}
            </div>
            {heroContent}
          </div>

          <div className="px-4 py-4 flex flex-col items-center">
            <h2
              className="text-lg font-bold text-[#2b2827] w-full text-left mb-1"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {campaignName}
            </h2>
            <p className="text-xs text-[#6b6461] w-full text-left mb-2">{subtitle}</p>

            {statusChips && (
              <div className="w-full flex flex-wrap gap-2 mb-3">{statusChips}</div>
            )}

            {children}

            <div className="w-full mt-2">
              <PinKeypad
                pin={pin}
                error={error}
                disabled={disabled}
                loading={loading}
                onKey={onKey}
                onDelete={onDelete}
                onSubmit={onSubmit}
                submitLabel={submitLabel}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export function CampaignPinLoading() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-white">
      <Loader2 className="size-10 text-[#5b0e81] animate-spin" />
    </div>
  )
}

export function CampaignPinBlocked({
  title,
  detail,
  emoji = '✅',
  onBack,
}: {
  title: string
  detail: string
  emoji?: string
  onBack: () => void
}) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center bg-white">
      <div className="text-5xl mb-4">{emoji}</div>
      <h1 className="text-xl font-bold text-[#2b2827] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
        {title}
      </h1>
      <p className="text-sm text-[#6b6461] mb-6">{detail}</p>
      <button
        type="button"
        onClick={onBack}
        className="px-6 py-3 rounded-full font-semibold text-sm text-white bg-[#5b0e81] border-0 cursor-pointer"
      >
        Back to vendor
      </button>
    </div>
  )
}
