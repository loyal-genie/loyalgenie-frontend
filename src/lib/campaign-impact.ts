/** Expected winner count = players × win rate (plays per day does not affect this). */
export function calcTotalWinners(userCap: number, _playsPerDay: number, winRatePercent: number): number {
  return Math.round((userCap * winRatePercent) / 100)
}

export function calcDailyWinners(dailyUserLimit: number, _playsPerDay: number, winRatePercent: number): number {
  return Math.round((dailyUserLimit * winRatePercent) / 100)
}

export function formatWinnerCount(count: number, exact = false): string {
  return exact ? count.toLocaleString() : `~${count.toLocaleString()}`
}

/** Stamp cards: each enrolled customer can earn up to one surprise + one big reward. */
export function calcStampMaxRewards(userCap: number): number {
  return userCap * 2
}

/** Loyalty: each customer can unlock every milestone once. */
export function calcLoyaltyMaxRewards(userCap: number, milestoneCount: number): number {
  return userCap * milestoneCount
}
