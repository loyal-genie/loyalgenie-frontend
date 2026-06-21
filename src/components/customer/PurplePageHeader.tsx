import { type ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PurplePageHeaderProps {
  title: string
  onBack?: () => void
  className?: string
  children?: ReactNode
}

export function PurplePageHeader({ title, onBack, className, children }: PurplePageHeaderProps) {
  return (
    <div className={cn('bg-[#5b0e81] rounded-b-[10px] px-5 pt-12 pb-6', className)}>
      <div className="flex items-center gap-3 mb-4">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="size-[50px] rounded-full bg-white/10 flex items-center justify-center border-0 cursor-pointer shrink-0"
            aria-label="Go back"
          >
            <ArrowLeft className="size-[18px] text-white" />
          </button>
        )}
        <h1
          className="text-lg font-bold text-white leading-7"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {title}
        </h1>
      </div>
      {children}
    </div>
  )
}
