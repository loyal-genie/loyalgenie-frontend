import type { SpinSegmentUi } from '@/lib/spin-campaign-config'
import { segmentCssBackground } from '@/lib/spin-segment-colors'
import { SpinWheelGradientDefs, segmentPathFill } from '@/components/vendor/SpinWheelGradientDefs'

interface SpinWheelPreviewProps {
  segments: SpinSegmentUi[]
  size?: number
  className?: string
}

export function SpinWheelPreview({ segments, size = 220, className }: SpinWheelPreviewProps) {
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 8
  const total = segments.reduce((s, seg) => s + seg.probability, 0) || 100

  let angle = -90

  return (
    <div className={className}>
      <div className="relative mx-auto" style={{ width: size, height: size }}>
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 z-10"
          style={{
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '16px solid #F5C518',
          }}
        />
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-md">
          <SpinWheelGradientDefs segments={segments} />
          {segments.map((seg, i) => {
            const slice = (seg.probability / total) * 360
            const startAngle = (angle * Math.PI) / 180
            angle += slice
            const endAngle = (angle * Math.PI) / 180
            const x1 = cx + r * Math.cos(startAngle)
            const y1 = cy + r * Math.sin(startAngle)
            const x2 = cx + r * Math.cos(endAngle)
            const y2 = cy + r * Math.sin(endAngle)
            const largeArc = slice > 180 ? 1 : 0
            const midAngle = startAngle + (endAngle - startAngle) / 2
            const tx = cx + r * 0.62 * Math.cos(midAngle)
            const ty = cy + r * 0.62 * Math.sin(midAngle)
            const label = seg.label.length > 8 ? `${seg.label.slice(0, 7)}…` : seg.label
            return (
              <g key={seg.id ?? i}>
                <path
                  d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                  fill={segmentPathFill(seg.color, seg.id)}
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="1"
                />
                {slice >= 18 && (
                  <text
                    x={tx}
                    y={ty}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize={size < 200 ? 7 : 8}
                    fontWeight="700"
                  >
                    {label}
                  </text>
                )}
              </g>
            )
          })}
          <circle cx={cx} cy={cy} r={r * 0.18} fill="#08071A" stroke="#F5C518" strokeWidth="1.5" />
          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize={size * 0.1}>
            🎡
          </text>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
        </svg>
      </div>
      <div className="mt-3 space-y-1">
        {segments.map(seg => (
          <div key={seg.id} className="flex items-center justify-between text-[10px] text-v-text-2">
            <span className="flex items-center gap-1.5 min-w-0">
              <span className="size-2 rounded-full shrink-0" style={{ background: segmentCssBackground(seg.color) }} />
              <span className="truncate">{seg.label}</span>
              {seg.isWin && <span className="text-v-purple font-semibold shrink-0">win</span>}
            </span>
            <span className="font-bold text-v-text shrink-0 ml-2">{seg.probability}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
