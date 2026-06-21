import { motion } from 'framer-motion'

interface CountdownRingProps {
  seconds: number
  total?: number
}

export function CountdownRing({ seconds, total = 60 }: CountdownRingProps) {
  const r = 72
  const circ = 2 * Math.PI * r
  const dash = circ * (seconds / total)

  return (
    <svg width={168} height={168} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={84} cy={84} r={r} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth={7} />
      <motion.circle
        cx={84}
        cy={84}
        r={r}
        fill="none"
        stroke={seconds <= 10 ? '#F87171' : 'rgba(255,255,255,0.85)'}
        strokeWidth={7}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ - dash}
        transition={{ duration: 0.85, ease: 'linear' }}
      />
    </svg>
  )
}
