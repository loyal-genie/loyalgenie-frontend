export type MechanicType = 'stamp' | 'spin' | 'shake' | 'lottery' | 'dice' | 'scratch'
export type CampaignStatus = 'active' | 'draft' | 'paused' | 'ended'

export interface Campaign {
  id: string
  name: string
  mechanic: MechanicType
  status: CampaignStatus
  startDate: string
  endDate: string
  userCap: number
  currentUsers: number
  participations: number
  rewardsClaimed: number
  redeemedCount: number
  pin: string
  pinExpiresAt: number
}

export interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  totalVisits: number
  lastVisit: string
  totalRewards: number
  segment?: 'loyalist' | 'regular' | 'at-risk' | 'inactive'
}

export interface RedemptionItem {
  id: string
  customerName: string
  reward: string
  campaignName: string
  status: 'pending' | 'verified'
  createdAt: string
}

export interface BusinessProfile {
  id: string
  name: string
  category: string
  email: string
  phone: string
  address: string
  city: string
}
