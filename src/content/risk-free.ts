import {
  ShieldCheck, RefreshCw, ThumbsUp, Megaphone, Users, Award, TrendingUp,
  Calendar, CreditCard, Package, Unlock, Clock, Star, type LucideIcon,
} from 'lucide-react'

export const RISK_COSTS = [
  { label: '10 minutes', sub: 'to set up your campaign' },
  { label: 'One standee', sub: "on your counter — that's it" },
  { label: 'Zero tech skills', sub: 'no integrations, no developers' },
  { label: 'Free for 30 days', sub: 'no credit card required' },
] as const

export const RISK_GAINS: { Icon: LucideIcon; color: string; title: string; desc: string }[] = [
  {
    Icon: RefreshCw, color: '#6b3fd4',
    title: 'More Repeat Visits',
    desc: 'Your regulars come back more often and more predictably — driven by rewards they actually want.',
  },
  {
    Icon: ThumbsUp, color: '#27ae60',
    title: 'Higher NPS',
    desc: 'Customers who feel rewarded feel valued. Valued customers recommend you to everyone they know.',
  },
  {
    Icon: Megaphone, color: '#e67e22',
    title: 'Word of Mouth',
    desc: '"You have to try this place." The shake-and-win moment is inherently talkable — people bring it up.',
  },
  {
    Icon: Users, color: '#2980b9',
    title: 'Referrals',
    desc: 'Customers bring friends just to show them the experience. Free acquisition with zero ad spend.',
  },
  {
    Icon: Award, color: '#f0c040',
    title: 'Stronger Brand',
    desc: "You're no longer just a shop. You're the café or salon with that fun loyalty thing everyone talks about.",
  },
  {
    Icon: TrendingUp, color: '#9b59b6',
    title: 'Invaluable Marketing & Social Media Buzz',
    desc: "Customers share their wins on WhatsApp and Instagram Stories — organic reach and brand visibility you can't buy.",
  },
  {
    Icon: Star, color: '#e74c3c',
    title: 'World-class Marketing & Loyalty Programs',
    desc: 'Everything a big brand runs to retain and grow customers — done for your business, without the agency price tag.',
  },
  {
    Icon: Clock, color: '#16a085',
    title: 'Pull Customers During Slow Periods',
    desc: 'Run targeted offers on Tuesdays, Wednesdays, Thursdays — turn your quietest hours into your most profitable ones.',
  },
]

export const RISK_GUARANTEES: { Icon: LucideIcon; label: string }[] = [
  { Icon: ShieldCheck, label: 'Pay only after proof' },
  { Icon: Calendar, label: 'Free for 30 days' },
  { Icon: CreditCard, label: 'No credit card needed' },
  { Icon: Package, label: 'Standee on your counter in 3 days' },
  { Icon: Unlock, label: 'Cancel anytime, no questions' },
]
