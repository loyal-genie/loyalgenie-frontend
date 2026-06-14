import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogOut } from 'lucide-react'
import { BottomNav } from '@/components/customer/bottom-nav'
import { Button } from '@/components/ui/button'
import { business } from '@/lib/mock-data'
import { getMechanicEmoji, formatDate, formatRelativeTime } from '@/lib/utils'
import { clearSession } from '@/lib/auth'
import { useCustomerSession } from '@/hooks/useCustomerSession'

export function CustomerProfilePage() {
  const navigate = useNavigate()
  const { customer, displayName, displayPhone, displayEmail } = useCustomerSession()

  function handleSignOut() {
    clearSession()
    navigate('/signin?role=customer', { replace: true })
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

        {/* Loyalty stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-2 mb-6"
        >
          {[
            { label: 'Visits',  value: customer.totalVisits,   icon: '📅' },
            { label: 'Games',   value: customer.gamesPlayed,   icon: '🎮' },
            { label: 'Rewards', value: customer.rewardsEarned, icon: '🎁' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-3 text-center border border-gray-100 shadow-sm">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-xl font-black text-gray-900">{s.value}</div>
              <div className="text-[10px] text-gray-500">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Business info */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl p-4 mb-5 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-xl">
              {business.logo}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{business.name}</p>
              <p className="text-xs text-gray-500">{business.category}</p>
            </div>
          </div>
          <div className="text-xs text-gray-400 leading-relaxed">{business.hours}</div>
        </motion.div>

        {/* Recent activity */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Recent Activity</h2>
          <div className="space-y-2">
            {customer.gameHistory.map((g, i) => (
              <motion.div
                key={g.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 + 0.2 }}
                className="bg-white rounded-xl p-3 flex items-center gap-3 border border-gray-100 shadow-sm"
              >
                <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-lg shrink-0">
                  {getMechanicEmoji(g.mechanic)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">{g.campaignName}</p>
                  <p className="text-[10px] text-gray-400">{formatRelativeTime(g.playedAt)}</p>
                </div>
                <div className="text-right shrink-0">
                  {g.won ? (
                    <>
                      <p className="text-[10px] font-bold text-amber-600">Won!</p>
                      <p className="text-[9px] text-gray-400">{g.reward}</p>
                    </>
                  ) : (
                    <p className="text-[10px] text-gray-400">No win</p>
                  )}
                </div>
              </motion.div>
            ))}
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
