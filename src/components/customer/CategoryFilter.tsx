import { cn } from '@/lib/utils'
import { CUSTOMER_CATEGORIES, type CustomerCategory } from '@/lib/customer-ui'

interface CategoryFilterProps {
  value: CustomerCategory
  onChange: (category: CustomerCategory) => void
  className?: string
}

export function CategoryFilter({ value, onChange, className }: CategoryFilterProps) {
  return (
    <div className={cn('flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1', className)}>
      {CUSTOMER_CATEGORIES.map(cat => {
        const active = value === cat
        return (
          <button
            key={cat}
            type="button"
            onClick={() => onChange(cat)}
            className={cn(
              'shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all border cursor-pointer',
              active
                ? 'bg-[#5b0e81] text-white border-[#5b0e81] shadow-[0_8px_24px_-12px_rgba(91,14,129,0.35),0_18px_40px_-18px_rgba(155,28,49,0.3)]'
                : 'bg-white text-[rgba(43,40,39,0.7)] border-[#e5e0dc]',
            )}
          >
            {cat}
          </button>
        )
      })}
    </div>
  )
}
