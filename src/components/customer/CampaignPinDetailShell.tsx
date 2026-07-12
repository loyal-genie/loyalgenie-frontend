import { type ReactNode } from 'react'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getCampaignTheme } from '@/lib/campaign-themes'
import { getCustomerMechanicChipLabel } from '@/lib/customer-ui'

interface CampaignPinDetailShellProps {
  mechanic: string
  title: string
  subtitle: string
  onBack: () => void
  /** Extra chips / badges under the subtitle (inside the colored cover). */
  coverExtra?: ReactNode
  /** Main scrollable content inside the white sheet (above PIN). */
  children?: ReactNode
  /** Sticky footer — typically compact PinKeypad, or claimed status. */
  footer: ReactNode
  loading?: boolean
  className?: string
}

/**
 * Stamp / check-in layout for all campaign PIN pages:
 * themed cover on top → white sheet with details → themed action in footer.
 */
export function CampaignPinDetailShell({
  mechanic,
  title,
  subtitle,
  onBack,
  coverExtra,
  children,
  footer,
  loading,
  className,
}: CampaignPinDetailShellProps) {
  const theme = getCampaignTheme(mechanic)

  return (
    <div
      className={cn(
        'h-dvh flex flex-col max-w-[440px] mx-auto overflow-hidden relative',
        className,
      )}
      style={{ backgroundColor: theme.cover }}
    >
      <div className="relative shrink-0 px-4 pb-4 pt-[max(2.75rem,env(safe-area-inset-top))]">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(255,255,255,0.06) 10px, rgba(255,255,255,0.06) 20px)',
          }}
        />
        <div className="relative flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex size-9 items-center justify-center rounded-full border-0 bg-black/25 backdrop-blur-sm cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft className="size-4 text-white" />
          </button>
          <span
            className={cn(
              'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide',
              theme.badgeBg,
              theme.badgeText,
            )}
          >
            {getCustomerMechanicChipLabel(mechanic)}
          </span>
        </div>
        <div className="relative mt-3">
          <h1 className="text-xl font-extrabold leading-tight text-white">{title}</h1>
          <p className="mt-1 text-xs text-white/75">{subtitle}</p>
          {coverExtra ? <div className="mt-2.5 flex flex-wrap gap-1.5">{coverExtra}</div> : null}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-[28px] bg-white shadow-[0_-8px_32px_rgba(0,0,0,0.12)]">
        {children ? (
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-2">{children}</div>
        ) : null}
        <div className="shrink-0 border-t border-[#f0ebf8] bg-[#faf8fc] px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {footer}
        </div>
      </div>

      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20">
          <Loader2 className="size-10 animate-spin" style={{ color: theme.cover }} />
        </div>
      )}
    </div>
  )
}

export function CampaignDetailCoverChip({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-bold text-white',
        className,
      )}
    >
      {children}
    </span>
  )
}
