const DICE_PIPS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[28, 28], [72, 72]],
  3: [[28, 28], [50, 50], [72, 72]],
  4: [[28, 28], [72, 28], [28, 72], [72, 72]],
  5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
  6: [[28, 28], [72, 28], [28, 50], [72, 50], [28, 72], [72, 72]],
}

interface DiceFaceProps {
  value: number
  pipColor?: string
  className?: string
}

export function DiceFace({ value, pipColor = '#1E1B4B', className }: DiceFaceProps) {
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" className={className} aria-label={`Dice face ${value}`}>
      {(DICE_PIPS[value] ?? []).map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="9" fill={pipColor} />
      ))}
    </svg>
  )
}
