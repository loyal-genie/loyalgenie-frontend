import { BarChart2, BellRing, Zap, Gamepad2, Smartphone, TrendingUp, QrCode, Gift, RefreshCw } from 'lucide-react'
import { SectionBadge } from '@/components/landing/SectionBadge'
import { businessTypes } from '@/content/landing'

const benefits = [
  { Icon: BarChart2, title: 'Know Your Regulars', desc: 'See exactly who your top customers are, how often they visit, and when they start drifting. End the guessing.' },
  { Icon: BellRing, title: 'Re-engage Silently Lost Customers', desc: "A regular who hasn't visited in 30 days? Send them a targeted offer automatically. Bring them back before it's too late." },
  { Icon: Zap, title: 'Zero Tech Headache', desc: "No POS integration. No app development. Just a standee on your counter and a 5-minute setup. That's it." },
  { Icon: Gamepad2, title: 'Gamified Experience', desc: "Your customers don't just earn points — they play. Shake, spin, scratch, collect. Fun drives repeat visits." },
  { Icon: Smartphone, title: 'Your Branded Loyalty App', desc: "Your business lives inside LoyalGenie's app — with your name, logo, and offers. Professional loyalty without the price tag." },
  { Icon: TrendingUp, title: 'Built for Slow Days', desc: 'Run a flash offer on Tuesday afternoon. Push a mystery reward on a slow weekend. Turn empty hours into revenue.' },
]

const standeeFlow = [
  { Icon: QrCode, label: 'Scan or Tap' },
  { Icon: Gift, label: 'Win Rewards' },
  { Icon: RefreshCw, label: 'Come Back' },
]

export function ForBusinesses() {
  return (
    <section id="for-business" className="section-main">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-16">
          <SectionBadge>FOR YOUR BUSINESS</SectionBadge>
          <h2 className="text-[clamp(32px,4vw,50px)] font-black text-white tracking-tight leading-tight mb-4">
            What Starbucks has, <span className="text-gold">you can have too</span>
          </h2>
          <p className="text-muted text-lg max-w-lg mx-auto leading-relaxed mb-9">
            Big brands know exactly who their regulars are, when they drift, and how to bring them back. LoyalGenie gives you the same power.
          </p>
          <div className="flex flex-wrap gap-2.5 justify-center">
            {businessTypes.map((b) => (
              <span key={b.name} className="inline-flex items-center gap-2 rounded-full border border-gold/15 bg-bg-card/60 px-4 py-2 text-white text-sm font-medium hover:border-gold/50 transition-colors">
                <span>{b.icon}</span>{b.name}
              </span>
            ))}
          </div>
        </header>

        <div className="benefit-grid grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b) => (
            <div key={b.title} className="card-glass p-8">
              <div className="w-[52px] h-[52px] rounded-2xl border border-gold/20 bg-gold/10 flex items-center justify-center mb-5">
                <b.Icon size={22} color="#f0c040" strokeWidth={1.75} />
              </div>
              <h3 className="text-white text-lg font-bold mb-2.5">{b.title}</h3>
              <p className="text-muted text-sm leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>

        <div className="card-glass standee-grid mt-16 grid lg:grid-cols-2 gap-12 items-center p-8 lg:p-14 bg-gradient-to-br from-purple-mid/30 to-bg-card/60">
          <div>
            <p className="text-gold text-xs font-semibold tracking-widest mb-4">ONE TAP. INFINITE REWARDS.</p>
            <h3 className="text-[clamp(28px,3vw,40px)] font-black text-white tracking-tight leading-tight mb-5">
              The standee that works while you work
            </h3>
            <p className="text-muted text-base leading-relaxed mb-8">
              Place it on your counter. Customers see it. They scan. They play. You get their contact, their loyalty, and their return visit — automatically.
            </p>
            <div className="flex items-start gap-2">
              {standeeFlow.map((f, i) => (
                <div key={f.label} className="flex items-start">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-xl border border-gold/25 bg-gold/10 flex items-center justify-center">
                      <f.Icon size={22} color="#f0c040" strokeWidth={1.75} />
                    </div>
                    <span className="text-gold text-xs font-semibold">{f.label}</span>
                  </div>
                  {i < standeeFlow.length - 1 && <span className="text-gold/40 text-lg px-3 leading-[48px]">→</span>}
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-center">
            <img
              src="/standee.png"
              alt="LoyalGenie Standee"
              className="h-72 lg:h-96 object-contain animate-float drop-shadow-[0_20px_60px_rgba(107,63,212,0.5)]"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
