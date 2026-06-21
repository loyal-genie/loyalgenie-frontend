import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ExternalLink, MapPin, Phone, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getMechanicHeaderChip } from '@/lib/customer-ui'
import {
  formatBusinessCategory,
  formatBusinessLocation,
  formatDistanceKm,
  formatOpenStatus,
  formatPhoneDisplay,
  formatRating,
  getBusinessHeroPhotos,
} from '@/lib/business-display'
import { useUserLocation } from '@/hooks/useUserLocation'
import { BusinessCoverHero } from '@/components/customer/BusinessCoverHero'
import type { BusinessWithCampaigns } from '@/lib/api'

interface BusinessDetailHeroProps {
  biz: BusinessWithCampaigns
  className?: string
}

export function BusinessDetailHero({ biz, className }: BusinessDetailHeroProps) {
  const campaignMechanics = [...new Set(biz.campaigns.map(c => c.mechanic))]
  const mechanics =
    biz.mechanicTags && biz.mechanicTags.length > 0 ? biz.mechanicTags : campaignMechanics
  const photos = useMemo(() => getBusinessHeroPhotos(biz), [biz])
  const dotCount = photos.length > 1 ? photos.length : 3
  const [activePhoto, setActivePhoto] = useState(0)
  const userCoords = useUserLocation()

  useEffect(() => {
    setActivePhoto(0)
  }, [biz.id])

  useEffect(() => {
    if (photos.length <= 1) return
    const t = setInterval(() => setActivePhoto(i => (i + 1) % photos.length), 6000)
    return () => clearInterval(t)
  }, [photos.length])

  const heroPhoto = photos[activePhoto] ?? photos[0]
  const location = formatBusinessLocation(biz)
  const openStatus = formatOpenStatus(biz.operatingHours)
  const phone = formatPhoneDisplay(biz.mobile)
  const rating = formatRating(biz.rating)
  const distance = formatDistanceKm(biz, userCoords?.lat, userCoords?.lng)
  const category = formatBusinessCategory(biz.businessType)

  return (
    <div className={cn('relative bg-white', className)}>
      <div className="relative h-[300px] overflow-hidden">
        {heroPhoto ? (
          <>
            <img
              src={heroPhoto}
              alt=""
              className="absolute top-0 left-[-2%] h-[89%] w-[105%] max-w-none object-cover pointer-events-none"
            />
            <div className="absolute inset-[127px_0_0_0] bg-gradient-to-b from-black/[0.12] via-[rgba(146,64,14,0.5)] via-[67%] to-[rgba(120,53,15,0.78)] rounded-[10px] pointer-events-none" />
          </>
        ) : (
          <BusinessCoverHero
            coverBannerData={undefined}
            brandColor={biz.brandColor}
            fallbackEmoji="🏪"
            className="h-full w-full pointer-events-none"
          />
        )}

        <Link
          to="/customer"
          replace
          className="absolute top-12 left-4 z-30 size-9 rounded-full bg-black/30 backdrop-blur-[6px] flex items-center justify-center border-0 cursor-pointer pointer-events-auto no-underline"
          aria-label="Back to home"
        >
          <ArrowLeft className="size-4 text-white" />
        </Link>

        {rating && (
          <div className="absolute top-12 right-4 z-10 flex items-center gap-1 bg-black/40 backdrop-blur-[6px] rounded-full px-2.5 py-1">
            <Star className="size-3 text-[#fcc800] fill-[#fcc800]" />
            <span className="text-xs font-bold text-white leading-4">{rating}</span>
          </div>
        )}

        {biz.tagline && (
          <div className="absolute top-[217px] left-3 z-10">
            <p className="inline-block max-w-[calc(100%-24px)] bg-white/[0.18] text-white text-sm leading-[22.75px] px-2.5 py-2.5 rounded-[23px]">
              {biz.tagline.replace(/^["']|["']$/g, '')}
            </p>
          </div>
        )}

        <div className="absolute bottom-[36px] left-1/2 -translate-x-1/2 z-10 flex gap-2.5">
          {Array.from({ length: dotCount }).map((_, i) => {
            const active = photos.length > 1 ? activePhoto === i : i === 1
            return (
              <button
                key={i}
                type="button"
                aria-label={`Photo ${i + 1}`}
                onClick={() => {
                  if (photos.length > 1) setActivePhoto(i)
                }}
                className={cn(
                  'size-[5px] rounded-full border-0 p-0 cursor-pointer transition-colors',
                  active ? 'bg-white' : 'bg-white/40',
                )}
              />
            )
          })}
        </div>

        <div className="absolute -bottom-px left-0 right-0 h-8 bg-white rounded-t-[32px] z-10" />
      </div>

      <div className="px-5 pt-1 pb-4 flex flex-col gap-1">
        <span className="inline-block w-fit bg-[#fef3c7] text-[#92400e] text-[11px] font-bold px-2.5 py-0.5 rounded-full leading-[16.5px]">
          {category}
        </span>

        <div className="relative min-h-[27.5px]">
          <h1 className="text-[22px] font-extrabold text-[#2b2827] leading-[27.5px] pr-16">{biz.name}</h1>
          {distance && (
            <span className="absolute right-0 top-1.5 text-sm text-[#99a1af] font-medium leading-5">
              {distance}
            </span>
          )}
        </div>

        {location && (
          <div className="flex items-center gap-1.5 py-1.5 text-xs text-[#6a7282] leading-4">
            <MapPin className="size-3.5 shrink-0" strokeWidth={2} />
            <span>{location}</span>
          </div>
        )}

        {mechanics.length > 0 && (
          <div className="flex flex-wrap gap-x-[31px] gap-y-1.5 py-px">
            {mechanics.map(m => (
              <span
                key={m}
                className="text-[10px] font-bold uppercase leading-[15px] px-2.5 py-1 rounded-full bg-[rgba(0,0,0,0.69)] text-white/[0.92] backdrop-blur-[3px] h-[23px] flex items-center"
              >
                {getMechanicHeaderChip(m)}
              </span>
            ))}
          </div>
        )}

        {openStatus && (
          <div className="flex items-center gap-3 py-1.5">
            <span className="size-2 rounded-full bg-[#00c950] shrink-0 mt-1" />
            <span className="text-xs font-semibold text-[#00a63e] leading-4">{openStatus}</span>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 py-1.5 min-h-[28px]">
          {phone ? (
            <a href={`tel:${biz.mobile}`} className="flex items-center gap-1 text-xs text-[#6a7282] leading-4 no-underline">
              <Phone className="size-3 shrink-0" strokeWidth={2} />
              <span>{phone}</span>
            </a>
          ) : (
            <span />
          )}
          {biz.googleReview ? (
            <a
              href={biz.googleReview}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] font-semibold text-[#155dfc] leading-[16.5px] no-underline shrink-0"
            >
              <span
                className="size-4 rounded bg-gradient-to-br from-[#4285f4] to-[#0f9d58] text-white text-[9px] font-extrabold flex items-center justify-center shrink-0"
              >
                G
              </span>
              Google Reviews
              <ExternalLink className="size-3 shrink-0" />
            </a>
          ) : null}
        </div>
      </div>
    </div>
  )
}
