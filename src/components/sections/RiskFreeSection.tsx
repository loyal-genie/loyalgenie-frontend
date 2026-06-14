'use client'

import { ShieldCheck, Check } from 'lucide-react'
import { RISK_COSTS, RISK_GAINS, RISK_GUARANTEES } from '@/content/risk-free'

export default function RiskFreeSection() {
  return (
    <section className="section-main" style={{
      padding: '100px 80px',
      borderTop: '1px solid rgba(240,192,64,0.07)',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div style={{
            display: 'inline-block', background: 'rgba(240,192,64,0.1)',
            border: '1px solid rgba(240,192,64,0.25)', borderRadius: '50px',
            padding: '6px 18px', marginBottom: '20px',
          }}>
            <span style={{ color: '#f0c040', fontSize: '13px', fontWeight: 600 }}>ZERO RISK. REAL UPSIDE.</span>
          </div>
          <h2 style={{
            fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 900,
            letterSpacing: '-1px', color: '#ffffff', lineHeight: 1.15, marginBottom: '16px',
          }}>
            Try it free.{' '}
            <span style={{ color: '#f0c040' }}>Pay only when<br />you see it working.</span>
          </h2>
          <p style={{ color: '#8b7db5', fontSize: '17px', maxWidth: '560px', margin: '0 auto', lineHeight: 1.7 }}>
            No commitment. No credit card. No leap of faith. Run LoyalGenie for 30 days, watch what happens to your regulars — and only then decide.
          </p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(61,31,138,0.35), rgba(26,11,75,0.6))',
          border: '1px solid rgba(240,192,64,0.35)',
          borderRadius: '20px',
          padding: '32px 40px',
          marginBottom: '56px',
          display: 'flex', alignItems: 'center', gap: '24px',
          boxShadow: '0 0 60px rgba(240,192,64,0.06)',
        }}>
          <div style={{
            flexShrink: 0, width: '64px', height: '64px', borderRadius: '16px',
            background: 'rgba(240,192,64,0.1)', border: '1px solid rgba(240,192,64,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ShieldCheck size={30} color="#f0c040" strokeWidth={1.75} />
          </div>
          <div>
            <div style={{ color: '#f0c040', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', marginBottom: '8px' }}>
              OUR FIRM PROMISE
            </div>
            <p style={{ color: '#ffffff', fontSize: '17px', lineHeight: 1.65, fontWeight: 500 }}>
              We only charge you after you&apos;ve seen the proof yourself. Set up your loyalty program today, watch your customers come back — and if it&apos;s not working in 30 days, you owe us absolutely nothing.
            </p>
          </div>
        </div>

        <div className="risk-asym-grid" style={{
          display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px',
          marginBottom: '56px', alignItems: 'start',
        }}>
          <div style={{
            background: 'rgba(26,11,75,0.4)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '20px', padding: '32px',
          }}>
            <div style={{ color: '#8b7db5', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', marginBottom: '24px' }}>
              WHAT IT COSTS YOU
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {RISK_COSTS.map((c) => (
                <div key={c.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{
                    width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0,
                    background: 'rgba(139,125,181,0.12)', border: '1px solid rgba(139,125,181,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1px',
                  }}>
                    <Check size={13} color="#8b7db5" strokeWidth={2.5} />
                  </div>
                  <div>
                    <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '15px' }}>{c.label}</div>
                    <div style={{ color: '#8b7db5', fontSize: '13px', marginTop: '2px' }}>{c.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ color: '#f0c040', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', marginBottom: '24px' }}>
              WHAT YOU STAND TO GAIN
            </div>
            <div className="gains-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {RISK_GAINS.map((g) => (
                <div key={g.title} style={{
                  background: 'rgba(26,11,75,0.5)',
                  border: '1px solid rgba(240,192,64,0.1)',
                  borderRadius: '16px', padding: '20px',
                  transition: 'border-color 0.2s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(240,192,64,0.3)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(240,192,64,0.1)')}
                >
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '10px', marginBottom: '12px',
                    background: `${g.color}18`, border: `1px solid ${g.color}35`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <g.Icon size={20} color={g.color} strokeWidth={1.75} />
                  </div>
                  <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '15px', marginBottom: '6px' }}>{g.title}</div>
                  <div style={{ color: '#8b7db5', fontSize: '13px', lineHeight: 1.6 }}>{g.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{
          background: 'rgba(26,11,75,0.3)',
          border: '1px solid rgba(240,192,64,0.15)',
          borderRadius: '16px',
          padding: '24px 32px',
          display: 'flex', flexWrap: 'wrap',
          justifyContent: 'center', gap: '12px 32px',
        }}>
          {RISK_GUARANTEES.map((g) => (
            <div key={g.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <g.Icon size={15} color="#f0c040" strokeWidth={2} />
              <span style={{ color: '#f0c040', fontSize: '14px', fontWeight: 600 }}>{g.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
