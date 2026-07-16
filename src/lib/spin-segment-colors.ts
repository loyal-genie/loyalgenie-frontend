/** Solid + gradient swatches for spin wheel segments. `value` is stored on the segment. */
export interface SpinColorSwatch {
  value: string
  /** SVG gradient stops when value is a CSS linear-gradient */
  stops?: [string, string]
}

export const SPIN_SOLID_COLORS: SpinColorSwatch[] = [
  { value: '#7C3AED' },
  { value: '#6D28D9' },
  { value: '#5B21B6' },
  { value: '#4C1D95' },
  { value: '#EC4899' },
  { value: '#DB2777' },
  { value: '#F43F5E' },
  { value: '#F59E0B' },
  { value: '#D97706' },
  { value: '#FBBF24' },
  { value: '#06B6D4' },
  { value: '#0891B2' },
  { value: '#22C55E' },
  { value: '#10B981' },
  { value: '#14B8A6' },
  { value: '#3B82F6' },
  { value: '#6366F1' },
  { value: '#8B5CF6' },
  { value: '#E5E1F8' },
  { value: '#EDE9FF' },
  { value: '#FCE7F3' },
  { value: '#FEF3C7' },
  { value: '#2A2660' },
  { value: '#1A1840' },
  { value: '#1E1B4B' },
  { value: '#374151' },
]

export const SPIN_GRADIENT_COLORS: SpinColorSwatch[] = [
  { value: 'linear-gradient(135deg, #c4b5fd 0%, #5b21b6 100%)', stops: ['#c4b5fd', '#5b21b6'] },
  { value: 'linear-gradient(135deg, #a78bfa 0%, #4c1d95 100%)', stops: ['#a78bfa', '#4c1d95'] },
  { value: 'linear-gradient(135deg, #f9a8d4 0%, #be185d 100%)', stops: ['#f9a8d4', '#be185d'] },
  { value: 'linear-gradient(135deg, #fb7185 0%, #9f1239 100%)', stops: ['#fb7185', '#9f1239'] },
  { value: 'linear-gradient(135deg, #fcd34d 0%, #d97706 100%)', stops: ['#fcd34d', '#d97706'] },
  { value: 'linear-gradient(135deg, #fde68a 0%, #f59e0b 100%)', stops: ['#fde68a', '#f59e0b'] },
  { value: 'linear-gradient(135deg, #67e8f9 0%, #0891b2 100%)', stops: ['#67e8f9', '#0891b2'] },
  { value: 'linear-gradient(135deg, #6ee7b7 0%, #059669 100%)', stops: ['#6ee7b7', '#059669'] },
  { value: 'linear-gradient(135deg, #93c5fd 0%, #2563eb 100%)', stops: ['#93c5fd', '#2563eb'] },
  { value: 'linear-gradient(135deg, #818cf8 0%, #4338ca 100%)', stops: ['#818cf8', '#4338ca'] },
  { value: 'linear-gradient(135deg, #e9d5ff 0%, #a855f7 100%)', stops: ['#e9d5ff', '#a855f7'] },
  { value: 'linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)', stops: ['#312e81', '#1e1b4b'] },
  { value: 'linear-gradient(160deg, #43036d 0%, #1c0038 100%)', stops: ['#43036d', '#1c0038'] },
  { value: 'linear-gradient(135deg, #faf5ff 0%, #ddd6fe 100%)', stops: ['#faf5ff', '#ddd6fe'] },
]

export const SPIN_ALL_COLORS: SpinColorSwatch[] = [...SPIN_SOLID_COLORS, ...SPIN_GRADIENT_COLORS]

/** @deprecated use SPIN_SOLID_COLORS */
export const SPIN_COLORS = SPIN_SOLID_COLORS.map(s => s.value)

export function isGradientColor(color: string): boolean {
  return color.startsWith('linear-gradient')
}

export function gradientStopsForColor(color: string): [string, string] | null {
  const found = SPIN_ALL_COLORS.find(s => s.value === color)
  if (found?.stops) return found.stops
  if (!isGradientColor(color)) return null
  const hexes = color.match(/#[0-9a-fA-F]{3,8}/g)
  if (hexes && hexes.length >= 2) return [hexes[0], hexes[1]] as [string, string]
  return null
}

export function segmentCssBackground(color: string): string {
  return color
}

export function segmentSvgFillId(segmentId: string): string {
  return `spin-grad-${segmentId.replace(/[^a-zA-Z0-9]/g, '')}`
}

function parseHex(hex: string): { r: number; g: number; b: number } | null {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h
  if (full.length !== 6) return null
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  }
}

export function rgbaFromHex(hex: string, alpha: number): string {
  const rgb = parseHex(hex)
  if (!rgb) return `rgba(255,255,255,${alpha})`
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`
}

function isLightHex(hex: string): boolean {
  const rgb = parseHex(hex)
  if (!rgb) return false
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255
  return luminance > 0.62
}

export interface SpinRewardChipStyle {
  background: string
  borderColor: string
  textColor: string
  dotBackground: string
}

/** Customer-facing pill styles for spin rewards on dark backgrounds. */
export function spinRewardChipStyle(color: string): SpinRewardChipStyle {
  if (isGradientColor(color)) {
    const stops = gradientStopsForColor(color)
    if (stops) {
      const [a, b] = stops
      return {
        background: `linear-gradient(135deg, ${rgbaFromHex(a, 0.38)}, ${rgbaFromHex(b, 0.52)})`,
        borderColor: rgbaFromHex(a, 0.58),
        textColor: '#ffffff',
        dotBackground: `linear-gradient(135deg, ${a}, ${b})`,
      }
    }
    return {
      background: 'rgba(255,255,255,0.12)',
      borderColor: 'rgba(255,255,255,0.22)',
      textColor: '#ffffff',
      dotBackground: '#a78bfa',
    }
  }

  const light = isLightHex(color)
  return {
    background: rgbaFromHex(color, light ? 0.88 : 0.24),
    borderColor: rgbaFromHex(color, light ? 0.95 : 0.48),
    textColor: light ? '#312e81' : '#ffffff',
    dotBackground: color,
  }
}

/** Chip styles for light surfaces (PIN entry, white cards). */
export function spinRewardChipStyleLight(color: string): SpinRewardChipStyle {
  if (isGradientColor(color)) {
    const stops = gradientStopsForColor(color)
    const a = stops?.[0] ?? '#7C3AED'
    const b = stops?.[1] ?? '#4C1D95'
    return {
      background: rgbaFromHex(a, 0.14),
      borderColor: rgbaFromHex(a, 0.35),
      textColor: b,
      dotBackground: `linear-gradient(135deg, ${a}, ${b})`,
    }
  }

  const light = isLightHex(color)
  return {
    background: rgbaFromHex(color, light ? 0.55 : 0.12),
    borderColor: rgbaFromHex(color, light ? 0.85 : 0.28),
    textColor: light ? '#312e81' : color,
    dotBackground: color,
  }
}

/** Solid accent hex for a segment color (gradients → first stop). */
export function spinSegmentAccentHex(color: string): string {
  if (isGradientColor(color)) {
    const stops = gradientStopsForColor(color)
    return stops?.[0] ?? '#7C3AED'
  }
  return color.startsWith('#') ? color : '#7C3AED'
}
