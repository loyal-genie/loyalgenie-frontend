import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getCustomerMechanicChipLabel } from '@/lib/customer-ui'
import { isMechanicLive } from '@/lib/live-mechanics'
import { BusinessCoverHero } from '@/components/customer/BusinessCoverHero'
import type { BusinessWithCampaigns } from '@/lib/api'

interface BusinessListingCardProps {
  biz: BusinessWithCampaigns
  className?: string
}

export function BusinessListingCard({ biz, className }: BusinessListingCardProps) {
  const liveMechanics = [...new Set(biz.campaigns.map(c => c.mechanic).filter(isMechanicLive))].slice(0, 3)
  const hasComingSoon = biz.campaigns.some(c => !isMechanicLive(c.mechanic))
  const campaignCount = biz.campaigns.filter(c => isMechanicLive(c.mechanic)).length || biz.campaigns.length

  return (
    <Link
      to={`/customer/business/${biz.id}`}
      className={cn(
        'block no-underline bg-white border border-[#e5e0dc] rounded-3xl overflow-hidden',
        'shadow-[0_8px_30px_rgba(0,0,0,0.06)] active:scale-[0.99] transition-transform',
        className,
      )}
    >
      <BusinessCoverHero
        coverBannerData={biz.coverBannerData}
        brandColor={biz.brandColor}
        fallbackEmoji="🏪"
        className="aspect-[398/224]"
      >
        <div className="absolute top-3 right-3 bg-white/95 rounded-full px-2.5 py-1">
          <span className="text-[10px] font-bold text-[#5b0e81]">
            {campaignCount} reward{campaignCount !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5 max-w-[85%]">
          {liveMechanics.map(m => (
            <span
              key={m}
              className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-white/90 text-[#2b2827] shadow-sm"
            >
              {getCustomerMechanicChipLabel(m)}
            </span>
          ))}
          {hasComingSoon && (
            <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-white/75 text-[#5b0e81] shadow-sm">
              More soon ✨
            </span>
          )}
        </div>
      </BusinessCoverHero>

      <div className="p-4 flex flex-col gap-0.5">
        <div className="flex items-start justify-between gap-3">
          <h3
            className="text-lg font-bold text-[#2b2827] leading-7 truncate"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {biz.name}
          </h3>
          <span className="text-[10px] font-semibold text-[#5b0e81] shrink-0 pt-1 uppercase">
            {biz.businessType}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-[#6b6461]">
          <MapPin className="size-3 shrink-0" />
          <span className="truncate">{biz.city}</span>
        </div>
        {biz.tagline && (
          <p className="text-xs text-[rgba(43,40,39,0.7)] leading-4 pt-1.5 line-clamp-2">
            {biz.tagline}
          </p>
        )}
      </div>
    </Link>
  )
}
