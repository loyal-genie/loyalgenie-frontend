import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

const PLAY_BUTTON_LABELS: Record<string, string> = {
  'check-in-loyalty': 'Check In & Earn Points ⭐',
  shake: 'Enter PIN & Play 🤳',
  spin: 'Enter PIN & Spin 🎡',
  dice: 'Enter PIN & Roll 🎲',
  lottery: 'Enter PIN & Claim Ticket 🎟️',
  'buy-x-get-y': 'Enter PIN & Claim 💰',
  coupon: 'Enter PIN & Claim 🎫',
  flash: 'Enter PIN & Claim ⚡',
  combo: 'Enter PIN & Claim 🎁',
  friend: 'Enter PIN & Claim 👫',
  groupunlock: 'Enter PIN & Reserve 🤝',
  stamp: 'Enter PIN & Collect Stamp 🎯',
}

const PLAY_BUTTON_STYLES: Record<string, string> = {
  'check-in-loyalty':
    'bg-gradient-to-r from-[#34d399] to-[#059669] text-white shadow-[0_8px_20px_rgba(16,185,129,0.32)]',
  shake: 'bg-gradient-to-r from-[#8b5cf6] to-[#6d28d9] text-white shadow-[0_8px_20px_rgba(124,58,237,0.32)]',
  spin: 'bg-gradient-to-r from-[#3b82f6] to-[#1e40af] text-white shadow-[0_8px_20px_rgba(37,99,235,0.35)]',
  dice: 'bg-gradient-to-r from-[#fb7185] to-[#f43f5e] text-white shadow-[0_8px_20px_rgba(244,63,94,0.32)]',
  lottery: 'bg-gradient-to-r from-[#fbbf24] to-[#d97706] text-white shadow-[0_8px_20px_rgba(245,158,11,0.35)]',
  'buy-x-get-y': 'bg-gradient-to-r from-[#fb923c] to-[#ea580c] text-white shadow-[0_8px_20px_rgba(249,115,22,0.35)]',
  coupon: 'bg-gradient-to-r from-[#14b8a6] to-[#0d9488] text-white shadow-[0_8px_20px_rgba(13,148,136,0.35)]',
  flash: 'bg-gradient-to-r from-[#7dd3fc] to-[#38bdf8] text-sky-950 shadow-[0_8px_20px_rgba(56,189,248,0.35)]',
  combo: 'bg-gradient-to-r from-[#d9f99d] to-[#a3e635] text-lime-950 shadow-[0_8px_20px_rgba(163,230,53,0.35)]',
  friend: 'bg-gradient-to-r from-[#f9a8d4] to-[#f472b6] text-pink-950 shadow-[0_8px_20px_rgba(244,114,182,0.35)]',
  groupunlock: 'bg-gradient-to-r from-[#c7d2fe] to-[#818cf8] text-indigo-950 shadow-[0_8px_20px_rgba(129,140,248,0.35)]',
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

  return (
    <button type="button" onClick={onClick} disabled={disabled || loading} className={classes}>
      {label}
    </button>
  )
}
