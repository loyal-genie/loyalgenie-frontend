import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ChevronRight,
  HelpCircle,
  Info,
  LogOut,
  Settings,
  Shield,
  Trash2,
} from 'lucide-react'
import { BottomNav } from '@/components/customer/bottom-nav'
import { clearSession } from '@/lib/auth'
import { getCampaignGradient, walletTimeAgo } from '@/lib/customer-ui'
import { useCustomerSession } from '@/hooks/useCustomerSession'
import { useCustomerLoyaltyProfiles, useCustomerRewards } from '@/hooks/useCustomerData'

const menuItems = [
  { label: 'Settings', icon: Settings, action: 'settings' as const },
  { label: 'Help', icon: HelpCircle, action: 'help' as const },
  { label: 'Privacy Policy', icon: Shield, action: 'privacy' as const },
  { label: 'Terms and Conditions', icon: Info, action: 'terms' as const },
  { label: 'Delete Account', icon: Trash2, danger: true, action: 'delete' as const },
]

export function CustomerProfilePage() {
  const navigate = useNavigate()
  const { displayName, displayPhone, displayEmail } = useCustomerSession()
  const { data: rewards = [] } = useCustomerRewards()
  const { data: loyaltyProfiles = [] } = useCustomerLoyaltyProfiles()

  const totalVisits = loyaltyProfiles.reduce((sum, p) => sum + p.totalCheckIns, 0)
  const gamesPlayed = rewards.length
  const rewardsEarned = rewards.filter(r => r.status !== 'redeemed').length + rewards.filter(r => r.status === 'redeemed').length

  const recentActivity = useMemo(
    () =>
      [...rewards]
        .sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime())
        .slice(0, 5),
    [rewards],
  )

  function handleMenuAction(action: string) {
    navigate(`/customer/profile/${action}`)
  }

  function handleSignOut() {
    clearSession('customer')
    navigate('/signin', { replace: true })
  }

  return (
    <div className="min-h-dvh bg-gray-50 pb-[calc(7rem+env(safe-area-inset-bottom))]">
      <div className="pt-14 px-5 pb-6">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="w-20 h-20 rounded-3xl bg-purple-100 border-2 border-purple-200 flex items-center justify-center text-4xl font-extrabold text-[#5b0e81] mx-auto mb-4">
            {displayName[0]?.toUpperCase()}
          </div>
          <h1 className="text-xl font-extrabold text-gray-900">{displayName}</h1>
          <p className="text-sm text-gray-500 mt-1">{displayPhone}</p>
          {displayEmail && <p className="text-xs text-gray-400 mt-0.5">{displayEmail}</p>}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-2 mb-6"
        >
          {[
            { label: 'Visits', value: totalVisits, icon: '📅' },
            { label: 'Games', value: gamesPlayed, icon: '🎮' },
            { label: 'Rewards', value: rewardsEarned, icon: '🎁' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-3 text-center border border-gray-100 shadow-sm">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-xl font-black text-gray-900">{s.value}</div>
              <div className="text-[10px] text-gray-500">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {recentActivity.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Recent Activity</h2>
            <div className="space-y-2">
              {recentActivity.map((r, i) => {
                const meta = getCampaignGradient(r.mechanic)
                return (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 + 0.2 }}
                    className="bg-white rounded-xl p-3 flex items-center gap-3 border border-gray-100 shadow-sm"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-lg shrink-0">
                      {r.icon || meta.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">{r.campaignName}</p>
                      <p className="text-[10px] text-gray-400">{walletTimeAgo(r.earnedAt)}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] font-bold text-amber-600 capitalize">{r.status}</p>
                      <p className="text-[9px] text-gray-400 truncate max-w-[80px]">{r.reward}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        <div className="space-y-3">
          {menuItems.map(({ label, icon: Icon, danger, action }) => (
            <button
              key={label}
              type="button"
              onClick={() => handleMenuAction(action)}
              className="w-full flex items-center gap-4 bg-white rounded-3xl px-5 py-4 border border-[#f3f4f6] shadow-sm cursor-pointer text-left"
            >
              <span className="size-[42px] rounded-xl bg-[#f9fafb] flex items-center justify-center shrink-0">
                <Icon className={cnIcon(danger)} />
              </span>
              <span className={cnLabel(danger)}>{label}</span>
              <ChevronRight className="size-4 text-[#d1d5db] ml-auto" />
            </button>
          ))}

          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 mt-4 py-3.5 rounded-2xl bg-[#fef2f2] text-[#dc2626] font-semibold text-sm border border-[#fecaca] cursor-pointer"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

function cnIcon(danger?: boolean) {
  return danger ? 'size-5 text-[#dc2626]' : 'size-5 text-[#5b0e81]'
}

function cnLabel(danger?: boolean) {
  return danger
    ? 'text-sm font-medium text-[#dc2626]'
    : 'text-sm font-medium text-[#2b2827]'
}
