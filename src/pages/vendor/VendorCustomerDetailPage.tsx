import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Phone, Calendar, Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SegmentBadge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { customers } from '@/lib/mock-data'

export function VendorCustomerDetailPage() {
  const { id } = useParams()
  const customer = customers.find((c) => c.id === id)

  if (!customer) {
    return (
      <div className="p-8 text-center">
        <p className="text-v-text-2">Customer not found.</p>
        <Link to="/vendor/customers"><Button variant="secondary" className="mt-4">Back</Button></Link>
      </div>
    )
  }

  const days = Math.floor((Date.now() - new Date(customer.lastVisit).getTime()) / 86400000)
  const segment = days > 45 ? 'inactive' : days > 14 ? 'at-risk' : customer.totalVisits >= 15 ? 'loyalist' : 'regular'

  return (
    <div className="p-6 lg:p-8 max-w-3xl space-y-6">
      <Link to="/vendor/customers" className="inline-flex items-center gap-1 text-sm text-v-purple hover:underline no-underline">
        <ArrowLeft className="w-4 h-4" /> All customers
      </Link>

      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-v-purple/10 border border-v-purple/20 flex items-center justify-center text-2xl font-black text-v-purple">
          {customer.name[0]}
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-v-text">{customer.name}</h1>
          <SegmentBadge segment={segment} />
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <Calendar className="w-4 h-4 text-v-purple mb-2" />
          <p className="text-2xl font-black text-v-text">{customer.totalVisits}</p>
          <p className="text-xs text-v-text-2">Total visits</p>
        </Card>
        <Card className="p-5">
          <Gift className="w-4 h-4 text-v-purple mb-2" />
          <p className="text-2xl font-black text-v-text">{customer.totalRewards}</p>
          <p className="text-xs text-v-text-2">Rewards won</p>
        </Card>
        <Card className="p-5">
          <Phone className="w-4 h-4 text-v-purple mb-2" />
          <p className="text-sm font-bold text-v-text">{customer.phone}</p>
          <p className="text-xs text-v-text-2">Last visit {days}d ago</p>
        </Card>
      </div>
    </div>
  )
}
