export type MechanicType = 'shake' | 'stamp' | 'check-in-loyalty' | 'spin' | 'dice' | 'lottery'
export type CampaignStatus = 'active' | 'draft' | 'ended' | 'paused'
export type RewardType = 'single' | 'range'

export interface Reward {
  id: string
  name: string
  description: string
  value: string
  icon: string
}

export interface Campaign {
  id: string
  name: string
  mechanic: MechanicType
  status: CampaignStatus
  startDate: string
  endDate: string
  userCap: number
  currentUsers: number
  playsPerUser: number
  rewards: Reward[]
  config: ShakeConfig | StampConfig | CheckInLoyaltyConfig | SpinConfig | DiceConfig | LotteryConfig
  pin: string
  pinExpiresAt: number
  participations: number
  rewardsClaimed: number
  redeemedCount: number
  createdAt: string
}

export interface ShakeConfig {
  type: 'shake'
  playsPerUser: number
  rewardType: RewardType
  winProbability: number
}

export interface StampConfig {
  type: 'stamp'
  totalStamps: number
  surpriseDropRange: [number, number]
  bigRewardPosition: number
  surpriseReward: Reward
  bigReward: Reward
}

export interface CheckInLoyaltyConfig {
  type: 'check-in-loyalty'
  pointsPerCheckIn: number
  milestones: { name: string; icon: string; pointsThreshold: number }[]
}

export interface SpinConfig {
  type: 'spin'
  segments: SpinSegment[]
  spinsPerUser: number
}

export interface SpinSegment {
  id?: string
  label: string
  reward: string | null
  probability: number
  color: string
  isWin: boolean
}

export interface DiceConfig {
  type: 'dice'
  rollsPerUser: number
  outcomes: DiceOutcome[]
}

export interface DiceOutcome {
  value: number
  reward: string | null
  isWin: boolean
}

export interface LotteryConfig {
  type: 'lottery'
  ticketLimit: number
  jackpotReward: Reward
  tiers: LotteryTier[]
}

export interface LotteryTier {
  name: string
  reward: string
  probability: number
  color: string
}

export interface Customer {
  id: string
  name: string
  phone: string
  email: string
  dob: string
  joinedAt: string
  lastVisit: string
  totalVisits: number
  gamesPlayed: number
  rewardsEarned: number
  status: 'active' | 'inactive'
  rewards: CustomerReward[]
  gameHistory: GameHistoryItem[]
}

export interface CustomerReward {
  id: string
  campaignId: string
  campaignName: string
  mechanic: MechanicType
  reward: string
  earnedAt: string
  status: 'earned' | 'pending' | 'redeemed'
  requestedAt?: string
  redeemedAt?: string
  code: string
}

export interface GameHistoryItem {
  id: string
  campaignId: string
  campaignName: string
  mechanic: MechanicType
  playedAt: string
  won: boolean
  reward?: string
}

export interface RedemptionQueueItem {
  id: string
  customerId: string
  customerName: string
  phone: string
  reward: string
  campaignName: string
  mechanic: MechanicType
  earnedAt: string
  code: string
}

export interface BusinessProfile {
  id: string
  name: string
  category: string
  tagline: string
  description: string
  logo: string
  address: string
  city: string
  phone: string
  email: string
  hours: string
  website: string
  qrCode: string
}

export interface CustomerBusiness {
  id: string
  name: string
  category: 'Cafe' | 'Salon' | 'Gym' | 'Restaurant' | 'Jewellery'
  tagline: string
  rating: number
  reviews: number
  distance: string
  location: string
  coverFrom: string
  coverTo: string
  coverEmoji: string
  mechanics: { type: MechanicType; label: string; description: string }[]
}
