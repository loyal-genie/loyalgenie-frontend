import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, LogOut, ChevronDown, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { clearSession, getUser } from '@/lib/auth'
import { useBusinessProfile } from '@/hooks/useBusinessProfile'

interface VendorPageHeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export function VendorPageHeader({ title, subtitle, actions }: VendorPageHeaderProps) {
  const navigate = useNavigate()
  const user = getUser('business')
  const { data: profile } = useBusinessProfile()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleSignOut() {
    clearSession('business')
    navigate('/business/signin')
  }

  const displayName = profile?.name ?? 'Business'
  const displayEmail = profile?.email ?? user?.email ?? ''

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl font-extrabold text-v-text truncate">{title}</h1>
        {subtitle && <p className="text-v-text-2 text-xs sm:text-sm mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2 sm:gap-3 shrink-0 self-end sm:self-auto">
        {actions}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all',
              'border border-v-border bg-v-surface hover:border-v-purple/40 text-v-text',
              open && 'border-v-purple/40 ring-2 ring-v-purple/15',
            )}
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-v-purple/15 text-v-purple">
              <User className="w-4 h-4" />
            </div>
            <span className="hidden sm:inline max-w-[120px] truncate">{displayName}</span>
            <ChevronDown className={cn('w-4 h-4 text-v-text-3 transition-transform', open && 'rotate-180')} />
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-v-border bg-v-surface shadow-lg z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-v-border">
                <p className="text-sm font-bold text-v-text truncate">{displayName}</p>
                <p className="text-xs text-v-text-3 truncate mt-0.5">{displayEmail}</p>
              </div>
              <Link
                to="/vendor/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-v-text-2 hover:bg-v-surface-2 hover:text-v-text no-underline transition-colors"
              >
                <Settings className="w-4 h-4" /> Profile & Settings
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-v-danger hover:bg-red-50 transition-colors bg-transparent border-0 cursor-pointer text-left"
              >
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
