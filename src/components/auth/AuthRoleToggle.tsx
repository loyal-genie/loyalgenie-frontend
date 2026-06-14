import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export type AuthAudience = 'business' | 'customer'

interface AuthRoleToggleProps {
  value: AuthAudience
  onChange: (value: AuthAudience) => void
  className?: string
}

export function AuthRoleToggle({ value, onChange, className }: AuthRoleToggleProps) {
  return (
    <div className={cn('flex p-1 rounded-xl bg-v-surface-2 border border-v-border', className)}>
      {(['business', 'customer'] as const).map((role) => (
        <button
          key={role}
          type="button"
          onClick={() => onChange(role)}
          className={cn(
            'flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all cursor-pointer capitalize',
            value === role
              ? 'bg-v-purple text-white shadow-sm'
              : 'text-v-text-2 hover:text-v-text bg-transparent',
          )}
        >
          {role}
        </button>
      ))}
    </div>
  )
}

export function CustomerComingSoon() {
  return (
    <div className="rounded-2xl border border-v-border bg-v-surface-2 p-8 text-center">
      <div className="text-4xl mb-4">📱</div>
      <h3 className="text-lg font-bold text-v-text mb-2">Customer app coming soon</h3>
      <p className="text-sm text-v-text-2 leading-relaxed">
        Scan a café&apos;s QR code at the counter to join their loyalty program. The customer app is on its way.
      </p>
      <Link to="/" className="inline-block mt-6 text-sm font-semibold text-v-purple hover:underline no-underline">
        ← Back to home
      </Link>
    </div>
  )
}
