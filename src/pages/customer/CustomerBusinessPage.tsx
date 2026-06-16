import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, Loader2, Sparkles } from 'lucide-react'
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
      <div className="min-h-screen flex items-center justify-center bg-[#f8f6ff]">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    )
  }

  if (!biz) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5 text-center bg-[#f8f6ff]">
        <p className="text-gray-600 font-semibold mb-4">Vendor not found</p>
        <button onClick={() => navigate('/customer')} className="text-purple-600 text-sm font-semibold">← Back home</button>
      </div>
    )
  }

  const emoji = CATEGORY_EMOJI[biz.businessType] ?? '🏪'
  const color = biz.brandColor

  return (
    <div className="min-h-dvh bg-[#f8f6ff] pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
      <div
        className="relative h-[220px] lg:h-[260px] overflow-hidden"
        style={{ background: `linear-gradient(160deg, ${color} 0%, ${color}aa 40%, #1e1b4b 100%)` }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl opacity-15 select-none">
          {emoji}
        </span>

        <button
          onClick={() => navigate(-1)}
          className="absolute top-12 left-4 w-10 h-10 rounded-2xl bg-black/25 backdrop-blur-md flex items-center justify-center z-10 border border-white/10 cursor-pointer hover:bg-black/35 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-5 lg:px-8 pb-6 bg-gradient-to-t from-black/50 to-transparent">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-extrabold text-white drop-shadow-sm">{biz.name}</h1>
            <div className="flex items-center gap-2 mt-2 text-xs text-white/80">
              <MapPin className="w-3.5 h-3.5" />
              <span>{biz.city}</span>
              <span>·</span>
              <span>{biz.businessType}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 lg:px-8 pt-6 max-w-3xl mx-auto">
        {biz.tagline && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-gray-600 mb-6 leading-relaxed bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
          >
            {biz.tagline}
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 mb-5"
        >
          <Sparkles className="w-4 h-4 text-purple-600" />
          <h2 className="text-base font-extrabold text-gray-900">Live campaigns</h2>
        </motion.div>

        {biz.campaigns.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-12 bg-white rounded-2xl">No active campaigns right now.</p>
        ) : (
          <div className="space-y-4">
            {biz.campaigns.map((c, i) => {
              const meta = MECHANIC_META[c.mechanic as keyof typeof MECHANIC_META] ?? MECHANIC_META.shake
              const isStamp = c.mechanic === 'stamp'
              const isPlayable = c.mechanic === 'shake' || isStamp
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
                >
                  <div
                    className="relative h-32 flex items-end p-4"
                    style={{ background: `linear-gradient(135deg, ${meta.cardFrom}, ${meta.cardTo})` }}
                  >
                    <span
                      className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm"
                      style={{ background: meta.badgeBg, color: meta.badgeText }}
                    >
                      {getMechanicLabel(c.mechanic as 'shake')}
                    </span>
                    <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/25 text-white">
                      {isStamp ? 'Surprise + big rewards' : `${c.winRatePercent}% win chance`}
                    </span>
                    <div className="absolute bottom-3 right-4 text-3xl drop-shadow">{getMechanicEmoji(c.mechanic)}</div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-base font-extrabold text-gray-900 mb-1">{c.name}</h3>
                    <p className="text-xs text-gray-500 mb-4">
                      {isStamp ? '1 stamp per day' : `${c.playsPerDay ?? 1} play per day`} · ends {c.endDate}
                    </p>
                    {isPlayable ? (
                      <Link
                        to={`/customer/campaigns/${c.id}`}
                        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-sm font-bold text-white no-underline transition-transform active:scale-[0.98]"
                        style={{ background: `linear-gradient(135deg, ${meta.cardFrom}, ${meta.cardTo})`, boxShadow: `0 8px 24px ${meta.cardFrom}40` }}
                      >
                        {isStamp ? 'Enter PIN & Collect Stamp' : `Enter PIN & Play`} {getMechanicEmoji(c.mechanic)}
                      </Link>
                    ) : (
                      <span className="block text-center text-xs text-gray-400 py-3">Coming soon</span>
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
