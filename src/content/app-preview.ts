import { Home, Search, Wallet, User, type LucideIcon } from 'lucide-react'

export const APP_MODULES: { Icon: LucideIcon; name: string; desc: string; color: string }[] = [
  {
    Icon: Home,
    name: 'Home',
    desc: "See all businesses you're loyal to. Active rewards, recent wins, and quick access to favourite spots.",
    color: '#6b3fd4',
  },
  {
    Icon: Search,
    name: 'Discover',
    desc: 'Explore every business in the LoyalGenie network near you. Find new places and earn rewards from day one.',
    color: '#f0c040',
  },
  {
    Icon: Wallet,
    name: 'Wallet',
    desc: "All your rewards in one place — active coupons, expiring soon, and a full history of what you've won.",
    color: '#27ae60',
  },
  {
    Icon: User,
    name: 'Profile',
    desc: 'Your loyalty identity. Points, badges, loyalty level, and your history across all partner businesses.',
    color: '#e67e22',
  },
]

export const APP_PLACES = [
  { name: 'Brew & Co.', emoji: '☕', pts: '240 pts' },
  { name: 'PawCare Clinic', emoji: '🐾', pts: '80 pts' },
] as const

export const APP_NAV_ITEMS = [
  { Icon: Home, label: 'Home', active: true },
  { Icon: Search, label: 'Discover', active: false },
  { Icon: Wallet, label: 'Wallet', active: false },
  { Icon: User, label: 'Profile', active: false },
] as const
