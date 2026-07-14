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
  /** Brand start color for filled digits + submit gradient. */
  submitColor?: string
  /** Brand end color for submit gradient. Falls back to submitColor. */
  submitColorTo?: string
}

/**
 * Prototype-aligned PIN keypad: square digit slots, light keys, gradient CTA.
 */
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
  submitLabel = 'Play Now',
  submitColor = '#7C3AED',
  submitColorTo,
}: PinKeypadProps) {
  const complete = pin.length >= pinLength
  const gradientTo = submitColorTo ?? submitColor
  const enabled = complete && !disabled && !loading

  return (
    <div className="w-full">
      {!hideHeader && (
        <div className={compact ? 'mb-3 text-center' : 'mb-4 text-center'}>
          <p className="text-sm font-bold text-gray-900 mb-1">Enter the code shared by staff</p>
          <p className="text-xs text-gray-400">3-digit code · refreshes every 2 minutes</p>
        </div>
      )}

      <div className={`flex justify-center gap-2.5 ${compact ? 'mb-3' : 'mb-4'}`}>
        {Array.from({ length: pinLength }, (_, i) => (
          <motion.div
            key={i}
            animate={error ? { x: [0, -6, 6, 0] } : {}}
            className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black text-gray-900 transition-colors"
            style={{
              background: '#F9FAFB',
              border: pin[i] ? `2px solid ${submitColor}` : '2px solid #E5E7EB',
            }}
          >
            {pin[i] ?? ''}
          </motion.div>
        ))}
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`text-center text-xs text-red-500 ${compact ? 'mb-2' : 'mb-3'}`}
        >
          {error}
        </motion.p>
      )}

      <div className={`grid grid-cols-3 gap-2 max-w-[220px] mx-auto ${compact ? 'mb-3' : 'mb-4'}`}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
          <motion.button
            key={n}
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={() => onKey(String(n))}
            disabled={disabled || loading || pin.length >= pinLength}
            className="py-2.5 rounded-xl text-sm font-bold text-gray-800 bg-gray-50 border-0 cursor-pointer disabled:opacity-40 touch-manipulation"
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
          className="py-2.5 rounded-xl text-sm font-bold text-gray-800 bg-gray-50 border-0 cursor-pointer disabled:opacity-40 touch-manipulation"
        >
          0
        </motion.button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={onDelete}
          disabled={disabled || loading}
          className="py-2.5 rounded-xl flex items-center justify-center text-gray-500 bg-gray-50 border-0 cursor-pointer disabled:opacity-40 touch-manipulation"
        >
          <Delete className="w-3.5 h-3.5" />
        </motion.button>
      </div>

      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={onSubmit}
        disabled={!enabled}
        className="w-full py-3.5 rounded-2xl font-bold text-base border-0 cursor-pointer flex items-center justify-center gap-2 transition-all disabled:cursor-not-allowed"
        style={{
          background: enabled ? `linear-gradient(135deg, ${submitColor}, ${gradientTo})` : '#F3F4F6',
          color: enabled ? '#FFFFFF' : '#9CA3AF',
          boxShadow: enabled ? `0 8px 28px ${submitColor}55` : 'none',
        }}
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : submitLabel}
      </motion.button>
    </div>
  )
}
