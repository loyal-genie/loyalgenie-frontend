import { getUser } from '@/lib/auth'
import { customers } from '@/lib/mock-data'
import type { Customer } from '@/lib/types'

export function useCustomerSession() {
  const session = getUser('customer')
  const customer: Customer =
    customers.find((c) => c.email.toLowerCase() === session?.email?.toLowerCase()) ?? customers[0]
  const displayName = session?.name ?? customer.name
  const displayPhone = session?.phone ?? customer.phone
  const displayEmail = session?.email ?? customer.email

  return {
    session,
    customer,
    displayName,
    displayPhone,
    displayEmail,
    firstName: displayName.split(' ')[0],
    activeRewards: customer.rewards.filter((r) => r.status === 'pending'),
    redeemedRewards: customer.rewards.filter((r) => r.status === 'redeemed'),
  }
}
