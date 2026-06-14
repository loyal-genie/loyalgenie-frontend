import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import type { AuthAudience } from '@/components/auth/AuthRoleToggle'
import { AuthRoleToggle } from '@/components/auth/AuthRoleToggle'

interface AuthShellProps {
  title: string
  subtitle: string
  children: React.ReactNode
  audience?: AuthAudience
  onAudienceChange?: (audience: AuthAudience) => void
  showRoleToggle?: boolean
}

export function AuthShell({
  title,
  subtitle,
  children,
  audience = 'business',
  onAudienceChange,
  showRoleToggle = true,
}: AuthShellProps) {
  const isBusiness = audience === 'business'

  return (
    <div className="min-h-screen vendor-bg flex">
      <div className="hidden lg:flex lg:w-1/2 gradient-hero items-center justify-center p-12 relative overflow-hidden">
        <div className="relative z-10 max-w-md text-center">
          <div className="text-6xl mb-6">🧞</div>
          <h2 className="text-3xl font-black text-white mb-4">
            Loyalty <span className="shimmer-gold">Granted.</span>
          </h2>
          <p className="text-muted leading-relaxed">
            {isBusiness
              ? 'Your dashboard to manage campaigns, track customers, and grow repeat visits — built for Indian SMEs.'
              : 'Scan, shake, and win rewards at your favourite local spots — all in one magical app.'}
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-v-text-2 hover:text-v-purple mb-6 no-underline w-fit transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>

        <Link to="/" className="inline-flex items-center gap-2 text-v-text font-black text-xl mb-8 no-underline w-fit">
          <span
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg border border-gold/35"
            style={{ background: 'linear-gradient(135deg, #3d1f8a, #6b3fd4)' }}
          >
            🧞
          </span>
          Loyal<span className="text-v-purple">Genie</span>
        </Link>

        <div className="max-w-md w-full">
          {showRoleToggle && onAudienceChange && (
            <AuthRoleToggle value={audience} onChange={onAudienceChange} className="mb-8" />
          )}
          <h1 className="text-2xl font-extrabold text-v-text mb-2">{title}</h1>
          <p className="text-v-text-2 text-sm mb-8">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  )
}
