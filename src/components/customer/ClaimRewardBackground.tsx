import type { ReactNode } from 'react'

const STARS = [
  { top: '6%', left: '13%', size: '18px', opacity: 0.3 },
  { top: '8%', left: '80%', size: '14px', opacity: 0.3 },
  { top: '12%', left: '18%', size: '18px', opacity: 0.3 },
  { top: '25%', left: '9%', size: '18px', opacity: 0.3 },
  { top: '37%', left: '19%', size: '18px', opacity: 0.3 },
  { top: '51%', left: '10%', size: '18px', opacity: 0.3 },
  { top: '65%', left: '12%', size: '18px', opacity: 0.3 },
  { top: '25%', left: '90%', size: '18px', opacity: 0.3 },
  { top: '48%', left: '85%', size: '18px', opacity: 0.3 },
  { top: '53%', left: '92%', size: '18px', opacity: 0.3 },
  { top: '72%', left: '86%', size: '18px', opacity: 0.1 },
  { top: '45%', left: '34%', size: '14px', opacity: 0.1 },
  { top: '75%', left: '44%', size: '16px', opacity: 0.1 },
  { top: '75%', left: '11%', size: '12px', opacity: 0.1 },
  { top: '89%', left: '12%', size: '18px', opacity: 0.19 },
  { top: '75%', left: '10%', size: '18px', opacity: 0.19 },
  { top: '81%', left: '30%', size: '12px', opacity: 0.19 },
  { top: '95%', left: '36%', size: '16px', opacity: 0.19 },
  { top: '84%', left: '61%', size: '18px', opacity: 0.19 },
  { top: '69%', left: '6%', size: '14px', opacity: 0.2 },
] as const

export function ClaimRewardBackground({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative min-h-dvh overflow-hidden text-white"
      style={{
        backgroundImage: 'linear-gradient(174.52deg, rgb(67, 3, 109) 2.11%, rgb(46, 20, 3) 93.31%)',
      }}
    >
      {STARS.map((star, index) => (
        <span
          key={index}
          className="pointer-events-none absolute select-none text-[rgba(250,212,153,1)]"
          style={{
            top: star.top,
            left: star.left,
            fontSize: star.size,
            opacity: star.opacity,
          }}
        >
          ★
        </span>
      ))}
      {children}
    </div>
  )
}
