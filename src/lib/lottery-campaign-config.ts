import { isRedeemBeforeValid, type RedeemBeforeValue } from '@/components/vendor/RedeemBeforeField'

export interface LotteryPrizeUi {
  id: string
  tier: 'jackpot' | 'prize'
  name: string
  reward: string
}

export function newLotteryPrize(partial?: Partial<LotteryPrizeUi>): LotteryPrizeUi {
  return {
    id: Math.random().toString(36).slice(2),
    tier: 'prize',
    name: 'Prize',
    reward: '',
    ...partial,
  }
}

export function defaultLotteryPrizes(): LotteryPrizeUi[] {
  return [
    newLotteryPrize({ tier: 'jackpot', name: 'Grand Prize', reward: 'Free Month Subscription' }),
    newLotteryPrize({ name: '2nd Prize', reward: 'Free Breakfast' }),
    newLotteryPrize({ name: '3rd Prize', reward: 'Free Coffee' }),
  ]
}

export function defaultLotteryRedeem(): RedeemBeforeValue {
  return {
    redeemExpiryMode: 'relative',
    redeemFixedDate: '',
    redeemRelativeAmount: 7,
    redeemRelativeUnit: 'day',
  }
}

export function isLotteryConfigValid(prizes: LotteryPrizeUi[], redeem: RedeemBeforeValue): boolean {
  const jackpot = prizes.find(p => p.tier === 'jackpot')
  if (!jackpot?.reward.trim()) return false
  return isRedeemBeforeValid(redeem)
}

export function buildLotteryCampaignPayload(prizes: LotteryPrizeUi[], redeem: RedeemBeforeValue) {
  return {
    lotteryConfig: {
      prizes: prizes.map(p => ({
        id: p.id,
        tier: p.tier,
        name: p.name.trim() || (p.tier === 'jackpot' ? 'Grand Prize' : 'Prize'),
        reward: p.reward.trim(),
        icon: p.tier === 'jackpot' ? '👑' : '🎁',
      })),
      redeemExpiryMode: redeem.redeemExpiryMode,
      redeemFixedDate: redeem.redeemExpiryMode === 'fixed' ? redeem.redeemFixedDate : undefined,
      redeemRelativeAmount: redeem.redeemExpiryMode === 'relative' ? redeem.redeemRelativeAmount : undefined,
      redeemRelativeUnit: redeem.redeemExpiryMode === 'relative' ? redeem.redeemRelativeUnit : undefined,
    },
  }
}

export function lotteryPrizesFromApi(
  lotteryConfig: {
    prizes: {
      id?: string
      tier: 'jackpot' | 'prize'
      name: string
      reward: string
    }[]
    redeemExpiryMode?: 'fixed' | 'relative'
    redeemFixedDate?: string | null
    redeemRelativeAmount?: number
    redeemRelativeUnit?: 'day' | 'week' | 'month'
  } | null | undefined,
  rewards?: { id: string; name: string; description?: string; rewardTier?: string | null }[],
): { prizes: LotteryPrizeUi[]; redeem: RedeemBeforeValue } {
  if (lotteryConfig?.prizes?.length) {
    return {
      prizes: lotteryConfig.prizes.map((p, i) => newLotteryPrize({
        id: p.id ?? `lottery-${i}`,
        tier: p.tier,
        name: p.name,
        reward: p.reward,
      })),
      redeem: {
        redeemExpiryMode: lotteryConfig.redeemExpiryMode ?? 'relative',
        redeemFixedDate: lotteryConfig.redeemFixedDate ?? '',
        redeemRelativeAmount: lotteryConfig.redeemRelativeAmount ?? 7,
        redeemRelativeUnit: lotteryConfig.redeemRelativeUnit ?? 'day',
      },
    }
  }

  if (rewards?.length) {
    return {
      prizes: rewards.map((r, i) => newLotteryPrize({
        id: r.id,
        tier: (r.rewardTier === 'jackpot' ? 'jackpot' : 'prize'),
        name: r.description?.trim() || (r.rewardTier === 'jackpot' ? 'Grand Prize' : `Prize ${i + 1}`),
        reward: r.name,
      })),
      redeem: defaultLotteryRedeem(),
    }
  }

  return { prizes: defaultLotteryPrizes(), redeem: defaultLotteryRedeem() }
}

export function lotteryPrizesEqual(
  a: LotteryPrizeUi[],
  b: LotteryPrizeUi[],
  redeemA: RedeemBeforeValue,
  redeemB: RedeemBeforeValue,
): boolean {
  if (a.length !== b.length) return false
  const prizesMatch = a.every((p, i) => {
    const o = b[i]!
    return p.tier === o.tier && p.name === o.name && p.reward === o.reward
  })
  const redeemMatch =
    redeemA.redeemExpiryMode === redeemB.redeemExpiryMode
    && redeemA.redeemFixedDate === redeemB.redeemFixedDate
    && redeemA.redeemRelativeAmount === redeemB.redeemRelativeAmount
    && redeemA.redeemRelativeUnit === redeemB.redeemRelativeUnit
  return prizesMatch && redeemMatch
}
