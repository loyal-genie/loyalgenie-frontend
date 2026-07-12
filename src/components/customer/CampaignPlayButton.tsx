import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

const PLAY_BUTTON_LABELS: Record<string, string> = {
  'check-in-loyalty': 'Check In & Earn Points ⭐',
  shake: 'Enter PIN & Play 🤳',
  spin: 'Enter PIN & Spin 🎡',
  dice: 'Enter PIN & Roll 🎲',
  lottery: 'Enter PIN & Claim',
  'buy-x-get-y': 'Enter PIN & Claim 💰',
  coupon: 'Enter PIN & Claim 🎫',
  flash: 'Enter PIN & Claim ⚡',
  friend: 'Enter PIN & Claim 👫',
  stamp: 'Enter PIN & Collect Stamp 🎯',
}

const PLAY_BUTTON_STYLES: Record<string, string> = {
  'check-in-loyalty':
    'bg-gradient-to-r from-[#34d399] to-[#059669] text-white shadow-[0_8px_20px_rgba(16,185,129,0.32)]',
  shake: 'bg-gradient-to-r from-[#8b5cf6] to-[#6d28d9] text-white shadow-[0_8px_20px_rgba(124,58,237,0.32)]',
  spin: 'bg-gradient-to-r from-[#3b82f6] to-[#1e40af] text-white shadow-[0_8px_20px_rgba(37,99,235,0.35)]',
  dice: 'bg-gradient-to-r from-[#fb7185] to-[#f43f5e] text-white shadow-[0_8px_20px_rgba(244,63,94,0.32)]',
  lottery: 'bg-gradient-to-r from-[#fef08a] to-[#fde047] text-amber-950 shadow-[0_8px_20px_rgba(250,204,21,0.28)]',
  'buy-x-get-y': 'bg-gradient-to-r from-[#fed7aa] to-[#fdba74] text-orange-950 shadow-[0_8px_20px_rgba(251,146,60,0.28)]',
  coupon: 'bg-gradient-to-r from-[#14b8a6] to-[#0d9488] text-white shadow-[0_8px_20px_rgba(13,148,136,0.35)]',
  flash: 'bg-gradient-to-r from-[#7dd3fc] to-[#38bdf8] text-sky-950 shadow-[0_8px_20px_rgba(56,189,248,0.35)]',
  friend: 'bg-gradient-to-r from-[#f9a8d4] to-[#f472b6] text-pink-950 shadow-[0_8px_20px_rgba(244,114,182,0.35)]',
  stamp: 'bg-gradient-to-r from-[#fbbf24] to-[#d97706] text-white shadow-[0_8px_20px_rgba(251,191,36,0.32)]',
}

const DEFAULT_BUTTON_STYLE =
  'bg-gradient-to-r from-[#631cbb] to-[#43036d] text-white shadow-[0_8px_20px_rgba(91,14,129,0.28)]'

export function getCampaignPlayButtonLabel(mechanic: string): string {
  return PLAY_BUTTON_LABELS[mechanic] ?? 'Enter PIN & Play'
}

interface CampaignPlayButtonProps {
  mechanic: string
  href?: string
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  loadingLabel?: string
  className?: string
  size?: 'sm' | 'md'
}

export function CampaignPlayButton({
  mechanic,
  href,
  onClick,
  disabled = false,
  loading = false,
  loadingLabel,
  className,
  size = 'md',
}: CampaignPlayButtonProps) {
  const label = loading && loadingLabel ? loadingLabel : getCampaignPlayButtonLabel(mechanic)
  const styleClass = PLAY_BUTTON_STYLES[mechanic] ?? DEFAULT_BUTTON_STYLE
  const sizeClass =
    size === 'sm'
      ? 'py-2.5 rounded-full text-xs'
      : 'py-3.5 rounded-full text-sm'

  const classes = cn(
    'flex items-center justify-center w-full font-bold border-0 no-underline transition-opacity',
    sizeClass,
    styleClass,
    disabled || loading ? 'opacity-60 cursor-not-allowed pointer-events-none' : 'cursor-pointer active:scale-[0.99]',
    className,
  )

  if (href && !disabled && !loading) {
    return (
      <Link to={href} className={classes}>
        {label}
      </Link>
    )
  }

  // Decorative CTA when the parent card handles navigation (no nested links)
  if (!href && !onClick) {
    return (
      <div className={cn(classes, 'pointer-events-none')} aria-hidden>
        {label}
      </div>
    )
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled || loading} className={classes}>
      {label}
    </button>
  )
}
