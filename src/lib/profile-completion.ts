import type { NavigateFunction } from 'react-router-dom'
import { getUser } from '@/lib/auth'

export function needsProfileCompletion(): boolean {
  const user = getUser('customer')
  return Boolean(user && user.profileComplete === false)
}

export function navigateToCompleteProfile(navigate: NavigateFunction, from?: string) {
  const returnPath = from ?? window.location.pathname + window.location.search
  navigate(`/customer/complete-profile?from=${encodeURIComponent(returnPath)}`, { replace: true })
}

/** After a successful game play, redirect to profile completion if still incomplete. */
export function promptProfileCompletionAfterGame(
  navigate: NavigateFunction,
  destination: string,
): void {
  if (!needsProfileCompletion()) {
    navigate(destination, { replace: true })
    return
  }
  navigateToCompleteProfile(navigate, destination)
}
