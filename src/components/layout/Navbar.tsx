'use client'

import { useEffect, useState } from 'react'
import { NAV_BAR_HEIGHT, NAV_LINKS, TYPEFORM_URL } from '@/lib/constants'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > NAV_BAR_HEIGHT)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        height: `${NAV_BAR_HEIGHT}px`,
        zIndex: 101,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px',
        background: 'linear-gradient(90deg, rgba(61,31,138,0.98), rgba(26,11,75,0.98), rgba(61,31,138,0.98))',
        borderBottom: '1px solid rgba(240,192,64,0.2)',
        backdropFilter: 'blur(12px)',
      }}>
        <div className="announce-line" style={{ width: '32px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(240,192,64,0.6))' }} />
        <span className="shimmer-gold announce-text" style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '2px' }}>
          SHAKE IT &amp; WIN IT
        </span>
        <div className="announce-line" style={{ width: '32px', height: '1px', background: 'linear-gradient(90deg, rgba(240,192,64,0.6), transparent)' }} />
      </div>

      <nav className="nav-main" style={{
        position: 'fixed',
        top: `${NAV_BAR_HEIGHT}px`,
        left: 0, right: 0,
        zIndex: 100,
        padding: '16px 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        transition: 'all 0.3s ease',
        background: scrolled ? 'rgba(10,5,32,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(240,192,64,0.1)' : 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="nav-logo-icon" style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #3d1f8a, #6b3fd4)',
            border: '1px solid rgba(240,192,64,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(107,63,212,0.5)',
            fontSize: '22px',
          }}>🧞</div>
          <span className="nav-logo-text" style={{ fontSize: '26px', fontWeight: 900, letterSpacing: '-0.5px' }}>
            <span style={{ color: '#ffffff' }}>Loyal</span>
            <span className="shimmer-gold">Genie</span>
          </span>
        </div>

        <div className="nav-links-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          {NAV_LINKS.map(({ label, href }) => (
            <a key={href} href={href} style={{ color: '#8b7db5', textDecoration: 'none', fontSize: '15px', fontWeight: 500, transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = '#8b7db5')}>
              {label}
            </a>
          ))}
          <a href={TYPEFORM_URL} target="_blank" rel="noopener noreferrer" className="btn-gold" style={{ padding: '10px 24px', fontSize: '14px' }}>
            Get Started Free
          </a>
        </div>

        <a href={TYPEFORM_URL} target="_blank" rel="noopener noreferrer"
          className="btn-gold nav-cta-mobile"
          style={{ display: 'none', padding: '9px 18px', fontSize: '13px' }}>
          Get Started
        </a>
      </nav>
    </>
  )
}
