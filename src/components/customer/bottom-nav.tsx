import { Link, useLocation } from 'react-router-dom'
import { Compass, Home, User, Wallet } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const nav = [
  { label: 'Home', href: '/customer', icon: Home },
  { label: 'Discover', href: '/customer/discover', icon: Compass },
  { label: 'Wallet', href: '/customer/wallet', icon: Wallet },
  { label: 'Profile', href: '/customer/profile', icon: User },
]

export function BottomNav() {
  const { pathname: path } = useLocation()

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] z-50 pointer-events-none pb-[env(safe-area-inset-bottom)]">
      <div className="px-5 pb-5 pt-6 pointer-events-auto">
        <div
          className="flex justify-around rounded-2xl py-3 px-2"
          style={{
            background: '#fff5f0',
            boxShadow:
              '0 0 0 1px rgba(0,0,0,0.05), 0 8px 32px rgba(91,14,129,0.12), 0 2px 6px rgba(0,0,0,0.05)',
          }}
        >
          {nav.map(({ label, href, icon: Icon }) => {
            const active =
              href === '/customer'
                ? path === '/customer'
                : path === href || path.startsWith(`${href}/`)

            return (
              <Link key={href} to={href} className="flex-1 no-underline">
                <motion.div
                  whileTap={{ scale: 0.88 }}
                  className="relative flex flex-col items-center gap-1.5 py-1 cursor-pointer select-none"
                >
                  {active ? (
                    <>
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute left-1/2 w-14 h-14 rounded-full flex items-center justify-center"
                        style={{
                          top: '-32px',
                          transform: 'translateX(-50%)',
                          background: 'linear-gradient(145deg, #7c3aed, #5b0e81)',
                          boxShadow: '0 8px 28px rgba(91,14,129,0.45), 0 2px 8px rgba(0,0,0,0.12)',
                        }}
                        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                      >
                        <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                      </motion.div>
                      <div style={{ width: 18, height: 18 }} />
                    </>
                  ) : (
                    <Icon className="w-[18px] h-[18px] text-gray-400" strokeWidth={1.8} />
                  )}
                  <span
                    className={cn(
                      'text-[10px] font-semibold tracking-wide leading-none',
                      active ? 'text-[#5b0e81]' : 'text-gray-400',
                    )}
                  >
                    {label}
                  </span>
                </motion.div>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
