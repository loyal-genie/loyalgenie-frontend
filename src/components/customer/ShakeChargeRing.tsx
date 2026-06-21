import { motion } from 'framer-motion'

const RADIUS = 100
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/** LoyalGenie ring colors: grey → gold → purple/green at max. */
function ringColor(pct: number): string {
  if (pct < 50) return 'rgba(255,255,255,0.35)'
  if (pct < 80) return '#e8b050'
  return '#7C3AED'
}

function hint(pct: number): string {
  if (pct === 0) return 'Shake your phone!'
  if (pct < 40) return 'Keep going…'
  if (pct < 70) return 'Shake harder! 💪'
  if (pct < 100) return 'Almost there! 🔥'
  return 'Hold it! ⚡'
}

interface ShakeChargeRingProps {
  intensity: number
  loading?: boolean
}

export function ShakeChargeRing({ intensity, loading = false }: ShakeChargeRingProps) {
  const color = ringColor(intensity)
  const isAtMax = intensity >= 100 && !loading
  const offset = CIRCUMFERENCE * (1 - intensity / 100)

  return (
    <div
      className={`relative w-[240px] h-[240px] ${isAtMax ? 'animate-shake-rumble' : ''}`}
      style={
        isAtMax
          ? { filter: 'drop-shadow(0 0 20px rgba(124,58,237,0.55))' }
          : undefined
      }
    >
      <svg
        className="absolute top-0 left-0 -rotate-90"
        viewBox="0 0 240 240"
        width={240}
        height={240}
      >
        <defs>
          <linearGradient id="shakeRingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#F5C518" />
          </linearGradient>
        </defs>
        <circle
          cx={120}
          cy={120}
          r={RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={10}
        />
        <circle
          cx={120}
          cy={120}
          r={RADIUS}
          fill="none"
          strokeWidth={10}
          strokeLinecap="round"
          style={{
            stroke: intensity >= 80 ? 'url(#shakeRingGrad)' : color,
            strokeDasharray: CIRCUMFERENCE,
            strokeDashoffset: offset,
            transition: 'stroke-dashoffset 0.08s linear, stroke 0.25s ease',
          }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-center px-6">
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-3xl animate-pulse">✨</span>
            <p className="text-xs font-semibold text-[#d4a8ff]">Revealing reward…</p>
          </motion.div>
        ) : (
          <>
            <span
              className="text-2xl font-bold tabular-nums leading-none transition-colors duration-250"
              style={{ color: intensity >= 80 ? '#F5C518' : color }}
            >
              {intensity}%
            </span>
            <span className="text-[11px] text-white/55 leading-snug">{hint(intensity)}</span>
          </>
        )}
      </div>
    </div>
  )
}
