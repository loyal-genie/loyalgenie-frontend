import { isRedeemBeforeValid } from '@/components/vendor/RedeemBeforeField'

export const DICE_FACE_COUNT = 6

export interface DiceOutcomeUi {
  id: string
  value: number
  isWin: boolean
  reward: string
  redeemExpiryMode: 'fixed' | 'relative'
  redeemFixedDate: string
  redeemRelativeAmount: number
  redeemRelativeUnit: 'day' | 'week' | 'month'
}

export function newDiceOutcome(partial?: Partial<DiceOutcomeUi>): DiceOutcomeUi {
  return {
    id: Math.random().toString(36).slice(2),
    value: 1,
    isWin: false,
    reward: '',
    redeemExpiryMode: 'relative',
    redeemFixedDate: '',
    redeemRelativeAmount: 7,
    redeemRelativeUnit: 'day',
    ...partial,
  }
}

export function defaultDiceOutcomes(): DiceOutcomeUi[] {
  return [
    newDiceOutcome({ value: 1, isWin: false }),
    newDiceOutcome({ value: 2, isWin: false }),
    newDiceOutcome({ value: 3, isWin: true, reward: 'Free Dessert' }),
    newDiceOutcome({ value: 4, isWin: true, reward: '₹50 Off' }),
    newDiceOutcome({ value: 5, isWin: false }),
    newDiceOutcome({ value: 6, isWin: true, reward: 'Free Dessert' }),
  ]
}

export function diceWinRateFromOutcomes(outcomes: DiceOutcomeUi[]): number {
  const winFaces = outcomes.filter(o => o.isWin && o.reward.trim()).length
  return Math.round((winFaces / DICE_FACE_COUNT) * 100)
}

export function isDiceOutcomeRedeemValid(outcome: DiceOutcomeUi): boolean {
  if (!outcome.isWin) return true
  return isRedeemBeforeValid({
    redeemExpiryMode: outcome.redeemExpiryMode,
    redeemFixedDate: outcome.redeemFixedDate,
    redeemRelativeAmount: outcome.redeemRelativeAmount,
    redeemRelativeUnit: outcome.redeemRelativeUnit,
  })
}

export function isDiceConfigValid(outcomes: DiceOutcomeUi[]): boolean {
  if (outcomes.length !== DICE_FACE_COUNT) return false
  const winOutcomes = outcomes.filter(o => o.isWin && o.reward.trim())
  if (winOutcomes.length < 1) return false
  return winOutcomes.every(o => isDiceOutcomeRedeemValid(o))
}

export function buildDiceCampaignPayload(outcomes: DiceOutcomeUi[]) {
  return {
    diceConfig: {
      outcomes: outcomes.map(o => ({
        id: o.id,
        value: o.value,
        isWin: o.isWin,
        reward: o.isWin ? (o.reward.trim() || `Roll ${o.value}`) : null,
        description: '',
        icon: '🎁',
        redeemExpiryMode: o.isWin ? o.redeemExpiryMode : undefined,
        redeemFixedDate: o.isWin && o.redeemExpiryMode === 'fixed' ? o.redeemFixedDate : undefined,
        redeemRelativeAmount: o.isWin && o.redeemExpiryMode === 'relative' ? o.redeemRelativeAmount : undefined,
        redeemRelativeUnit: o.isWin && o.redeemExpiryMode === 'relative' ? o.redeemRelativeUnit : undefined,
      })),
    },
  }
}

export function diceOutcomesFromApi(
  diceConfig: {
    outcomes: {
      id?: string
      value: number
      isWin: boolean
      reward: string | null
      redeemExpiryMode?: 'fixed' | 'relative'
      redeemFixedDate?: string | null
      redeemRelativeAmount?: number
      redeemRelativeUnit?: 'day' | 'week' | 'month'
    }[]
  } | null | undefined,
): DiceOutcomeUi[] {
  if (diceConfig?.outcomes?.length === DICE_FACE_COUNT) {
    return [...diceConfig.outcomes]
      .sort((a, b) => a.value - b.value)
      .map((o, i) => newDiceOutcome({
        id: o.id ?? `dice-${i}`,
        value: o.value,
        isWin: o.isWin,
        reward: o.reward ?? '',
        redeemExpiryMode: o.redeemExpiryMode ?? 'relative',
        redeemFixedDate: o.redeemFixedDate ?? '',
        redeemRelativeAmount: o.redeemRelativeAmount ?? 7,
        redeemRelativeUnit: o.redeemRelativeUnit ?? 'day',
      }))
  }
  return defaultDiceOutcomes()
}

export function diceOutcomesEqual(a: DiceOutcomeUi[], b: DiceOutcomeUi[]): boolean {
  if (a.length !== b.length) return false
  return a.every((o, i) => {
    const other = b[i]!
    return o.value === other.value
      && o.isWin === other.isWin
      && o.reward === other.reward
      && o.redeemExpiryMode === other.redeemExpiryMode
      && o.redeemFixedDate === other.redeemFixedDate
      && o.redeemRelativeAmount === other.redeemRelativeAmount
      && o.redeemRelativeUnit === other.redeemRelativeUnit
  })
}
