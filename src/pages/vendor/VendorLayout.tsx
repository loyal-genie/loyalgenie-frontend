import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Megaphone, Users, Settings, ChevronRight, Zap, QrCode, Menu, X, LogOut, Gift } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useBusinessProfile } from '@/hooks/useBusinessProfile'
import { useCampaigns, useVendorPinRealtime } from '@/hooks/useCampaigns'
import { useVendorSessionRealtime, useVendorDashboardStats } from '@/hooks/useVendorAnalytics'
import { effectiveCampaignStatus } from '@/lib/campaign-dates'
import type { CampaignStatus } from '@/lib/types'
import { clearSession } from '@/lib/auth' // Imported your auth clearer

const nav = [
  { label: 'Dashboard', href: '/vendor/dashboard', icon: LayoutDashboard },
  { label: 'Campaigns', href: '/vendor/campaigns', icon: Megaphone },
  { label: 'Rewards', href: '/vendor/rewards', icon: Gift },
  { label: 'Customers', href: '/vendor/customers', icon: Users },
  { label: 'My QR Code', href: '/vendor/qr-code', icon: QrCode },
  { label: 'Settings', href: '/vendor/settings', icon: Settings },
]

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { data: profile } = useBusinessProfile()
  const { data: campaigns = [] } = useCampaigns()
  const { data: stats } = useVendorDashboardStats('all')
  const activeCount = campaigns.filter(c => effectiveCampaignStatus(c.status as CampaignStatus, c.endDate) === 'active').length
  const totalPlays = stats?.totalPlays ?? campaigns.reduce((s, c) => s + c.participations, 0)

  const handleSignOut = () => {
    if (onNavigate) onNavigate() // Close mobile menu drawer if open
    clearSession('business')
    navigate('/')                // Redirects user to landing/home page
  }

  return (
    <>
      <div className="px-5 py-6 border-b border-vs-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl bg-v-purple/20 border border-v-purple/35">
            🧞
          </div>
          <div className="min-w-0">
            <div className="text-sm font-extrabold text-vs-text">LoyalGenie</div>
            <div className="text-[10px] font-medium text-vs-text-3 truncate">{profile?.name ?? '…'}</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {nav.map(({ label, href, icon: Icon }) => {
          const active = location.pathname.startsWith(href)
          return (
            <Link
              key={href}
              to={href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all no-underline',
                active ? 'bg-v-purple/15 text-vs-text border border-v-purple/25' : 'text-vs-text-2 hover:bg-vs-surface border border-transparent',
              )}
            >
              <Icon className="w-4 h-4 shrink-0" style={{ color: active ? '#9D6FF0' : '#5B5897' }} />
              {label}
              {active && <ChevronRight className="w-3 h-3 ml-auto text-v-purple-l" />}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Section: Campaign summary and Sign Out actions */}
      <div className="p-4 border-t border-vs-border space-y-3">
        <div className="rounded-xl p-3 flex items-start gap-3 bg-v-purple/10 border border-v-purple/20">
          <Zap className="w-4 h-4 mt-0.5 shrink-0 text-[#F5C518]" />
          <div>
            <div className="text-xs font-bold text-vs-text">{activeCount} Active Campaign{activeCount !== 1 ? 's' : ''}</div>
            <div className="text-[10px] mt-0.5 text-vs-text-3">{totalPlays} total plays</div>
          </div>
        </div>

        {/* Brand New Sign Out Button */}
        <button
          type="button"
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium border border-transparent text-vs-text-2 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer bg-transparent"
        >
          <LogOut className="w-4 h-4 shrink-0 text-[#5B5897] hover:text-red-400" />
          Sign Out
        </button>
      </div>
    </>
  )
}

export function VendorLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  useVendorPinRealtime()
  useVendorSessionRealtime()

  return (
    <div className="vendor-bg min-h-screen flex flex-col lg:flex-row">
      {/* Mobile header bar */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-vs-bg border-b border-vs-border">
        <div className="flex items-center gap-2">
          <span className="text-lg">🧞</span>
          <span className="text-sm font-extrabold text-vs-text">LoyalGenie</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg text-vs-text-2 hover:bg-vs-surface border-0 bg-transparent cursor-pointer"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} aria-hidden />
          <aside className="relative w-64 max-w-[80vw] flex flex-col h-full bg-vs-bg border-r border-vs-border shadow-xl">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-vs-text-2 hover:bg-vs-surface border-0 bg-transparent cursor-pointer z-10"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col h-screen sticky top-0 bg-vs-bg border-r border-vs-border">
        <SidebarContent />
      </aside>

      <main className="flex-1 min-w-0 overflow-auto vendor-scroll">
        <Outlet />
      </main>
    </div>
  )
}