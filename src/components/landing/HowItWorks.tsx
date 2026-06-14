import { useState } from 'react'
import { Settings, QrCode, UserCheck, Smartphone, RefreshCw } from 'lucide-react'
import { SectionBadge } from '@/components/landing/SectionBadge'
import { InfoModal, type ModalContent } from '@/components/ui/info-modal'

const steps: {
  step: string
  Icon: typeof Settings
  title: string
  desc: string
  color: string
  modal: ModalContent
}[] = [
  {
    step: '01', Icon: Settings, title: 'Set Up Your Campaign', color: '#6b3fd4',
    desc: 'Log into your LoyalGenie dashboard. Choose your mechanics — Stamp Card, Spin Wheel, Mystery Box, and more. Go live in minutes.',
    modal: {
      icon: '⚙️', title: 'Set Up Your Campaign',
      sections: [
        { label: 'WHAT HAPPENS HERE?', text: 'You log into the LoyalGenie dashboard on any device — phone, tablet, or laptop. Choose from ready-made templates for salons, cafes, restaurants, gyms, and more. Pick your mechanics, define your rewards, and hit publish. Most businesses are live in under 10 minutes.' },
        { label: 'WHAT DO YOU CONTROL?', text: 'Everything. You decide the reward type, the probability of each prize, the validity period, and when to run flash promotions. Want to push a special offer on a slow Tuesday? Change it in 60 seconds from your phone.' },
      ],
      proof: { text: '"Pro tip: Start with Stamp Card + Shake & Win combination. This pairing consistently delivers the highest new customer engagement and repeat visit rates in the first 30 days."', source: 'LoyalGenie onboarding data' },
    },
  },
  {
    step: '02', Icon: QrCode, title: 'Place the Standee', color: '#f0c040',
    desc: 'Put the LoyalGenie standee on your counter — just like Google Pay. Customers see it and know exactly what to do.',
    modal: {
      icon: '🪧', title: 'Place the Standee',
      sections: [
        { label: 'WHAT IS THE STANDEE?', text: 'Your LoyalGenie standee arrives printed, branded, and ready to use. It displays your business name, a unique QR code, and a simple call-to-action. Place it at eye level on your billing counter.' },
        { label: 'WHY DOES PLACEMENT MATTER?', text: 'Customers already have a habit loop around QR codes at the counter. Counter-level placement at billing is the highest-converting position because the customer is already holding their phone.' },
      ],
      proof: { text: '"Businesses that place the standee at the billing counter see 3× more scans than those who place it on tables or near the door."', source: 'LoyalGenie placement A/B test data' },
    },
  },
  {
    step: '03', Icon: UserCheck, title: 'Customer Scans & Joins', color: '#27ae60',
    desc: 'Customer scans the QR code, opens the app in seconds, and joins your loyalty program — no friction, no download barrier.',
    modal: {
      icon: '📲', title: 'Customer Scans & Joins',
      sections: [
        { label: 'WHAT DOES THE CUSTOMER DO?', text: 'They scan your QR code with their phone camera. A lightweight web page loads instantly — no app download required to get started. They enter their name and phone number. The entire process takes under 30 seconds.' },
        { label: 'WHAT DO YOU GET?', text: 'Their name and phone number — stored in your LoyalGenie dashboard forever. This is your customer database, built automatically with every scan.' },
      ],
      proof: { text: '"The average Indian SME has no idea who their top 20 customers are. LoyalGenie changes that from day one."', source: 'LoyalGenie product philosophy' },
    },
  },
  {
    step: '04', Icon: Smartphone, title: 'Shake It & Win It', color: '#e9a820',
    desc: 'Customers shake their phone and a reward is revealed — coupon, discount, free item. Pure magic. Pure delight.',
    modal: {
      icon: '🎉', title: 'Shake It & Win It',
      sections: [
        { label: 'WHAT IS THIS MOMENT?', text: 'This is the moment that makes LoyalGenie unforgettable. The customer shakes their phone. An animation plays. Confetti bursts. A reward is revealed — a discount, free item, or bonus stamps.' },
        { label: 'WHY IS THIS SO POWERFUL?', text: 'Physical interaction creates embodied memory — customers remember an experience they physically did, far longer than a static coupon they received.' },
      ],
      proof: { text: '"Research shows physical gestures make digital rewards feel more real and earned. Swiggy\'s Shake to Win campaign during IPL 2023 saw 3× higher engagement vs. static offers."', source: 'Consumer psychology research + Swiggy campaign data' },
    },
  },
  {
    step: '05', Icon: RefreshCw, title: 'They Come Back', color: '#6b3fd4',
    desc: 'Customers return to redeem their reward. You see visit history, track regulars, and run targeted re-engagement campaigns.',
    modal: {
      icon: '🔄', title: 'They Come Back',
      sections: [
        { label: 'WHAT DO YOU SEE?', text: 'Your dashboard shows every customer — how often they visit, when they last came in, what rewards they\'ve won and redeemed. You can see your top 10 regulars at a glance.' },
        { label: 'WHAT HAPPENS AUTOMATICALLY?', text: 'When a regular hasn\'t visited in 30 days, LoyalGenie automatically flags them and can send a personalised nudge — "We miss you! Here\'s a special reward just for you."' },
      ],
      proof: { text: '"The top 20% of your customers generate 80% of your revenue. Businesses using our re-engagement campaigns report recovering 30–40% of lapsed regulars."', source: 'Gartner research + LoyalGenie merchant data' },
    },
  },
]

export function HowItWorks() {
  const [modal, setModal] = useState<ModalContent | null>(null)

  return (
    <section id="how-it-works" className="section-main">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-16">
          <SectionBadge>HOW IT WORKS</SectionBadge>
          <h2 className="text-[clamp(32px,4vw,50px)] font-black text-white tracking-tight leading-tight mb-4">
            Up and running in <span className="text-gold">under 10 minutes</span>
          </h2>
          <p className="text-muted text-lg max-w-lg mx-auto leading-relaxed">
            No developers. No complex setup. Just a standee, a QR code, and delighted customers.
          </p>
        </header>

        <div className="how-row1 grid md:grid-cols-3 gap-6 mb-6">
          {steps.slice(0, 3).map((s, i) => (
            <StepCard key={s.step} step={s} index={i} total={3} onLearnMore={() => setModal(s.modal)} />
          ))}
        </div>
        <div className="how-row2 grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {steps.slice(3).map((s, i) => (
            <StepCard key={s.step} step={s} index={i} total={2} onLearnMore={() => setModal(s.modal)} />
          ))}
        </div>
      </div>
      <InfoModal content={modal} onClose={() => setModal(null)} />
    </section>
  )
}

function StepCard({
  step,
  index,
  total,
  onLearnMore,
}: {
  step: typeof steps[0]
  index: number
  total: number
  onLearnMore: () => void
}) {
  return (
    <div className="card-glass p-8 relative flex flex-col">
      <div className="absolute -top-2 -right-2 text-[80px] font-black text-white/[0.03] leading-none select-none pointer-events-none">
        {step.step}
      </div>
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: `${step.color}22`, border: `1px solid ${step.color}44` }}
      >
        <step.Icon size={24} color={step.color} strokeWidth={1.75} />
      </div>
      <span className="text-gold text-xs font-bold tracking-widest mb-2">STEP {step.step}</span>
      <h3 className="text-white text-lg font-bold mb-3">{step.title}</h3>
      <p className="text-muted text-sm leading-relaxed flex-1">{step.desc}</p>
      <button
        type="button"
        onClick={onLearnMore}
        className="mt-4 text-left text-gold/60 hover:text-gold text-xs font-semibold bg-transparent border-none cursor-pointer p-0 transition-colors"
      >
        More detail →
      </button>
      {index < total - 1 && (
        <div
          className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-0.5 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(90deg, rgba(240,192,64,0.4), transparent)' }}
        />
      )}
    </div>
  )
}
