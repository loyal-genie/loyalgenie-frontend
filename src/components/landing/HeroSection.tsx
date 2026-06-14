import { Link } from 'react-router-dom'
import { HeroScene } from '@/components/landing/HeroScene'

export function HeroSection() {
  return (
    <section className="gradient-hero min-h-screen grid lg:grid-cols-2 items-center gap-8 lg:gap-10 px-6 sm:px-8 md:px-12 lg:px-20 pt-28 sm:pt-32 md:pt-36 pb-16 sm:pb-20 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_50%_60%_at_30%_50%,rgba(107,63,212,0.15)_0%,transparent_70%)]" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_40%_50%_at_75%_50%,rgba(107,63,212,0.12)_0%,transparent_65%)]" />

      <div className="relative z-10 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3.5 sm:px-4 py-1.5 sm:py-2 mb-5 sm:mb-7 max-w-full">
          <span className="text-sm">✨</span>
          <span className="text-gold text-[10px] sm:text-xs font-semibold tracking-wide leading-tight">
            MAGICAL LOYALTY FOR SMEs IN INDIA
          </span>
        </div>

        <h1 className="text-[clamp(26px,6.5vw,58px)] font-black leading-[1.12] sm:leading-[1.15] tracking-tight mb-4 sm:mb-6">
          <span className="text-white">Loyalty </span>
          <span className="shimmer-gold">Granted.</span>
          <br />
          <span className="text-white">Keep Customers </span>
          <span className="text-gold">Coming Back.</span>
        </h1>

        <p className="text-muted text-[15px] sm:text-base leading-relaxed max-w-md mx-auto sm:mx-0 mb-7 sm:mb-9">
          Give your salon, cafe, or shop a gamified loyalty platform. Customers scan, shake their phone, and win rewards — while you build a base of loyal regulars.
        </p>

        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 max-w-sm sm:max-w-none mx-auto sm:mx-0">
          <Link to="/signup" className="btn-gold text-sm sm:text-[15px] !py-3 !px-6 sm:!px-7 no-underline w-full sm:w-auto justify-center">
            Get Started — Free
          </Link>
          <a href="#how-it-works" className="btn-outline text-sm sm:text-[15px] !py-3 !px-6 sm:!px-7 w-full sm:w-auto justify-center">
            See How It Works
          </a>
        </div>
        <p className="mt-5 sm:mt-6 text-sm text-muted">
          Already have an account?{' '}
          <Link to="/signin" className="text-gold font-semibold hover:underline">Sign in to dashboard</Link>
        </p>
      </div>

      <div className="relative z-10 hero-scene-wrap">
        <HeroScene />
      </div>
    </section>
  )
}
