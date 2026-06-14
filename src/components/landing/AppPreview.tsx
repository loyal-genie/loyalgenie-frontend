import { Home, Search, Wallet, User, type LucideIcon } from 'lucide-react'
import { SectionBadge } from '@/components/landing/SectionBadge'

const modules: { Icon: LucideIcon; name: string; desc: string; color: string }[] = [
  { Icon: Home, name: 'Home', desc: "See all businesses you're loyal to. Active rewards, recent wins, and quick access to favourite spots.", color: '#6b3fd4' },
  { Icon: Search, name: 'Discover', desc: 'Explore every business in the LoyalGenie network near you. Find new places and earn rewards from day one.', color: '#f0c040' },
  { Icon: Wallet, name: 'Wallet', desc: "All your rewards in one place — active coupons, expiring soon, and a full history of what you've won.", color: '#27ae60' },
  { Icon: User, name: 'Profile', desc: 'Your loyalty identity. Points, badges, loyalty level, and your history across all partner businesses.', color: '#e67e22' },
]

export function AppPreview() {
  return (
    <section className="section-main bg-bg-card/20 border-t border-gold/5">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div>
          <SectionBadge>THE CUSTOMER APP</SectionBadge>
          <h2 className="text-[clamp(28px,3.5vw,44px)] font-black text-white tracking-tight leading-tight mb-4">
            Everything in one <span className="text-gold">magical app</span>
          </h2>
          <p className="text-muted text-base leading-relaxed mb-10">
            Customers scan once, download the app, and enter a world of rewards across every LoyalGenie-powered business.
          </p>
          <div className="flex flex-col gap-4">
            {modules.map((m) => (
              <div
                key={m.name}
                className="flex gap-4 p-5 rounded-2xl border border-gold/10 bg-bg-card/50 backdrop-blur-md hover:border-gold/35 hover:translate-x-1.5 transition-all"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${m.color}22`, border: `1px solid ${m.color}44` }}
                >
                  <m.Icon size={20} color={m.color} strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-[15px] mb-1">{m.name}</h3>
                  <p className="text-muted text-[13px] leading-relaxed">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center relative">
          <div
            className="absolute w-[300px] h-[300px] rounded-full pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ background: 'radial-gradient(circle, rgba(107,63,212,0.4) 0%, transparent 70%)' }}
          />

          <div
            className="relative w-[260px] rounded-[40px] p-3.5 animate-float"
            style={{
              background: '#0a0520',
              border: '2px solid rgba(240,192,64,0.2)',
              boxShadow: '0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(107,63,212,0.2)',
              animationDelay: '1s',
            }}
          >
            <div className="flex justify-between px-3 pt-1 pb-3 text-[11px] text-muted">
              <span>9:41</span>
              <div className="flex gap-1 items-center text-xs">
                <span>▲</span><span>WiFi</span><span>🔋</span>
              </div>
            </div>

            <div className="rounded-[28px] overflow-hidden px-4 py-5" style={{ background: '#0f0628' }}>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-muted text-[11px]">Good Morning 👋</p>
                  <p className="text-white text-[15px] font-bold">Priya</p>
                </div>
                <span className="text-2xl">🧞</span>
              </div>

              <div
                className="rounded-2xl p-4 mb-4"
                style={{ background: 'linear-gradient(135deg, #3d1f8a, #6b3fd4)' }}
              >
                <p className="text-white/70 text-[10px] mb-1">ACTIVE REWARD</p>
                <p className="text-gold text-lg font-black mb-1">₹100 Off</p>
                <p className="text-white/80 text-[11px]">Glow Salon • Expires in 3 days</p>
                <span
                  className="inline-block mt-3 rounded-full px-3.5 py-1.5 text-[11px] font-semibold text-white"
                  style={{ background: 'rgba(255,255,255,0.15)' }}
                >
                  Tap to Redeem
                </span>
              </div>

              <p className="text-muted text-[11px] mb-2.5">MY PLACES</p>
              {[
                { name: 'Brew & Co.', emoji: '☕', pts: '240 pts' },
                { name: 'PawCare Clinic', emoji: '🐾', pts: '80 pts' },
              ].map((p) => (
                <div
                  key={p.name}
                  className="flex justify-between items-center rounded-[10px] px-3 py-2.5 mb-2"
                  style={{ background: 'rgba(26,11,75,0.6)' }}
                >
                  <div className="flex gap-2 items-center">
                    <span className="text-base">{p.emoji}</span>
                    <span className="text-white text-xs font-semibold">{p.name}</span>
                  </div>
                  <span className="text-gold text-[11px] font-semibold">{p.pts}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-around pt-3 mt-1.5 border-t border-white/5">
              {([
                { Icon: Home, label: 'Home', active: true },
                { Icon: Search, label: 'Discover', active: false },
                { Icon: Wallet, label: 'Wallet', active: false },
                { Icon: User, label: 'Profile', active: false },
              ] as const).map(({ Icon, label, active }) => (
                <div key={label} className="text-center">
                  <div className="flex justify-center">
                    <Icon size={16} color={active ? '#f0c040' : '#8b7db5'} strokeWidth={active ? 2.5 : 1.75} />
                  </div>
                  <p className="text-[9px] mt-0.5" style={{ color: active ? '#f0c040' : '#8b7db5' }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
