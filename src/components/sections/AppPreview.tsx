'use client'

import { APP_MODULES, APP_NAV_ITEMS, APP_PLACES } from '@/content/app-preview'

export default function AppPreview() {
  return (
    <section className="section-main" style={{
      padding: '100px 80px',
      background: 'rgba(26,11,75,0.2)',
      borderTop: '1px solid rgba(240,192,64,0.07)',
    }}>
      <div className="app-grid" style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
        <div>
          <div style={{
            display: 'inline-block', background: 'rgba(240,192,64,0.1)',
            border: '1px solid rgba(240,192,64,0.25)', borderRadius: '50px',
            padding: '6px 18px', marginBottom: '20px',
          }}>
            <span style={{ color: '#f0c040', fontSize: '13px', fontWeight: 600 }}>THE CUSTOMER APP</span>
          </div>
          <h2 style={{
            fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 900,
            letterSpacing: '-1px', color: '#ffffff', lineHeight: 1.2, marginBottom: '16px',
          }}>
            Everything in one{' '}
            <span style={{ color: '#f0c040' }}>magical app</span>
          </h2>
          <p style={{ color: '#8b7db5', fontSize: '16px', lineHeight: 1.7, marginBottom: '40px' }}>
            Customers scan once, download the app, and enter a world of rewards across every LoyalGenie-powered business.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {APP_MODULES.map((m) => (
              <div key={m.name} className="module-card" style={{
                display: 'flex', gap: '18px', alignItems: 'flex-start',
                padding: '20px 24px',
                background: 'rgba(26,11,75,0.5)', backdropFilter: 'blur(12px)',
                border: '1px solid rgba(240,192,64,0.1)',
                borderRadius: '16px', transition: 'all 0.3s ease',
                cursor: 'default',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(240,192,64,0.35)'
                  e.currentTarget.style.transform = 'translateX(6px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(240,192,64,0.1)'
                  e.currentTarget.style.transform = 'none'
                }}
              >
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                  background: `${m.color}22`, border: `1px solid ${m.color}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <m.Icon size={20} color={m.color} strokeWidth={1.75} />
                </div>
                <div>
                  <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>{m.name}</div>
                  <div style={{ color: '#8b7db5', fontSize: '13px', lineHeight: 1.6 }}>{m.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="app-phone-wrap" style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
          <div style={{
            position: 'absolute', width: '300px', height: '300px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(107,63,212,0.4) 0%, transparent 70%)',
            top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            pointerEvents: 'none',
          }} />

          <div className="phone-mockup" style={{
            width: '260px', background: '#0a0520',
            borderRadius: '40px', padding: '14px',
            border: '2px solid rgba(240,192,64,0.2)',
            boxShadow: '0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(107,63,212,0.2)',
            animation: 'float 5s ease-in-out 1s infinite',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 12px 12px', fontSize: '11px', color: '#8b7db5' }}>
              <span>9:41</span>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center', fontSize: '12px' }}>
                <span>▲</span><span>WiFi</span><span>🔋</span>
              </div>
            </div>

            <div style={{ background: '#0f0628', borderRadius: '28px', overflow: 'hidden', padding: '20px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <div style={{ color: '#8b7db5', fontSize: '11px' }}>Good Morning 👋</div>
                  <div style={{ color: '#fff', fontSize: '15px', fontWeight: 700 }}>Priya</div>
                </div>
                <div style={{ fontSize: '24px' }}>🧞</div>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #3d1f8a, #6b3fd4)',
                borderRadius: '16px', padding: '16px', marginBottom: '16px',
              }}>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '10px', marginBottom: '4px' }}>ACTIVE REWARD</div>
                <div style={{ color: '#f0c040', fontSize: '18px', fontWeight: 900, marginBottom: '4px' }}>₹100 Off</div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>Glow Salon • Expires in 3 days</div>
                <div style={{
                  marginTop: '12px', background: 'rgba(255,255,255,0.15)', borderRadius: '50px',
                  padding: '6px 14px', display: 'inline-block',
                  color: '#fff', fontSize: '11px', fontWeight: 600,
                }}>Tap to Redeem</div>
              </div>

              <div style={{ color: '#8b7db5', fontSize: '11px', marginBottom: '10px' }}>MY PLACES</div>
              {APP_PLACES.map((p) => (
                <div key={p.name} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: 'rgba(26,11,75,0.6)', borderRadius: '10px',
                  padding: '10px 12px', marginBottom: '8px',
                }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '16px' }}>{p.emoji}</span>
                    <span style={{ color: '#fff', fontSize: '12px', fontWeight: 600 }}>{p.name}</span>
                  </div>
                  <span style={{ color: '#f0c040', fontSize: '11px', fontWeight: 600 }}>{p.pts}</span>
                </div>
              ))}
            </div>

            <div style={{
              display: 'flex', justifyContent: 'space-around', padding: '12px 0 4px',
              borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '6px',
            }}>
              {APP_NAV_ITEMS.map(({ Icon, label, active }) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Icon size={16} color={active ? '#f0c040' : '#8b7db5'} strokeWidth={active ? 2.5 : 1.75} />
                  </div>
                  <div style={{ color: active ? '#f0c040' : '#8b7db5', fontSize: '9px', marginTop: '2px' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
