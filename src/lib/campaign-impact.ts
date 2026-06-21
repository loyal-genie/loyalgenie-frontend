/** Expected winners/rewards from participation caps and win rate. */
export function calcTotalWinners(userCap: number, playsPerDay: number, winRatePercent: number): number {
  return Math.round((userCap * playsPerDay * winRatePercent) / 100)
}

export function calcDailyWinners(dailyUserLimit: number, playsPerDay: number, winRatePercent: number): number {
  return Math.round((dailyUserLimit * playsPerDay * winRatePercent) / 100)
}

export function maxTotalWinners(userCap: number, playsPerDay: number): number {
  return Math.max(1, userCap * playsPerDay)
}

export function winRateFromTotalWinners(totalWinners: number, userCap: number, playsPerDay: number): number {
  const totalPlays = userCap * playsPerDay
  if (totalPlays <= 0) return 1
  return Math.max(1, Math.min(100, Math.round((totalWinners / totalPlays) * 100)))
}

/** Stamp cards: each enrolled customer can earn up to one surprise + one big reward. */
export function calcStampMaxRewards(userCap: number): number {
  return userCap * 2
}

/** Loyalty: each customer can unlock every milestone once. */
export function calcLoyaltyMaxRewards(userCap: number, milestoneCount: number): number {
  return userCap * milestoneCount
}

export function formatWinnerCount(count: number): string {
  return `~${count.toLocaleString()}`
}
