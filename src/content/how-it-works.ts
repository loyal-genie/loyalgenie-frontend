import { Settings, QrCode, UserCheck, Smartphone, RefreshCw } from 'lucide-react'
import type { ModalContent } from '@/types/modal'

export interface HowItWorksStep {
  step: string
  Icon: typeof Settings
  title: string
  desc: string
  color: string
  modal: ModalContent
}

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    step: '01',
    Icon: Settings,
    title: 'Set Up Your Campaign',
    desc: 'Log into your LoyalGenie dashboard. Choose your mechanics — Stamp Card, Spin Wheel, Mystery Box, and more. Go live in minutes.',
    color: '#6b3fd4',
    modal: {
      icon: '⚙️',
      title: 'Set Up Your Campaign',
      sections: [
        {
          label: 'WHAT HAPPENS HERE?',
          text: 'You log into the LoyalGenie dashboard on any device — phone, tablet, or laptop. Choose from ready-made templates for salons, cafes, restaurants, gyms, and more. Pick your mechanics, define your rewards (what customers win, the value, expiry), and hit publish. Most businesses are live in under 10 minutes.',
        },
        {
          label: 'WHAT DO YOU CONTROL?',
          text: 'Everything. You decide the reward type (discount, free item, bonus points), the probability of each prize, the validity period, and when to run flash promotions. Want to push a special offer on a slow Tuesday? Change it in 60 seconds from your phone. No developers, no waiting, no cost.',
        },
      ],
      proof: {
        text: '"Pro tip: Start with Stamp Card + Shake & Win combination. This pairing consistently delivers the highest new customer engagement and repeat visit rates in the first 30 days."',
        source: 'LoyalGenie onboarding data',
      },
    },
  },
  {
    step: '02',
    Icon: QrCode,
    title: 'Place the Standee',
    desc: 'Put the LoyalGenie standee on your counter — just like Google Pay. Customers see it and know exactly what to do.',
    color: '#f0c040',
    modal: {
      icon: '🪧',
      title: 'Place the Standee',
      sections: [
        {
          label: 'WHAT IS THE STANDEE?',
          text: 'Your LoyalGenie standee arrives printed, branded, and ready to use. It displays your business name, a unique QR code, and a simple call-to-action. Place it at eye level on your billing counter — exactly where your Google Pay or Paytm standee sits today.',
        },
        {
          label: 'WHY DOES PLACEMENT MATTER?',
          text: 'Customers already have a habit loop around QR codes at the counter — they pick up their phone to pay, and seeing a loyalty standee right next to it triggers an instant scan. Counter-level placement at billing is the highest-converting position because the customer is already holding their phone.',
        },
      ],
      proof: {
        text: '"Businesses that place the standee at the billing counter see 3× more scans than those who place it on tables or near the door. Eye contact at payment moment is the highest-intent touchpoint in your entire store."',
        source: 'LoyalGenie placement A/B test data',
      },
    },
  },
  {
    step: '03',
    Icon: UserCheck,
    title: 'Customer Scans & Joins',
    desc: 'Customer scans the QR code, opens the app in seconds, and joins your loyalty program — no friction, no download barrier.',
    color: '#27ae60',
    modal: {
      icon: '📲',
      title: 'Customer Scans & Joins',
      sections: [
        {
          label: 'WHAT DOES THE CUSTOMER DO?',
          text: "They scan your QR code with their phone camera. A lightweight web page loads instantly — no app download required to get started. They enter their name and phone number. That's it. The entire process takes under 30 seconds. First-time reward is triggered immediately to create instant delight.",
        },
        {
          label: 'WHAT DO YOU GET?',
          text: 'Their name and phone number — stored in your LoyalGenie dashboard forever. This is your customer database, built automatically with every scan. You now have the ability to send them targeted offers, re-engagement messages, and personalised rewards. Something most small businesses never have.',
        },
      ],
      proof: {
        text: '"The average Indian SME has no idea who their top 20 customers are. LoyalGenie changes that from day one — every scan builds a customer profile you can act on. Data privacy is fully compliant; customer data belongs to you."',
        source: 'LoyalGenie product philosophy',
      },
    },
  },
  {
    step: '04',
    Icon: Smartphone,
    title: 'Shake It & Win It',
    desc: 'Customers shake their phone and a reward is revealed — coupon, discount, free item. Pure magic. Pure delight.',
    color: '#e9a820',
    modal: {
      icon: '🎉',
      title: 'Shake It & Win It',
      sections: [
        {
          label: 'WHAT IS THIS MOMENT?',
          text: 'This is the moment that makes LoyalGenie unforgettable. The customer shakes their phone. An animation plays. Confetti bursts. A reward is revealed — a discount on their next visit, a free item, or bonus stamps. It takes 3 seconds and leaves a lasting impression.',
        },
        {
          label: 'WHY IS THIS SO POWERFUL?',
          text: 'Physical interaction creates embodied memory — customers remember an experience they physically did, far longer than a static coupon they received. The "shake" is also inherently social: customers pull out their phones and show friends sitting across the table, generating organic word-of-mouth at zero cost to you. Every shake is a brand moment.',
        },
      ],
      proof: {
        text: '"Research shows physical gestures make digital rewards feel more real and earned. Customers remember experiential rewards 4× longer than passive ones. Swiggy\'s \'Shake to Win\' campaign during IPL 2023 saw 3× higher engagement vs. static offers."',
        source: 'Consumer psychology research + Swiggy campaign data',
      },
    },
  },
  {
    step: '05',
    Icon: RefreshCw,
    title: 'They Come Back',
    desc: 'Customers return to redeem their reward. You see visit history, track regulars, and run targeted re-engagement campaigns.',
    color: '#6b3fd4',
    modal: {
      icon: '🔄',
      title: 'They Come Back',
      sections: [
        {
          label: 'WHAT DO YOU SEE?',
          text: "Your dashboard shows every customer — how often they visit, when they last came in, what rewards they've won and redeemed. You can see your top 10 regulars at a glance, identify customers who are drifting, and trigger targeted re-engagement offers — all from your phone.",
        },
        {
          label: 'WHAT HAPPENS AUTOMATICALLY?',
          text: 'When a regular hasn\'t visited in 30 days (you define the window), LoyalGenie automatically flags them and can send a personalised nudge — "We miss you! Here\'s a special reward just for you." This silent retention system runs in the background while you focus on running your business.',
        },
      ],
      proof: {
        text: '"The top 20% of your customers generate 80% of your revenue (Gartner/Pareto). LoyalGenie helps you identify, protect, and deepen relationships with exactly those customers. Businesses using our re-engagement campaigns report recovering 30–40% of lapsed regulars."',
        source: 'Gartner research + LoyalGenie merchant data',
      },
    },
  },
]
