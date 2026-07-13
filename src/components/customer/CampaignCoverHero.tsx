import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { getCampaignTheme } from '@/lib/campaign-themes'

interface CampaignCoverHeroProps {
  mechanic: string
  className?: string
  children?: ReactNode
}

function StampCoverArt() {
  return (
    <div className="absolute inset-0 flex items-center justify-between px-4 pb-2 pt-8">
      <div className="flex flex-col gap-1 max-w-[45%]">
        <p className="text-[11px] font-extrabold uppercase tracking-wider text-amber-950/70">Stamp</p>
        <p className="text-lg font-extrabold leading-tight text-amber-950">Collect &amp; Win</p>
      </div>
      <div className="grid grid-cols-4 gap-1.5 shrink-0">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'size-7 rounded-full flex items-center justify-center text-[10px] shadow-sm',
              i < 5 ? 'bg-amber-600/80 text-white' : 'bg-white/40 text-amber-900/50 border border-white/50',
            )}
          >
            {i < 5 ? '☕' : i + 1}
          </div>
        ))}
      </div>
      <svg className="absolute left-6 bottom-3 size-14 opacity-90" viewBox="0 0 64 64" fill="none" aria-hidden>
        <ellipse cx="32" cy="52" rx="18" ry="4" fill="#92400e" opacity="0.2" />
        <path d="M22 28h20v18c0 4-4 8-10 8s-10-4-10-8V28z" fill="#fff" stroke="#b45309" strokeWidth="2" />
        <path d="M20 28h24v4H20z" fill="#fde68a" stroke="#b45309" strokeWidth="1.5" />
        <path d="M28 18c0-3 2-5 4-5s4 2 4 5" stroke="#b45309" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  )
}

function ShakeCoverArt() {
  return (
    <div className="absolute inset-0 flex items-end justify-between px-4 pb-3 pt-8">
      <div className="max-w-[52%] z-10">
        <p className="text-xl font-extrabold leading-tight text-white drop-shadow-sm">Shake &amp; Win</p>
        <p className="text-[11px] text-white/75 mt-1 leading-snug">Shake your phone to reveal your reward</p>
      </div>
      <div className="relative shrink-0 mr-1 mb-1">
        <div className="absolute -inset-3 rounded-full border border-white/15" />
        <div className="absolute -inset-6 rounded-full border border-white/10" />
        <div className="relative w-[72px] h-[120px] rounded-[14px] bg-[#4c1d95] border-2 border-white/25 shadow-lg rotate-12 overflow-hidden">
          <div className="absolute inset-x-2 top-2 h-1.5 rounded-full bg-white/20" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 pt-3">
            <span className="text-2xl">☕</span>
            <div className="flex gap-0.5">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1 h-2 bg-white/40 rounded-full" style={{ transform: `rotate(${(i - 1) * 15}deg)` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CheckInCoverArt() {
  return (
    <div className="absolute inset-0 flex items-end justify-between px-4 pb-3 pt-8">
      <div className="max-w-[48%] z-10">
        <p className="text-lg font-extrabold leading-tight text-white drop-shadow-sm">
          Check In <span className="text-emerald-100">&amp; WIN</span>
        </p>
        <p className="text-[11px] text-white/80 mt-1">Show up daily. Stack your points.</p>
      </div>
      <div className="shrink-0 w-[88px] rounded-xl bg-white/15 backdrop-blur-sm border border-white/25 p-2 mb-1">
        <p className="text-[8px] font-bold text-white/70 text-center mb-1.5">JUNE 2026</p>
        <div className="grid grid-cols-4 gap-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'size-4 rounded flex items-center justify-center text-[7px] font-bold',
                i < 5 ? 'bg-white text-emerald-700' : i === 5 ? 'bg-yellow-300 text-emerald-900' : 'bg-white/20 text-white/60',
              )}
            >
              {i < 5 ? '✓' : i === 5 ? '!' : ''}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SpinCoverArt() {
  const cx = 80
  const cy = 80
  const r = 58
  const slices = [
    { color: '#7C3AED', label: 'Win' },
    { color: '#EC4899', label: 'Prize' },
    { color: '#2A2660', label: 'Try' },
    { color: '#F59E0B', label: 'Off' },
    { color: '#06B6D4', label: 'Gift' },
    { color: '#1A1840', label: 'Luck' },
  ]
  let angle = -90
  return (
    <div className="absolute inset-0 flex items-end justify-between px-4 pb-3 pt-8">
      <div className="max-w-[52%] z-10">
        <p className="text-xl font-extrabold leading-tight text-white drop-shadow-sm">Spin a Wheel</p>
        <p className="text-[11px] text-white/75 mt-1 leading-snug">A flick of fortune at every checkout</p>
      </div>
      <div className="relative shrink-0 mr-1 mb-1">
        <div className="absolute -inset-3 rounded-full border border-white/15" />
        <div className="absolute -inset-6 rounded-full border border-white/10" />
        <svg width="120" height="120" viewBox="0 0 160 160" className="drop-shadow-lg">
          {slices.map((slice, i) => {
            const sweep = 360 / slices.length
            const start = (angle * Math.PI) / 180
            angle += sweep
            const end = (angle * Math.PI) / 180
            const x1 = cx + r * Math.cos(start)
            const y1 = cy + r * Math.sin(start)
            const x2 = cx + r * Math.cos(end)
            const y2 = cy + r * Math.sin(end)
            return (
              <path
                key={i}
                d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`}
                fill={slice.color}
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="1"
              />
            )
          })}
          <circle cx={cx} cy={cy} r="14" fill="#08071A" stroke="#F5C518" strokeWidth="2" />
          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="12">🎡</text>
        </svg>
      </div>
    </div>
  )
}

function DiceCoverArt() {
  const pips: Record<number, [number, number][]> = {
    2: [[30, 30], [70, 70]],
    5: [[30, 30], [70, 30], [50, 50], [30, 70], [70, 70]],
  }
  return (
    <div className="absolute inset-0 flex items-end justify-between px-4 pb-3 pt-8">
      <div className="max-w-[52%] z-10">
        <p className="text-xl font-extrabold leading-tight text-white drop-shadow-sm">Roll a Dice</p>
        <p className="text-[11px] text-white/75 mt-1 leading-snug">Roll the dice and win instantly</p>
      </div>
      <div className="relative shrink-0 mr-2 mb-1">
        <div className="absolute -inset-4 rounded-full border border-white/10" />
        <svg width="118" height="100" viewBox="0 0 118 100" className="drop-shadow-lg">
          <g transform="rotate(-12 40 55)">
            <rect x="12" y="30" width="52" height="52" rx="12" fill="#ffffff" />
            {pips[5]!.map(([px, py], i) => (
              <circle key={i} cx={12 + (px / 100) * 52} cy={30 + (py / 100) * 52} r="4.5" fill="#9f1239" />
            ))}
          </g>
          <g transform="rotate(14 82 50)">
            <rect x="58" y="18" width="44" height="44" rx="10" fill="#ffe4e6" />
            {pips[2]!.map(([px, py], i) => (
              <circle key={i} cx={58 + (px / 100) * 44} cy={18 + (py / 100) * 44} r="4" fill="#9f1239" />
            ))}
          </g>
        </svg>
      </div>
    </div>
  )
}

function LotteryCoverArt() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="relative size-24 rotate-12 rounded-xl border-2 border-amber-800/15 bg-white/55 shadow-lg flex items-center justify-center">
        <span className="text-4xl">🎟️</span>
      </div>
    </div>
  )
}

function BuyXGetYCoverArt() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="relative size-24 -rotate-6 rounded-xl border-2 border-orange-800/15 bg-white/55 shadow-lg flex items-center justify-center">
        <span className="text-4xl">💰</span>
      </div>
    </div>
  )
}

function CouponCoverArt() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="relative size-24 rotate-6 rounded-xl border-2 border-white/30 bg-white/10 shadow-lg flex items-center justify-center">
        <span className="text-4xl">🎫</span>
      </div>
    </div>
  )
}

function FlashCoverArt() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="relative size-24 -rotate-3 rounded-xl border-2 border-white/30 bg-white/10 shadow-lg flex items-center justify-center">
        <span className="text-4xl">⚡</span>
      </div>
    </div>
  )
}

function ComboCoverArt() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="relative size-24 rotate-3 rounded-xl border-2 border-white/30 bg-white/10 shadow-lg flex items-center justify-center">
        <span className="text-4xl">🎁</span>
      </div>
    </div>
  )
}

function FriendCoverArt() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="relative size-24 rotate-3 rounded-xl border-2 border-white/30 bg-white/10 shadow-lg flex items-center justify-center">
        <span className="text-4xl">👫</span>
      </div>
    </div>
  )
}

function GroupUnlockCoverArt() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="relative size-24 -rotate-2 rounded-xl border-2 border-white/30 bg-white/10 shadow-lg flex items-center justify-center">
        <span className="text-4xl">🤝</span>
      </div>
    </div>
  )
}

function CoverArt({ mechanic }: { mechanic: string }) {
  if (mechanic === 'stamp') return <StampCoverArt />
  if (mechanic === 'check-in-loyalty') return <CheckInCoverArt />
  if (mechanic === 'spin') return <SpinCoverArt />
  if (mechanic === 'dice') return <DiceCoverArt />
  if (mechanic === 'lottery') return <LotteryCoverArt />
  if (mechanic === 'buy-x-get-y') return <BuyXGetYCoverArt />
  if (mechanic === 'coupon') return <CouponCoverArt />
  if (mechanic === 'flash') return <FlashCoverArt />
  if (mechanic === 'combo') return <ComboCoverArt />
  if (mechanic === 'friend') return <FriendCoverArt />
  if (mechanic === 'groupunlock') return <GroupUnlockCoverArt />
  return <ShakeCoverArt />
}

export function CampaignCoverHero({ mechanic, className, children }: CampaignCoverHeroProps) {
  const theme = getCampaignTheme(mechanic)

  return (
    <div className={cn('relative h-44 overflow-hidden', className)} style={{ background: theme.gradient }}>
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '18px 18px',
        }}
      />
      <CoverArt mechanic={mechanic} />
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
  return (
    <span
      className={cn(
        'absolute top-3 left-3 text-[10px] font-bold px-2.5 py-0.5 rounded-full',
        theme.badgeBg,
        theme.badgeText,
        className,
      )}
    >
      {theme.chipLabel}
    </span>
  )
}
