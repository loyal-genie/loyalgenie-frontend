/** Layout tokens — Figma footer (node 0:599), scaled to 440px shell width. */
export const NAV_LAYOUT = {
  totalHeight: 72,
  barTop: 22,
  barHeight: 50,
  circleSize: 44,
  cutoutRadius: 32,
  viewBoxWidth: 440,
} as const

/**
 * Cream bar with a true top cutout (Subtract shape).
 * The semicircular notch is transparent — page background shows through
 * around the white active circle.
 */
export function createNavCurvePath(
  centerX: number,
  width = NAV_LAYOUT.viewBoxWidth,
  height = NAV_LAYOUT.barHeight,
  cutoutR = NAV_LAYOUT.cutoutRadius,
): string {
  const left = centerX - cutoutR
  const right = centerX + cutoutR

  return [
    `M 0 ${height}`,
    `L ${width} ${height}`,
    `L ${width} 0`,
    `L ${right} 0`,
    `A ${cutoutR} ${cutoutR} 0 0 0 ${left} 0`,
    `L 0 0`,
    `Z`,
  ].join(' ')
}

export function tabCenterX(
  index: number,
  tabCount: number,
  barWidth = NAV_LAYOUT.viewBoxWidth,
): number {
  return (barWidth / tabCount) * (index + 0.5)
}
