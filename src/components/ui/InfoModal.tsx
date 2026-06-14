'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import type { ModalContent } from '@/types/modal'

interface InfoModalProps {
  content: ModalContent | null
  onClose: () => void
}

export default function InfoModal({ content, onClose }: InfoModalProps) {
  useEffect(() => {
    if (!content) return
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [content, onClose])

  if (!content) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(10,5,32,0.88)',
        backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '580px',
          background: 'rgba(18,8,50,0.98)',
          border: '1px solid rgba(240,192,64,0.28)',
          borderRadius: '24px',
          padding: '36px 36px 32px',
          position: 'relative',
          boxShadow: '0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(107,63,212,0.15)',
          maxHeight: '88vh',
          overflowY: 'auto',
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close modal"
          style={{
            position: 'absolute', top: '16px', right: '16px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            width: '32px', height: '32px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#8b7db5',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
            e.currentTarget.style.color = '#fff'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
            e.currentTarget.style.color = '#8b7db5'
          }}
        >
          <X size={16} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px', paddingRight: '32px' }}>
          <div style={{
            fontSize: '26px', width: '52px', height: '52px', flexShrink: 0,
            borderRadius: '14px',
            background: 'rgba(240,192,64,0.1)',
            border: '1px solid rgba(240,192,64,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{content.icon}</div>
          <h3 style={{ color: '#ffffff', fontSize: '21px', fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1.2 }}>
            {content.title}
          </h3>
        </div>

        {content.sections.map((s, i) => (
          <div key={i} style={{ marginBottom: '22px' }}>
            <div style={{
              color: '#f0c040', fontSize: '10px', fontWeight: 700,
              letterSpacing: '2px', marginBottom: '10px',
            }}>{s.label}</div>
            <p style={{ color: '#c8bde8', fontSize: '15px', lineHeight: 1.75 }}>{s.text}</p>
            {i < content.sections.length - 1 && (
              <div style={{ height: '1px', background: 'rgba(240,192,64,0.1)', marginTop: '22px' }} />
            )}
          </div>
        ))}

        {content.proof && (
          <div style={{
            marginTop: '8px',
            background: 'rgba(240,192,64,0.05)',
            border: '1px solid rgba(240,192,64,0.15)',
            borderLeft: '3px solid rgba(240,192,64,0.6)',
            borderRadius: '0 12px 12px 0',
            padding: '14px 18px',
          }}>
            <p style={{ color: '#f0d878', fontSize: '14px', lineHeight: 1.65, fontStyle: 'italic' }}>
              {content.proof.text}
            </p>
            {content.proof.source && (
              <p style={{ color: '#8b7db5', fontSize: '12px', marginTop: '6px' }}>
                — {content.proof.source}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export type { ModalContent }
