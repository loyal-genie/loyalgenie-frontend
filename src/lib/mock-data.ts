import type { BusinessProfile, Campaign, Customer, RedemptionItem } from './types'

export const business: BusinessProfile = {
  id: 'biz-1',
  name: 'Brew & Bite Café',
  category: 'Café & Bakery',
  email: 'hello@brewandbite.in',
  phone: '+91 98765 43210',
  address: '12, Koramangala 4th Block',
  city: 'Bangalore',
}

export const campaigns: Campaign[] = [
  {
    id: 'camp-1',
    name: 'Weekend Spin Fiesta',
    mechanic: 'spin',
    status: 'active',
    startDate: '2026-06-10',
    endDate: '2026-06-30',
    userCap: 500,
    currentUsers: 312,
    participations: 312,
    rewardsClaimed: 198,
    redeemedCount: 141,
    pin: '472',
    pinExpiresAt: Date.now() + 42000,
  },
  {
    id: 'camp-2',
    name: 'Loyalty Stamp Card — June',
    mechanic: 'stamp',
    status: 'active',
    startDate: '2026-06-01',
    endDate: '2026-06-30',
    userCap: 300,
    currentUsers: 187,
    participations: 187,
    rewardsClaimed: 43,
    redeemedCount: 18,
    pin: '815',
    pinExpiresAt: Date.now() + 28000,
  },
  {
    id: 'camp-3',
    name: 'Monsoon Shake & Win',
    mechanic: 'shake',
    status: 'active',
    startDate: '2026-06-13',
    endDate: '2026-07-15',
    userCap: 1000,
    currentUsers: 89,
    participations: 89,
    rewardsClaimed: 61,
    redeemedCount: 28,
    pin: '237',
    pinExpiresAt: Date.now() + 55000,
  },
]

export const customers: Customer[] = [
  { id: 'c1', name: 'Priya Sharma', phone: '+91 98765 11111', totalVisits: 24, lastVisit: '2026-06-12', totalRewards: 8 },
  { id: 'c2', name: 'Arjun Mehta', phone: '+91 98765 22222', totalVisits: 18, lastVisit: '2026-06-10', totalRewards: 5 },
  { id: 'c3', name: 'Sneha Reddy', phone: '+91 98765 33333', totalVisits: 15, lastVisit: '2026-06-08', totalRewards: 4 },
  { id: 'c4', name: 'Rahul Kapoor', phone: '+91 98765 44444', totalVisits: 9, lastVisit: '2026-05-28', totalRewards: 2 },
  { id: 'c5', name: 'Ananya Iyer', phone: '+91 98765 55555', totalVisits: 6, lastVisit: '2026-05-15', totalRewards: 1 },
  { id: 'c6', name: 'Vikram Singh', phone: '+91 98765 66666', totalVisits: 4, lastVisit: '2026-04-20', totalRewards: 1 },
  { id: 'c7', name: 'Meera Nair', phone: '+91 98765 77777', totalVisits: 3, lastVisit: '2026-04-05', totalRewards: 0 },
]

export const redemptionQueue: RedemptionItem[] = [
  { id: 'r1', customerName: 'Priya Sharma', reward: 'Free Coffee', campaignName: 'Weekend Spin Fiesta', status: 'pending', createdAt: '2026-06-13T09:15:00Z' },
  { id: 'r2', customerName: 'Arjun Mehta', reward: '20% Off', campaignName: 'Monsoon Shake & Win', status: 'pending', createdAt: '2026-06-13T08:42:00Z' },
  { id: 'r3', customerName: 'Sneha Reddy', reward: 'Free Muffin', campaignName: 'Weekend Spin Fiesta', status: 'verified', createdAt: '2026-06-13T08:10:00Z' },
]
