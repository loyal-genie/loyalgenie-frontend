import { motion } from 'framer-motion'
import { Delete, Loader2 } from 'lucide-react'

interface PinKeypadProps {
  pin: string
  pinLength?: number
  error?: string
  disabled?: boolean
  loading?: boolean
  hideHeader?: boolean
  compact?: boolean
  onKey: (digit: string) => void
  onDelete: () => void
  onSubmit: () => void
  submitLabel?: string
}

export function PinKeypad({
  pin,
  pinLength = 3,
  error,
  disabled,
  loading,
  hideHeader = false,
  compact = false,
  onKey,
  onDelete,
  onSubmit,
  submitLabel = 'Redeem code',
}: PinKeypadProps) {
  const complete = pin.length >= pinLength

  return (
    <div className="w-full">
      {!hideHeader && (
        <div className={compact ? 'mb-2.5 text-center' : 'text-center mb-5'}>
          <h2 className={compact ? 'text-sm font-semibold text-[#2b2827] mb-0.5' : 'text-xl font-semibold text-[#2b2827] mb-2'}>
            Enter the code shared by staff
          </h2>
          <p className={compact ? 'text-[11px] text-[rgba(43,40,39,0.65)]' : 'text-sm text-[rgba(43,40,39,0.7)]'}>
            3-digit code · refreshes every 2 minutes
          </p>
        </div>
      )}

      <div className={`flex justify-center ${compact ? 'gap-3 mb-2.5' : 'gap-4 mb-4'}`}>
        {Array.from({ length: pinLength }, (_, i) => (
          <motion.div
            key={i}
            animate={error ? { x: [0, -6, 6, 0] } : {}}
            className={
              compact
                ? 'w-11 h-9 rounded-lg border border-[#e5e0dc] bg-white flex items-center justify-center'
                : 'w-14 h-10 rounded-xl border border-[#e5e0dc] bg-white shadow-sm flex items-center justify-center'
            }
          >
            {pin[i] ? (
              <span className={compact ? 'text-lg font-bold text-[#5b0e81]' : 'text-xl font-bold text-[#5b0e81]'}>{pin[i]}</span>
            ) : (
              <span className="text-lg text-[rgba(91,14,129,0.15)] font-normal">•</span>
            )}
          </motion.div>
        ))}
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`text-center text-xs text-red-500 ${compact ? 'mb-2' : 'mb-4'}`}
        >
          {error}
        </motion.p>
      )}

      <div className={`grid grid-cols-3 ${compact ? 'gap-1.5 mb-2.5' : 'gap-2 mb-5'}`}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
          <motion.button
            key={n}
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={() => onKey(String(n))}
            disabled={disabled || loading || pin.length >= pinLength}
            className={
              compact
                ? 'h-10 rounded-xl text-base font-semibold text-[#2b2827] bg-[#faf8f6] border border-[#e5e0dc] cursor-pointer disabled:opacity-40 touch-manipulation'
                : 'h-12 rounded-2xl text-lg font-semibold text-[#2b2827] bg-[#faf8f6] border border-[#e5e0dc] cursor-pointer disabled:opacity-40 touch-manipulation'
            }
          >
            {n}
          </motion.button>
        ))}
        <div />
        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={() => onKey('0')}
          disabled={disabled || loading || pin.length >= pinLength}
          className={
            compact
              ? 'h-10 rounded-xl text-base font-semibold text-[#2b2827] bg-[#faf8f6] border border-[#e5e0dc] cursor-pointer disabled:opacity-40 touch-manipulation'
              : 'h-12 rounded-2xl text-lg font-semibold text-[#2b2827] bg-[#faf8f6] border border-[#e5e0dc] cursor-pointer disabled:opacity-40 touch-manipulation'
          }
        >
          0
        </motion.button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={onDelete}
          disabled={disabled || loading}
          className={
            compact
              ? 'h-10 rounded-xl text-[#6b6461] bg-[#faf8f6] border border-[#e5e0dc] cursor-pointer flex items-center justify-center disabled:opacity-40 touch-manipulation'
              : 'h-12 rounded-2xl text-[#6b6461] bg-[#faf8f6] border border-[#e5e0dc] cursor-pointer flex items-center justify-center disabled:opacity-40 touch-manipulation'
          }
        >
          <Delete className={compact ? 'size-4' : 'size-5'} />
        </motion.button>
      </div>

      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={onSubmit}
        disabled={!complete || disabled || loading}
        className={
          compact
            ? 'w-full h-10 rounded-full font-semibold text-sm text-white bg-[#5b0e81] disabled:opacity-40 border-0 cursor-pointer flex items-center justify-center gap-2'
            : 'w-full h-12 rounded-full font-medium text-sm text-white bg-[#5b0e81] shadow-[0px_18px_40px_-18px_rgba(155,28,49,0.3)] disabled:opacity-40 border-0 cursor-pointer flex items-center justify-center gap-2'
        }
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : submitLabel}
      </motion.button>
    </div>
  )
}
