import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export const Card = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('vendor-card rounded-2xl', className)}
      {...props}
    />
  ),
)
Card.displayName = 'Card'

export function ProgressBar({ value, max, className }: { value: number; max: number; className?: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div className={cn('h-1.5 rounded-full bg-v-surface-3 overflow-hidden', className)}>
      <div
        className="h-full rounded-full bg-v-purple transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
