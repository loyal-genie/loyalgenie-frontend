import { useState } from 'react'
import { SectionBadge } from '@/components/landing/SectionBadge'
import { InfoModal, type ModalContent } from '@/components/ui/info-modal'
import { mechanics } from '@/content/mechanics'

export function MechanicsSection() {
  const [active, setActive] = useState(4)
  const [modal, setModal] = useState<ModalContent | null>(null)

  return (
    <section id="mechanics" className="section-main bg-bg-card/25 border-y border-gold/5">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-10 sm:mb-16">
          <SectionBadge>8 ENGAGEMENT MECHANICS</SectionBadge>
          <h2 className="text-[clamp(26px,5.5vw,50px)] font-black text-white tracking-tight leading-tight mb-3 sm:mb-4">
            Every visit is a <span className="text-gold">new adventure</span>
          </h2>
          <p className="text-muted text-base sm:text-lg max-w-lg mx-auto leading-relaxed px-1">
            Mix and match mechanics to keep your customers guessing, engaged, and always coming back for more.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {mechanics.map((m, i) => {
            const isActive = active === i
            return (
              <div
                key={m.name}
                role="button"
                tabIndex={0}
                onClick={() => setActive(i)}
                onKeyDown={(e) => e.key === 'Enter' && setActive(i)}
                className="text-left rounded-[20px] p-5 sm:p-7 relative overflow-hidden flex flex-col cursor-pointer transition-all duration-350 backdrop-blur-md"
                style={{
                  background: isActive ? m.gradient : 'rgba(26,11,75,0.5)',
                  border: isActive ? '1px solid rgba(240,192,64,0.4)' : '1px solid rgba(240,192,64,0.1)',
                  transform: isActive ? 'translateY(-6px) scale(1.02)' : 'none',
                  boxShadow: isActive ? '0 20px 50px rgba(0,0,0,0.4)' : 'none',
                }}
              >
                {m.tag && (
                  <span
                    className="absolute top-3 right-3 text-[11px] font-semibold text-gold rounded-full px-2.5 py-0.5"
                    style={{ background: 'rgba(240,192,64,0.15)', border: '1px solid rgba(240,192,64,0.3)' }}
                  >
                    {m.tag}
                  </span>
                )}
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-3.5"
                  style={{ background: isActive ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)' }}
                >
                  <m.Icon size={22} color={isActive ? '#fff' : '#8b7db5'} strokeWidth={1.75} />
                </div>
                <h3 className="text-white text-[17px] font-bold mb-2">{m.name}</h3>
                <p className={`text-[13px] leading-relaxed flex-1 ${isActive ? 'text-white/80' : 'text-muted'}`}>
                  {m.desc}
                </p>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setModal(m.modal) }}
                  className="mt-4 text-left text-xs font-semibold bg-transparent border-none cursor-pointer p-0 transition-colors"
                  style={{ color: isActive ? 'rgba(255,255,255,0.7)' : 'rgba(240,192,64,0.6)' }}
                >
                  Learn more →
                </button>
              </div>
            )
          })}
        </div>
      </div>
      <InfoModal content={modal} onClose={() => setModal(null)} />
    </section>
  )
}
