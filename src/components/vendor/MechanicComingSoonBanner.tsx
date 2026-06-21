import { Sparkles } from 'lucide-react'
import { getMechanicLabel } from '@/lib/utils'
import { isMechanicComingSoon } from '@/lib/live-mechanics'
import type { MechanicType } from '@/lib/types'

export function MechanicComingSoonBanner({ mechanic }: { mechanic: string }) {
  if (!isMechanicComingSoon(mechanic)) return null

  return (
    <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-3">
      <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-bold text-amber-900">
          {getMechanicLabel(mechanic as MechanicType)} — live soon
        </p>
        <p className="text-xs text-amber-800/80 mt-1 leading-relaxed">
          Customers cannot play this campaign yet. Only Shake &amp; Win, Stamp Cards, and Check-in
          Loyalty are live in this release. You can still view stats; editing is limited until launch.
        </p>
      </div>
    </div>
  )
}

export function MechanicComingSoonBadge({ mechanic }: { mechanic: string }) {
  if (!isMechanicComingSoon(mechanic)) return null
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
      <Sparkles className="w-3 h-3" />
      Live soon
    </span>
  )
}
