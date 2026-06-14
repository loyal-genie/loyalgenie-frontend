'use client'

import { useState } from 'react'
import InfoModal from '@/components/ui/InfoModal'
import { DEFAULT_ACTIVE_MECHANIC_INDEX, MECHANICS, type Mechanic } from '@/content/mechanics'
import type { ModalContent } from '@/types/modal'

export default function MechanicsSection() {
  const [active, setActive] = useState(DEFAULT_ACTIVE_MECHANIC_INDEX)
  const [modalContent, setModalContent] = useState<ModalContent | null>(null)

  return (
    <section id="mechanics" className="section-mechanic" style={{
      padding: '100px 80px',
      background: 'rgba(26,11,75,0.25)',
      borderTop: '1px solid rgba(240,192,64,0.07)',
      borderBottom: '1px solid rgba(240,192,64,0.07)',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div style={{
            display: 'inline-block', background: 'rgba(240,192,64,0.1)',
            border: '1px solid rgba(240,192,64,0.25)', borderRadius: '50px',
            padding: '6px 18px', marginBottom: '20px',
          }}>
            <span style={{ color: '#f0c040', fontSize: '13px', fontWeight: 600 }}>8 ENGAGEMENT MECHANICS</span>
          </div>
          <h2 style={{
            fontSize: 'clamp(32px, 4vw, 50px)', fontWeight: 900,
            letterSpacing: '-1px', color: '#ffffff', lineHeight: 1.2, marginBottom: '16px',
          }}>
            Every visit is a{' '}
            <span style={{ color: '#f0c040' }}>new adventure</span>
          </h2>
          <p style={{ color: '#8b7db5', fontSize: '17px', maxWidth: '520px', margin: '0 auto', lineHeight: 1.7 }}>
            Mix and match mechanics to keep your customers guessing, engaged, and always coming back for more.
          </p>
        </div>

        <div className="mechanics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
          {MECHANICS.map((m, i) => (
            <MechanicCard
              key={m.name}
              mechanic={m}
              isActive={active === i}
              onClick={() => setActive(i)}
              onLearnMore={e => { e.stopPropagation(); setModalContent(m.modal) }}
            />
          ))}
        </div>
      </div>

      <InfoModal content={modalContent} onClose={() => setModalContent(null)} />
    </section>
  )
}

function MechanicCard({ mechanic, isActive, onClick, onLearnMore }: {
  mechanic: Mechanic
  isActive: boolean
  onClick: () => void
  onLearnMore: (e: React.MouseEvent) => void
}) {
  return (
    <div
      className="mechanic-card"
      onClick={onClick}
      style={{
        padding: '28px 24px 20px',
        borderRadius: '20px',
        cursor: 'pointer',
        transition: 'all 0.35s ease',
        background: isActive ? mechanic.gradient : 'rgba(26,11,75,0.5)',
        border: isActive ? '1px solid rgba(240,192,64,0.4)' : '1px solid rgba(240,192,64,0.1)',
        transform: isActive ? 'translateY(-6px) scale(1.02)' : 'none',
        boxShadow: isActive ? '0 20px 50px rgba(0,0,0,0.4)' : 'none',
        backdropFilter: 'blur(12px)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {mechanic.tag && (
        <div style={{
          position: 'absolute', top: '12px', right: '12px',
          background: 'rgba(240,192,64,0.15)', border: '1px solid rgba(240,192,64,0.3)',
          borderRadius: '20px', padding: '3px 10px',
          color: '#f0c040', fontSize: '11px', fontWeight: 600,
        }}>{mechanic.tag}</div>
      )}
      <div style={{
        width: '44px', height: '44px', borderRadius: '12px',
        background: isActive ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '14px',
      }}>
        <mechanic.Icon size={22} color={isActive ? '#ffffff' : '#8b7db5'} strokeWidth={1.75} />
      </div>
      <h3 style={{ color: '#ffffff', fontSize: '17px', fontWeight: 700, marginBottom: '10px' }}>{mechanic.name}</h3>
      <p style={{ color: isActive ? 'rgba(255,255,255,0.8)' : '#8b7db5', fontSize: '13px', lineHeight: 1.6, flex: 1 }}>{mechanic.desc}</p>

      <button
        onClick={onLearnMore}
        style={{
          marginTop: '16px',
          background: 'none', border: 'none', padding: 0,
          color: isActive ? 'rgba(255,255,255,0.7)' : 'rgba(240,192,64,0.6)',
          fontSize: '12px', fontWeight: 600, cursor: 'pointer',
          textAlign: 'left', letterSpacing: '0.3px',
          transition: 'color 0.2s',
          display: 'flex', alignItems: 'center', gap: '4px',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = isActive ? '#fff' : '#f0c040')}
        onMouseLeave={e => (e.currentTarget.style.color = isActive ? 'rgba(255,255,255,0.7)' : 'rgba(240,192,64,0.6)')}
      >
        Learn more →
      </button>
    </div>
  )
}
