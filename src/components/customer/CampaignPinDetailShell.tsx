import { type ReactNode } from 'react'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getCampaignTheme } from '@/lib/campaign-themes'
import { CampaignCoverHero } from '@/components/customer/CampaignCoverHero'

interface CampaignPinDetailShellProps {
  mechanic: string
  title: string
  subtitle: string
  onBack: () => void
  /** Extra chips under the title in the white sheet (optional). */
  coverExtra?: ReactNode
  /** Business name shown under the title. */
  businessName?: string
  /** Main scrollable content inside the white sheet (above PIN). */
  children?: ReactNode
  /** Sticky/inline footer — typically compact PinKeypad. */
  footer: ReactNode
  loading?: boolean
  className?: string
  /** Override cover right badge (e.g. win-rate teaser). */
  headerRight?: string
}

/**
 * Prototype PIN layout: pastel hero cover → white overlapping sheet → keypad.
 */
export function CampaignPinDetailShell({
  mechanic,
  title,
  subtitle,
  onBack,
  coverExtra,
  businessName,
  children,
  footer,
  loading,
  className,
  headerRight,
}: CampaignPinDetailShellProps) {
  const theme = getCampaignTheme(mechanic)

  return (
    <div
      className={cn(
        'min-h-dvh flex flex-col max-w-[440px] mx-auto overflow-x-hidden relative bg-white',
        className,
      )}
    >
      <div className="relative shrink-0">
        <CampaignCoverHero
          mechanic={mechanic}
          variant="detail"
          headerRight={headerRight}
          showStatusBadge
        />
        <button
          type="button"
          onClick={onBack}
          className="absolute top-[max(2.75rem,env(safe-area-inset-top))] left-4 z-20 flex size-9 items-center justify-center rounded-full border-0 bg-black/25 backdrop-blur-md cursor-pointer"
          aria-label="Go back"
        >
          <ArrowLeft className="size-4 text-white" />
        </button>
        {/* Scallop into white body */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-white rounded-t-[2rem] pointer-events-none" />
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col px-5 pt-1 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h1 className="text-xl font-extrabold text-gray-900 leading-tight">{title}</h1>
          {coverExtra ? <div className="shrink-0 flex flex-wrap gap-1.5 justify-end">{coverExtra}</div> : null}
        </div>
        {businessName && (
          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1.5">
            <span aria-hidden>☕</span>
            {businessName}
          </p>
        )}
        <p className="text-sm text-gray-500 mb-4 leading-relaxed">{subtitle}</p>

        <div
          className="rounded-3xl bg-white px-4 py-5 flex-1 flex flex-col"
          style={{
            boxShadow: `0 16px 48px ${theme.accent}20, 0 0 0 1px ${theme.accent}1A`,
          }}
        >
          {children ? <div className="mb-5">{children}</div> : null}
          <div className="mt-auto">{footer}</div>
        </div>
      </div>

      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20">
          <Loader2 className="size-10 animate-spin" style={{ color: theme.accent }} />
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
        'inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-bold text-gray-700',
        className,
      )}
    >
      {children}
    </span>
  )
}
