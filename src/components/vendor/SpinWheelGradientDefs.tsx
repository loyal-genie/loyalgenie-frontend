import { gradientStopsForColor, isGradientColor, segmentSvgFillId } from '@/lib/spin-segment-colors'

interface SpinWheelGradientDefsProps {
  segments: { id: string; color: string }[]
}

export function SpinWheelGradientDefs({ segments }: SpinWheelGradientDefsProps) {
  return (
    <defs>
      {segments.map(seg => {
        if (!isGradientColor(seg.color)) return null
        const stops = gradientStopsForColor(seg.color)
        if (!stops) return null
        const id = segmentSvgFillId(seg.id)
        return (
          <linearGradient key={id} id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={stops[0]} />
            <stop offset="100%" stopColor={stops[1]} />
          </linearGradient>
        )
      })}
    </defs>
  )
}

export function segmentPathFill(color: string, segmentId: string): string {
  if (isGradientColor(color)) {
    const stops = gradientStopsForColor(color)
    if (stops) return `url(#${segmentSvgFillId(segmentId)})`
  }
  return color
}
