import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Megaphone, Users, Settings, ChevronRight, Zap, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { business } from '@/lib/mock-data'
import { clearSession } from '@/lib/auth'

const nav = [
  { label: 'Dashboard', href: '/vendor/dashboard', icon: LayoutDashboard },
  { label: 'Campaigns', href: '/vendor/campaigns', icon: Megaphone },
  { label: 'Customers', href: '/vendor/customers', icon: Users },
  { label: 'Settings', href: '/vendor/settings', icon: Settings },
]

export function VendorLayout() {
  const location = useLocation()
  const navigate = useNavigate()

  function handleSignOut() {
    clearSession()
    navigate('/signin')
  }

  return (
    <div className="vendor-bg min-h-screen flex">
      <aside className="w-60 shrink-0 flex flex-col h-screen sticky top-0 bg-vs-bg border-r border-vs-border">
        <div className="px-5 py-6 border-b border-vs-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl bg-v-purple/20 border border-v-purple/35">
              🧞
            </div>
            <div>
              <div className="text-sm font-extrabold text-vs-text">LoyalGenie</div>
              <div className="text-[10px] font-medium text-vs-text-3">{business.name}</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {nav.map(({ label, href, icon: Icon }) => {
            const active = location.pathname.startsWith(href)
            return (
              <Link
                key={href}
                to={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  active ? 'bg-v-purple/15 text-vs-text border border-v-purple/25' : 'text-vs-text-2 hover:bg-vs-surface border border-transparent',
                )}
              >
                <Icon className="w-4 h-4" style={{ color: active ? '#9D6FF0' : '#5B5897' }} />
                {label}
                {active && <ChevronRight className="w-3 h-3 ml-auto text-v-purple-l" />}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 space-y-3">
          <div className="rounded-xl p-3 flex items-start gap-3 bg-v-purple/10 border border-v-purple/20">
            <Zap className="w-4 h-4 mt-0.5 shrink-0 text-[#F5C518]" />
            <div>
              <div className="text-xs font-bold text-vs-text">3 Active Campaigns</div>
              <div className="text-[10px] mt-0.5 text-vs-text-3">312 players today</div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-vs-text-2 hover:text-vs-text py-2 rounded-xl border border-vs-border hover:border-vs-text-3 transition-colors bg-transparent cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
