
import { useId } from 'react'

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function wedgePath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle)
  const end = polarToCartesian(cx, cy, r, startAngle)
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`
}

function burstPath(cx: number, cy: number, rOuter: number, rInner: number, points: number) {
  const pts: string[] = []
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? rOuter : rInner
    const angle = (i * Math.PI) / points
    pts.push(`${cx + r * Math.sin(angle)},${cy - r * Math.cos(angle)}`)
  }
  return `M ${pts.join(' L ')} Z`
}

function heartPath(cx: number, cy: number, s: number) {
  return `M ${cx},${cy + s * 0.32} C ${cx - s},${cy - s * 0.4} ${cx - s * 0.5},${cy - s} ${cx},${cy - s * 0.32} C ${cx + s * 0.5},${cy - s} ${cx + s},${cy - s * 0.4} ${cx},${cy + s * 0.32} Z`
}

const WHEEL_SLICES = ['☕', '🏷️', '🧁', '⭐', '🏷️', '🧁']

export function SpinWheelArt({ className = '' }: { className?: string }) {
  const rawId = useId()
  const gid = `sw-${rawId.replace(/[^a-zA-Z0-9]/g, '')}`
  const cx = 60, cy = 56, r = 42

  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <defs>
        <radialGradient id={`${gid}-hub`} cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#D97706" />
        </radialGradient>
        <filter id={`${gid}-shadow`} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#4C1D95" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* pedestal */}
      <rect x="46" y="100" width="28" height="7" rx="3.5" fill="#4C1D95" opacity="0.55" />
      <rect x="55" y="94" width="10" height="10" rx="2" fill="#4C1D95" opacity="0.55" />

      {/* wheel */}
      <g filter={`url(#${gid}-shadow)`}>
        <circle cx={cx} cy={cy} r={r + 4} fill="#4C1D95" />
        {WHEEL_SLICES.map((emoji, i) => {
          const startAngle = i * 60
          const endAngle = startAngle + 60
          const mid = (startAngle + endAngle) / 2
          const labelPos = polarToCartesian(cx, cy, r * 0.62, mid)
          const isPurple = i % 2 === 0
          return (
            <g key={i}>
              <path d={wedgePath(cx, cy, r, startAngle, endAngle)} fill={isPurple ? '#7C3AED' : '#FFFFFF'} />
              <text
                x={labelPos.x}
                y={labelPos.y}
                fontSize="11"
                textAnchor="middle"
                dominantBaseline="central"
              >
                {emoji}
              </text>
            </g>
          )
        })}
        <circle cx={cx} cy={cy} r={r + 4} fill="none" stroke="#4C1D95" strokeWidth="2.5" />
        {/* rim bulbs */}
        {Array.from({ length: 12 }, (_, i) => {
          const p = polarToCartesian(cx, cy, r + 4, i * 30)
          return <circle key={i} cx={p.x} cy={p.y} r="1.6" fill="#FFFFFF" />
        })}
      </g>

      {/* pointer */}
      <path d={`M ${cx} 6 L ${cx - 6} 16 L ${cx + 6} 16 Z`} fill="#F59E0B" stroke="#B45309" strokeWidth="1" />

      {/* hub */}
      <circle cx={cx} cy={cy} r="9" fill={`url(#${gid}-hub)`} stroke="#B45309" strokeWidth="1" />
      <circle cx={cx - 2.5} cy={cy - 2.5} r="2.2" fill="#FFFBEB" opacity="0.8" />
    </svg>
  )
}

export function RollDiceArt({ className = '' }: { className?: string }) {
  const rawId = useId()
  const gid = `rd-${rawId.replace(/[^a-zA-Z0-9]/g, '')}`

  return (
    <svg viewBox="0 0 150 130" className={className} aria-hidden="true">
      <defs>
        <filter id={`${gid}-shadow`} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#831843" floodOpacity="0.28" />
        </filter>
      </defs>

      {/* ground shadow */}
      <ellipse cx="78" cy="114" rx="46" ry="7" fill="#831843" opacity="0.15" />

      {/* back die — smaller, blush, single pip */}
      <g filter={`url(#${gid}-shadow)`} transform="rotate(16 100 40)">
        <rect x="70" y="10" width="60" height="60" rx="16" fill="#FBE7EF" />
        <circle cx="100" cy="40" r="6" fill="#BE185D" />
      </g>

      {/* front die — bigger, white, five pips */}
      <g filter={`url(#${gid}-shadow)`} transform="rotate(-10 62 78)">
        <rect x="22" y="38" width="80" height="80" rx="20" fill="#FFFFFF" />
        <circle cx="42" cy="58" r="6.5" fill="#9D174D" />
        <circle cx="82" cy="58" r="6.5" fill="#9D174D" />
        <circle cx="62" cy="78" r="6.5" fill="#9D174D" />
        <circle cx="42" cy="98" r="6.5" fill="#9D174D" />
        <circle cx="82" cy="98" r="6.5" fill="#9D174D" />
      </g>
    </svg>
  )
}

export function CouponTicketArt({ className = '' }: { className?: string }) {
  const rawId = useId()
  const gid = `ct-${rawId.replace(/[^a-zA-Z0-9]/g, '')}`
  const perfX = 108
  const holes = Array.from({ length: 6 }, (_, i) => 22 + i * 10)

  return (
    <svg viewBox="0 0 170 100" className={className} aria-hidden="true">
      <defs>
        <filter id={`${gid}-shadow`} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#0B4A5C" floodOpacity="0.28" />
        </filter>
      </defs>

      <g filter={`url(#${gid}-shadow)`}>
        <rect x="10" y="14" width="140" height="72" rx="10" fill="#ECFBFE" />
        {/* perforation notches */}
        <circle cx={perfX} cy="14" r="6" fill="#06B6D4" />
        <circle cx={perfX} cy="86" r="6" fill="#06B6D4" />
        <line x1={perfX} y1="24" x2={perfX} y2="76" stroke="#06B6D4" strokeWidth="2" strokeDasharray="4 4" />

        {/* left zone: tag icon + code lines */}
        <rect x="28" y="34" width="16" height="12" rx="2" fill="none" stroke="#0E7490" strokeWidth="2.5" transform="rotate(-8 36 40)" />
        <circle cx="32" cy="38" r="1.4" fill="#0E7490" transform="rotate(-8 36 40)" />
        <rect x="50" y="38" width="42" height="4" rx="2" fill="#67E8F9" />
        <rect x="50" y="48" width="30" height="4" rx="2" fill="#A5F3FC" />

        {/* barcode */}
        {holes.map((y, i) => (
          <rect key={i} x={120 + (i % 3) * 6} y="30" width={i % 2 === 0 ? 2.5 : 1.5} height="40" fill="#0B4A5C" opacity="0.85" />
        ))}
      </g>

      {/* percent starburst badge */}
      <g filter={`url(#${gid}-shadow)`}>
        <path d={burstPath(148, 82, 20, 15, 10)} fill="#06B6D4" />
        <text x="148" y="82" fontSize="15" fontWeight="700" fill="#FFFFFF" textAnchor="middle" dominantBaseline="central">%</text>
      </g>
    </svg>
  )
}

export function BundleGiftArt({ className = '' }: { className?: string }) {
  const rawId = useId()
  const gid = `bg-${rawId.replace(/[^a-zA-Z0-9]/g, '')}`

  return (
    <svg viewBox="0 0 170 130" className={className} aria-hidden="true">
      <defs>
        <filter id={`${gid}-shadow`} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#3730A3" floodOpacity="0.3" />
        </filter>
      </defs>

      <ellipse cx="82" cy="122" rx="60" ry="6" fill="#3730A3" opacity="0.15" />

      <g filter={`url(#${gid}-shadow)`}>
        {/* back bag (tan) */}
        <path d="M62,52 L108,52 L114,116 L56,116 Z" fill="#E9D5A1" stroke="#3730A3" strokeWidth="2" strokeLinejoin="round" />
        <path d="M72,52 C72,40 98,40 98,52" fill="none" stroke="#3730A3" strokeWidth="3" strokeLinecap="round" />

        {/* front bag (purple) */}
        <path d="M18,60 L64,60 L70,120 L12,120 Z" fill="#8B5CF6" stroke="#3730A3" strokeWidth="2" strokeLinejoin="round" />
        <path d="M28,60 C28,49 54,49 54,60" fill="none" stroke="#3730A3" strokeWidth="3" strokeLinecap="round" />
        {/* tag on front bag */}
        <rect x="26" y="80" width="18" height="13" rx="2" fill="#FDE68A" stroke="#3730A3" strokeWidth="1.5" transform="rotate(-10 35 86)" />
        <circle cx="30" cy="84" r="1.6" fill="#3730A3" transform="rotate(-10 35 86)" />

        {/* gift box */}
        <rect x="112" y="82" width="42" height="36" rx="3" fill="#7C3AED" stroke="#3730A3" strokeWidth="2" />
        <rect x="112" y="82" width="42" height="10" fill="#6D28D9" stroke="#3730A3" strokeWidth="2" />
        <rect x="129" y="82" width="8" height="36" fill="#FDE68A" />
        <path d="M124,82 C118,70 128,66 133,78 C138,66 148,70 142,82 Z" fill="#FDE68A" stroke="#3730A3" strokeWidth="1.5" strokeLinejoin="round" />
      </g>

      {/* best-value starburst */}
      <g filter={`url(#${gid}-shadow)`}>
        <path d={burstPath(78, 70, 19, 14, 10)} fill="#F59E0B" />
        <path d="M78,63 L80.5,68.5 L86,70 L80.5,71.5 L78,77 L75.5,71.5 L70,70 L75.5,68.5 Z" fill="#FFFFFF" />
      </g>
    </svg>
  )
}

export function FlashClockArt({ className = '' }: { className?: string }) {
  const rawId = useId()
  const gid = `fc-${rawId.replace(/[^a-zA-Z0-9]/g, '')}`
  const cx = 60, cy = 66, r = 38

  return (
    <svg viewBox="0 0 120 130" className={className} aria-hidden="true">
      <defs>
        <filter id={`${gid}-shadow`} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#172554" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* small bolt accents */}
      <path d="M14,30 L20,44 L13,44 L19,58 L6,40 L13,40 Z" fill="#FBBF24" opacity="0.55" />
      <path d="M104,86 L108,95 L103,95 L107,105 L98,92 L103,92 Z" fill="#FBBF24" opacity="0.5" />

      {/* crown buttons */}
      <rect x="52" y="10" width="16" height="12" rx="3" fill="#1E3A8A" />
      <rect x="26" y="20" width="10" height="8" rx="2" fill="#1E3A8A" transform="rotate(-35 31 24)" />
      <rect x="84" y="20" width="10" height="8" rx="2" fill="#1E3A8A" transform="rotate(35 89 24)" />

      <g filter={`url(#${gid}-shadow)`}>
        <circle cx={cx} cy={cy} r={r + 6} fill="#1E3A8A" />
        <circle cx={cx} cy={cy} r={r} fill="#FFFFFF" />
        {Array.from({ length: 12 }, (_, i) => {
          const outer = polarToCartesian(cx, cy, r - 3, i * 30)
          const inner = polarToCartesian(cx, cy, r - 8, i * 30)
          return <line key={i} x1={outer.x} y1={outer.y} x2={inner.x} y2={inner.y} stroke="#1E3A8A" strokeWidth="2" strokeLinecap="round" />
        })}
        {/* bolt hand */}
        <path d={`M ${cx + 2},${cy - 22} L ${cx - 10},${cy + 2} L ${cx - 1},${cy + 2} L ${cx - 6},${cy + 24} L ${cx + 12},${cy - 4} L ${cx + 3},${cy - 4} Z`} fill="#F59E0B" />
        <circle cx={cx} cy={cy} r="4" fill="#1E3A8A" />
      </g>
    </svg>
  )
}

export function LotteryDrawArt({ className = '' }: { className?: string }) {
  const rawId = useId()
  const gid = `ld-${rawId.replace(/[^a-zA-Z0-9]/g, '')}`
  const boxCx = 65, boxTop = 78
  const rays = Array.from({ length: 8 }, (_, i) => {
    const inner = polarToCartesian(boxCx, boxTop - 4, 14, i * 45)
    const outer = polarToCartesian(boxCx, boxTop - 4, 46, i * 45)
    return { inner, outer }
  })

  return (
    <svg viewBox="0 0 150 150" className={className} aria-hidden="true">
      <defs>
        <filter id={`${gid}-shadow`} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#4C3FA8" floodOpacity="0.3" />
        </filter>
        <linearGradient id={`${gid}-box`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9B8FF5" />
          <stop offset="100%" stopColor="#6D5DD3" />
        </linearGradient>
      </defs>

      {/* light-ray burst from the box opening */}
      <g opacity="0.35">
        {rays.map((ray, i) => (
          <line key={i} x1={ray.inner.x} y1={ray.inner.y} x2={ray.outer.x} y2={ray.outer.y}
            stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
        ))}
      </g>

      {/* warm glow at the box opening */}
      <circle cx={boxCx} cy={boxTop - 2} r="30" fill="#FDE68A" opacity="0.28" />
      <circle cx={boxCx} cy={boxTop - 2} r="16" fill="#FEF3C7" opacity="0.45" />

      {/* ticket rising out of the box */}
      <g transform={`rotate(-8 ${boxCx + 6} 55)`}>
        <rect x="45" y="18" width="46" height="64" rx="6" fill="#FCFBFF" stroke="#7C6EF0" strokeWidth="2" />
        <text x="68" y="38" fontSize="10" fontWeight="800" textAnchor="middle" fill="#4C1D95">YOUR</text>
        <text x="68" y="50" fontSize="10" fontWeight="800" textAnchor="middle" fill="#7C3AED">TICKET</text>
        <line x1="51" y1="60" x2="85" y2="60" stroke="#C4B5FD" strokeWidth="1.5" strokeDasharray="3 3" />
        <path d={burstPath(68, 71, 7, 3, 5)} fill="#7C6EF0" />
      </g>

      {/* main gift box */}
      <g filter={`url(#${gid}-shadow)`}>
        <rect x="35" y={boxTop} width="60" height="48" rx="5" fill={`url(#${gid}-box)`} />
        <rect x="59" y={boxTop} width="12" height="48" fill="#FBBF24" />
        <ellipse cx={boxCx} cy={boxTop} rx="30" ry="6" fill="#5B4FC7" />
        <path d={burstPath(65, 106, 9, 4, 5)} fill="#FBBF24" />
      </g>

      {/* small ribboned gift box */}
      <g filter={`url(#${gid}-shadow)`}>
        <rect x="102" y="104" width="30" height="26" rx="3" fill="#7C6EF0" />
        <rect x="102" y="104" width="30" height="7" fill="#6D28D9" />
        <rect x="114" y="104" width="6" height="26" fill="#FBBF24" />
        <path d="M108,104 C104,96 112,92 117,100 C122,92 130,96 126,104 Z" fill="#FBBF24" stroke="#B45309" strokeWidth="1" strokeLinejoin="round" />
      </g>

      {/* coin stack */}
      <g filter={`url(#${gid}-shadow)`}>
        <ellipse cx="24" cy="120" rx="13" ry="10" fill="#F59E0B" />
        <ellipse cx="24" cy="114" rx="13" ry="10" fill="#FBBF24" />
        <path d={burstPath(24, 114, 5.5, 2.5, 5)} fill="#B45309" />
      </g>

      {/* confetti + sparkles */}
      <rect x="10" y="24" width="6" height="15" rx="2" fill="#7C6EF0" transform="rotate(20 13 31)" />
      <rect x="126" y="20" width="5" height="13" rx="2" fill="#F472B6" transform="rotate(-15 128 26)" />
      <rect x="118" y="70" width="5" height="11" rx="2" fill="#4ADE80" transform="rotate(12 120 75)" />
      <text x="16" y="60" fontSize="14" fill="#C4B5FD">✦</text>
      <text x="132" y="52" fontSize="11" fill="#FBBF24">✦</text>
      <text x="100" y="20" fontSize="9" fill="#A78BFA">✦</text>
      <text x="30" y="16" fontSize="9" fill="#FBBF24">✦</text>
    </svg>
  )
}

export function SpendGetArt({ className = '' }: { className?: string }) {
  const rawId = useId()
  const gid = `sg-${rawId.replace(/[^a-zA-Z0-9]/g, '')}`

  return (
    <svg viewBox="0 0 170 120" className={className} aria-hidden="true">
      <defs>
        <filter id={`${gid}-shadow`} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#14532D" floodOpacity="0.3" />
        </filter>
      </defs>

      <ellipse cx="80" cy="112" rx="55" ry="5" fill="#14532D" opacity="0.15" />

      <g filter={`url(#${gid}-shadow)`}>
        {/* gift box, tucked behind */}
        <rect x="86" y="58" width="30" height="26" rx="2" fill="#15803D" stroke="#14532D" strokeWidth="1.5" />
        <rect x="86" y="58" width="30" height="7" fill="#14532D" stroke="#14532D" strokeWidth="1.5" />
        <rect x="98" y="58" width="6" height="26" fill="#BBF7D0" />

        {/* bag with X */}
        <path d="M18,44 L64,44 L70,104 L12,104 Z" fill="#16A34A" stroke="#14532D" strokeWidth="2" strokeLinejoin="round" />
        <path d="M28,44 C28,33 54,33 54,44" fill="none" stroke="#14532D" strokeWidth="3" strokeLinecap="round" />
        <text x="41" y="82" fontSize="26" fontWeight="800" fill="#FFFFFF" textAnchor="middle">X</text>

        {/* arrow */}
        <path d="M74,74 L92,74" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
        <path d="M87,68 L93,74 L87,80" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {/* tag with Y */}
        <rect x="118" y="68" width="38" height="30" rx="4" fill="#DCFCE7" stroke="#14532D" strokeWidth="2" transform="rotate(-6 137 83)" />
        <circle cx="126" cy="76" r="2.2" fill="#14532D" transform="rotate(-6 137 83)" />
        <text x="139" y="90" fontSize="20" fontWeight="800" fill="#15803D" textAnchor="middle" transform="rotate(-6 137 83)">Y</text>
      </g>
    </svg>
  )
}

export function FriendHeartArt({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 100" className={className} aria-hidden="true">
      <path d={heartPath(96, 18, 8)} fill="#FB7185" opacity="0.5" />
      <path d={heartPath(18, 14, 5)} fill="#FB7185" opacity="0.35" />

      <path d={heartPath(60, 26, 13)} fill="#F43F5E" />

      {/* person 1 (back, lighter) */}
      <circle cx="38" cy="52" r="13" fill="#FECDD3" />
      <path d="M18,96 C18,74 58,74 58,96 Z" fill="#FECDD3" />

      {/* person 2 (front, deeper) */}
      <circle cx="76" cy="56" r="15" fill="#FDA4AF" />
      <path d="M52,98 C52,72 100,72 100,98 Z" fill="#FDA4AF" />
    </svg>
  )
}

export function CheckInCalendarArt({ className = '' }: { className?: string }) {
  const rawId = useId()
  const gid = `ci-${rawId.replace(/[^a-zA-Z0-9]/g, '')}`
  const cells: (true | 'warn' | false)[] = [true, true, true, true, true, 'warn', false, false]

  return (
    <svg viewBox="0 0 130 120" className={className} aria-hidden="true">
      <defs>
        <filter id={`${gid}-shadow`} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#065F46" floodOpacity="0.35" />
        </filter>
      </defs>

      <g filter={`url(#${gid}-shadow)`}>
        <rect x="8" y="10" width="114" height="100" rx="18" fill="#FFFFFF" opacity="0.16" />
        <rect x="8" y="10" width="114" height="100" rx="18" fill="none" stroke="#FFFFFF" strokeOpacity="0.35" strokeWidth="1.5" />

        {cells.map((c, i) => {
          const col = i % 4
          const row = Math.floor(i / 4)
          const x = 22 + col * 24
          const y = 30 + row * 40
          const isWarn = c === 'warn'
          const isDone = c === true
          return (
            <g key={i}>
              <rect
                x={x} y={y} width="18" height="18" rx="6"
                fill={isWarn ? '#FBBF24' : '#FFFFFF'}
                opacity={isDone ? 1 : isWarn ? 1 : 0.25}
              />
              {isDone && (
                <path
                  d={`M ${x + 4},${y + 9.5} L ${x + 7.5},${y + 13} L ${x + 14},${y + 5.5}`}
                  stroke="#059669" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round"
                />
              )}
              {isWarn && (
                <text x={x + 9} y={y + 13.5} fontSize="12" fontWeight="800" textAnchor="middle" fill="#78350F">!</text>
              )}
            </g>
          )
        })}
      </g>
    </svg>
  )
}

export function StampCupArt({ className = '' }: { className?: string }) {
  const rawId = useId()
  const gid = `sc-${rawId.replace(/[^a-zA-Z0-9]/g, '')}`
  const cells: (true | number)[] = [true, true, true, true, true, 6, 7, 8]

  return (
    <svg viewBox="0 0 130 120" className={className} aria-hidden="true">
      <defs>
        <filter id={`${gid}-shadow`} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#78350F" floodOpacity="0.35" />
        </filter>
      </defs>

      <g filter={`url(#${gid}-shadow)`}>
        {cells.map((c, i) => {
          const col = i % 4
          const row = Math.floor(i / 4)
          const cx = 26 + col * 26
          const cy = 30 + row * 42
          const isFilled = c === true
          return (
            <g key={i}>
              <circle cx={cx} cy={cy} r="13" fill={isFilled ? '#B45309' : '#FDE9C4'} opacity={isFilled ? 1 : 0.75} />
              {isFilled ? (
                <text x={cx} y={cy + 5} fontSize="13" textAnchor="middle">☕</text>
              ) : (
                <text x={cx} y={cy + 4.5} fontSize="11" fontWeight="800" textAnchor="middle" fill="#B45309" opacity="0.55">{c}</text>
              )}
            </g>
          )
        })}
      </g>
    </svg>
  )
}

export function ShakePhoneArt({ className = '' }: { className?: string }) {
  const rawId = useId()
  const gid = `sh-${rawId.replace(/[^a-zA-Z0-9]/g, '')}`

  return (
    <svg viewBox="0 0 120 140" className={className} aria-hidden="true">
      <defs>
        <filter id={`${gid}-shadow`} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#3B0764" floodOpacity="0.35" />
        </filter>
        <linearGradient id={`${gid}-screen`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EDE4FF" />
          <stop offset="100%" stopColor="#C4B5FD" />
        </linearGradient>
      </defs>

      {/* motion rings */}
      <ellipse cx="60" cy="72" rx="52" ry="58" fill="none" stroke="#FFFFFF" strokeOpacity="0.3" strokeWidth="2" strokeDasharray="4 7" />
      <ellipse cx="60" cy="72" rx="40" ry="46" fill="none" stroke="#FFFFFF" strokeOpacity="0.22" strokeWidth="2" strokeDasharray="3 6" />

      <g filter={`url(#${gid}-shadow)`} transform="rotate(-6 60 72)">
        <rect x="26" y="20" width="68" height="104" rx="16" fill="#FFFFFF" />
        <rect x="32" y="30" width="56" height="76" rx="6" fill={`url(#${gid}-screen)`} />
        <rect x="52" y="22" width="16" height="3" rx="1.5" fill="#E5E7EB" />
        <text x="60" y="72" fontSize="26" textAnchor="middle">☕</text>
        <path d="M40,90 L48,90" stroke="#7C3AED" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
        <path d="M46,96 L58,96" stroke="#7C3AED" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
        <path d="M40,102 L52,102" stroke="#7C3AED" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
      </g>

      {/* shake burst accents */}
      <path d="M14,50 L18,58 L12,58 L16,66" stroke="#FFFFFF" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
      <path d="M104,86 L100,94 L106,94 L102,102" stroke="#FFFFFF" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
    </svg>
  )
}

export function GroupUnlockArt({ className = '' }: { className?: string }) {
  const badgeCx = 90, badgeCy = 40, badgeR = 26

  return (
    <svg viewBox="0 0 170 130" className={className} aria-hidden="true">
      {/* sparkle rays around the badge */}
      {Array.from({ length: 8 }, (_, i) => {
        const outer = polarToCartesian(badgeCx, badgeCy, badgeR + 14, i * 45)
        const inner = polarToCartesian(badgeCx, badgeCy, badgeR + 5, i * 45)
        return <line key={i} x1={outer.x} y1={outer.y} x2={inner.x} y2={inner.y} stroke="#059669" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
      })}
      <path d={heartPath(30, 24, 4.5)} fill="#059669" opacity="0.3" />
      <path d={heartPath(150, 78, 5)} fill="#059669" opacity="0.25" />

      {/* left person (lighter) */}
      <circle cx="26" cy="72" r="15" fill="#A7F3D0" />
      <path d="M2,128 C2,102 50,102 50,128 Z" fill="#A7F3D0" />

      {/* right person (lighter) */}
      <circle cx="140" cy="76" r="15" fill="#A7F3D0" />
      <path d="M116,128 C116,102 164,102 164,128 Z" fill="#A7F3D0" />

      {/* center person (deeper, in front) */}
      <circle cx="85" cy="66" r="19" fill="#059669" />
      <path d="M52,128 C52,96 118,96 118,128 Z" fill="#059669" />

      {/* heart badge */}
      <circle cx={badgeCx} cy={badgeCy} r={badgeR} fill="#FFFFFF" />
      <path d={heartPath(badgeCx, badgeCy, 12)} fill="#059669" />
    </svg>
  )
}
