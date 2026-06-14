import {
  BarChart2, BellRing, Zap, Gamepad2, Smartphone, TrendingUp, QrCode, Gift, RefreshCw,
  type LucideIcon,
} from 'lucide-react'

export const BUSINESS_TYPES = [
  { icon: '💇', name: 'Salons & Spas' },
  { icon: '☕', name: 'Cafes' },
  { icon: '🍽️', name: 'Restaurants' },
  { icon: '⛽', name: 'Service Stations' },
  { icon: '🐾', name: 'Pet Clinics' },
  { icon: '🏋️', name: 'Gyms' },
  { icon: '🛍️', name: 'Retail Stores' },
  { icon: '🏪', name: 'Any SME' },
] as const

export const BUSINESS_BENEFITS: { Icon: LucideIcon; title: string; desc: string }[] = [
  {
    Icon: BarChart2,
    title: 'Know Your Regulars',
    desc: 'See exactly who your top customers are, how often they visit, and when they start drifting. End the guessing.',
  },
  {
    Icon: BellRing,
    title: 'Re-engage Silently Lost Customers',
    desc: "A regular who hasn't visited in 30 days? Send them a targeted offer automatically. Bring them back before it's too late.",
  },
  {
    Icon: Zap,
    title: 'Zero Tech Headache',
    desc: "No POS integration. No app development. Just a standee on your counter and a 5-minute setup. That's it.",
  },
  {
    Icon: Gamepad2,
    title: 'Gamified Experience',
    desc: "Your customers don't just earn points — they play. Shake, spin, scratch, collect. Fun drives repeat visits.",
  },
  {
    Icon: Smartphone,
    title: 'Your Branded Loyalty App',
    desc: "Your business lives inside LoyalGenie's app — with your name, logo, and offers. Professional loyalty without the price tag.",
  },
  {
    Icon: TrendingUp,
    title: 'Built for Slow Days',
    desc: 'Run a flash offer on Tuesday afternoon. Push a mystery reward on a slow weekend. Turn empty hours into revenue.',
  },
]

export const STANDEE_FLOW: { Icon: LucideIcon; label: string }[] = [
  { Icon: QrCode, label: 'Scan or Tap' },
  { Icon: Gift, label: 'Win Rewards' },
  { Icon: RefreshCw, label: 'Come Back' },
]
