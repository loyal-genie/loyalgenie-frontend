import { campaigns } from '@/lib/mock-data'
import type { Campaign, MechanicType } from '@/lib/types'

export function getCampaignFromQuery(search: string): Campaign | undefined {
  const id = new URLSearchParams(search).get('campaign')
  if (!id) return undefined
  return campaigns.find((c) => c.id === id)
}

export function getCampaignForMechanic(search: string, mechanic: MechanicType): Campaign {
  const fromQuery = getCampaignFromQuery(search)
  if (fromQuery && fromQuery.mechanic === mechanic) return fromQuery
  return (
    campaigns.find((c) => c.mechanic === mechanic && c.status === 'active') ??
    campaigns.find((c) => c.mechanic === mechanic)!
  )
}
