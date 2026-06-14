import { stats } from '@/content/landing'

export function StatsBar() {
  return (
    <div className="stats-bar border-y border-gold/10 bg-bg-card/40 px-5 md:px-12 lg:px-20 py-12">
      <div className="stats-grid max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((s) => (
          <div key={s.source} className="text-center px-2">
            <div className="text-[clamp(32px,3.5vw,48px)] font-black text-gold tracking-tight leading-none mb-2.5">
              {s.value}
            </div>
            <p className="text-white text-sm leading-relaxed mb-2">{s.label}</p>
            <span className="inline-block text-[11px] font-semibold tracking-wide text-purple-light bg-purple-mid/20 border border-purple-light/25 rounded-full px-2.5 py-0.5">
              — {s.source}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
