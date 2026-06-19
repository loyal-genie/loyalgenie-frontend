import { type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, Loader2, Sparkles, Star } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { BottomNav } from '@/components/customer/bottom-nav'
import { MECHANIC_META, getMechanicEmoji, getMechanicLabel } from '@/lib/utils'
import { useBusinessesWithCampaigns } from '@/hooks/useCustomerData'
import { fetchLoyaltyState, fetchPlayState, fetchStampState } from '@/lib/api'

const CATEGORY_EMOJI: Record<string, string> = {
  Cafe: '☕', Restaurant: '🍝', Salon: '✂️', Gym: '🏋️', Jewellery: '💎',
}

function LoyaltyCampaignCard({
  campaign,
  index,
}: {
  campaign: { id: string; name: string; endDate: string }
  index: number
}) {
  const meta = MECHANIC_META['check-in-loyalty']
  const { data: state, isLoading } = useQuery({
    queryKey: ['loyalty-state', campaign.id],
    queryFn: () => fetchLoyaltyState(campaign.id),
  })

  const checkedInToday = state?.checkedInToday ?? false

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.08 }}
      className="bg-white rounded-3xl overflow-hidden border border-purple-100 shadow-[0_4px_20px_rgba(124,58,237,0.08)]"
    >
      <div
        className="relative h-32 flex items-end p-4"
        style={{ background: `linear-gradient(135deg, ${meta.cardFrom}, ${meta.cardTo})` }}
      >
        <span
          className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm"
          style={{ background: meta.badgeBg, color: meta.badgeText }}
        >
          {getMechanicLabel('check-in-loyalty')}
        </span>
        <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/25 text-white">
          {isLoading ? '…' : state ? `${state.loyaltyPoints} pts` : 'Earn points'}
        </span>
        <div className="absolute bottom-3 right-4 text-3xl drop-shadow">⭐</div>
      </div>
      <div className="p-5">
        <h3 className="text-base font-extrabold text-gray-900 mb-1">{campaign.name}</h3>
        <p className="text-xs text-gray-500 mb-3">
          {state ? `+${state.pointsPerCheckIn} pts per check-in` : 'Daily check-in loyalty'} · ends {campaign.endDate}
        </p>
        {state?.nextMilestone && !checkedInToday && (
          <p className="text-[11px] text-purple-600 font-semibold mb-3 flex items-center gap-1">
            <Star className="w-3 h-3" />
            {state.nextMilestone.pointsNeeded} pts to {state.nextMilestone.name}
          </p>
        )}
        {checkedInToday ? (
          <div className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-sm font-bold bg-green-50 text-green-700 border border-green-200">
            ✓ Checked in today · {state?.loyaltyPoints} pts
          </div>
        ) : (
          <Link
            to={`/customer/check-in?campaign=${campaign.id}`}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-sm font-bold text-white no-underline transition-transform active:scale-[0.98]"
            style={{ background: `linear-gradient(135deg, ${meta.cardFrom}, #F5C518)`, boxShadow: `0 8px 24px ${meta.cardFrom}40`, color: '#1A0545' }}
          >
            Check In & Earn Points ⭐
          </Link>
        )}
      </div>
    </motion.div>
  )
}

function StatusBanner({
  children,
  variant = 'success',
}: {
  children: ReactNode
  variant?: 'success' | 'warning' | 'muted'
}) {
  const styles = {
    success: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    muted: 'bg-gray-50 text-gray-600 border-gray-200',
  }
  return (
    <div className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-sm font-bold border ${styles[variant]}`}>
      {children}
    </div>
  )
}

function ShakeCampaignCard({
  campaign,
  index,
}: {
  campaign: { id: string; name: string; endDate: string; winRatePercent?: number; playsPerDay?: number }
  index: number
}) {
  const meta = MECHANIC_META.shake
  const { data: playState, isLoading } = useQuery({
    queryKey: ['play-state', campaign.id],
    queryFn: () => fetchPlayState(campaign.id),
  })

  const blocked = Boolean(playState && !playState.canPlay)
  const quotaUsed = playState?.blockReason === 'no_plays_remaining'
  const campaignFull = playState?.blockReason === 'daily_participant_limit' || playState?.blockReason === 'user_cap'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.08 }}
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
          {getMechanicLabel('shake')}
        </span>
        <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/25 text-white">
          {campaign.winRatePercent}% win chance
        </span>
        <div className="absolute bottom-3 right-4 text-3xl drop-shadow">{getMechanicEmoji('shake')}</div>
      </div>
      <div className="p-5">
        <h3 className="text-base font-extrabold text-gray-900 mb-1">{campaign.name}</h3>
        <p className="text-xs text-gray-500 mb-4">
          {campaign.playsPerDay ?? 1} play per day · ends {campaign.endDate}
        </p>
        {blocked ? (
          <StatusBanner variant={quotaUsed ? 'success' : campaignFull ? 'warning' : 'muted'}>
            {quotaUsed
              ? `✓ All plays used today · ${playState!.playsUsedToday}/${playState!.playsPerDay}`
              : playState!.message}
          </StatusBanner>
        ) : (
          <Link
            to={`/customer/campaigns/${campaign.id}`}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-sm font-bold text-white no-underline transition-transform active:scale-[0.98]"
            style={{ background: `linear-gradient(135deg, ${meta.cardFrom}, ${meta.cardTo})`, boxShadow: `0 8px 24px ${meta.cardFrom}40` }}
          >
            Enter PIN & Play {getMechanicEmoji('shake')}
          </Link>
        )}
        {isLoading && !playState && (
          <p className="text-center text-[10px] text-gray-400 mt-2">Checking play status…</p>
        )}
      </div>
    </motion.div>
  )
}

function StampCampaignCard({
  campaign,
  index,
}: {
  campaign: { id: string; name: string; endDate: string }
  index: number
}) {
  const meta = MECHANIC_META.stamp
  const { data: stampState, isLoading } = useQuery({
    queryKey: ['stamp-state', campaign.id],
    queryFn: () => fetchStampState(campaign.id),
  })

  const collectedToday = Boolean(
    stampState?.enrolled && !stampState.canCollectToday && !stampState.cardComplete,
  )
  const cardComplete = Boolean(stampState?.cardComplete)
  const cardExpired = stampState?.status === 'expired'
  const enrollmentClosed = Boolean(stampState && !stampState.enrolled && !stampState.enrollmentOpen)
  const blocked = collectedToday || cardComplete || cardExpired || enrollmentClosed

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.08 }}
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
          {getMechanicLabel('stamp')}
        </span>
        <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/25 text-white">
          Surprise + big rewards
        </span>
        <div className="absolute bottom-3 right-4 text-3xl drop-shadow">{getMechanicEmoji('stamp')}</div>
      </div>
      <div className="p-5">
        <h3 className="text-base font-extrabold text-gray-900 mb-1">{campaign.name}</h3>
        <p className="text-xs text-gray-500 mb-4">
          1 stamp per day · ends {campaign.endDate}
        </p>
        {stampState?.enrolled && !blocked && (
          <p className="text-[11px] text-amber-700 font-semibold mb-3">
            {stampState.stampsCollected}/{stampState.totalStamps} stamps collected
          </p>
        )}
        {blocked ? (
          <StatusBanner
            variant={collectedToday || cardComplete ? 'success' : enrollmentClosed ? 'warning' : 'muted'}
          >
            {collectedToday
              ? `✓ Stamp collected today · ${stampState!.stampsCollected}/${stampState!.totalStamps}`
              : cardComplete
                ? `✓ Card complete · ${stampState!.stampsCollected}/${stampState!.totalStamps}`
                : cardExpired
                  ? 'Your stamp card has expired'
                  : 'Enrollment closed — no spots left'}
          </StatusBanner>
        ) : (
          <Link
            to={`/customer/campaigns/${campaign.id}`}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-sm font-bold text-white no-underline transition-transform active:scale-[0.98]"
            style={{ background: `linear-gradient(135deg, ${meta.cardFrom}, ${meta.cardTo})`, boxShadow: `0 8px 24px ${meta.cardFrom}40` }}
          >
            Enter PIN & Collect Stamp {getMechanicEmoji('stamp')}
          </Link>
        )}
        {isLoading && !stampState && (
          <p className="text-center text-[10px] text-gray-400 mt-2">Checking stamp status…</p>
        )}
      </div>
    </motion.div>
  )
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
  const loyaltyCampaigns = biz.campaigns.filter(c => c.mechanic === 'check-in-loyalty')
  const shakeCampaigns = biz.campaigns.filter(c => c.mechanic === 'shake')
  const stampCampaigns = biz.campaigns.filter(c => c.mechanic === 'stamp')
  const otherCampaigns = biz.campaigns.filter(
    c => c.mechanic !== 'check-in-loyalty' && c.mechanic !== 'shake' && c.mechanic !== 'stamp',
  )

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
            {loyaltyCampaigns.map((c, i) => (
              <LoyaltyCampaignCard key={c.id} campaign={c} index={i} />
            ))}
            {shakeCampaigns.map((c, i) => (
              <ShakeCampaignCard key={c.id} campaign={c} index={loyaltyCampaigns.length + i} />
            ))}
            {stampCampaigns.map((c, i) => (
              <StampCampaignCard
                key={c.id}
                campaign={c}
                index={loyaltyCampaigns.length + shakeCampaigns.length + i}
              />
            ))}
            {otherCampaigns.map((c, i) => {
              const meta = MECHANIC_META[c.mechanic as keyof typeof MECHANIC_META] ?? MECHANIC_META.shake
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + (loyaltyCampaigns.length + shakeCampaigns.length + stampCampaigns.length + i) * 0.08 }}
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
                    <div className="absolute bottom-3 right-4 text-3xl drop-shadow">{getMechanicEmoji(c.mechanic)}</div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-base font-extrabold text-gray-900 mb-1">{c.name}</h3>
                    <p className="text-xs text-gray-500 mb-4">ends {c.endDate}</p>
                    <span className="block text-center text-xs text-gray-400 py-3">Coming soon</span>
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
