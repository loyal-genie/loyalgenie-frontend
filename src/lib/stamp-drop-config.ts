import type { RewardEntry, RewardMode } from '@/components/vendor/RewardPoolEditor'
import { newRewardEntry } from '@/components/vendor/RewardPoolEditor'

export type StampDropUiState = {
  id: string
  label: string
  from: number
  to: number
  mode: RewardMode
  color: string
  singleName: string
  pool: RewardEntry[]
}

export const SURPRISE_DROP_COLORS = ['#F3E8FF', '#E0E7FF', '#DBEAFE', '#D1FAE5', '#CCFBF1']
export const BIG_REWARD_COLORS = ['#FEF3C7', '#FFEDD5', '#FEE2E2', '#FCE7F3', '#FDE68A']

export function newStampDrop(tier: 'surprise' | 'big', index: number, totalStamps: number): StampDropUiState {
  const colors = tier === 'surprise' ? SURPRISE_DROP_COLORS : BIG_REWARD_COLORS
  const from = tier === 'surprise' ? Math.min(3 + index * 2, totalStamps) : Math.max(1, totalStamps - 2 - index * 2)
  const to = Math.min(from + 2, totalStamps)
  return {
    id: `${tier}-${Math.random().toString(36).slice(2, 9)}`,
    label: tier === 'surprise' ? `Surprise Drop ${index + 1}` : `Big Reward ${index + 1}`,
    from,
    to,
    mode: 'single',
    color: colors[index % colors.length]!,
    singleName: tier === 'surprise' ? 'Mystery Treat' : 'Free Breakfast Combo',
    pool: [newRewardEntry()],
  }
}

export function defaultStampUiState() {
  return {
    totalStamps: 10,
    prefillStamps: 0,
    surpriseDrops: [newStampDrop('surprise', 0, 10)],
    bigRewards: [newStampDrop('big', 0, 10)],
  }
}

export function isStampDropValid(drop: StampDropUiState): boolean {
  if (drop.from < 1 || drop.to < drop.from) return false
  if (drop.mode === 'single') {
    const r = drop.pool[0]
    const redeemOk = r?.redeemExpiryMode === 'fixed'
      ? Boolean(r.redeemFixedDate)
      : (r?.redeemRelativeAmount ?? 0) > 0
    return drop.singleName.trim().length > 0 && redeemOk
  }
  const named = drop.pool.filter(r => r.name.trim())
  const total = drop.pool.reduce((s, r) => s + r.probability, 0)
  return named.length > 0
    && named.every(r => r.redeemExpiryMode === 'fixed' ? Boolean(r.redeemFixedDate) : r.redeemRelativeAmount > 0)
    && total >= 1
    && total <= 100
}

export function mapRewardEntry(r: RewardEntry) {
  return {
    ...(r.id ? { id: r.id } : {}),
    name: r.name.trim(),
    description: r.description,
    icon: r.icon,
    winPercent: r.probability,
    redeemExpiryMode: r.redeemExpiryMode,
    redeemFixedDate: r.redeemExpiryMode === 'fixed' ? r.redeemFixedDate : undefined,
    redeemRelativeAmount: r.redeemExpiryMode === 'relative' ? r.redeemRelativeAmount : undefined,
    redeemRelativeUnit: r.redeemExpiryMode === 'relative' ? r.redeemRelativeUnit : undefined,
  }
}

function singleRewardEntry(drop: StampDropUiState, icon: string) {
  const r = drop.pool[0]
  return {
    ...(r?.id ? { id: r.id } : {}),
    name: drop.singleName.trim(),
    description: '',
    icon,
    winPercent: 100,
    redeemExpiryMode: r?.redeemExpiryMode ?? 'relative',
    redeemFixedDate: r?.redeemExpiryMode === 'fixed' ? r.redeemFixedDate : undefined,
    redeemRelativeAmount: r?.redeemExpiryMode === 'relative' ? (r.redeemRelativeAmount ?? 7) : undefined,
    redeemRelativeUnit: r?.redeemExpiryMode === 'relative' ? (r.redeemRelativeUnit ?? 'day') : undefined,
  }
}

export function buildStampCampaignPayload(stampUi: {
  totalStamps: number
  prefillStamps: number
  surpriseDrops: StampDropUiState[]
  bigRewards: StampDropUiState[]
}) {
  const surpriseRewards: Record<string, ReturnType<typeof mapRewardEntry>[]> = {}
  for (const drop of stampUi.surpriseDrops) {
    surpriseRewards[drop.id] = drop.mode === 'single'
      ? [singleRewardEntry(drop, '🎁')]
      : drop.pool.filter(r => r.name.trim()).map(mapRewardEntry)
  }

  const bigRewards: Record<string, ReturnType<typeof mapRewardEntry>[]> = {}
  for (const drop of stampUi.bigRewards) {
    bigRewards[drop.id] = drop.mode === 'single'
      ? [singleRewardEntry(drop, '🏆')]
      : drop.pool.filter(r => r.name.trim()).map(mapRewardEntry)
  }

  return {
    stampConfig: {
      totalStamps: stampUi.totalStamps,
      prefillStamps: stampUi.prefillStamps,
      surpriseDrops: stampUi.surpriseDrops.map(d => ({
        id: d.id,
        label: d.label,
        from: d.from,
        to: d.to,
        mode: d.mode,
        color: d.color,
      })),
      bigRewards: stampUi.bigRewards.map(d => ({
        id: d.id,
        label: d.label,
        from: d.from,
        to: d.to,
        mode: d.mode,
        color: d.color,
      })),
    },
    rewards: { surprise: surpriseRewards, big: bigRewards },
  }
}

function parseRewardTier(tier: string | null | undefined): { kind: 'surprise' | 'big'; dropId: string } | null {
  if (!tier) return null
  if (tier === 'surprise') return { kind: 'surprise', dropId: 'surprise-0' }
  if (tier === 'big') return { kind: 'big', dropId: 'big-0' }
  const surpriseMatch = tier.match(/^surprise:(.+)$/)
  if (surpriseMatch) return { kind: 'surprise', dropId: surpriseMatch[1]! }
  const bigMatch = tier.match(/^big:(.+)$/)
  if (bigMatch) return { kind: 'big', dropId: bigMatch[1]! }
  return null
}

export function hydrateStampUiFromCampaign(
  stampConfig: {
    totalStamps: number
    prefillStamps: number
    surpriseDrops?: { id: string; label: string; from: number; to: number; mode: RewardMode; color: string }[]
    bigRewards?: { id: string; label: string; from: number; to: number; mode: RewardMode; color: string }[]
    surpriseRange?: [number, number]
    bigRange?: [number, number]
    surpriseMode?: RewardMode
    bigMode?: RewardMode
  },
  rewards: {
    id: string
    name: string
    description?: string
    icon: string
    tier?: string | null
    sharePercent?: number
    redeemExpiryMode?: 'fixed' | 'relative'
    redeemFixedDate?: string | null
    redeemRelativeAmount?: number | null
    redeemRelativeUnit?: 'day' | 'week' | 'month' | null
  }[],
) {
  const surpriseDrops = stampConfig.surpriseDrops ?? [{
    id: 'surprise-0',
    label: 'Surprise Drop 1',
    from: stampConfig.surpriseRange?.[0] ?? 3,
    to: stampConfig.surpriseRange?.[1] ?? 5,
    mode: stampConfig.surpriseMode ?? 'single',
    color: SURPRISE_DROP_COLORS[0]!,
  }]
  const bigRewardDrops = stampConfig.bigRewards ?? [{
    id: 'big-0',
    label: 'Big Reward 1',
    from: stampConfig.bigRange?.[0] ?? 8,
    to: stampConfig.bigRange?.[1] ?? 10,
    mode: stampConfig.bigMode ?? 'single',
    color: BIG_REWARD_COLORS[0]!,
  }]

  const rewardsByDrop = new Map<string, typeof rewards>()
  for (const r of rewards) {
    const parsed = parseRewardTier(r.tier)
    if (!parsed) continue
    const key = `${parsed.kind}:${parsed.dropId}`
    if (!rewardsByDrop.has(key)) rewardsByDrop.set(key, [])
    rewardsByDrop.get(key)!.push(r)
  }

  function mapDrop(
    drop: { id: string; label: string; from: number; to: number; mode: RewardMode; color: string },
    tier: 'surprise' | 'big',
  ): StampDropUiState {
    const entries = rewardsByDrop.get(`${tier}:${drop.id}`) ?? []
    if (drop.mode === 'single') {
      const r = entries[0]
      return {
        ...drop,
        singleName: r?.name ?? (tier === 'surprise' ? 'Mystery Treat' : 'Free Breakfast Combo'),
        pool: [{
          ...newRewardEntry(),
          name: r?.name ?? '',
          redeemExpiryMode: r?.redeemExpiryMode ?? 'relative',
          redeemFixedDate: r?.redeemFixedDate ?? '',
          redeemRelativeAmount: r?.redeemRelativeAmount ?? 7,
          redeemRelativeUnit: r?.redeemRelativeUnit ?? 'day',
        }],
      }
    }
    return {
      ...drop,
      singleName: '',
      pool: entries.length > 0
        ? entries.map(r => ({
          id: r.id,
          name: r.name,
          description: r.description ?? '',
          icon: r.icon,
          probability: r.sharePercent ?? 100,
          redeemExpiryMode: r.redeemExpiryMode ?? 'relative',
          redeemFixedDate: r.redeemFixedDate ?? '',
          redeemRelativeAmount: r.redeemRelativeAmount ?? 7,
          redeemRelativeUnit: r.redeemRelativeUnit ?? 'day',
        }))
        : [newRewardEntry()],
    }
  }

  return {
    totalStamps: stampConfig.totalStamps,
    prefillStamps: stampConfig.prefillStamps,
    surpriseDrops: surpriseDrops.map(d => mapDrop(d, 'surprise')),
    bigRewards: bigRewardDrops.map(d => mapDrop(d, 'big')),
  }
}
