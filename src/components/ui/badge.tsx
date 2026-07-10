import { cn } from '@/lib/utils'

const MECHANIC_LABELS: Record<string, string> = {
  stamp: 'Stamp Card',
  spin: 'Spin Wheel',
  shake: 'Shake & Win',
  lottery: 'Lottery',
  'buy-x-get-y': 'Buy X Get Y',
  coupon: 'Coupon Codes',
  flash: 'Flash Deal',
  combo: 'Package/Combo Deal',
  friend: 'Bring a Friend',
  groupunlock: 'Community Offer',
  dice: 'Dice',
  scratch: 'Scratch Card',
  'check-in-loyalty': 'Check-in Loyalty',
}

export function MechanicBadge({ mechanic }: { mechanic: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-v-purple/10 px-2 py-0.5 text-[10px] font-semibold text-v-purple">
      {MECHANIC_LABELS[mechanic] ?? mechanic}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: 'bg-green-50 text-v-success border-green-200',
    draft: 'bg-gray-50 text-gray-600 border-gray-200',
    paused: 'bg-amber-50 text-v-gold border-amber-200',
    ended: 'bg-red-50 text-v-danger border-red-200',
  }
  return (
    <span className={cn('inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize', styles[status] ?? styles.draft)}>
      {status}
    </span>
  )
}

export function SegmentBadge({ segment }: { segment: string }) {
  const styles: Record<string, string> = {
    loyalist: 'bg-amber-50 text-amber-700 border-amber-200',
    regular: 'bg-blue-50 text-blue-700 border-blue-200',
    'at-risk': 'bg-orange-50 text-orange-700 border-orange-200',
    inactive: 'bg-gray-50 text-gray-600 border-gray-200',
  }
  return (
    <span className={cn('inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold', styles[segment] ?? styles.regular)}>
      {segment}
    </span>
  )
}
