import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'vendor-card rounded-2xl',
        hover && 'vendor-card-hover transition-all duration-200 cursor-pointer',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
)
Card.displayName = 'Card'

export function StatCard({
  label,
  value,
  sub,
  icon,
  color = '#7C3AED',
  trend,
}: {
  label: string
  value: string | number
  sub?: string
  icon: string
  color?: string
  trend?: { value: string; up: boolean }
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
          style={{ background: `${color}12`, border: `1px solid ${color}25` }}
        >
          {icon}
        </div>
        {trend && (
          <span
            className={cn(
              'text-xs font-semibold px-2 py-0.5 rounded-full',
              trend.up ? 'text-emerald-700 bg-emerald-50' : 'text-red-600 bg-red-50',
            )}
          >
            {trend.up ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-v-text">{value}</div>
      <div className="text-xs font-medium text-v-text-2 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-v-text-3 mt-1">{sub}</div>}
    </Card>
  )
}

export function ProgressBar({
  value,
  max,
  color = '#7C3AED',
  className,
}: {
  value: number
  max: number
  color?: string
  className?: string
}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div className={cn('h-1.5 rounded-full bg-v-surface-3 overflow-hidden', className)}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  )
}
