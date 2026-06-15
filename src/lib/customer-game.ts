import { campaigns } from '@/lib/mock-data'
import type { MechanicType } from '@/lib/types'

const PLAY_SESSION_PREFIX = 'lg_play_session_'

export function setPlaySession(campaignId: string, token: string) {
  sessionStorage.setItem(`${PLAY_SESSION_PREFIX}${campaignId}`, token)
}

export function getPlaySession(campaignId: string): string | null {
  return sessionStorage.getItem(`${PLAY_SESSION_PREFIX}${campaignId}`)
}

export function clearPlaySession(campaignId: string) {
  sessionStorage.removeItem(`${PLAY_SESSION_PREFIX}${campaignId}`)
}

export function getCampaignIdFromSearch(search: string): string | null {
  const params = new URLSearchParams(search)
  return params.get('campaign')
}

/** Mock fallback for non-wired game mechanics */
export function getCampaignForMechanic(search: string, mechanic: MechanicType) {
  const id = getCampaignIdFromSearch(search)
  const active = campaigns.filter(c => c.mechanic === mechanic && c.status === 'active')
  return (id ? campaigns.find(c => c.id === id) : null) ?? active[0] ?? campaigns[0]
}
