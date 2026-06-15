import { campaigns } from '@/lib/mock-data'
import type { MechanicType } from '@/lib/types'

const PLAY_SESSION_PREFIX = 'lg_play_session_'
const MOTION_GESTURE_KEY = 'lg_motion_gesture'
const MOTION_GESTURE_TTL_MS = 60_000

export function markMotionGesture() {
  try {
    sessionStorage.setItem(MOTION_GESTURE_KEY, String(Date.now()))
  } catch {
    /* private browsing */
  }
}

/** Recent user gesture (PIN tap etc.) — does not consume, safe for Strict Mode. */
export function hasRecentMotionGesture(): boolean {
  try {
    const raw = sessionStorage.getItem(MOTION_GESTURE_KEY)
    if (!raw) return false
    const ts = Number(raw)
    if (!Number.isFinite(ts)) return false
    return Date.now() - ts < MOTION_GESTURE_TTL_MS
  } catch {
    return false
  }
}

export function clearAllPlaySessions() {
  const keys: string[] = []
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i)
    if (key?.startsWith(PLAY_SESSION_PREFIX)) keys.push(key)
  }
  keys.forEach(k => sessionStorage.removeItem(k))
}

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
