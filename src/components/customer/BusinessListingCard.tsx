import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { getMechanicHeaderChipShort } from '@/lib/customer-ui'
import { isMechanicLive } from '@/lib/live-mechanics'
import { BusinessCoverHero } from '@/components/customer/BusinessCoverHero'
import { formatDistanceKm } from '@/lib/business-display'
import type { BusinessWithCampaigns } from '@/lib/api'

interface BusinessListingCardProps {
  biz: BusinessWithCampaigns
  userCoords?: { lat: number; lng: number } | null
  className?: string
}

function businessEmoji(type: string): string {
  const t = type.toLowerCase()
  if (t.includes('cafe') || t.includes('coffee')) return '🏪'
  if (t.includes('salon') || t.includes('spa')) return '💇'
  if (t.includes('gym') || t.includes('fitness')) return '💪'
  if (t.includes('restaurant') || t.includes('food')) return '🍽️'
  return '🏪'
}

function formatSubtitle(biz: BusinessWithCampaigns): string {
  if (biz.tagline?.trim()) {
    const t = biz.tagline.trim()
    return t.startsWith('"') ? t : `"${t}"`
  }
  return biz.businessType
}

export function BusinessListingCard({ biz, userCoords, className }: BusinessListingCardProps) {
  const liveCampaigns = biz.campaigns.filter(c => isMechanicLive(c.mechanic))
  const liveMechanics = [...new Set(liveCampaigns.map(c => c.mechanic))]
  const liveCount = liveCampaigns.length || biz.campaigns.length
  const maxWinRate = liveCampaigns.reduce((max, c) => Math.max(max, c.winRatePercent ?? 0), 0)
  const distance = formatDistanceKm(biz, userCoords?.lat, userCoords?.lng)

  return (
    <Link
      to={`/customer/business/${biz.id}`}
      className={cn(
        'block no-underline bg-white rounded-3xl overflow-hidden',
        'shadow-[0_8px_32px_rgba(0,0,0,0.08)] active:scale-[0.99] transition-transform',
        className,
      )}
    >
      <BusinessCoverHero
        coverBannerData={biz.coverBannerData}
        brandColor={biz.brandColor}
        fallbackEmoji={businessEmoji(biz.businessType)}
        className="aspect-[398/224]"
        emojiClassName="text-8xl"
      >
        {liveCount > 0 && (
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5 max-w-[85%]">
            <span className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full bg-white/20 border border-white/30 backdrop-blur-sm text-white">
              LOYALTY
            </span>
            {liveMechanics.map(m => (
              <span
                key={m}
                className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full bg-white/20 border border-white/30 backdrop-blur-sm text-white"
              >
                {getMechanicHeaderChipShort(m)}
              </span>
            ))}
          </div>
        )}
      </BusinessCoverHero>

      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <h3
            className="text-lg font-bold text-[#1a1625] leading-tight truncate"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {biz.name}
          </h3>
          {maxWinRate > 0 && (
            <span className="shrink-0 rounded-full bg-[#fff7ed] px-2.5 py-1 text-[11px] font-semibold text-[#c2410c]">
              Up to {maxWinRate}% win
            </span>
          )}
        </div>

        <p className="mt-1 text-sm text-[#6b7280] leading-snug line-clamp-2">
          {formatSubtitle(biz)}
        </p>

        <div className="my-3 h-px bg-[#f0ece8]" />

        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-[#9ca3af] truncate">
            {distance ? `${distance} · ` : ''}
            {biz.city} · {liveCount} live
          </span>
          <span className="shrink-0 text-sm font-semibold text-[#5b0e81]">
            Play now →
          </span>
        </div>
      </div>
    </Link>
  )
}
