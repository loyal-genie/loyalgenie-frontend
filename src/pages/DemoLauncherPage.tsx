import { Link } from 'react-router-dom'

export function DemoLauncherPage() {
  return (
    <div className="min-h-screen vendor-bg flex flex-col items-center justify-center p-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-v-purple/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-v-gold/8 blur-3xl pointer-events-none" />

      <div className="mb-12 text-center relative z-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-v-surface border border-v-border mb-6 float">
          <span className="text-4xl">🧞</span>
        </div>
        <h1 className="text-4xl font-extrabold text-v-text tracking-tight">
          Loyal<span className="text-v-purple">Genie</span>
        </h1>
        <p className="text-v-text-2 text-sm mt-2">Magical Loyalty for Your Business</p>
        <div className="mt-3 px-3 py-1 inline-block rounded-full bg-v-surface border border-v-border text-xs text-v-text-3">
          Design Prototype · MVP v1
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl relative z-10">
        <Link to="/vendor/dashboard" className="group block no-underline">
          <div className="bg-v-surface border border-v-border rounded-2xl p-8 hover:border-v-purple/60 hover:bg-v-surface-2 transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 rounded-2xl bg-v-purple/15 border border-v-purple/25 flex items-center justify-center text-3xl mb-5">🏪</div>
            <h2 className="text-xl font-bold text-v-text mb-2">Vendor App</h2>
            <p className="text-sm text-v-text-2 leading-relaxed mb-5">
              Manage campaigns, configure games, track customers and redemptions.
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {['Dashboard', 'Campaigns', 'Customers', 'Settings'].map((t) => (
                <span key={t} className="px-2.5 py-1 rounded-lg bg-v-surface-3 text-v-text-3 text-xs">{t}</span>
              ))}
            </div>
            <div className="flex items-center gap-2 text-v-purple text-sm font-semibold group-hover:gap-3 transition-all">
              Open Vendor App <span>→</span>
            </div>
          </div>
        </Link>

        <Link to="/customer" className="group block no-underline">
          <div className="bg-v-surface border border-v-border rounded-2xl p-8 hover:border-v-gold/40 hover:bg-v-surface-2 transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 rounded-2xl bg-v-gold/10 border border-v-gold/20 flex items-center justify-center text-3xl mb-5">🎮</div>
            <h2 className="text-xl font-bold text-v-text mb-2">Customer App</h2>
            <p className="text-sm text-v-text-2 leading-relaxed mb-5">
              Play games, win rewards, and manage your loyalty wallet.
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {['Games', 'Stamp Card', 'Spin & Win', 'Wallet'].map((t) => (
                <span key={t} className="px-2.5 py-1 rounded-lg bg-v-surface-3 text-v-text-3 text-xs">{t}</span>
              ))}
            </div>
            <div className="flex items-center gap-2 text-v-gold text-sm font-semibold group-hover:gap-3 transition-all">
              Open Customer App <span>→</span>
            </div>
          </div>
        </Link>
      </div>

      <p className="mt-10 text-xs text-v-text-3 relative z-10">
        <Link to="/" className="text-v-purple hover:underline">← Marketing site</Link>
        {' · '}
        <Link to="/signin" className="text-v-purple hover:underline">Sign in</Link>
      </p>
    </div>
  )
}
