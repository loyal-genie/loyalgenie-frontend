import { motion } from 'framer-motion'

const STARS = [
  { x: 8, y: 10, s: 14, o: 0.38 },
  { x: 83, y: 8, s: 9, o: 0.26 },
  { x: 13, y: 35, s: 8, o: 0.2 },
  { x: 91, y: 29, s: 13, o: 0.3 },
  { x: 5, y: 61, s: 16, o: 0.24 },
  { x: 88, y: 52, s: 9, o: 0.18 },
  { x: 26, y: 79, s: 11, o: 0.15 },
  { x: 74, y: 77, s: 7, o: 0.2 },
  { x: 44, y: 8, s: 8, o: 0.15 },
  { x: 61, y: 16, s: 6, o: 0.17 },
  { x: 33, y: 52, s: 10, o: 0.18 },
  { x: 77, y: 43, s: 8, o: 0.14 },
  { x: 50, y: 88, s: 10, o: 0.16 },
  { x: 19, y: 69, s: 6, o: 0.14 },
  { x: 57, y: 62, s: 5, o: 0.12 },
] as const

export function ClaimRewardBackground({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative min-h-dvh overflow-hidden text-white select-none"
      style={{
        background: 'linear-gradient(180deg, #2D0A6B 0%, #1A0D3A 45%, #0E060C 78%, #1C0410 100%)',
      }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {STARS.map((s, i) => (
          <motion.div
            key={i}
            className="absolute text-white"
            style={{ left: `${s.x}%`, top: `${s.y}%`, opacity: s.o, fontSize: s.s }}
            animate={{ opacity: [s.o, s.o * 0.3, s.o], scale: [1, 1.3, 1] }}
            transition={{
              duration: 2.2 + i * 0.28,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.18,
            }}
          >
            ✦
          </motion.div>
        ))}
      </div>
      {children}
    </div>
  )
}
