import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Bell, ChevronRight, Loader2, UserCircle } from 'lucide-react'
import { BottomNav } from '@/components/customer/bottom-nav'
import { useCustomerNotifications } from '@/hooks/useCustomerData'

export function CustomerNotificationsPage() {
  const navigate = useNavigate()
  const { data, isLoading } = useCustomerNotifications()
  const notifications = data?.notifications ?? []

  return (
    <div className="min-h-dvh bg-gray-50 pb-[calc(5rem+env(safe-area-inset-bottom))]">
      <div className="px-5 pt-14 pb-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-[#5b0e81] mb-6 bg-transparent border-0 cursor-pointer p-0"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 flex items-center justify-center">
            <Bell className="w-5 h-5 text-[#5b0e81]" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">Notifications</h1>
            <p className="text-xs text-gray-500">Updates for your account</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="size-8 text-[#5b0e81] animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="text-4xl mb-3">✨</div>
            <p className="text-sm font-semibold text-gray-900">You&apos;re all caught up</p>
            <p className="text-xs text-gray-500 mt-1">No new notifications right now.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n, i) => (
              <motion.button
                key={n.id}
                type="button"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate(n.actionUrl)}
                className="w-full text-left bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-start gap-3 cursor-pointer"
              >
                <span className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                  <UserCircle className="w-5 h-5 text-amber-600" />
                </span>
                <span className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{n.body}</p>
                </span>
                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0 mt-1" />
              </motion.button>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
