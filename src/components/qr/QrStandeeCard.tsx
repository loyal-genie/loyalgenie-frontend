import { cn } from '@/lib/utils'
import { Nfc } from 'lucide-react'
import { displayJoinPath } from '@/lib/reserved-slugs'

interface QrStandeeCardProps {
  qrCodeDataUrl: string
  slug: string
  businessName?: string
  className?: string
  showActions?: boolean
  onDownload?: () => void
}

export function QrStandeeCard({
  qrCodeDataUrl,
  slug,
  businessName,
  className,
  showActions = false,
  onDownload,
}: QrStandeeCardProps) {
  const joinPath = `/${slug}`

  return (
    <div
      className={cn(
        'relative w-full max-w-sm mx-auto rounded-3xl overflow-hidden',
        'border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.5)]',
        className,
      )}
      style={{
        background: 'linear-gradient(165deg, #1a0b4b 0%, #0d0b28 45%, #12082e 100%)',
      }}
    >
      <div className="absolute top-4 right-4 flex flex-col items-center gap-0.5 opacity-70">
        <Nfc className="w-5 h-5 text-white" />
        <span className="text-[9px] font-bold text-white tracking-wider">NFC</span>
      </div>

      <div className="px-6 pt-8 pb-6 text-center">
        <div className="text-5xl mb-4">🧞</div>

        <h3 className="text-xl font-black text-white tracking-tight mb-1">Loyalty Granted</h3>
        <p className="text-sm font-bold mb-6">
          <span className="text-white">SHAKE IT! </span>
          <span className="text-gold">GRAB IT!</span>
        </p>

        {businessName && (
          <p className="text-xs text-white/60 mb-4 font-semibold uppercase tracking-widest">{businessName}</p>
        )}

        <div
          className="mx-auto w-fit p-4 rounded-2xl mb-4"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <img
            src={qrCodeDataUrl}
            alt={`QR code for ${joinPath}`}
            className="w-44 h-44 sm:w-48 sm:h-48 bg-white rounded-lg"
          />
        </div>

        <p className="text-[11px] font-bold tracking-[0.2em] text-white/80 mb-4">SCAN OR TAP TO JOIN</p>

        <div
          className="inline-block px-5 py-2 rounded-full text-[10px] font-bold tracking-wider mb-6"
          style={{ border: '1px solid rgba(240,192,64,0.5)', color: '#f0c040' }}
        >
          ONE TAP. INFINITE REWARDS.
        </div>

        <div className="border-t border-white/10 pt-5">
          <p className="text-lg font-black">
            <span className="text-white">Loyal</span>
            <span className="text-gold">Genie</span>
            <span className="text-gold text-xs align-super ml-0.5">✦✦✦</span>
          </p>
          <p className="text-[10px] text-white/40 mt-1">Magical Interaction for Businesses</p>
          <p className="text-xs text-gold/80 mt-3 font-mono font-semibold">{displayJoinPath(slug)}</p>
          <p className="text-[10px] text-white/35 mt-1">{joinPath}</p>
        </div>

        {showActions && onDownload && (
          <button
            type="button"
            onClick={onDownload}
            className="mt-5 w-full py-2.5 rounded-xl text-xs font-semibold text-white border border-white/20 hover:bg-white/5 transition-colors cursor-pointer bg-transparent"
          >
            Download standee QR
          </button>
        )}
      </div>
    </div>
  )
}
