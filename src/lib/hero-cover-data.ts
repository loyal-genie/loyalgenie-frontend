import type { ComponentType } from 'react'
import {
  Tag, ShoppingCart, Clock, ShieldCheck, ShoppingBag, Star, Zap, Gift,
  TicketPercent, Wallet, ThumbsUp, Ticket, CalendarDays, UserPlus, Trophy,
  type LucideIcon,
} from 'lucide-react'
import {
  SpinWheelArt, RollDiceArt, CouponTicketArt, BundleGiftArt, FlashClockArt,
  LotteryDrawArt, SpendGetArt, FriendHeartArt, GroupUnlockArt,
  CheckInCalendarArt, StampCupArt, ShakePhoneArt,
} from '@/components/customer/mechanic-cover-art'

export interface HeroCover {
  headline: string
  headlineAccent?: string
  accentColor?: string
  tagline: string
  bgFrom: string
  bgTo: string
  textColor: string
  layout: 'side' | 'center'
  badgeBg?: string
  badgeTextColor?: string
  badgeRight?: string
  art?: ComponentType<{ className?: string }>
  features?: { icon: LucideIcon; label: string }[]
  footerBanner?: string
  /** Detail/PIN hero height. */
  detailCoverClass: string
}

/** Pastel hero covers — source of truth aligned with the design prototype. */
export const HERO_COVER: Record<string, HeroCover> = {
  spin: {
    headline: 'Spin & Win',
    tagline: 'Spin the wheel for exciting rewards every time!',
    bgFrom: '#EDE9FE',
    bgTo: '#DDD6FE',
    textColor: '#4C1D95',
    layout: 'side',
    art: SpinWheelArt,
    detailCoverClass: 'h-64',
  },
  dice: {
    headline: 'Roll & Win',
    tagline: 'Roll the dice and get rewarded instantly!',
    bgFrom: '#FCE7F3',
    bgTo: '#FBCFE8',
    textColor: '#831843',
    layout: 'side',
    art: RollDiceArt,
    detailCoverClass: 'h-64',
  },
  coupon: {
    headline: 'Exclusive Savings',
    tagline: 'Apply your code at checkout and save more.',
    bgFrom: '#ECFBFE',
    bgTo: '#B4E1EB',
    textColor: '#0B4A5C',
    layout: 'side',
    art: CouponTicketArt,
    features: [
      { icon: Tag, label: 'Extra Savings' },
      { icon: ShoppingCart, label: 'Easy to Use' },
      { icon: Clock, label: 'Limited Time' },
      { icon: ShieldCheck, label: 'All Orders' },
    ],
    detailCoverClass: 'h-80',
  },
  combo: {
    headline: 'Bundle & Save',
    tagline: 'The more you buy, the more you save!',
    bgFrom: '#EEF2FF',
    bgTo: '#E0E7FF',
    textColor: '#312E81',
    layout: 'side',
    art: BundleGiftArt,
    features: [
      { icon: ShoppingBag, label: 'Buy More' },
      { icon: Tag, label: 'Extra Rewards' },
      { icon: Gift, label: 'Exclusive' },
      { icon: Star, label: 'Best Value' },
    ],
    detailCoverClass: 'h-80',
  },
  flash: {
    headline: 'Flash Sale',
    tagline: "Amazing offers, limited time — don't miss out!",
    bgFrom: '#EFF6FF',
    bgTo: '#DBEAFE',
    textColor: '#1E3A8A',
    layout: 'side',
    art: FlashClockArt,
    features: [
      { icon: Tag, label: 'Exciting Deals' },
      { icon: ShoppingBag, label: 'Limited Stock' },
      { icon: Zap, label: 'Hurry Up' },
      { icon: ShieldCheck, label: 'Secure Checkout' },
    ],
    detailCoverClass: 'h-80',
  },
  lottery: {
    headline: 'Your Chance to',
    headlineAccent: 'Win Big!',
    accentColor: '#7C6EF0',
    tagline: 'Earn a ticket every visit and stand a chance to win exciting prizes.',
    bgFrom: '#F5F3FF',
    bgTo: '#EDE9FE',
    textColor: '#2E1065',
    layout: 'side',
    art: LotteryDrawArt,
    features: [
      { icon: Ticket, label: 'Earn Tickets' },
      { icon: CalendarDays, label: 'Weekly Draw' },
      { icon: Trophy, label: 'Exciting Prizes' },
    ],
    footerBanner: 'More tickets, more chances, more rewards!',
    detailCoverClass: 'h-96',
  },
  'buy-x-get-y': {
    headline: 'Spend X, Get Y',
    tagline: 'Spend or buy a minimum amount and get exciting rewards!',
    bgFrom: '#F0FDF4',
    bgTo: '#DCFCE7',
    textColor: '#14532D',
    layout: 'side',
    art: SpendGetArt,
    features: [
      { icon: Wallet, label: 'More You Spend' },
      { icon: Gift, label: 'Exciting Rewards' },
      { icon: TicketPercent, label: 'Great Benefits' },
      { icon: ThumbsUp, label: 'Instant Reward' },
    ],
    detailCoverClass: 'h-80',
  },
  friend: {
    headline: 'Better Together',
    tagline: 'Invite a friend along — you both get rewarded!',
    bgFrom: '#FFE4E9',
    bgTo: '#FFC1CC',
    textColor: '#9F1239',
    layout: 'side',
    art: FriendHeartArt,
    detailCoverClass: 'h-64',
  },
  groupunlock: {
    headline: 'Stronger Together,',
    headlineAccent: 'Better Rewards!',
    accentColor: '#059669',
    tagline: 'Enjoy exclusive rewards as a valued community member.',
    bgFrom: '#ECFDF5',
    bgTo: '#D1FAE5',
    textColor: '#064E3B',
    layout: 'side',
    art: GroupUnlockArt,
    features: [
      { icon: UserPlus, label: 'Community' },
      { icon: Gift, label: 'Rewards' },
      { icon: TicketPercent, label: 'Offers' },
    ],
    detailCoverClass: 'h-80',
  },
  'check-in-loyalty': {
    headline: 'Check In &',
    headlineAccent: 'WIN',
    accentColor: '#BBF7D0',
    tagline: 'Show up daily. Stack your points.',
    bgFrom: '#34D399',
    bgTo: '#047857',
    textColor: '#FFFFFF',
    badgeTextColor: '#065F46',
    layout: 'side',
    art: CheckInCalendarArt,
    detailCoverClass: 'h-64',
  },
  stamp: {
    headline: 'Collect & Win',
    tagline: 'Every visit gets you closer to a surprise reward.',
    bgFrom: '#FCD34D',
    bgTo: '#B45309',
    textColor: '#451A03',
    badgeTextColor: '#92400E',
    layout: 'side',
    art: StampCupArt,
    badgeRight: 'Surprise + big rewards',
    detailCoverClass: 'h-64',
  },
  shake: {
    headline: 'Shake & Win',
    tagline: 'Shake your phone to reveal your reward',
    bgFrom: '#A78BFA',
    bgTo: '#5B21B6',
    textColor: '#FFFFFF',
    badgeTextColor: '#5B21B6',
    layout: 'side',
    art: ShakePhoneArt,
    detailCoverClass: 'h-64',
  },
}

export function getHeroCover(mechanic: string): HeroCover {
  return HERO_COVER[mechanic] ?? HERO_COVER.shake!
}
