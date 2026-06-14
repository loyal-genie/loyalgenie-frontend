import { Link, useLocation } from 'react-router-dom'
import { Home, Compass, Wallet, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const nav = [
  { label: 'Home',     href: '/customer',          icon: Home },
  { label: 'Discover', href: '/customer/discover',  icon: Compass },
  { label: 'Wallet',   href: '/customer/wallet',    icon: Wallet },
  { label: 'Profile',  href: '/customer/profile',   icon: User },
]

export function BottomNav() {
  const { pathname: path } = useLocation()
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around py-2 px-2">
        {nav.map(({ label, href, icon: Icon }) => {
          const active =
            href === '/customer'
              ? path === '/customer'
              : path === href || path.startsWith(href + '/')
          return (
            <Link key={href} to={href} className="flex flex-col items-center gap-0.5 py-1 px-3">
              <div className={cn('w-8 h-8 rounded-full flex items-center justify-center transition-all', active ? 'bg-purple-100' : '')}>
                <Icon
                  className={cn('w-4.5 h-4.5 transition-colors', active ? 'text-purple-700' : 'text-gray-400')}
                  strokeWidth={active ? 2.5 : 1.8}
                />
              </div>
              <span className={cn('text-[10px] font-semibold tracking-wide leading-none', active ? 'text-purple-700' : 'text-gray-400')}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
