'use client'

import { BUSINESS_BENEFITS, BUSINESS_TYPES, STANDEE_FLOW } from '@/content/for-businesses'
import Image from 'next/image'

export default function ForBusinesses() {
  return (
    <section id="for-business" className="section-main" style={{ padding: '100px 80px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div style={{
            display: 'inline-block', background: 'rgba(240,192,64,0.1)',
            border: '1px solid rgba(240,192,64,0.25)', borderRadius: '50px',
            padding: '6px 18px', marginBottom: '20px',
          }}>
            <span style={{ color: '#f0c040', fontSize: '13px', fontWeight: 600 }}>FOR YOUR BUSINESS</span>
          </div>
          <h2 style={{
            fontSize: 'clamp(32px, 4vw, 50px)', fontWeight: 900,
            letterSpacing: '-1px', color: '#ffffff', lineHeight: 1.2, marginBottom: '16px',
          }}>
            What Starbucks has,{' '}
            <span style={{ color: '#f0c040' }}>you can have too</span>
          </h2>
          <p style={{ color: '#8b7db5', fontSize: '17px', maxWidth: '520px', margin: '0 auto', lineHeight: 1.7, marginBottom: '36px' }}>
            Big brands know exactly who their regulars are, when they drift, and how to bring them back. LoyalGenie gives you the same power.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
            {BUSINESS_TYPES.map((b) => (
              <div key={b.name} className="biz-chip" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'rgba(26,11,75,0.6)', border: '1px solid rgba(240,192,64,0.15)',
                borderRadius: '50px', padding: '8px 18px',
                color: '#ffffff', fontSize: '14px', fontWeight: 500,
                transition: 'all 0.2s ease', cursor: 'default',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(240,192,64,0.5)'
                  e.currentTarget.style.background = 'rgba(26,11,75,0.9)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(240,192,64,0.15)'
                  e.currentTarget.style.background = 'rgba(26,11,75,0.6)'
                }}
              >
                <span>{b.icon}</span>
                <span>{b.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="benefit-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          {BUSINESS_BENEFITS.map((b) => (
            <div key={b.title} className="benefit-card card-glass" style={{ padding: '32px' }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '14px',
                background: 'rgba(240,192,64,0.08)', border: '1px solid rgba(240,192,64,0.18)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '18px',
              }}>
                <b.Icon size={22} color="#f0c040" strokeWidth={1.75} />
              </div>
              <h3 style={{ color: '#ffffff', fontSize: '18px', fontWeight: 700, marginBottom: '10px' }}>{b.title}</h3>
              <p style={{ color: '#8b7db5', fontSize: '14px', lineHeight: 1.7 }}>{b.desc}</p>
            </div>
          ))}
        </div>

        <div className="card-glass standee-grid" style={{
          marginTop: '60px',
          display: 'grid', gridTemplateColumns: '1.1fr 0.9fr',
          gap: '48px', alignItems: 'center', padding: '52px 60px',
          background: 'linear-gradient(135deg, rgba(61,31,138,0.3), rgba(26,11,75,0.6))',
        }}>
          <div>
            <div style={{ color: '#f0c040', fontSize: '13px', fontWeight: 600, letterSpacing: '1px', marginBottom: '16px' }}>
              ONE TAP. INFINITE REWARDS.
            </div>
            <h3 style={{
              fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 900,
              letterSpacing: '-0.5px', color: '#ffffff', lineHeight: 1.2, marginBottom: '20px',
            }}>
              The standee that works while you work
            </h3>
            <p style={{ color: '#8b7db5', fontSize: '16px', lineHeight: 1.7, marginBottom: '32px' }}>
              Place it on your counter. Customers see it. They scan. They play. You get their contact, their loyalty, and their return visit — automatically.
            </p>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0' }}>
              {STANDEE_FLOW.map((f, i) => (
                <div key={f.label} style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '12px',
                      background: 'rgba(240,192,64,0.12)', border: '1px solid rgba(240,192,64,0.25)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <f.Icon size={22} color="#f0c040" strokeWidth={1.75} />
                    </div>
                    <div style={{ color: '#f0c040', fontSize: '13px', fontWeight: 600 }}>{f.label}</div>
                  </div>
                  {i < STANDEE_FLOW.length - 1 && (
                    <div style={{
                      color: 'rgba(240,192,64,0.4)', fontSize: '18px',
                      lineHeight: '48px', padding: '0 14px',
                    }}>→</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Image
              src="/standee.png"
              alt="LoyalGenie Standee"
              width={220}
              height={380}
              style={{
                height: '380px',
                width: 'auto',
                objectFit: 'contain',
                filter: 'drop-shadow(0 20px 60px rgba(107,63,212,0.5))',
                animation: 'float 5s ease-in-out infinite',
              }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
