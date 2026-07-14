import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { getCampaignTheme } from '@/lib/campaign-themes'
import { getHeroCover } from '@/lib/hero-cover-data'

/** Uniform listing-card cover height for all 12 mechanics. */
export const LIST_COVER_HEIGHT = 'h-44'

interface CampaignCoverHeroProps {
  mechanic: string
  /** 'list' for campaign cards, 'detail' for PIN/detail heroes. */
  variant?: 'list' | 'detail'
  className?: string
  children?: ReactNode
  /** Detail: custom right-side badge instead of Active / badgeRight. */
  headerRight?: string
  showStatusBadge?: boolean
}

function ListCoverContent({ mechanic }: { mechanic: string }) {
  const hero = getHeroCover(mechanic)
  const Art = hero.art
  const hasFeatures = Boolean(hero.features?.length)
  // Slightly smaller art when the feature row must also fit in h-44
  const artSize = hasFeatures ? 'w-20 h-20' : 'w-24 h-24'

  return (
    <div className="flex h-full flex-col px-3 pb-2.5 pt-9">
      {/* Headline + art — packed, no free vertical gap */}
      <div className="flex min-h-0 flex-1 items-center justify-between gap-2">
        <div className="max-w-[55%] min-w-0">
          <p className="text-base font-extrabold leading-tight" style={{ color: hero.textColor }}>
            {hero.headline}
            {hero.headlineAccent ? (
              <>
                {' '}
                <span style={{ color: hero.accentColor ?? hero.textColor }}>{hero.headlineAccent}</span>
              </>
            ) : null}
          </p>
          <p className="mt-0.5 text-[10px] leading-snug opacity-80 line-clamp-2" style={{ color: hero.textColor }}>
            {hero.tagline}
          </p>
        </div>
        {Art ? (
          <motion.div
            className={cn(artSize, 'shrink-0')}
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Art className="w-full h-full" />
          </motion.div>
        ) : null}
      </div>

      {/* Feature chips sit flush under the hero row — no empty band */}
      {hasFeatures && (
        <div className="mt-2 shrink-0 rounded-xl bg-white/45 backdrop-blur-sm px-1.5 py-1.5 flex items-center gap-0.5">
          {hero.features!.map((f, fi) => (
            <div key={fi} className="flex items-center gap-1 flex-1 min-w-0">
              <div
                className="size-6 rounded-full shrink-0 flex items-center justify-center"
                style={{ background: hero.accentColor ?? hero.textColor }}
              >
                <f.icon className="size-3 text-white" />
              </div>
              <span
                className="text-[8px] leading-tight font-medium line-clamp-2"
                style={{ color: hero.textColor }}
              >
                {f.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function DetailCoverContent({ mechanic }: { mechanic: string }) {
  const hero = getHeroCover(mechanic)
  const Art = hero.art

  return (
    <div className="relative flex h-full flex-col justify-between px-5 pb-10 pt-24">
      <div className="flex items-center justify-between gap-3">
        <div className="max-w-[55%] min-w-0">
          <p className="text-2xl font-extrabold leading-tight" style={{ color: hero.textColor }}>
            {hero.headline}
          </p>
          {hero.headlineAccent && (
            <p
              className="text-2xl font-extrabold leading-tight"
              style={{ color: hero.accentColor ?? hero.textColor }}
            >
              {hero.headlineAccent}
            </p>
          )}
          <p className="mt-1.5 text-xs leading-snug opacity-80" style={{ color: hero.textColor }}>
            {hero.tagline}
          </p>
        </div>
        {Art ? (
          <motion.div
            className="w-32 h-32 shrink-0"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Art className="w-full h-full" />
          </motion.div>
        ) : null}
      </div>

      {(hero.features || hero.footerBanner) && (
        <div className="mt-3 flex flex-col gap-2 shrink-0">
          {hero.features && (
            <div className="rounded-xl bg-white/40 backdrop-blur-sm px-3 py-2.5 flex items-center gap-2">
              {hero.features.map((f, fi) => (
                <div key={fi} className="flex items-center gap-1.5 flex-1 min-w-0">
                  <div
                    className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center"
                    style={{ background: hero.accentColor ?? hero.textColor }}
                  >
                    <f.icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-[10px] leading-tight font-medium" style={{ color: hero.textColor }}>
                    {f.label}
                  </span>
                </div>
              ))}
            </div>
          )}
          {hero.footerBanner && (
            <div className="rounded-xl bg-white/60 backdrop-blur-sm px-4 py-3 flex items-center justify-center">
              <span
                className="text-xs font-bold text-center"
                style={{ color: hero.accentColor ?? hero.textColor }}
              >
                {hero.footerBanner}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function CampaignCoverHero({
  mechanic,
  variant = 'list',
  className,
  children,
  headerRight,
  showStatusBadge = true,
}: CampaignCoverHeroProps) {
  const hero = getHeroCover(mechanic)
  const theme = getCampaignTheme(mechanic)
  const heightClass = variant === 'detail' ? hero.detailCoverClass : LIST_COVER_HEIGHT
  const rightBadge =
    headerRight ??
    (showStatusBadge ? hero.badgeRight ?? 'Active' : undefined)
  const isCustomRight = Boolean(headerRight || hero.badgeRight)

  return (
    <div
      className={cn('relative overflow-hidden', heightClass, className)}
      style={{ background: `linear-gradient(135deg, ${hero.bgFrom}, ${hero.bgTo})` }}
    >
      <span
        className="absolute top-6 right-24 w-1.5 h-1.5 rounded-full pointer-events-none"
        style={{ background: hero.textColor, opacity: 0.25 }}
      />
      <span
        className="absolute bottom-8 left-28 w-1 h-1 rounded-full pointer-events-none"
        style={{ background: hero.textColor, opacity: 0.3 }}
      />

      {variant === 'detail' ? (
        <DetailCoverContent mechanic={mechanic} />
      ) : (
        <ListCoverContent mechanic={mechanic} />
      )}

      {variant === 'detail' ? (
        <div className="absolute top-[max(2.75rem,env(safe-area-inset-top))] right-4 z-10 flex flex-col items-end gap-1.5">
          <span
            className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/70"
            style={{ color: hero.badgeTextColor ?? hero.textColor }}
          >
            {theme.coverBadgeLabel}
          </span>
          {rightBadge && (
            <span
              className={cn(
                'text-[10px] font-bold px-2.5 py-0.5 rounded-full max-w-[130px] leading-tight text-right',
                isCustomRight
                  ? 'bg-black/25 backdrop-blur-md text-white'
                  : 'bg-[#D1FAE5] text-[#065F46]',
              )}
            >
              {rightBadge}
            </span>
          )}
        </div>
      ) : (
        <>
          <span
            className="absolute top-2.5 left-3 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/70 z-10"
            style={{ color: hero.badgeTextColor ?? hero.textColor }}
          >
            {theme.coverBadgeLabel}
          </span>
          {rightBadge && (
            <span
              className={cn(
                'absolute top-2.5 right-3 text-[10px] font-bold px-2.5 py-0.5 rounded-full z-10 max-w-[120px] leading-tight text-right',
                isCustomRight
                  ? 'bg-black/25 backdrop-blur-md text-white'
                  : 'bg-[#D1FAE5] text-[#065F46]',
              )}
            >
              {rightBadge}
            </span>
          )}
        </>
      )}

      {children}
    </div>
  )
}

export function CampaignCoverBadge({
  mechanic,
  className,
}: {
  mechanic: string
  className?: string
}) {
  const theme = getCampaignTheme(mechanic)
  const hero = getHeroCover(mechanic)
  return (
    <span
      className={cn(
        'absolute top-2.5 left-3 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/70 z-10',
        className,
      )}
      style={{ color: hero.badgeTextColor ?? hero.textColor }}
    >
      {theme.coverBadgeLabel}
    </span>
  )
}
