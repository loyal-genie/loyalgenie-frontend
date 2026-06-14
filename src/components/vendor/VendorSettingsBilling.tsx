import { Check, Crown, CreditCard, Receipt, Zap, AlertCircle, Download } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const CURRENT_PLAN = {
  name: 'Growth',
  price: 2499,
  nextBilling: '2026-07-13',
  customersUsed: 7,
  customerLimit: 500,
  campaignsUsed: 5,
  features: [
    'Up to 500 customers',
    'Unlimited campaigns',
    'All 5 game mechanics',
    'Custom branding',
    'Priority support',
    'Analytics dashboard',
  ],
}

const PLANS = [
  { name: 'Starter', price: 1499, color: '#6B7280', features: ['Up to 200 customers', '3 active campaigns', 'Shake, Spin & Stamp', 'Basic analytics'], cta: 'Downgrade' },
  { name: 'Growth', price: 2499, color: '#7C3AED', current: true, features: ['Up to 500 customers', 'Unlimited campaigns', 'All 5 mechanics', 'Custom branding', 'Priority support'], cta: 'Current Plan' },
  { name: 'Pro', price: 4999, color: '#D97706', features: ['Unlimited customers', 'Unlimited campaigns', 'All mechanics + Lottery', 'Dedicated account manager', 'White-label app'], cta: 'Upgrade →' },
]

const BILLING_HISTORY = [
  { id: 'INV-2026-006', date: '2026-06-01', amount: 2499, plan: 'Growth', status: 'paid' },
  { id: 'INV-2026-005', date: '2026-05-01', amount: 2499, plan: 'Growth', status: 'paid' },
  { id: 'INV-2026-004', date: '2026-04-01', amount: 1499, plan: 'Starter', status: 'paid' },
  { id: 'INV-2026-003', date: '2026-03-01', amount: 1499, plan: 'Starter', status: 'paid' },
  { id: 'INV-2026-002', date: '2026-02-01', amount: 1499, plan: 'Starter', status: 'paid' },
]

const PAYMENT_METHOD = { brand: 'Visa', last4: '4242', expiry: '08/27', name: 'Omkar Ramu Bandi' }

export function VendorSettingsBilling() {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Crown className="w-4 h-4 text-v-purple" />
              <h2 className="text-base font-bold text-v-text">Current Plan</h2>
            </div>
            <p className="text-xs text-v-text-3">Next billing on {CURRENT_PLAN.nextBilling}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-v-purple">₹{CURRENT_PLAN.price.toLocaleString()}</div>
            <div className="text-xs text-v-text-3">/ month</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-xl bg-v-surface-2 border border-v-border mb-5">
          <div className="w-10 h-10 rounded-xl bg-v-purple flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-v-text">{CURRENT_PLAN.name} Plan</div>
            <div className="text-xs text-v-text-3">Active · renews monthly</div>
          </div>
          <span className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-emerald-50 text-green-700 border border-emerald-200">Active</span>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-v-text-2 font-medium">Customers</span>
              <span className="text-v-text font-bold">{CURRENT_PLAN.customersUsed} / {CURRENT_PLAN.customerLimit}</span>
            </div>
            <div className="h-2 bg-v-surface-3 rounded-full overflow-hidden">
              <div className="h-full bg-v-purple rounded-full" style={{ width: `${CURRENT_PLAN.customersUsed / CURRENT_PLAN.customerLimit * 100}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-v-text-2 font-medium">Campaigns</span>
              <span className="text-v-text font-bold">{CURRENT_PLAN.campaignsUsed} / Unlimited</span>
            </div>
            <div className="h-2 bg-v-surface-3 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full" style={{ width: '2%' }} />
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {CURRENT_PLAN.features.map((f) => (
            <span key={f} className="text-[11px] px-2.5 py-1 rounded-full bg-v-surface-3 border border-v-border text-v-text-2 font-medium flex items-center gap-1">
              <Check className="w-2.5 h-2.5 text-v-success" />{f}
            </span>
          ))}
        </div>
      </Card>

      <div>
        <h2 className="text-sm font-bold text-v-text mb-3">All Plans</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PLANS.map((plan) => (
            <div key={plan.name} className={`rounded-2xl p-5 border transition-all ${plan.current ? 'border-v-purple bg-v-surface-2' : 'border-v-border bg-white hover:border-v-border-b'}`}>
              {plan.current && (
                <div className="text-[10px] font-black text-v-purple mb-2 flex items-center gap-1">
                  <Check className="w-2.5 h-2.5" /> CURRENT
                </div>
              )}
              <div className="text-base font-black text-v-text mb-0.5">{plan.name}</div>
              <div className="text-2xl font-black mb-1" style={{ color: plan.color }}>₹{plan.price.toLocaleString()}</div>
              <div className="text-[10px] text-v-text-3 mb-4">/ month</div>
              <ul className="space-y-1.5 mb-5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-1.5 text-[11px] text-v-text-2">
                    <Check className="w-3 h-3 mt-0.5 shrink-0" style={{ color: plan.color }} />{f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${plan.current ? 'bg-v-surface-3 text-v-text-3 cursor-not-allowed' : 'hover:opacity-90 text-white'}`}
                style={!plan.current ? { background: plan.color } : {}}
                disabled={plan.current}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-v-purple" />
            <h2 className="text-sm font-bold text-v-text">Payment Method</h2>
          </div>
          <Button variant="ghost" size="sm">Update</Button>
        </div>
        <div className="flex items-center gap-4 p-4 rounded-xl bg-v-surface-2 border border-v-border">
          <div className="w-12 h-8 rounded-lg bg-v-purple/10 border border-v-border flex items-center justify-center">
            <span className="text-[10px] font-black text-v-purple">{PAYMENT_METHOD.brand.toUpperCase()}</span>
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-v-text">•••• •••• •••• {PAYMENT_METHOD.last4}</div>
            <div className="text-xs text-v-text-3">{PAYMENT_METHOD.name} · Expires {PAYMENT_METHOD.expiry}</div>
          </div>
          <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-50 text-green-700 border border-emerald-200 font-semibold">Default</span>
        </div>
        <div className="flex items-center gap-2 mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <p className="text-[11px] text-amber-700">Auto-renewal is on. You&apos;ll be charged ₹2,499 on 13 July 2026.</p>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-5">
          <Receipt className="w-4 h-4 text-v-purple" />
          <h2 className="text-sm font-bold text-v-text">Billing History</h2>
        </div>
        <div className="space-y-0 divide-y divide-v-border">
          {BILLING_HISTORY.map((inv) => (
            <div key={inv.id} className="flex items-center gap-4 py-3">
              <div className="flex-1">
                <div className="text-xs font-semibold text-v-text">{inv.plan} Plan</div>
                <div className="text-[10px] text-v-text-3">
                  {new Date(inv.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  {' · '}{inv.id}
                </div>
              </div>
              <div className="text-sm font-bold text-v-text">₹{inv.amount.toLocaleString()}</div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-green-700 border border-emerald-200 font-semibold capitalize">{inv.status}</span>
              <button type="button" className="text-v-purple hover:text-v-purple-d transition-colors border-0 bg-transparent cursor-pointer">
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
