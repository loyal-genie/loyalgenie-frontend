'use client'

import { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import gsap from 'gsap'
import { HERO_REWARD_CARDS } from '@/content/hero'
import { TYPEFORM_URL } from '@/lib/constants'

const FloatingScene = dynamic(() => import('@/components/three/FloatingScene'), { ssr: false })

export default function HeroSection() {
  const headlineRef = useRef<HTMLDivElement>(null)
  const subRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const badgeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    tl.from(badgeRef.current, { y: -20, opacity: 0, duration: 0.6 })
      .from(headlineRef.current, { y: 50, opacity: 0, duration: 0.9 }, '-=0.3')
      .from(subRef.current, { y: 30, opacity: 0, duration: 0.7 }, '-=0.5')
      .from(ctaRef.current, { y: 20, opacity: 0, duration: 0.6 }, '-=0.4')
  }, [])

  return (
    <section
      className="gradient-hero hero-grid hero-section"
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        alignItems: 'center',
        padding: '158px 80px 80px',
        gap: '40px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 50% 60% at 30% 50%, rgba(107,63,212,0.15) 0%, transparent 70%)',
      }} />

      <div style={{ position: 'relative', zIndex: 2 }}>
        <div ref={badgeRef} style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(240,192,64,0.1)', border: '1px solid rgba(240,192,64,0.3)',
          borderRadius: '50px', padding: '8px 18px', marginBottom: '28px',
        }}>
          <span style={{ fontSize: '14px' }}>✨</span>
          <span style={{ color: '#f0c040', fontSize: '13px', fontWeight: 600, letterSpacing: '0.5px' }}>
            MAGICAL LOYALTY FOR SMEs IN INDIA
          </span>
        </div>

        <div ref={headlineRef}>
          <h1 style={{
            fontSize: 'clamp(34px, 4.2vw, 58px)',
            fontWeight: 900,
            lineHeight: 1.15,
            letterSpacing: '-1.5px',
            marginBottom: '24px',
          }}>
            <span style={{ color: '#ffffff' }}>Loyalty</span>{' '}
            <span className="shimmer-gold">Granted.</span>
            <br />
            <span style={{ color: '#ffffff' }}>Keep Customers{' '}</span>
            <span style={{ color: '#f0c040' }}>Coming Back.</span>
          </h1>
        </div>

        <p ref={subRef} style={{
          fontSize: '16px',
          color: '#8b7db5',
          lineHeight: 1.7,
          maxWidth: '480px',
          marginBottom: '36px',
        }}>
          Give your salon, cafe, or shop a gamified loyalty platform. Customers scan, shake their phone, and win rewards — while you build a base of loyal regulars.
        </p>

        <div ref={ctaRef} style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <a href={TYPEFORM_URL} target="_blank" rel="noopener noreferrer" className="btn-gold" style={{ fontSize: '15px', padding: '12px 28px' }}>
            Add to Your Counter — Free
          </a>
          <a href="#how-it-works" className="btn-outline" style={{ fontSize: '15px', padding: '11px 28px' }}>
            See How It Works
          </a>
        </div>
      </div>

      <div className="hero-scene-wrap" style={{ position: 'relative', height: '600px' }}>
        <div className="hero-tagline" style={{
          position: 'absolute', top: '-46px', left: 0, right: 0,
          textAlign: 'center', zIndex: 5, pointerEvents: 'none',
        }}>
          <span className="shimmer-gold" style={{
            fontSize: 'clamp(14px, 1.5vw, 20px)',
            fontWeight: 700,
            letterSpacing: '1px',
          }}>
            Shake It &amp; Win It
          </span>
        </div>

        <FloatingScene />

        {HERO_REWARD_CARDS.map((card, i) => (
          <div key={i} className="hero-float-card" style={{
            position: 'absolute',
            ...card.position,
            background: 'rgba(26,11,75,0.88)', backdropFilter: 'blur(20px)',
            border: `1px solid ${card.borderColor}`, borderRadius: '16px',
            padding: '14px 18px', zIndex: 10,
            animation: `float 4.2s ease-in-out ${card.animationDelay} infinite`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: '10px',
                background: card.iconGradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', flexShrink: 0,
              }}>{card.emoji}</div>
              <div>
                <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '13px' }}>You Won!</div>
                <div style={{ color: card.rewardColor, fontSize: '12px' }}>{card.reward}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
