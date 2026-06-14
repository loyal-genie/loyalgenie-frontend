'use client'

import { useState } from 'react'
import InfoModal from '@/components/ui/InfoModal'
import { HOW_IT_WORKS_STEPS, type HowItWorksStep } from '@/content/how-it-works'
import type { ModalContent } from '@/types/modal'

export default function HowItWorks() {
  const [modalContent, setModalContent] = useState<ModalContent | null>(null)

  return (
    <section id="how-it-works" className="section-main" style={{ padding: '100px 80px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(240,192,64,0.1)',
            border: '1px solid rgba(240,192,64,0.25)',
            borderRadius: '50px', padding: '6px 18px', marginBottom: '20px',
          }}>
            <span style={{ color: '#f0c040', fontSize: '13px', fontWeight: 600 }}>HOW IT WORKS</span>
          </div>
          <h2 style={{
            fontSize: 'clamp(32px, 4vw, 50px)',
            fontWeight: 900, letterSpacing: '-1px',
            color: '#ffffff', lineHeight: 1.2, marginBottom: '16px',
          }}>
            Up and running in{' '}
            <span style={{ color: '#f0c040' }}>under 10 minutes</span>
          </h2>
          <p style={{ color: '#8b7db5', fontSize: '17px', maxWidth: '520px', margin: '0 auto', lineHeight: 1.7 }}>
            No developers. No complex setup. Just a standee, a QR code, and delighted customers.
          </p>
        </div>

        <div className="how-row1" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '24px' }}>
          {HOW_IT_WORKS_STEPS.slice(0, 3).map((s, i) => (
            <StepCard key={s.step} step={s} index={i} total={3} onLearnMore={() => setModalContent(s.modal)} />
          ))}
        </div>

        <div className="how-row2" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '24px',
          width: 'calc(66.667% - 8px)',
          margin: '0 auto',
        }}>
          {HOW_IT_WORKS_STEPS.slice(3).map((s, i) => (
            <StepCard key={s.step} step={s} index={i} total={2} onLearnMore={() => setModalContent(s.modal)} />
          ))}
        </div>
      </div>

      <InfoModal content={modalContent} onClose={() => setModalContent(null)} />
    </section>
  )
}

function StepCard({
  step, index, total, onLearnMore,
}: {
  step: HowItWorksStep
  index: number
  total: number
  onLearnMore: () => void
}) {
  return (
    <div className="step-card card-glass" style={{ padding: '32px 24px 24px', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        position: 'absolute', top: '-10px', right: '-10px',
        fontSize: '80px', fontWeight: 900, color: 'rgba(255,255,255,0.03)',
        lineHeight: 1, userSelect: 'none', pointerEvents: 'none',
      }}>{step.step}</div>

      <div style={{
        width: '56px', height: '56px', borderRadius: '16px',
        background: `${step.color}22`,
        border: `1px solid ${step.color}44`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '20px',
      }}>
        <step.Icon size={24} color={step.color} strokeWidth={1.75} />
      </div>

      <div style={{ color: '#f0c040', fontSize: '12px', fontWeight: 700, letterSpacing: '1px', marginBottom: '8px' }}>
        STEP {step.step}
      </div>
      <h3 style={{ color: '#ffffff', fontSize: '18px', fontWeight: 700, marginBottom: '12px', lineHeight: 1.3 }}>
        {step.title}
      </h3>
      <p style={{ color: '#8b7db5', fontSize: '14px', lineHeight: 1.7, flex: 1 }}>{step.desc}</p>

      <button
        onClick={onLearnMore}
        style={{
          marginTop: '16px',
          background: 'none', border: 'none', padding: 0,
          color: 'rgba(240,192,64,0.6)',
          fontSize: '12px', fontWeight: 600, cursor: 'pointer',
          textAlign: 'left', letterSpacing: '0.3px',
          transition: 'color 0.2s',
          display: 'flex', alignItems: 'center', gap: '4px',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = '#f0c040')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(240,192,64,0.6)')}
      >
        More detail →
      </button>

      {index < total - 1 && (
        <div style={{
          position: 'absolute', right: '-12px', top: '50%',
          width: '24px', height: '2px',
          background: 'linear-gradient(90deg, rgba(240,192,64,0.4), transparent)',
          zIndex: 10,
        }} />
      )}
    </div>
  )
}
