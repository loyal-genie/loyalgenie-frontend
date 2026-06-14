import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { SegmentBadge } from '@/components/ui/badge'
import { customers } from '@/lib/mock-data'
import type { Customer } from '@/lib/types'

function getSegment(c: Customer) {
  const days = Math.floor((Date.now() - new Date(c.lastVisit).getTime()) / 86400000)
  if (days > 45) return 'inactive'
  if (days > 14) return 'at-risk'
  if (c.totalVisits >= 15) return 'loyalist'
  return 'regular'
}

export function VendorCustomersPage() {
  return (
    <div className="p-6 lg:p-8 max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-v-text">Customers</h1>
        <p className="text-v-text-2 text-sm mt-1">{customers.length} customers in your loyalty program</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-v-text-3" />
        <Input placeholder="Search by name or phone..." className="pl-10" />
      </div>

      <div className="vendor-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-v-border bg-v-surface-2">
              <th className="text-left p-4 font-semibold text-v-text-2">Customer</th>
              <th className="text-left p-4 font-semibold text-v-text-2 hidden sm:table-cell">Visits</th>
              <th className="text-left p-4 font-semibold text-v-text-2 hidden md:table-cell">Last Visit</th>
              <th className="text-left p-4 font-semibold text-v-text-2">Segment</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b border-v-border last:border-0 hover:bg-v-surface-2/50">
                <td className="p-4">
                  <Link to={`/vendor/customers/${c.id}`} className="no-underline">
                    <p className="font-semibold text-v-text hover:text-v-purple">{c.name}</p>
                    <p className="text-xs text-v-text-3">{c.phone}</p>
                  </Link>
                </td>
                <td className="p-4 text-v-text hidden sm:table-cell">{c.totalVisits}</td>
                <td className="p-4 text-v-text-2 text-xs hidden md:table-cell">{c.lastVisit}</td>
                <td className="p-4"><SegmentBadge segment={getSegment(c)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
