import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { getCampaignTheme, getRewardScreenBackground } from '@/lib/campaign-themes'

const CONFETTI_COLORS = ['#7C3AED', '#F5C518', '#EC4899', '#06B6D4', '#22C55E', '#F59E0B', '#A78BFA', '#FDE68A']

function Confetti() {
  const pieces = Array.from({ length: 48 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    delay: Math.random() * 0.6,
    duration: 2.2 + Math.random() * 2,
    rotate: Math.random() * 360,
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {pieces.map(p => (
        <motion.div
          key={p.id}
          initial={{ y: -20, x: `${p.x}vw`, opacity: 1, rotate: p.rotate }}
          animate={{ y: '110vh', opacity: 0, rotate: p.rotate + 720 }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
          className="absolute w-1.5 h-1 rounded-sm"
          style={{ background: p.color }}
        />
      ))}
    </div>
  )
}

/** Primary CTA — full campaign card gradient. */
function ThemePrimaryButton({
  children,
  accent,
  accentTo,
  as: As = 'button',
  to,
  onClick,
  type = 'button',
}: {
  children: ReactNode
  accent: string
  accentTo: string
  as?: 'button' | 'link'
  to?: string
  onClick?: () => void
  type?: 'button' | 'submit'
}) {
  const className =
    'block w-full py-4 rounded-full font-bold text-base text-center text-white no-underline border-0 cursor-pointer'
  const style = {
    background: `linear-gradient(135deg, ${accent}, ${accentTo})`,
    boxShadow: `0 8px 28px ${accent}50`,
  }

  if (As === 'link' && to) {
    return (
      <Link to={to} className={className} style={style}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} onClick={onClick} className={className} style={style}>
      {children}
    </button>
  )
}

/** Secondary CTA — solid campaign accent (same family as card). */
function ThemeSecondaryButton({
  children,
  accent,
  onClick,
}: {
  children: ReactNode
  accent: string
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="block w-full py-4 rounded-full font-bold text-base text-white border-0 cursor-pointer"
      style={{
        background: accent,
        boxShadow: `0 6px 20px ${accent}40`,
      }}
    >
      {children}
    </button>
  )
}

interface WinCelebrationProps {
  reward: string
  emoji?: string
  code?: string
  businessName?: string
  onBackToCafe?: () => void
  /** @deprecated use onBackToCafe */
  onClose?: () => void
  mechanic?: string
}

export function WinCelebration({
  reward,
  emoji = '☕',
  code,
  businessName,
  onBackToCafe,
  onClose,
  mechanic = 'spin',
}: WinCelebrationProps) {
  const handleBackToCafe = onBackToCafe ?? onClose
  const displayCode = code ?? '—'
  const theme = getCampaignTheme(mechanic)
  const accent = theme.accent

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center min-h-dvh px-5 overflow-y-auto"
      style={{ background: getRewardScreenBackground(mechanic) }}
    >
      {handleBackToCafe && (
        <button
          type="button"
          onClick={handleBackToCafe}
          className="absolute top-[max(2.75rem,env(safe-area-inset-top))] left-4 z-20 size-9 rounded-full bg-white/80 border border-gray-200 flex items-center justify-center cursor-pointer shadow-sm"
          aria-label="Back to vendor"
        >
          <ArrowLeft className="size-4 text-gray-800" />
        </button>
      )}
      <Confetti />
      <div className="relative z-10 text-center w-full max-w-sm mx-auto pt-16 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs font-bold tracking-widest uppercase mb-5"
          style={{ color: accent }}
        >
          🎉 YOU WON!
        </motion.p>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.15 }}
          className="relative mx-auto size-32 mb-5 rounded-full flex items-center justify-center"
          style={{ background: `${accent}18`, border: `2.5px solid ${accent}45` }}
        >
          <span className="text-6xl leading-none">{emoji}</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-[28px] font-extrabold text-gray-900 mb-2 leading-tight">{reward}</h2>
          <p className="text-sm font-medium text-gray-700 mb-8">
            {businessName ? `Added to your wallet · ${businessName}` : 'Added to your wallet'}
          </p>

          <div
            className="rounded-2xl px-6 py-4 mb-3 mx-auto max-w-[220px] bg-white"
            style={{ border: `1.5px solid ${accent}40`, boxShadow: `0 4px 16px ${accent}18` }}
          >
            <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: accent }}>
              Reward Code
            </p>
            <p className="font-bold text-xl tracking-wide text-gray-900">{displayCode}</p>
          </div>
          <p className="text-sm font-medium text-gray-600 mb-10">
            Show this code to the staff at the counter to redeem
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="space-y-3"
        >
          <ThemePrimaryButton as="link" to="/customer/wallet" accent={accent} accentTo={theme.accentTo}>
            View Rewards
          </ThemePrimaryButton>
          {handleBackToCafe && (
            <ThemeSecondaryButton accent={theme.accentTo} onClick={handleBackToCafe}>
              ← Back to Business
            </ThemeSecondaryButton>
          )}
        </motion.div>
      </div>
    </div>
  )
}

interface NoWinProps {
  onTryAgain?: () => void
  onBackToCafe?: () => void
  /** @deprecated use onTryAgain */
  onClose?: () => void
  playsLeft?: number
  attempts?: { used: number; total: number }
  mechanic?: string
}

export function NoWin({
  onTryAgain,
  onBackToCafe,
  onClose,
  playsLeft,
  attempts,
  mechanic = 'spin',
}: NoWinProps) {
  const handleTryAgain = onTryAgain ?? onClose
  const canRetry = playsLeft !== undefined && playsLeft > 0 && Boolean(handleTryAgain)
  const theme = getCampaignTheme(mechanic)
  const accent = theme.accent

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center min-h-dvh px-5 overflow-y-auto"
      style={{ background: getRewardScreenBackground(mechanic) }}
    >
      {onBackToCafe && (
        <button
          type="button"
          onClick={onBackToCafe}
          className="absolute top-[max(2.75rem,env(safe-area-inset-top))] left-4 z-20 size-9 rounded-full bg-white/80 border border-gray-200 flex items-center justify-center cursor-pointer shadow-sm"
          aria-label="Back to vendor"
        >
          <ArrowLeft className="size-4 text-gray-800" />
        </button>
      )}

      <div className="relative z-10 flex flex-col items-center justify-center flex-1 w-full max-w-sm py-16 text-center">
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-6xl mb-5">
          😔
        </motion.div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">So close!</h2>
        <p className="text-sm font-medium text-gray-700 mb-2">
          Not this time — your next visit could be the one.
        </p>
        {attempts && (
          <p className="text-sm font-bold mb-2" style={{ color: accent }}>
            {attempts.used}/{attempts.total} attempts used today
          </p>
        )}
        <p className="text-sm font-medium text-gray-600 mb-10">
          Every visit gives you a new chance to win 🍀
        </p>

        <div className="w-full space-y-3">
          {canRetry && (
            <ThemePrimaryButton accent={accent} accentTo={theme.accentTo} onClick={handleTryAgain}>
              Try Again ({playsLeft} left)
            </ThemePrimaryButton>
          )}
          <ThemePrimaryButton
            as="link"
            to="/customer/wallet"
            accent={accent}
            accentTo={theme.accentTo}
          >
            View Rewards
          </ThemePrimaryButton>
          {onBackToCafe && (
            <ThemeSecondaryButton accent={theme.accentTo} onClick={onBackToCafe}>
              ← Back to Business
            </ThemeSecondaryButton>
          )}
        </div>
      </div>
    </div>
  )
}
