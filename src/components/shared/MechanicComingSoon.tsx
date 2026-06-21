import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { getCampaignGradient, getCustomerMechanicChipLabel } from '@/lib/customer-ui'
import { getMechanicEmoji } from '@/lib/utils'

interface MechanicComingSoonProps {
  mechanic?: string
  title?: string
  detail?: string
  backTo?: string
  onBack?: () => void
  variant?: 'page' | 'card'
}

export function MechanicComingSoon({
  mechanic = 'spin',
  title,
  detail,
  backTo = '/customer',
  onBack,
  variant = 'page',
}: MechanicComingSoonProps) {
  const navigate = useNavigate()
  const gradient = getCampaignGradient(mechanic)
  const label = getCustomerMechanicChipLabel(mechanic)
  const emoji = getMechanicEmoji(mechanic as 'shake')

  const handleBack = () => {
    if (onBack) onBack()
    else navigate(backTo)
  }

  if (variant === 'card') {
    return (
      <div className="rounded-3xl overflow-hidden border border-[#e9d5ff] bg-white shadow-sm">
        <div
          className="relative h-32 flex items-center justify-center opacity-80"
          style={{ background: `linear-gradient(130deg, ${gradient.from}88, ${gradient.to}aa)` }}
        >
          <span className="text-5xl grayscale-[30%]">{emoji}</span>
          <span className="absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/95 text-[#5b0e81]">
            Live soon
          </span>
        </div>
        <div className="p-4 text-center">
          <p className="text-sm font-bold text-[#2b2827]">{title ?? label}</p>
          <p className="text-xs text-[#6b6461] mt-1.5 leading-relaxed">
            {detail ?? 'We are putting the finishing touches on this game. Check back soon!'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{ background: `linear-gradient(160deg, ${gradient.from}22, #faf5ff 45%, white)` }}
    >
      <div className="px-5 pt-14 pb-6 flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto">
        <button
          type="button"
          onClick={handleBack}
          className="absolute top-14 left-5 size-10 rounded-full bg-white/80 border border-[#e9d5ff] flex items-center justify-center cursor-pointer"
          aria-label="Go back"
        >
          <ArrowLeft className="size-5 text-[#5b0e81]" />
        </button>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="size-24 rounded-3xl flex items-center justify-center text-5xl mb-6 shadow-lg"
          style={{ background: `linear-gradient(145deg, ${gradient.from}, ${gradient.to})` }}
        >
          {emoji}
        </motion.div>

        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full bg-[#f3e8ff] text-[#5b0e81] mb-4 uppercase tracking-wide">
          <Sparkles className="size-3.5" />
          Live soon
        </span>

        <h1 className="text-2xl font-extrabold text-[#2b2827] mb-2">{title ?? label}</h1>
        <p className="text-sm text-[#6b6461] leading-relaxed mb-8">
          {detail ??
            'This campaign type is not available yet. Shake & Win, Stamp Cards, and Check-in Loyalty are live now.'}
        </p>

        <button
          type="button"
          onClick={handleBack}
          className="px-6 py-3 rounded-2xl text-sm font-bold text-white border-0 cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #5b0e81, #43036d)' }}
        >
          Browse live campaigns
        </button>
      </div>
    </div>
  )
}
