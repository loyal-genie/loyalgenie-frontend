import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface BusinessCoverHeroProps {
  coverBannerData?: string
  brandColor: string
  fallbackEmoji?: string
  className?: string
  emojiClassName?: string
  children?: ReactNode
}

export function BusinessCoverHero({
  coverBannerData,
  brandColor,
  fallbackEmoji,
  className,
  emojiClassName,
  children,
}: BusinessCoverHeroProps) {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      {coverBannerData ? (
        <>
          <img
            src={coverBannerData}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-black/10" />
        </>
      ) : (
        <>
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(160deg, ${brandColor} 0%, ${brandColor}aa 40%, #1e1b4b 100%)`,
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
          {fallbackEmoji && (
            <span
              className={cn(
                'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-15 select-none',
                emojiClassName ?? 'text-9xl',
              )}
            >
              {fallbackEmoji}
            </span>
          )}
        </>
      )}
      {children}
    </div>
  )
}
