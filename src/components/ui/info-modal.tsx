import { useEffect } from 'react'
import { X } from 'lucide-react'

export interface ModalSection {
  label: string
  text: string
}

export interface ModalContent {
  icon: string
  title: string
  sections: ModalSection[]
  proof?: { text: string; source: string }
}

interface InfoModalProps {
  content: ModalContent | null
  onClose: () => void
}

export function InfoModal({ content, onClose }: InfoModalProps) {
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
      className="fixed inset-0 z-[2000] flex items-center justify-center p-6"
      style={{ background: 'rgba(10,5,32,0.88)', backdropFilter: 'blur(10px)' }}
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-[580px] rounded-3xl p-8 sm:p-9 relative max-h-[88vh] overflow-y-auto"
        style={{
          background: 'rgba(18,8,50,0.98)',
          border: '1px solid rgba(240,192,64,0.28)',
          boxShadow: '0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(107,63,212,0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="info-modal-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors text-muted hover:text-white"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          aria-label="Close"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-3.5 mb-7 pr-10">
          <div
            className="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center text-[26px] shrink-0"
            style={{ background: 'rgba(240,192,64,0.1)', border: '1px solid rgba(240,192,64,0.25)' }}
          >
            {content.icon}
          </div>
          <h3 id="info-modal-title" className="text-white text-xl font-extrabold tracking-tight leading-tight">
            {content.title}
          </h3>
        </div>

        {content.sections.map((s, i) => (
          <div key={s.label} className="mb-5">
            <p className="text-gold text-[10px] font-bold tracking-[2px] mb-2.5">{s.label}</p>
            <p className="text-[#c8bde8] text-[15px] leading-relaxed">{s.text}</p>
            {i < content.sections.length - 1 && (
              <div className="h-px mt-5" style={{ background: 'rgba(240,192,64,0.1)' }} />
            )}
          </div>
        ))}

        {content.proof && (
          <div
            className="mt-2 py-3.5 px-4 rounded-r-xl"
            style={{
              background: 'rgba(240,192,64,0.05)',
              border: '1px solid rgba(240,192,64,0.15)',
              borderLeft: '3px solid rgba(240,192,64,0.6)',
            }}
          >
            <p className="text-[#f0d878] text-sm leading-relaxed italic">{content.proof.text}</p>
            {content.proof.source && (
              <p className="text-muted text-xs mt-1.5">— {content.proof.source}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
