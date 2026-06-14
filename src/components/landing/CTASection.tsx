import { Link } from 'react-router-dom'

export function CTASection() {
  return (
    <section id="get-started" className="cta-section relative section-main overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_70%_70%_at_50%_50%,rgba(61,31,138,0.3)_0%,transparent_70%)]" />
      <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/5 animate-spin-slow pointer-events-none" />

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        <div className="text-5xl mb-5">🧞</div>
        <h2 className="text-[clamp(36px,5vw,58px)] font-black tracking-tight leading-tight mb-5">
          <span className="text-white">Your wish is </span>
          <span className="shimmer-gold">granted.</span>
        </h2>
        <p className="text-muted text-lg leading-relaxed mb-4">
          Start for free. Place the standee on your counter today. See your first returning regulars within the week.
        </p>
        <p className="text-gold text-sm font-semibold tracking-wide mb-10">
          ✦ No setup fee &nbsp; ✦ No lock-in &nbsp; ✦ Free 30-day trial
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link to="/signup" className="btn-gold text-[17px] py-4 px-10 no-underline">
            Get Your Free Standee →
          </Link>
          <Link to="/signin" className="btn-outline text-[17px] no-underline">
            Sign In to Dashboard
          </Link>
        </div>
      </div>
    </section>
  )
}
