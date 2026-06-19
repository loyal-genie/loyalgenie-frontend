import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogOut, Gift, ChevronRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { BottomNav } from '@/components/customer/bottom-nav'
import { Button } from '@/components/ui/button'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import { clearSession } from '@/lib/auth'
import { useCustomerSession } from '@/hooks/useCustomerSession'
import { fetchCustomerRewards } from '@/lib/api'

export function CustomerProfilePage() {
  const navigate = useNavigate()
  const { customer, displayName, displayPhone, displayEmail } = useCustomerSession()

  const { data: rewards = [] } = useQuery({
    queryKey: ['customer-rewards'],
    queryFn: fetchCustomerRewards,
  })

  const pendingRewards = rewards.filter(r => r.status === 'pending')
  const redeemedRewards = rewards.filter(r => r.status === 'redeemed')

  function handleSignOut() {
    clearSession('customer')
    navigate('/signin', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="pt-12 px-5 pb-6">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="w-20 h-20 rounded-3xl bg-purple-100 border-2 border-purple-200 flex items-center justify-center text-4xl font-extrabold text-purple-700 mx-auto mb-4">
            {displayName[0]}
          </div>
          <h1 className="text-xl font-extrabold text-gray-900">{displayName}</h1>
          <p className="text-sm text-gray-500 mt-1">{displayPhone}</p>
          <p className="text-xs text-gray-400 mt-0.5">Member since {formatDate(customer.joinedAt)}</p>
        </motion.div>

        {/* Reward stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-2 mb-6"
        >
          {[
            { label: 'Total Rewards', value: rewards.length || customer.rewardsEarned, icon: '🎁' },
            { label: 'Redeemed', value: redeemedRewards.length, icon: '✅' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-3 text-center border border-gray-100 shadow-sm">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-xl font-black text-gray-900">{s.value}</div>
              <div className="text-[10px] text-gray-500">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Redeemable rewards */}
        {pendingRewards.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            className="mb-5"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5 text-amber-500" /> Ready to Redeem
              </h2>
              <Link to="/customer/wallet" className="text-[10px] font-semibold text-purple-600 flex items-center gap-0.5">
                Wallet <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {pendingRewards.slice(0, 3).map(r => (
                <div key={r.id} className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-3 flex items-center gap-3 border border-amber-200">
                  <span className="text-2xl">{r.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">{r.reward}</p>
                    <p className="text-[10px] text-gray-500">{r.campaignName}</p>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-amber-700 bg-white px-2 py-1 rounded-lg">{r.code}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-2 text-center">Show code at counter — staff verifies redemption</p>
          </motion.div>
        )}

        {/* Recent activity - from rewards */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Recent Rewards</h2>
          <div className="space-y-2">
            {rewards.length > 0 ? rewards.slice(0, 5).map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 + 0.2 }}
                className="bg-white rounded-xl p-3 flex items-center gap-3 border border-gray-100 shadow-sm"
              >
                <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-lg shrink-0">
                  {r.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">{r.reward}</p>
                  <p className="text-[10px] text-gray-400">{formatRelativeTime(r.earnedAt)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-[10px] font-bold ${r.status === 'pending' ? 'text-amber-600' : 'text-green-600'}`}>
                    {r.status === 'pending' ? 'Pending' : 'Redeemed'}
                  </p>
                </div>
              </motion.div>
            )) : customer.gameHistory.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No activity yet</p>
            ) : null}
          </div>
        </motion.div>

        {/* Profile info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-5 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
        >
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Profile</h2>
          {[
            { label: 'Email', value: displayEmail },
            { label: 'Date of Birth', value: formatDate(customer.dob) },
            { label: 'Last Visit', value: formatRelativeTime(customer.lastVisit) },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <span className="text-xs text-gray-400">{item.label}</span>
              <span className="text-xs text-gray-800 font-medium">{item.value}</span>
            </div>
          ))}
        </motion.div>

        <Button variant="danger" className="w-full mt-6" onClick={handleSignOut}>
          <LogOut className="w-4 h-4" /> Sign out
        </Button>
      </div>

      <BottomNav />
    </div>
  )
}
