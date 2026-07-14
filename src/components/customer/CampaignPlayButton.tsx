import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { getCampaignTheme, isClaimStyleMechanic } from '@/lib/campaign-themes'

export function getCampaignPlayButtonLabel(mechanic: string): string {
  return isClaimStyleMechanic(mechanic) ? 'Claim Now' : 'Play Now'
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
  label?: string
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
  label,
}: CampaignPlayButtonProps) {
  const theme = getCampaignTheme(mechanic)
  const displayLabel = loading && loadingLabel ? loadingLabel : label ?? getCampaignPlayButtonLabel(mechanic)
  const sizeClass = size === 'sm' ? 'py-2 rounded-xl text-xs' : 'py-2.5 rounded-xl text-xs'

  const classes = cn(
    'flex items-center justify-center w-full font-bold border-0 no-underline text-white transition-opacity',
    sizeClass,
    disabled || loading ? 'opacity-60 cursor-not-allowed pointer-events-none' : 'cursor-pointer active:scale-[0.99]',
    className,
  )

  const style = {
    background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentTo})`,
    boxShadow: `0 8px 20px ${theme.accent}45`,
  }

  if (href && !disabled && !loading) {
    return (
      <Link to={href} className={classes} style={style}>
        {displayLabel}
      </Link>
    )
  }

  if (!href && !onClick) {
    return (
      <div className={cn(classes, 'pointer-events-none')} style={style} aria-hidden>
        {displayLabel}
      </div>
    )
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled || loading} className={classes} style={style}>
      {displayLabel}
    </button>
  )
}
