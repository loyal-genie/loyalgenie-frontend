import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getMechanicHeaderChip } from '@/lib/customer-ui'
import { BusinessCoverHero } from '@/components/customer/BusinessCoverHero'
import type { BusinessWithCampaigns } from '@/lib/api'

interface BusinessDetailHeroProps {
  biz: BusinessWithCampaigns
  onBack: () => void
  className?: string
}

export function BusinessDetailHero({ biz, onBack, className }: BusinessDetailHeroProps) {
  const mechanics = [...new Set(biz.campaigns.map(c => c.mechanic))]

  return (
    <div className={cn('relative', className)}>
      <BusinessCoverHero
        coverBannerData={biz.coverBannerData}
        brandColor={biz.brandColor}
        fallbackEmoji="🏪"
        className="h-[300px]"
      >
        <button
          type="button"
          onClick={onBack}
          className="absolute top-12 left-4 z-10 size-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center border-0 cursor-pointer"
          aria-label="Go back"
        >
          <ArrowLeft className="size-4 text-white" />
        </button>

        <div className="absolute top-12 right-4 z-10 bg-black/40 backdrop-blur-sm rounded-full px-2.5 py-1">
          <span className="text-[10px] font-bold text-white">
            {biz.campaigns.length} active
          </span>
        </div>

        {biz.tagline && (
          <div className="absolute bottom-14 left-3 right-3 z-10">
            <p className="inline-block bg-white/18 backdrop-blur-sm text-white text-sm leading-[22px] px-2.5 py-2.5 rounded-[23px]">
              {biz.tagline}
            </p>
          </div>
        )}

        <div className="absolute -bottom-px left-0 right-0 h-8 bg-white rounded-t-[32px] z-10" />
      </BusinessCoverHero>

      <div className="px-5 pt-1 pb-4 bg-white">
        <span className="inline-block bg-[#fef3c7] text-[#92400e] text-[11px] font-bold px-2.5 py-0.5 rounded-full mb-1">
          {biz.businessType}
        </span>

        <div className="flex items-start justify-between gap-3">
          <h1 className="text-[22px] font-extrabold text-[#2b2827] leading-[27.5px]">{biz.name}</h1>
        </div>

        <div className="flex items-center gap-1.5 py-1.5 text-xs text-[#6a7282]">
          <span>{biz.city}</span>
        </div>

        <div className="flex flex-wrap gap-1.5 py-1">
          {mechanics.map(m => (
            <span
              key={m}
              className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-[#f3e8ff] text-[#5b0e81]"
            >
              {getMechanicHeaderChip(m)}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
