import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, Loader2 } from 'lucide-react'
import { BottomNav } from '@/components/customer/bottom-nav'
import { MECHANIC_META, getMechanicEmoji, getMechanicLabel } from '@/lib/utils'
import { useBusinessesWithCampaigns } from '@/hooks/useCustomerData'

const CATEGORY_EMOJI: Record<string, string> = {
  Cafe: '☕', Restaurant: '🍝', Salon: '✂️', Gym: '🏋️', Jewellery: '💎',
}

export function CustomerBusinessPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: businesses, isLoading } = useBusinessesWithCampaigns()
  const biz = businesses?.find(b => b.id === id)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    )
  }

  if (!biz) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5 text-center">
        <p className="text-gray-600 font-semibold mb-4">Vendor not found</p>
        <button onClick={() => navigate('/customer')} className="text-purple-600 text-sm">← Back home</button>
      </div>
    )
  }

  const emoji = CATEGORY_EMOJI[biz.businessType] ?? '🏪'
  const color = biz.brandColor

  return (
    <div className="min-h-screen bg-white pb-24">
      <div
        className="relative h-[200px] lg:h-[240px]"
        style={{ background: `linear-gradient(135deg, ${color}, ${color}99)` }}
      >
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl opacity-20 select-none">
          {emoji}
        </span>

        <button
          onClick={() => navigate(-1)}
          className="absolute top-12 left-4 w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center z-10 border-0 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>

        <div className="absolute top-12 left-0 right-0 text-center z-10 pointer-events-none">
          <span className="text-white font-bold text-base drop-shadow">{biz.name}</span>
        </div>
      </div>

      <div className="px-5 lg:px-8 pt-5 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2"
        >
          <h1 className="text-xl font-extrabold text-gray-900">{biz.name}</h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="flex items-center gap-2 mb-4 text-xs text-gray-500"
        >
          <MapPin className="w-3.5 h-3.5 text-gray-400" />
          <span>{biz.city}</span>
          <span>·</span>
          <span>{biz.businessType}</span>
        </motion.div>

        {biz.tagline && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.08 }}
            className="text-sm text-gray-500 mb-6 leading-relaxed"
          >
            {biz.tagline}
          </motion.p>
        )}

        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-base font-extrabold text-gray-900 mb-4"
        >
          Active Campaigns
        </motion.h2>

        {biz.campaigns.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No active campaigns right now.</p>
        ) : (
          <div className="space-y-4">
            {biz.campaigns.map((c, i) => {
              const meta = MECHANIC_META[c.mechanic as keyof typeof MECHANIC_META] ?? MECHANIC_META.shake
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18 + i * 0.07 }}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
                >
                  <div
                    className="relative h-28 flex items-end p-3"
                    style={{ background: `linear-gradient(135deg, ${meta.cardFrom}, ${meta.cardTo})` }}
                  >
                    <span
                      className="absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: meta.badgeBg, color: meta.badgeText }}
                    >
                      {getMechanicLabel(c.mechanic as 'shake')}
                    </span>
                    <div className="absolute bottom-3 right-3 text-2xl">
                      {getMechanicEmoji(c.mechanic)}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-bold text-gray-900 mb-0.5">{c.name}</h3>
                    <p className="text-xs text-gray-500 mb-1">
                      {c.winRatePercent}% win rate · {c.playsPerDay ?? 1} play/day
                    </p>
                    <p className="text-[10px] text-gray-400 mb-3">
                      {c.startDate} → {c.endDate}
                    </p>
                    {c.mechanic === 'shake' ? (
                      <Link
                        to={`/customer/campaigns/${c.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 hover:text-purple-900 transition-colors no-underline"
                      >
                        Enter PIN & Play →
                      </Link>
                    ) : (
                      <span className="text-xs text-gray-400">Coming soon</span>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
