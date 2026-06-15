import { motion } from 'framer-motion'

export const SHAKE_PARTICLE_COLORS = [
  '#7C3AED', '#F5C518', '#EC4899', '#06B6D4', '#22C55E', '#F59E0B', '#A78BFA', '#FDE68A',
]

export function StarField() {
  const stars = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    left: `${(i * 17 + 7) % 100}%`,
    top: `${(i * 23 + 11) % 100}%`,
    size: 1 + (i % 3),
    delay: (i % 5) * 0.4,
  }))

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {stars.map(s => (
        <motion.div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{ left: s.left, top: s.top, width: s.size, height: s.size }}
          animate={{ opacity: [0.15, 0.7, 0.15], scale: [1, 1.4, 1] }}
          transition={{ duration: 2 + (s.id % 3), delay: s.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

export function ShakeVignette({ intensity, active }: { intensity: number; active: boolean }) {
  if (!active) return null
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none z-[1]"
      animate={{ opacity: 0.35 + intensity * 0.45 }}
      transition={{ duration: 0.15 }}
      style={{
        background: `radial-gradient(ellipse at center, transparent 35%, rgba(10,0,30,${0.5 + intensity * 0.3}) 100%)`,
        boxShadow: `inset 0 0 ${80 + intensity * 120}px rgba(139,92,246,${0.15 + intensity * 0.25})`,
      }}
    />
  )
}

export function EnergyRing({ delay, intensity, active }: { delay: number; intensity: number; active: boolean }) {
  if (!active) return null
  return (
    <motion.div
      className="absolute rounded-[2.75rem] border pointer-events-none"
      style={{
        width: 'clamp(9rem, 42vw, 13rem)',
        height: 'clamp(14.5rem, 68vw, 21rem)',
        borderColor: `rgba(167,139,250,${0.25 + intensity * 0.35})`,
        borderWidth: 1 + intensity * 2,
      }}
      initial={{ scale: 0.95, opacity: 0.7 }}
      animate={{ scale: 2.2 + intensity * 0.5, opacity: 0 }}
      transition={{ duration: 1 + delay * 0.2, delay, repeat: Infinity, ease: 'easeOut' }}
    />
  )
}

export function SplashBurst({ intensity, burstKey }: { intensity: number; burstKey: number }) {
  const count = Math.min(28, 10 + Math.floor(intensity * 18))
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <motion.div
          key={`${burstKey}-${i}`}
          className="absolute rounded-full pointer-events-none z-20"
          style={{
            width: 3 + (i % 5) * 2,
            height: 3 + (i % 5) * 2,
            background: SHAKE_PARTICLE_COLORS[i % SHAKE_PARTICLE_COLORS.length],
            left: '50%',
            top: '50%',
            boxShadow: `0 0 6px ${SHAKE_PARTICLE_COLORS[i % SHAKE_PARTICLE_COLORS.length]}`,
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: Math.cos((i / count) * Math.PI * 2) * (50 + intensity * 100),
            y: Math.sin((i / count) * Math.PI * 2) * (50 + intensity * 100),
            opacity: 0,
            scale: 0.1,
          }}
          transition={{ duration: 0.5 + (i % 4) * 0.1, ease: 'easeOut' }}
        />
      ))}
    </>
  )
}

export function ProgressRing({ progress, size = 200 }: { progress: number; size?: number }) {
  const stroke = 4
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - progress)

  return (
    <svg
      className="absolute pointer-events-none -rotate-90"
      width={size}
      height={size}
      style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%) rotate(-90deg)' }}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={stroke}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="url(#shakeProgressGrad)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        animate={{ strokeDashoffset: offset }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      />
      <defs>
        <linearGradient id="shakeProgressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#F5C518" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function FloatingPrizes({ visible }: { visible: boolean }) {
  if (!visible) return null
  const prizes = ['🎁', '☕', '🏆', '✨', '🎯', '💎']
  return (
    <>
      {prizes.map((emoji, i) => (
        <motion.span
          key={emoji}
          className="absolute pointer-events-none select-none"
          style={{
            left: `${8 + (i * 15) % 85}%`,
            top: `${12 + (i % 3) * 28}%`,
            fontSize: 'clamp(1rem, 4vw, 1.5rem)',
            opacity: 0.18,
          }}
          animate={{ y: [0, -12 - (i % 2) * 8, 0], rotate: [0, 8, -8, 0] }}
          transition={{ duration: 2.5 + i * 0.35, repeat: Infinity, ease: 'easeInOut' }}
        >
          {emoji}
        </motion.span>
      ))}
    </>
  )
}

export function RevealFlash({ active }: { active: boolean }) {
  if (!active) return null
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none z-30"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.85, 0] }}
      transition={{ duration: 0.6 }}
      style={{ background: 'radial-gradient(circle, rgba(245,197,24,0.5) 0%, transparent 70%)' }}
    />
  )
}

interface PhoneMockupProps {
  phase: 'idle' | 'charging' | 'shaking' | 'suspense'
  intensity: number
  onTap: () => void
  disabled: boolean
  reducedMotion: boolean
}

export function PhoneMockup({ phase, intensity, onTap, disabled, reducedMotion }: PhoneMockupProps) {
  const isShaking = phase === 'shaking' || phase === 'charging'
  const isSuspense = phase === 'suspense'
  const phoneW = 'clamp(9rem, 42vw, 13rem)'
  const phoneH = 'clamp(14.5rem, 68vw, 21rem)'

  const shakeAnim = reducedMotion
    ? {}
    : isShaking
      ? {
          x: [0, -14 * (0.5 + intensity), 16 * (0.5 + intensity), -12 * (0.5 + intensity), 10, -6, 0],
          y: [0, 10 * (0.5 + intensity), -8 * (0.5 + intensity), 12 * (0.5 + intensity), -8, 4, 0],
          rotate: [0, -10 - intensity * 8, 12 + intensity * 8, -8, 6, 0],
        }
      : isSuspense
        ? { scale: [1, 1.04, 1], rotate: [0, 2, -2, 0] }
        : { y: [0, -8, 0] }

  const shakeTransition = isShaking
    ? { duration: 0.22 - intensity * 0.06, repeat: Infinity, ease: 'easeInOut' as const }
    : isSuspense
      ? { duration: 0.45, repeat: Infinity }
      : { duration: 2.8, repeat: Infinity, ease: 'easeInOut' as const }

  return (
    <div className="relative flex items-center justify-center">
      {phase === 'idle' &&
        [0, 0.6, 1.2].map((delay, i) => (
          <motion.div
            key={`idle-ring-${i}`}
            className="absolute rounded-[2.75rem] border border-purple-400/25 pointer-events-none"
            style={{ width: phoneW, height: phoneH }}
            initial={{ scale: 1, opacity: 0.45 }}
            animate={{ scale: 1.5 + i * 0.15, opacity: 0 }}
            transition={{ duration: 2.2, delay, repeat: Infinity, ease: 'easeOut' }}
          />
        ))}

      {isShaking &&
        [0, 0.25, 0.5, 0.75].map((delay, i) => (
          <EnergyRing key={i} delay={delay} intensity={intensity} active={isShaking} />
        ))}

      <motion.button
        type="button"
        onClick={onTap}
        disabled={disabled}
        animate={shakeAnim}
        transition={shakeTransition}
        whileTap={phase === 'idle' && !disabled ? { scale: 0.93 } : {}}
        className="relative flex flex-col items-center justify-center border-0 cursor-pointer touch-manipulation select-none disabled:cursor-not-allowed disabled:opacity-60"
        style={{
          width: phoneW,
          height: phoneH,
          borderRadius: '2.75rem',
          background: isShaking
            ? `linear-gradient(145deg, #3d2478, #1A0545)`
            : 'linear-gradient(145deg, #2D1B69, #1A0545)',
          border: `2px solid rgba(167,139,250,${0.35 + intensity * 0.45})`,
          boxShadow: isShaking
            ? `0 0 ${50 + intensity * 100}px rgba(139,92,246,${0.45 + intensity * 0.4}), 0 24px 48px rgba(0,0,0,0.75), inset 0 0 ${30 + intensity * 40}px rgba(245,197,24,${intensity * 0.15})`
            : '0 0 40px rgba(139,92,246,0.35), 0 20px 40px rgba(0,0,0,0.55)',
        }}
        aria-label={phase === 'idle' ? 'Tap to start shaking' : 'Keep shaking'}
      >
        {/* Phone notch / home indicator */}
        <div className="absolute top-3 sm:top-4 w-[35%] h-1 sm:h-1.5 rounded-full bg-black/45" />
        <div className="absolute bottom-3 sm:bottom-5 w-[22%] h-0.5 sm:h-1 rounded-full bg-black/40" />

        {/* Screen glow */}
        <motion.div
          className="absolute inset-3 sm:inset-4 rounded-[2rem] pointer-events-none"
          animate={{
            opacity: isShaking ? 0.5 + intensity * 0.4 : isSuspense ? [0.3, 0.7, 0.3] : 0.15,
            boxShadow: isShaking
              ? `inset 0 0 ${20 + intensity * 40}px rgba(245,197,24,${0.2 + intensity * 0.3})`
              : 'inset 0 0 20px rgba(139,92,246,0.2)',
          }}
          transition={isSuspense ? { duration: 0.5, repeat: Infinity } : { duration: 0.2 }}
          style={{ background: 'rgba(0,0,0,0.25)' }}
        />

        {isSuspense ? (
          <motion.div
            key="suspense"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: [1, 1.15, 1] }}
            transition={{ duration: 0.45, repeat: Infinity }}
            className="flex flex-col items-center gap-2 sm:gap-3 z-10"
          >
            <motion.span
              className="text-5xl sm:text-6xl"
              animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 0.6, repeat: Infinity }}
            >
              ✨
            </motion.span>
            <div className="flex gap-1.5">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{ background: '#F5C518' }}
                  animate={{ scale: [1, 1.8, 1], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 0.45, delay: i * 0.1, repeat: Infinity }}
                />
              ))}
            </div>
          </motion.div>
        ) : isShaking ? (
          <motion.div key="shaking" className="flex flex-col items-center gap-2 z-10">
            <motion.span
              className="text-4xl sm:text-5xl"
              animate={{ scale: [1, 1.35 + intensity * 0.2, 1], rotate: [0, 25, -25, 0] }}
              transition={{ duration: 0.28, repeat: Infinity }}
            >
              🎁
            </motion.span>
            <p className="text-[10px] sm:text-xs font-bold text-white/90 tracking-wide uppercase">
              {intensity > 0.65 ? 'Almost there!' : 'Keep shaking!'}
            </p>
          </motion.div>
        ) : (
          <motion.div key="idle" className="flex flex-col items-center gap-2 sm:gap-3 z-10 px-2">
            <motion.span
              className="text-4xl sm:text-5xl"
              animate={{ rotate: [0, -12, 12, -8, 8, 0] }}
              transition={{ duration: 1.1, repeat: Infinity, repeatDelay: 0.6 }}
            >
              📱
            </motion.span>
            <div className="text-center">
              <p className="text-xs sm:text-sm font-bold text-white">Tap to Shake!</p>
              <p className="text-[9px] sm:text-[10px] text-white/45 mt-0.5">or shake your phone hard</p>
            </div>
          </motion.div>
        )}
      </motion.button>
    </div>
  )
}
