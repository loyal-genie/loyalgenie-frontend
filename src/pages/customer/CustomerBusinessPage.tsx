import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, Star, Gift, Stamp } from 'lucide-react'
import { BottomNav } from '@/components/customer/bottom-nav'
import { customerBusinesses } from '@/lib/mock-data'
import { MECHANIC_META } from '@/lib/utils'
import type { MechanicType } from '@/lib/types'

// Map mechanic type to game route + campaign query
const MECHANIC_GAME_LINKS: Record<MechanicType, string> = {
  stamp:   '/customer/games/stamp?campaign=camp-2',
  spin:    '/customer/games/spin?campaign=camp-1',
  shake:   '/customer/games/shake?campaign=camp-1',
  dice:    '/customer/games/dice?campaign=camp-3',
  lottery: '/customer/games/lottery?campaign=camp-5',
}

export function CustomerBusinessPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const biz = customerBusinesses.find(b => b.id === id) ?? customerBusinesses[0]

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Cover section */}
      <div
        className="relative h-[220px]"
        style={{ background: `linear-gradient(135deg, ${biz.coverFrom}, ${biz.coverTo})` }}
      >
        {/* Big emoji bg */}
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl opacity-20 select-none">
          {biz.coverEmoji}
        </span>

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-12 left-4 w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center z-10"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>

        {/* Business name in header */}
        <div className="absolute top-12 left-0 right-0 text-center z-10 pointer-events-none">
          <span className="text-white font-bold text-base drop-shadow">{biz.name}</span>
        </div>

        {/* Rating badge top-right */}
        <div className="absolute top-12 right-4 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1 z-10">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-bold text-gray-800">{biz.rating.toFixed(1)}</span>
        </div>

        {/* Mechanic pills bottom-left */}
        <div className="absolute bottom-3 left-4 flex flex-wrap gap-1.5 z-10">
          {biz.mechanics.map(m => {
            const meta = MECHANIC_META[m.type]
            return (
              <span
                key={m.type}
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: meta.badgeBg, color: meta.badgeText }}
              >
                {meta.label}
              </span>
            )
          })}
        </div>

        {/* Floating action buttons — left edge mid */}
        <div className="absolute right-4 bottom-3 flex flex-col gap-2 z-10">
          <button className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md">
            <Gift className="w-4 h-4 text-purple-700" />
          </button>
          <button className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md">
            <Stamp className="w-4 h-4 text-purple-700" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 pt-5">
        {/* Name + distance row */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between gap-2 mb-2"
        >
          <h1 className="text-xl font-extrabold text-gray-900">{biz.name}</h1>
          <span className="text-sm text-gray-400 shrink-0 mt-1">{biz.distance}</span>
        </motion.div>

        {/* Location + reviews */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="flex items-center gap-2 mb-2 text-xs text-gray-500"
        >
          <MapPin className="w-3.5 h-3.5 text-gray-400" />
          <span>{biz.location}</span>
          <span>·</span>
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span className="font-semibold text-gray-700">{biz.rating.toFixed(1)}</span>
          <span>({biz.reviews} reviews)</span>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.08 }}
          className="text-sm text-gray-500 mb-5 leading-relaxed"
        >
          {biz.tagline}
        </motion.p>

        {/* Membership CTA */}
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="w-full py-3.5 rounded-full text-sm font-bold text-white mb-6"
          style={{ background: 'linear-gradient(90deg, #5B21B6, #7C3AED)' }}
        >
          Checkout Membership Plans →
        </motion.button>

        {/* Mechanics section */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-base font-extrabold text-gray-900 mb-4"
        >
          Mechanics Live Here
        </motion.h2>

        <div className="space-y-4">
          {biz.mechanics.map((m, i) => {
            const meta = MECHANIC_META[m.type]
            const gameLink = MECHANIC_GAME_LINKS[m.type]
            return (
              <motion.div
                key={m.type}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 + i * 0.07, type: 'spring', stiffness: 280, damping: 22 }}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
              >
                {/* Mechanic card cover */}
                <div
                  className="relative h-28 flex items-end p-3"
                  style={{ background: `linear-gradient(135deg, ${meta.cardFrom}, ${meta.cardTo})` }}
                >
                  {/* Badge top-left */}
                  <span
                    className="absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: meta.badgeBg, color: meta.badgeText }}
                  >
                    {meta.label}
                  </span>
                  {/* Icon circle bottom-right */}
                  <div className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl">
                    {meta.emoji}
                  </div>
                </div>
                {/* Text */}
                <div className="p-4">
                  <h3 className="text-sm font-bold text-gray-900 mb-0.5">{m.label}</h3>
                  <p className="text-xs text-gray-500 mb-3">{m.description}</p>
                  <Link
                    to={gameLink}
                    className="text-xs font-bold text-purple-700 hover:text-purple-900 transition-colors"
                  >
                    Play now →
                  </Link>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
