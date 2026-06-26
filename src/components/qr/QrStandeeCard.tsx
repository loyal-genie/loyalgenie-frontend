import { cn } from '@/lib/utils'
import { customerSignInPath } from '@/lib/reserved-slugs'

const STANDEE_STARS = [
  { top: '5.95%', right: '16.05%' },
  { top: '23.81%', right: '6.34%' },
  { bottom: '9.72%', left: '8%' },
  { bottom: '10.91%', right: '8.62%' },
  { top: '6.1%', left: '16.57%' },
  { top: '50%', left: '4%' },
  { top: '48.51%', right: '4%' },
  { bottom: '25.05%', left: '3.14%' },
  { top: '25.89%', left: '4.29%' },
  { bottom: '29.36%', right: '4.05%' },
  { bottom: '5.11%', left: '49.14%' },
  { top: '46.43%', right: '4.05%' },
] as const

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
  const joinPath = customerSignInPath(slug)

  return (
    <div
      className={cn(
        'relative mx-auto w-[350px] max-w-full overflow-hidden rounded-[20px]',
        className,
      )}
      style={{
        background: 'linear-gradient(180deg, #420467 58.705%, #2d110d 122.99%)',
      }}
    >
      {STANDEE_STARS.map((star, index) => (
        <span
          key={index}
          aria-hidden
          className="pointer-events-none absolute text-[15px] leading-none"
          style={{ color: 'rgba(250, 212, 153, 0.29)', ...star }}
        >
          ★
        </span>
      ))}

      <div className="relative flex flex-col items-center px-6 pt-[34px] pb-8 text-center">
        <img
          src="/qr/genie.svg"
          alt=""
          className="h-[90px] w-[90px] shrink-0"
          draggable={false}
        />

        <h3 className="mt-[23px] text-[24px] font-semibold capitalize leading-normal text-white">
          Loyalty Granted
        </h3>

        <p className="mt-1 text-[14px] font-semibold uppercase leading-normal">
          <span className="text-white">SHAKE IT! </span>
          <span className="text-[#f6a800]">WIN IT!</span>
        </p>

        <div
          className="mt-5 flex w-[235px] max-w-full flex-col items-center rounded-[10px] border border-[rgba(177,138,70,0.31)] px-5 pt-5 pb-4"
          style={{ background: 'rgba(217, 217, 217, 0.1)' }}
        >
          <img
            src={qrCodeDataUrl}
            alt={`QR code for ${joinPath}`}
            className="h-[160px] w-[160px] rounded-[10px] bg-white object-contain"
          />

          <p className="mt-[17px] text-[13px] font-semibold leading-normal text-white">
            SCAN TO JOIN
          </p>

          <div className="mt-3 flex h-[29px] w-[175px] max-w-full items-center justify-center rounded-[10px] border border-[#b18a46] px-3">
            <p className="text-[10px] font-medium leading-normal text-[#b18a46]">
              ONE TAP. <span className="uppercase">Infinite Rewards</span>
            </p>
          </div>
        </div>

        <div className="mt-[53px] flex flex-col items-center">
          <div className="relative inline-flex items-end justify-center">
            <p className="text-[24px] font-semibold leading-normal">
              <span className="text-white">Loyal</span>
              <span className="text-[#f6a800]">Genie</span>
            </p>
            <img
              src="/qr/star-lg.svg"
              alt=""
              aria-hidden
              className="absolute -top-1 left-[calc(100%-8px)] h-[10px] w-[10px]"
              draggable={false}
            />
            <img
              src="/qr/star-sm.svg"
              alt=""
              aria-hidden
              className="absolute -top-2 left-[calc(100%+2px)] h-[4px] w-[4px]"
              draggable={false}
            />
            <img
              src="/qr/star-sm.svg"
              alt=""
              aria-hidden
              className="absolute -top-0.5 left-[calc(100%+10px)] h-[4px] w-[4px]"
              draggable={false}
            />
            <img
              src="/qr/star-sm.svg"
              alt=""
              aria-hidden
              className="absolute top-0.5 left-[calc(100%-2px)] h-[4px] w-[4px]"
              draggable={false}
            />
          </div>

          <p className="mt-1 text-[10px] font-normal leading-normal text-[#afadad]">
            Magical Interaction for Businesses
          </p>

          {businessName && (
            <p className="mt-3 text-[12px] font-semibold uppercase tracking-[0.15em] text-white/70">
              {businessName}
            </p>
          )}
        </div>

        {showActions && onDownload && (
          <button
            type="button"
            onClick={onDownload}
            className="mt-5 w-full cursor-pointer rounded-xl border border-white/20 bg-transparent py-2.5 text-xs font-semibold text-white transition-colors hover:bg-white/5"
          >
            Download standee QR
          </button>
        )}
      </div>
    </div>
  )
}
