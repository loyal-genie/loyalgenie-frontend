import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import type { PanInfo } from 'framer-motion'
import { cn } from '@/lib/utils'
import { getCustomerMechanicChipLabel } from '@/lib/customer-ui'
import { BusinessCoverHero } from '@/components/customer/BusinessCoverHero'
import type { BusinessWithCampaigns } from '@/lib/api'

interface PromoHeroBannerProps {
  businesses?: BusinessWithCampaigns[]
  className?: string
}

type Slide = {
  id: string
  businessName: string
  headline: string
  mechanic: string
  href: string
  cover?: string
  brandColor: string
}

const MAX_SLIDES = 6

function businessEmoji(type: string): string {
  const t = type.toLowerCase()
  if (t.includes('cafe') || t.includes('coffee')) return '☕'
  if (t.includes('salon') || t.includes('spa')) return '💇'
  if (t.includes('gym') || t.includes('fitness')) return '💪'
  if (t.includes('restaurant') || t.includes('food')) return '🍽️'
  return '🏪'
}

export function PromoHeroBanner({ businesses = [], className }: PromoHeroBannerProps) {
  const navigate = useNavigate()
  const [active, setActive] = useState(0)

  const slides = useMemo((): Slide[] => {
    const sorted = [...businesses].sort((a, b) => {
      const aHasCover = Boolean(a.coverBannerData)
      const bHasCover = Boolean(b.coverBannerData)
      if (aHasCover !== bHasCover) return aHasCover ? -1 : 1
      return 0
    })

    const fromBusinesses = sorted.slice(0, MAX_SLIDES).map(biz => {
      const featured = biz.campaigns[0]
      return {
        id: biz.id,
        businessName: biz.name,
        headline: featured?.name ?? biz.tagline ?? 'Explore rewards',
        mechanic: featured?.mechanic ?? 'shake',
        href: `/customer/business/${biz.id}`,
        cover: biz.coverBannerData,
        brandColor: biz.brandColor,
      }
    })

    if (fromBusinesses.length > 0) return fromBusinesses

    return [
      {
        id: 'default',
        businessName: 'LoyalGenie',
        headline: 'Discover local rewards',
        mechanic: 'shake',
        href: '/customer/discover',
        brandColor: '#5b0e81',
      },
    ]
  }, [businesses])

  const count = slides.length

  const go = useCallback(
    (dir: 1 | -1) => {
      setActive(i => (i + dir + count) % count)
    },
    [count],
  )

  useEffect(() => {
    setActive(i => (i >= count ? 0 : i))
  }, [count])

  useEffect(() => {
    if (count <= 1) return
    const t = setInterval(() => go(1), 5500)
    return () => clearInterval(t)
  }, [count, go])

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -40) go(1)
    else if (info.offset.x > 40) go(-1)
  }

  const slide = slides[active]!
  const biz = businesses.find(b => b.id === slide.id)

  return (
    <div className={cn('relative', className)}>
      <motion.button
        type="button"
        onClick={() => navigate(slide.href)}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.12}
        onDragEnd={onDragEnd}
        className="relative h-[180px] w-full rounded-[22px] overflow-hidden border-0 cursor-pointer p-0 text-left shadow-[0_12px_40px_rgba(91,14,129,0.18)]"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0"
          >
            <BusinessCoverHero
              coverBannerData={slide.cover}
              brandColor={slide.brandColor}
              fallbackEmoji={biz ? businessEmoji(biz.businessType) : '🏪'}
              className="h-full w-full"
              emojiClassName="text-8xl"
            />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 z-10 flex flex-col justify-end px-5 pb-5 pointer-events-none">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/70 mb-1">
            {slide.businessName}
          </p>
          <p className="text-xl font-extrabold text-white leading-tight drop-shadow-sm">
            {slide.headline}
          </p>
          {slide.mechanic && slide.id !== 'default' && (
            <span className="mt-2 inline-flex w-fit rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-semibold text-[#2b2827] shadow-sm">
              {getCustomerMechanicChipLabel(slide.mechanic)}
            </span>
          )}
        </div>
      </motion.button>

      {count > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === active ? 'true' : undefined}
              onClick={() => setActive(i)}
              className={cn(
                'h-[5px] rounded-full transition-all duration-300 border-0 cursor-pointer p-0',
                i === active ? 'w-5 bg-[#5b0e81]' : 'w-[5px] bg-[#e5e0dc]',
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}
