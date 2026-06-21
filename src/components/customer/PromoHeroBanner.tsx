import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { PanInfo } from 'framer-motion'
import { cn } from '@/lib/utils'
import { getCampaignGradient } from '@/lib/customer-ui'
import type { BusinessWithCampaigns } from '@/lib/api'

interface PromoHeroBannerProps {
  businesses?: BusinessWithCampaigns[]
  className?: string
}

type Slide = {
  id: string
  title: string
  subtitle: string
  mechanic: string
  href: string
  cover?: string
  brandColor: string
}

export function PromoHeroBanner({ businesses = [], className }: PromoHeroBannerProps) {
  const navigate = useNavigate()
  const [active, setActive] = useState(0)

  const slides = useMemo((): Slide[] => {
    const fromCampaigns: Slide[] = []
    for (const biz of businesses) {
      for (const c of biz.campaigns.slice(0, 1)) {
        fromCampaigns.push({
          id: c.id,
          title: c.name,
          subtitle: biz.name,
          mechanic: c.mechanic,
          href: `/customer/campaigns/${c.id}`,
          cover: biz.coverBannerData,
          brandColor: biz.brandColor,
        })
      }
      if (fromCampaigns.length >= 5) break
    }
    if (fromCampaigns.length > 0) return fromCampaigns.slice(0, 5)

    return [
      {
        id: 'default',
        title: 'Rewards near you',
        subtitle: 'Discover local deals',
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
    if (count <= 1) return
    const t = setInterval(() => go(1), 6000)
    return () => clearInterval(t)
  }, [count, go])

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -40) go(1)
    else if (info.offset.x > 40) go(-1)
  }

  const slide = slides[active]!
  const grad = getCampaignGradient(slide.mechanic)

  return (
    <div className={cn('relative', className)}>
      <motion.button
        type="button"
        onClick={() => navigate(slide.href)}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.12}
        onDragEnd={onDragEnd}
        className="relative h-[165px] w-full rounded-[20px] overflow-hidden border-0 cursor-pointer p-0 text-left"
        style={{
          background: slide.cover
            ? undefined
            : `linear-gradient(135deg, ${grad.from}, ${grad.to})`,
        }}
      >
        {slide.cover && (
          <>
            <img src={slide.cover} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/35 to-transparent" />
          </>
        )}
        <div className="relative z-10 h-full flex flex-col justify-end px-5 pb-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/75 mb-1">
            {slide.subtitle}
          </p>
          <p className="text-lg font-extrabold text-white leading-tight">{slide.title}</p>
        </div>
      </motion.button>

      {count > 1 && (
        <div className="flex justify-center gap-1.5 mt-2">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setActive(i)}
              className={cn(
                'size-[5px] rounded-full transition-colors border-0 cursor-pointer p-0',
                i === active ? 'bg-[#5b0e81]' : 'bg-[#e5e0dc]',
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}
