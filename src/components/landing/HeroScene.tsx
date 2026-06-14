const floatCards = [
  {
    emoji: '⭐',
    prize: 'Double Points',
    prizeColor: '#f0c040',
    border: 'rgba(240,192,64,0.25)',
    iconGradient: 'linear-gradient(135deg,#f0c040,#e9a820)',
    position: 'top-[30px] -left-4 lg:-left-[88px]',
    animation: 'float 4.2s ease-in-out 0.3s infinite',
  },
  {
    emoji: '💆',
    prize: 'Complimentary Service',
    prizeColor: '#4dd4ac',
    border: 'rgba(22,160,133,0.35)',
    iconGradient: 'linear-gradient(135deg,#16a085,#0d3b27)',
    position: 'top-[240px] -left-2 lg:-left-[83px]',
    animation: 'float 5s ease-in-out 2.5s infinite',
  },
  {
    emoji: '🎁',
    prize: '₹50 off your next visit',
    prizeColor: '#f0c040',
    border: 'rgba(240,192,64,0.25)',
    iconGradient: 'linear-gradient(135deg,#f0c040,#e9a820)',
    position: 'bottom-[100px] -left-4 lg:-left-[88px]',
    animation: 'float 4s ease-in-out 0s infinite',
  },
  {
    emoji: '☕',
    prize: 'Free Coffee',
    prizeColor: '#a78bfa',
    border: 'rgba(107,63,212,0.35)',
    iconGradient: 'linear-gradient(135deg,#6b3fd4,#3d1f8a)',
    position: 'top-[60px] -right-2 lg:-right-[10px]',
    animation: 'float 4.5s ease-in-out 1.2s infinite',
  },
  {
    emoji: '🍕',
    prize: 'Free Snack',
    prizeColor: '#fca5a5',
    border: 'rgba(239,68,68,0.35)',
    iconGradient: 'linear-gradient(135deg,#ef4444,#991b1b)',
    position: 'top-[240px] -right-3 lg:-right-5',
    animation: 'float 4.8s ease-in-out 1.8s infinite',
  },
  {
    emoji: '🏷️',
    prize: '10% Off Today',
    prizeColor: '#fdba74',
    border: 'rgba(251,146,60,0.35)',
    iconGradient: 'linear-gradient(135deg,#f97316,#c2410c)',
    position: 'bottom-[80px] -right-2 lg:-right-[15px]',
    animation: 'float 5.2s ease-in-out 3.2s infinite',
  },
] as const

function FloatWinCard({
  emoji,
  prize,
  prizeColor,
  border,
  iconGradient,
  position,
  animation,
}: (typeof floatCards)[number]) {
  return (
    <div
      className={`absolute z-10 hidden lg:block ${position}`}
      style={{
        background: 'rgba(26,11,75,0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${border}`,
        borderRadius: '16px',
        padding: '14px 18px',
        animation,
      }}
    >
      <div className="flex items-center gap-2.5">
        <div
          className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center text-lg shrink-0"
          style={{ background: iconGradient }}
        >
          {emoji}
        </div>
        <div>
          <div className="text-white font-bold text-[13px] leading-tight">You Won!</div>
          <div className="text-[12px] font-medium leading-snug mt-0.5" style={{ color: prizeColor }}>
            {prize}
          </div>
        </div>
      </div>
    </div>
  )
}

function CentralWinCard() {
  return (
    <div
      className="relative z-20 w-[min(100%,280px)] mx-auto rounded-[28px] px-6 pt-7 pb-6 text-center shadow-[0_24px_80px_rgba(107,63,212,0.45)]"
      style={{
        background: 'linear-gradient(165deg, rgba(26,11,75,0.95) 0%, rgba(13,8,40,0.98) 100%)',
        border: '1px solid rgba(240,192,64,0.2)',
        backdropFilter: 'blur(24px)',
      }}
    >
      <div className="text-5xl mb-3 animate-float" style={{ animationDuration: '4s' }}>
        🧞
      </div>

      <p className="text-[11px] font-bold tracking-[0.25em] text-white/70 uppercase mb-1">You Won!</p>
      <h3
        className="text-[clamp(22px,3vw,28px)] font-black leading-tight mb-2 shimmer-gold"
        style={{ letterSpacing: '-0.5px' }}
      >
        Complimentary Service
      </h3>
      <p className="text-[12px] text-[#a78bfa] mb-5">Glow Salon · Claim on your next visit</p>

      <button
        type="button"
        className="w-full py-3.5 rounded-full text-[14px] font-bold cursor-default"
        style={{
          background: 'linear-gradient(135deg, #f0c040, #e9a820)',
          color: '#0a0520',
          boxShadow: '0 8px 28px rgba(240,192,64,0.35)',
        }}
      >
        Tap to Redeem →
      </button>

      {/* Soft glow ring */}
      <div
        className="absolute -inset-3 rounded-[32px] -z-10 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(107,63,212,0.25) 0%, transparent 70%)',
        }}
      />
    </div>
  )
}

function AmbientParticles() {
  const dots = [
    { top: '12%', left: '18%', size: 6, delay: '0s' },
    { top: '28%', left: '72%', size: 4, delay: '1.2s' },
    { top: '55%', left: '8%', size: 5, delay: '0.6s' },
    { top: '70%', left: '85%', size: 7, delay: '2s' },
    { top: '85%', left: '45%', size: 4, delay: '1.5s' },
  ]

  return (
    <>
      {dots.map((d, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-gold/40 pointer-events-none animate-float"
          style={{
            top: d.top,
            left: d.left,
            width: d.size,
            height: d.size,
            animationDelay: d.delay,
            boxShadow: '0 0 12px rgba(240,192,64,0.5)',
          }}
        />
      ))}
    </>
  )
}

export function HeroScene() {
  return (
    <div className="relative h-[420px] sm:h-[500px] lg:h-[600px] w-full">
      <AmbientParticles />

      <div className="absolute -top-2 sm:-top-8 left-0 right-0 text-center z-30 pointer-events-none">
        <span className="shimmer-gold text-sm sm:text-lg font-bold tracking-wide">Shake It & Win It</span>
      </div>

      <div className="absolute inset-0 flex items-center justify-center pt-6">
        {/* Orbit rings */}
        <div
          className="absolute w-48 h-48 sm:w-56 sm:h-56 rounded-full border border-gold/15 pointer-events-none"
          style={{ boxShadow: 'inset 0 0 40px rgba(107,63,212,0.15)' }}
        />
        <div
          className="absolute w-64 h-64 sm:w-72 sm:h-72 rounded-full border border-dashed border-gold/20 pointer-events-none animate-spin-slow"
        />

        <CentralWinCard />
      </div>

      {floatCards.map((card) => (
        <FloatWinCard key={card.prize} {...card} />
      ))}
    </div>
  )
}
