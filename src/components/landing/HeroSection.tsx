import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import FloatingScene from '@/components/three/FloatingScene'

gsap.registerPlugin(useGSAP)

function HeroFloatCard({
  top,
  bottom,
  left,
  right,
  borderColor,
  iconBg,
  icon,
  rewardColor,
  reward,
  delay,
}: {
  top?: string
  bottom?: string
  left?: string
  right?: string
  borderColor: string
  iconBg: string
  icon: string
  rewardColor: string
  reward: string
  delay: string
}) {
  return (
    <div
      className="hero-float-card absolute hidden xl:block"
      style={{
        top,
        bottom,
        left,
        right,
        background: 'rgba(26,11,75,0.95)',
        border: `1px solid ${borderColor}`,
        borderRadius: '16px',
        padding: '14px 18px',
        zIndex: 5,
        animation: `float ${delay} ease-in-out infinite`,
      }}
    >
      <div className="flex items-center gap-2.5">
        <div
          className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center text-lg shrink-0"
          style={{ background: iconBg }}
        >
          {icon}
        </div>
        <div>
          <div className="text-white font-bold text-[13px]">You Won!</div>
          <div className="text-xs" style={{ color: rewardColor }}>{reward}</div>
        </div>
      </div>
    </div>
  )
}

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headlineRef = useRef<HTMLDivElement>(null)
  const subRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const badgeRef = useRef<HTMLDivElement>(null)

  // Animate Y only — never touch opacity (Strict Mode + gsap.from(opacity:0) was leaving hero text invisible)
  useGSAP(
    () => {
      const targets = [badgeRef.current, headlineRef.current, subRef.current, ctaRef.current].filter(Boolean)
      if (targets.length === 0) return

      gsap.set(targets, { opacity: 1, clearProps: 'opacity' })

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.from(badgeRef.current, { y: -20, duration: 0.6 })
        .from(headlineRef.current, { y: 50, duration: 0.9 }, '-=0.3')
        .from(subRef.current, { y: 30, duration: 0.7 }, '-=0.5')
        .from(ctaRef.current, { y: 20, duration: 0.6 }, '-=0.4')
    },
    { scope: sectionRef },
  )

  return (
    <section
      ref={sectionRef}
      className="gradient-hero hero-grid min-h-screen grid lg:grid-cols-2 items-center gap-8 lg:gap-10 px-6 sm:px-8 md:px-12 lg:px-20 pt-28 sm:pt-32 md:pt-36 pb-16 sm:pb-20 relative overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_50%_60%_at_30%_50%,rgba(107,63,212,0.15)_0%,transparent_70%)]" />
      <div className="absolute inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_40%_50%_at_75%_50%,rgba(107,63,212,0.12)_0%,transparent_65%)]" />

      {/* isolate + high z-index keeps copy above the WebGL canvas layer */}
      <div className="relative z-[2] isolate opacity-100 text-center sm:text-left">
        <div
          ref={badgeRef}
          className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3.5 sm:px-4 py-1.5 sm:py-2 mb-5 sm:mb-7 max-w-full"
          style={{ opacity: 1 }}
        >
          <span className="text-sm">✨</span>
          <span className="text-gold text-[10px] sm:text-xs font-semibold tracking-wide leading-tight">
            MAGICAL LOYALTY FOR SMEs IN INDIA
          </span>
        </div>

        <div ref={headlineRef} style={{ opacity: 1 }}>
          <h1 className="text-[clamp(26px,6.5vw,58px)] font-black leading-[1.12] sm:leading-[1.15] tracking-tight mb-4 sm:mb-6">
            <span className="text-white">Loyalty </span>
            <span className="shimmer-gold">Granted.</span>
            <br />
            <span className="text-white">Keep Customers </span>
            <span className="text-gold">Coming Back.</span>
          </h1>
        </div>

        <p
          ref={subRef}
          className="text-[#8b7db5] text-[15px] sm:text-base leading-relaxed max-w-md mx-auto sm:mx-0 mb-7 sm:mb-9"
          style={{ opacity: 1 }}
        >
          Give your salon, cafe, or shop a gamified loyalty platform. Customers scan, shake their phone, and win rewards — while you build a base of loyal regulars.
        </p>

        <div
          ref={ctaRef}
          className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 max-w-sm sm:max-w-none mx-auto sm:mx-0"
          style={{ opacity: 1 }}
        >
          <Link to="/signup" className="btn-gold text-sm sm:text-[15px] !py-3 !px-6 sm:!px-7 no-underline w-full sm:w-auto justify-center">
            Add to Your Counter — Free
          </Link>
          <a href="#how-it-works" className="btn-outline text-sm sm:text-[15px] !py-3 !px-6 sm:!px-7 w-full sm:w-auto justify-center">
            See How It Works
          </a>
        </div>
        <p className="mt-5 sm:mt-6 text-sm text-[#8b7db5]">
          Already have an account?{' '}
          <Link to="/signin" className="text-gold font-semibold hover:underline">Sign in to dashboard</Link>
        </p>
      </div>

      <div className="relative z-[1] hero-scene-wrap h-[420px] lg:h-[600px] overflow-hidden">
        <div className="hero-tagline absolute -top-8 lg:-top-11 left-0 right-0 text-center z-[5] pointer-events-none hidden sm:block">
          <span className="shimmer-gold text-sm lg:text-lg font-bold tracking-wide">
            Shake It &amp; Win It
          </span>
        </div>

        <FloatingScene />

        {/* Cards stay inside the scene column — no negative left overlap into copy */}
        <HeroFloatCard top="30px" left="8px" borderColor="rgba(240,192,64,0.25)" iconBg="linear-gradient(135deg,#f0c040,#e9a820)" icon="⭐" rewardColor="#f0c040" reward="Double Points" delay="4.2s 0.3s" />
        <HeroFloatCard top="240px" left="12px" borderColor="rgba(22,160,133,0.35)" iconBg="linear-gradient(135deg,#16a085,#0d3b27)" icon="💆" rewardColor="#4dd4ac" reward="Complimentary Service" delay="5s 2.5s" />
        <HeroFloatCard bottom="100px" left="8px" borderColor="rgba(240,192,64,0.25)" iconBg="linear-gradient(135deg,#f0c040,#e9a820)" icon="🎁" rewardColor="#f0c040" reward="₹50 off your next visit" delay="4s 0s" />
        <HeroFloatCard top="60px" right="8px" borderColor="rgba(107,63,212,0.35)" iconBg="linear-gradient(135deg,#6b3fd4,#3d1f8a)" icon="☕" rewardColor="#a78bfa" reward="Free Coffee" delay="4.5s 1.2s" />
        <HeroFloatCard top="240px" right="12px" borderColor="rgba(239,68,68,0.35)" iconBg="linear-gradient(135deg,#ef4444,#991b1b)" icon="🍕" rewardColor="#fca5a5" reward="Free Snack" delay="4.8s 1.8s" />
        <HeroFloatCard bottom="80px" right="8px" borderColor="rgba(251,146,60,0.35)" iconBg="linear-gradient(135deg,#f97316,#c2410c)" icon="🏷️" rewardColor="#fdba74" reward="10% Off Today" delay="5.2s 3.2s" />
      </div>
    </section>
  )
}
