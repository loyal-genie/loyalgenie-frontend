import { Link } from 'react-router-dom'

export function CTASection() {
  return (
    <section id="get-started" className="cta-section relative section-main overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_70%_70%_at_50%_50%,rgba(61,31,138,0.3)_0%,transparent_70%)]" />
      <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/5 animate-spin-slow pointer-events-none" />

      <div className="relative z-10 text-center max-w-2xl mx-auto px-1">
        <div className="text-4xl sm:text-5xl mb-4 sm:mb-5">🧞</div>
        <h2 className="text-[clamp(28px,7vw,58px)] font-black tracking-tight leading-tight mb-4 sm:mb-5">
          <span className="text-white">Your wish is </span>
          <span className="shimmer-gold">granted.</span>
        </h2>
        <p className="text-muted text-base sm:text-lg leading-relaxed mb-4">
          Start for free. Place the standee on your counter today. See your first returning regulars within the week.
        </p>
        <p className="text-gold text-xs sm:text-sm font-semibold tracking-wide mb-8 sm:mb-10 flex flex-wrap justify-center gap-x-3 gap-y-1">
          <span>✦ No setup fee</span>
          <span>✦ No lock-in</span>
          <span>✦ Free 30-day trial</span>
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center max-w-sm sm:max-w-none mx-auto">
          <Link to="/business/signup" className="btn-gold text-sm sm:text-[17px] !py-3.5 sm:!py-4 !px-8 sm:!px-10 no-underline w-full sm:w-auto justify-center">
            Get Your Free Standee →
          </Link>
          <Link to="/business/signin" className="btn-outline text-sm sm:text-[17px] !py-3.5 sm:!py-4 w-full sm:w-auto justify-center no-underline">
            Business Sign In
          </Link>
        </div>
      </div>
    </section>
  )
}
