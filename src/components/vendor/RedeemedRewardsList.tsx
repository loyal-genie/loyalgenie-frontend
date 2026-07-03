import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { Card } from '@/components/ui/card'
import type { VendorRedeemedRewardDto } from '@/lib/api'

// Column filters disabled for now — re-enable when ready.
// const ENABLE_COLUMN_FILTERS = false

type RedeemedFilters = {
  search: string
  customerName: string
  customerPhone: string
  source: string
  rewardName: string
  claimedFrom: string
  claimedTo: string
  redeemedFrom: string
  redeemedTo: string
}

const emptyFilters: RedeemedFilters = {
  search: '',
  customerName: '',
  customerPhone: '',
  source: '',
  rewardName: '',
  claimedFrom: '',
  claimedTo: '',
  redeemedFrom: '',
  redeemedTo: '',
}

const GRID_COLS = 'grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)_minmax(0,1fr)_minmax(0,0.95fr)_minmax(0,1fr)]'

function dateOnly(value?: string | null) {
  if (!value) return ''
  return value.slice(0, 10)
}

/*
function matchesDateRange(value: string | null | undefined, from: string, to: string) {
  const day = dateOnly(value)
  if (!day) return !from && !to
  if (from && day < from) return false
  if (to && day > to) return false
  return true
}
*/

function filterRedeemed(items: VendorRedeemedRewardDto[], filters: RedeemedFilters) {
  const q = filters.search.trim().toLowerCase()
  if (!q) return items

  return items.filter(item => {
    const haystack = [
      item.customerName,
      item.customerPhone,
      item.rewardName,
      item.source,
    ].join(' ').toLowerCase()
    return haystack.includes(q)
  })

  /*
  return items.filter(item => {
    if (q) {
      const haystack = [
        item.customerName,
        item.customerPhone,
        item.rewardName,
        item.source,
      ].join(' ').toLowerCase()
      if (!haystack.includes(q)) return false
    }

    if (filters.customerName && !item.customerName.toLowerCase().includes(filters.customerName.trim().toLowerCase())) {
      return false
    }
    if (filters.customerPhone && !item.customerPhone.includes(filters.customerPhone.trim())) {
      return false
    }
    if (filters.source && item.source !== filters.source) return false
    if (filters.rewardName && item.rewardName !== filters.rewardName) return false
    if (!matchesDateRange(item.claimedAt ?? item.earnedAt, filters.claimedFrom, filters.claimedTo)) {
      return false
    }
    if (!matchesDateRange(item.redeemedAt, filters.redeemedFrom, filters.redeemedTo)) {
      return false
    }

    return true
  })
  */
}

type RedeemedRewardsListProps = {
  items: VendorRedeemedRewardDto[]
  isLoading?: boolean
  onRedeemedDateRangeChange?: (from?: string, to?: string) => void
}

export function RedeemedRewardsList({ items, isLoading }: RedeemedRewardsListProps) {
  const [filters, setFilters] = useState<RedeemedFilters>(emptyFilters)

  /*
  const sourceOptions = useMemo(
    () => Array.from(new Set(items.map(item => item.source).filter(Boolean))).sort(),
    [items],
  )

  const rewardOptions = useMemo(
    () => Array.from(new Set(items.map(item => item.rewardName).filter(Boolean))).sort(),
    [items],
  )
  */

  const filtered = useMemo(() => filterRedeemed(items, filters), [items, filters])

  /*
  const updateFilter = <K extends keyof RedeemedFilters>(key: K, value: RedeemedFilters[K]) => {
    setFilters(prev => {
      const next = { ...prev, [key]: value }
      if (key === 'redeemedFrom' || key === 'redeemedTo') {
        onRedeemedDateRangeChange?.(
          next.redeemedFrom || undefined,
          next.redeemedTo || undefined,
        )
      }
      return next
    })
  }

  const clearFilters = () => {
    setFilters(emptyFilters)
    onRedeemedDateRangeChange?.(undefined, undefined)
  }

  const filterInputClass =
    'h-8 w-full rounded-lg border border-v-border bg-white px-2 text-xs text-v-text placeholder:text-v-text-3 focus:border-v-purple focus:outline-none focus:ring-1 focus:ring-v-purple/20'
  */

  return (
    <div className="mt-4">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-v-text-3" />
          <input
            value={filters.search}
            onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
            placeholder="Search customer, phone, reward, or campaign..."
            className="h-11 w-full rounded-xl border border-v-border bg-white pl-10 pr-3 text-sm text-v-text placeholder:text-v-text-3 focus:border-v-purple focus:outline-none focus:ring-2 focus:ring-v-purple/12"
          />
        </div>
      </div>

      <div className={`mb-2 hidden min-w-0 md:grid ${GRID_COLS} gap-3 px-1`}>
        <p className="text-xs font-semibold uppercase tracking-wide text-[#6c68a7]">Customer</p>
        <p className="text-xs font-semibold uppercase tracking-wide text-[#6c68a7]">Campaign</p>
        <p className="text-xs font-semibold uppercase tracking-wide text-[#6c68a7]">Reward Name</p>
        <p className="text-xs font-semibold uppercase tracking-wide text-[#6c68a7]">Claimed on</p>
        <p className="text-xs font-semibold uppercase tracking-wide text-[#6c68a7]">Redeemed on</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-v-purple border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-[#e5e0f8] bg-white px-4 py-12 text-center">
          <p className="text-sm font-semibold text-v-text-2">
            {items.length === 0 ? 'No redeemed rewards yet' : 'No results match your search'}
          </p>
          <p className="mt-1 text-xs text-v-text-3">
            {items.length === 0
              ? 'Redeemed rewards from campaigns and points will appear here.'
              : 'Try a different search term.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(item => (
            <Card key={item.id} className="border-[#e5e0f8] px-4 py-3 shadow-sm">
              <div className="md:hidden">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f1eefb] text-sm font-semibold text-[#7c3aed]">
                    {item.customerName.charAt(0)}
                  </span>
                  <div className="min-w-0 flex-1 space-y-2">
                    <div>
                      <p className="text-sm font-semibold text-v-text">{item.customerName}</p>
                      <p className="text-xs text-v-text-3">{item.customerPhone}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-v-text-3">Campaign</p>
                        <p className="text-v-text-2">{item.source}</p>
                      </div>
                      <div>
                        <p className="text-v-text-3">Reward</p>
                        <p className="font-semibold text-amber-600">{item.rewardName}</p>
                      </div>
                      <div>
                        <p className="text-v-text-3">Claimed on</p>
                        <p className="text-v-text">{dateOnly(item.claimedAt ?? item.earnedAt) || '-'}</p>
                      </div>
                      <div>
                        <p className="text-v-text-3">Redeemed on</p>
                        <p className="text-v-text">
                          {item.redeemedAt ? item.redeemedAt.slice(0, 16).replace('T', ' ') : '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`hidden md:grid ${GRID_COLS} items-center gap-3`}>
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f1eefb] text-sm font-semibold text-[#7c3aed]">
                    {item.customerName.charAt(0)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-v-text">{item.customerName}</p>
                    <p className="truncate text-xs text-v-text-3">{item.customerPhone}</p>
                  </div>
                </div>
                <p className="truncate text-xs text-v-text-2">{item.source}</p>
                <p className="truncate font-semibold text-amber-600">{item.rewardName}</p>
                <p className="text-xs text-v-text">{dateOnly(item.claimedAt ?? item.earnedAt) || '-'}</p>
                <p className="text-xs text-v-text">
                  {item.redeemedAt ? item.redeemedAt.slice(0, 16).replace('T', ' ') : '-'}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && filtered.length > 0 && (
        <p className="mt-2 text-xs text-v-text-3">
          Showing {filtered.length} of {items.length} redeemed reward{items.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}
