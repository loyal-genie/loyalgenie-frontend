import {
  ShieldCheck, RefreshCw, ThumbsUp, Megaphone, Users, Award, TrendingUp,
  Calendar, CreditCard, Package, Unlock, Check, Clock, Star, type LucideIcon,
} from 'lucide-react'
import { SectionBadge } from '@/components/landing/SectionBadge'
import { riskFreeCosts } from '@/content/landing'

const gains: { Icon: LucideIcon; color: string; title: string; desc: string }[] = [
  { Icon: RefreshCw, color: '#6b3fd4', title: 'More Repeat Visits', desc: 'Your regulars come back more often and more predictably — driven by rewards they actually want.' },
  { Icon: ThumbsUp, color: '#27ae60', title: 'Higher NPS', desc: 'Customers who feel rewarded feel valued. Valued customers recommend you to everyone they know.' },
  { Icon: Megaphone, color: '#e67e22', title: 'Word of Mouth', desc: '"You have to try this place." The shake-and-win moment is inherently talkable — people bring it up.' },
  { Icon: Users, color: '#2980b9', title: 'Referrals', desc: 'Customers bring friends just to show them the experience. Free acquisition with zero ad spend.' },
  { Icon: Award, color: '#f0c040', title: 'Stronger Brand', desc: "You're no longer just a shop. You're the café or salon with that fun loyalty thing everyone talks about." },
  { Icon: TrendingUp, color: '#9b59b6', title: 'Invaluable Marketing & Social Media Buzz', desc: "Customers share their wins on WhatsApp and Instagram Stories — organic reach you can't buy." },
  { Icon: Star, color: '#e74c3c', title: 'World-class Marketing & Loyalty Programs', desc: 'Everything a big brand runs to retain and grow customers — done for your business, without the agency price tag.' },
  { Icon: Clock, color: '#16a085', title: 'Pull Customers During Slow Periods', desc: 'Run targeted offers on Tuesdays, Wednesdays, Thursdays — turn your quietest hours into your most profitable ones.' },
]

const guarantees: { Icon: LucideIcon; label: string }[] = [
  { Icon: ShieldCheck, label: 'Pay only after proof' },
  { Icon: Calendar, label: 'Free for 30 days' },
  { Icon: CreditCard, label: 'No credit card needed' },
  { Icon: Package, label: 'Standee on your counter in 3 days' },
  { Icon: Unlock, label: 'Cancel anytime, no questions' },
]

export function RiskFreeSection() {
  return (
    <section className="section-main border-t border-gold/5">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-14">
          <SectionBadge>ZERO RISK. REAL UPSIDE.</SectionBadge>
          <h2 className="text-[clamp(32px,4vw,52px)] font-black text-white tracking-tight leading-[1.15] mb-4">
            Try it free.{' '}
            <span className="text-gold">Pay only when<br className="hidden sm:block" /> you see it working.</span>
          </h2>
          <p className="text-muted text-lg max-w-xl mx-auto leading-relaxed">
            No commitment. No credit card. No leap of faith. Run LoyalGenie for 30 days, watch what happens to your regulars — and only then decide.
          </p>
        </header>

        <div
          className="rounded-[20px] p-6 sm:p-8 lg:px-10 mb-14 flex flex-col sm:flex-row items-start gap-6"
          style={{
            background: 'linear-gradient(135deg, rgba(61,31,138,0.35), rgba(26,11,75,0.6))',
            border: '1px solid rgba(240,192,64,0.35)',
            boxShadow: '0 0 60px rgba(240,192,64,0.06)',
          }}
        >
          <div
            className="w-16 h-16 rounded-2xl shrink-0 flex items-center justify-center"
            style={{ background: 'rgba(240,192,64,0.1)', border: '1px solid rgba(240,192,64,0.3)' }}
          >
            <ShieldCheck size={30} color="#f0c040" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-gold text-[11px] font-bold tracking-[2px] mb-2">OUR FIRM PROMISE</p>
            <p className="text-white text-base sm:text-[17px] leading-relaxed font-medium">
              We only charge you after you&apos;ve seen the proof yourself. Set up your loyalty program today, watch your customers come back — and if it&apos;s not working in 30 days, you owe us absolutely nothing.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_2fr] gap-8 mb-14 items-start">
          <div
            className="rounded-[20px] p-8"
            style={{ background: 'rgba(26,11,75,0.4)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <p className="text-muted text-[11px] font-bold tracking-[2px] mb-6">WHAT IT COSTS YOU</p>
            <div className="flex flex-col gap-5">
              {riskFreeCosts.map((c) => (
                <div key={c.label} className="flex items-start gap-3">
                  <div
                    className="w-[22px] h-[22px] rounded-md shrink-0 flex items-center justify-center mt-0.5"
                    style={{ background: 'rgba(139,125,181,0.12)', border: '1px solid rgba(139,125,181,0.2)' }}
                  >
                    <Check size={13} color="#8b7db5" strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-white font-bold text-[15px]">{c.label}</p>
                    <p className="text-muted text-[13px] mt-0.5">{c.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-gold text-[11px] font-bold tracking-[2px] mb-6">WHAT YOU STAND TO GAIN</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {gains.map((g) => (
                <div
                  key={g.title}
                  className="rounded-2xl p-5 transition-colors hover:border-gold/30"
                  style={{ background: 'rgba(26,11,75,0.5)', border: '1px solid rgba(240,192,64,0.1)' }}
                >
                  <div
                    className="w-10 h-10 rounded-[10px] mb-3 flex items-center justify-center"
                    style={{ background: `${g.color}18`, border: `1px solid ${g.color}35` }}
                  >
                    <g.Icon size={20} color={g.color} strokeWidth={1.75} />
                  </div>
                  <p className="text-white font-bold text-[15px] mb-1.5">{g.title}</p>
                  <p className="text-muted text-[13px] leading-relaxed">{g.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          className="rounded-2xl px-6 py-6 flex flex-wrap justify-center gap-x-8 gap-y-3"
          style={{ background: 'rgba(26,11,75,0.3)', border: '1px solid rgba(240,192,64,0.15)' }}
        >
          {guarantees.map((g) => (
            <div key={g.label} className="flex items-center gap-2">
              <g.Icon size={15} color="#f0c040" strokeWidth={2} />
              <span className="text-gold text-sm font-semibold">{g.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
