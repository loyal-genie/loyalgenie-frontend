'use client'

import { TYPEFORM_URL } from '@/lib/constants'

export default function CTASection() {
  return (
    <section id="get-started" className="cta-section" style={{
      padding: '120px 80px',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(61,31,138,0.3) 0%, transparent 70%)',
      }} />

      <div style={{
        position: 'absolute', width: '600px', height: '600px',
        top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        borderRadius: '50%', border: '1px solid rgba(240,192,64,0.06)',
        animation: 'spin-slow 20s linear infinite', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: '800px', height: '800px',
        top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        borderRadius: '50%', border: '1px solid rgba(107,63,212,0.06)',
        animation: 'spin-slow 30s linear infinite reverse', pointerEvents: 'none',
      }} />

      <div className="cta-content" style={{ textAlign: 'center', position: 'relative', zIndex: 2, maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🧞</div>
        <h2 style={{
          fontSize: 'clamp(36px, 5vw, 58px)', fontWeight: 900,
          letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: '20px',
        }}>
          <span style={{ color: '#ffffff' }}>Your wish is </span>
          <span className="shimmer-gold">granted.</span>
        </h2>
        <p style={{ color: '#8b7db5', fontSize: '18px', lineHeight: 1.7, marginBottom: '16px' }}>
          Start for free. Place the standee on your counter today. See your first returning regulars within the week.
        </p>
        <p style={{ color: '#f0c040', fontSize: '14px', fontWeight: 600, marginBottom: '40px', letterSpacing: '0.5px' }}>
          ✦ No setup fee &nbsp; ✦ No lock-in &nbsp; ✦ Free 30-day trial
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href={TYPEFORM_URL} target="_blank" rel="noopener noreferrer" className="btn-gold" style={{ fontSize: '17px', padding: '16px 40px' }}>
            Get Your Free Standee →
          </a>
          <a href={TYPEFORM_URL} target="_blank" rel="noopener noreferrer" className="btn-outline" style={{ fontSize: '17px' }}>
            Talk to Founder
          </a>
        </div>
      </div>
    </section>
  )
}
