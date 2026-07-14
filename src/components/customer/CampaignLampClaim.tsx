import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, CalendarDays, Gift, Loader2 } from 'lucide-react'
import { getCampaignTheme, getPlayScreenBackground } from '@/lib/campaign-themes'
import { fmtCampaignDate } from '@/lib/campaign-dates'
import { getMechanicEmoji, hexToRgb, hexMix } from '@/lib/utils'

/** Larger circle so lamp/genie fill the CTA (prototype fit). */
const CONTAINER = 280
const R = 102
const CX = 120
const CY = 120
const SVG_SIZE = 240

const STARS = [
  { x: 8, y: 10, s: 14, o: 0.38 },
  { x: 83, y: 8, s: 9, o: 0.26 },
  { x: 13, y: 35, s: 8, o: 0.2 },
  { x: 91, y: 29, s: 13, o: 0.3 },
  { x: 5, y: 61, s: 16, o: 0.24 },
  { x: 88, y: 52, s: 9, o: 0.18 },
  { x: 26, y: 79, s: 11, o: 0.15 },
  { x: 74, y: 77, s: 7, o: 0.2 },
  { x: 44, y: 8, s: 8, o: 0.15 },
  { x: 61, y: 16, s: 6, o: 0.17 },
]

export const LAMP_REVEAL_SUBTITLE: Record<string, string> = {
  'buy-x-get-y': 'Reveal your spend & save reward',
  coupon: 'Reveal your surprise discount',
  flash: 'Reveal your flash deal',
  friend: 'Reveal your friend reward',
  combo: 'Reveal your bundle reward',
  groupunlock: 'Reveal your community reward',
}

export interface CampaignLampClaimResult {
  reward: string
  code?: string
  icon?: string
  redeemBefore?: string | null
  subtitle?: string
}

export interface CampaignLampPreview {
  sectionLabel?: string
  /** Pill badge text, e.g. "10% Off" */
  badgeLabel?: string
  rewardTitle: string
  description?: string
  highlight?: string
  availableLabel?: string
  claimBefore?: string | null
  redeemBefore?: string | null
}

interface CampaignLampClaimProps {
  mechanic: string
  businessName: string
  revealSubtitle?: string
  preview: CampaignLampPreview
  claimedHeadline?: string
  disabled?: boolean
  alreadyClaimed?: boolean
  onBack: () => void
  onClaim: () => Promise<CampaignLampClaimResult>
  onAlreadyClaimedWallet?: () => void
}

type SmokeParticle = {
  id: number
  xOff: number
  xDrift: number
  yDrift: number
  size: number
  duration: number
  opacity: number
  color: string
}

type ConfettiPiece = {
  id: number
  x: number
  color: string
  rotation: number
  rotationEnd: number
  duration: number
  delay: number
  isStrip: boolean
  size: number
}

let particleCounter = 0

function formatMaybeDate(value?: string | null) {
  if (!value) return null
  try {
    return fmtCampaignDate(value)
  } catch {
    return value
  }
}

/**
 * Shared tap-lamp claim experience for claim-style campaigns (Option A).
 */
export function CampaignLampClaim({
  mechanic,
  businessName,
  revealSubtitle,
  preview,
  claimedHeadline = "Here's Your Reward ✨",
  disabled,
  alreadyClaimed,
  onBack,
  onClaim,
  onAlreadyClaimedWallet,
}: CampaignLampClaimProps) {
  const theme = getCampaignTheme(mechanic)
  const accent = theme.accent
  const accentTo = theme.accentTo
  const accentRgb = hexToRgb(accent).join(',')
  const deepRgb = hexToRgb(accentTo).join(',')
  const lightAccentRgb = hexToRgb(hexMix(accent, '#FFFFFF', 0.45)).join(',')
  const emoji = getMechanicEmoji(mechanic)
  const subtitle = revealSubtitle ?? LAMP_REVEAL_SUBTITLE[mechanic] ?? 'Reveal your reward'

  const [claiming, setClaiming] = useState(false)
  const [claimed, setClaimed] = useState(false)
  const [showReward, setShowReward] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [genieVisible, setGenieVisible] = useState(false)
  const [ringClaimed, setRingClaimed] = useState(false)
  const [claimError, setClaimError] = useState('')
  const [result, setResult] = useState<CampaignLampClaimResult | null>(null)
  const [particles, setParticles] = useState<SmokeParticle[]>([])
  const [pieces, setPieces] = useState<ConfettiPiece[]>([])
  const firedRef = useRef(false)

  const confettiColors = [accent, accentTo, '#67E8F9', '#A5F3FC', '#FBBF24', '#F472B6', '#FFFFFF']

  useEffect(() => {
    if (!showConfetti) return
    setPieces(
      Array.from({ length: 72 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)]!,
        rotation: Math.random() * 360,
        rotationEnd: Math.random() * 720 - 360,
        duration: 1.8 + Math.random() * 1.6,
        delay: Math.random() * 0.7,
        isStrip: Math.random() > 0.45,
        size: 5 + Math.floor(Math.random() * 9),
      })),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showConfetti])

  const emitSmoke = useCallback(
    (count: number) => {
      const colors = [
        `rgba(${accentRgb},0.75)`,
        `rgba(${lightAccentRgb},0.7)`,
        'rgba(255,255,255,0.65)',
        `rgba(${deepRgb},0.55)`,
      ]
      const next: SmokeParticle[] = Array.from({ length: count }, () => {
        particleCounter += 1
        return {
          id: particleCounter,
          xOff: (Math.random() - 0.5) * 10,
          xDrift: (Math.random() - 0.5) * 45,
          yDrift: -(60 + Math.random() * 50),
          size: 14 + Math.random() * 20,
          duration: 0.8 + Math.random() * 0.9,
          opacity: 0.5 + Math.random() * 0.38,
          color: colors[Math.floor(Math.random() * colors.length)]!,
        }
      })
      setParticles(prev => [...prev, ...next].slice(-32))
    },
    [accentRgb, deepRgb, lightAccentRgb],
  )

  const handleClaim = async () => {
    if (firedRef.current || disabled || claiming || claimed || alreadyClaimed) return
    firedRef.current = true
    setClaimError('')
    setClaiming(true)
    emitSmoke(28)
    if (typeof navigator !== 'undefined') navigator.vibrate?.([60, 30, 80, 30, 120])

    try {
      const claimResult = await onClaim()
      setResult(claimResult)
      window.setTimeout(() => {
        setClaimed(true)
        setGenieVisible(true)
        setRingClaimed(true)
      }, 320)
      window.setTimeout(() => {
        setShowConfetti(true)
        setShowReward(true)
      }, 600)
    } catch (err) {
      firedRef.current = false
      setClaiming(false)
      setClaimError(err instanceof Error ? err.message : 'Could not claim reward. Try again.')
    }
  }

  const previewClaimDate = formatMaybeDate(preview.claimBefore)
  const previewRedeemDate = formatMaybeDate(preview.redeemBefore)
  const successRedeemDate = formatMaybeDate(result?.redeemBefore ?? preview.redeemBefore)
  const successClaimDate = formatMaybeDate(preview.claimBefore)

  if (alreadyClaimed && !claimed) {
    return (
      <div
        className="min-h-dvh flex flex-col items-center justify-center px-5 max-w-[440px] mx-auto relative"
        style={{ background: getPlayScreenBackground(mechanic) }}
      >
        <button
          type="button"
          onClick={onBack}
          className="absolute top-12 left-4 size-9 rounded-full bg-black/5 flex items-center justify-center border-0 cursor-pointer"
        >
          <ArrowLeft className="size-4 text-gray-700" />
        </button>
        <p className="text-sm font-semibold text-gray-900">Already in your wallet</p>
        <button
          type="button"
          onClick={() => onAlreadyClaimedWallet?.()}
          className="mt-3 text-sm font-bold border-0 bg-transparent cursor-pointer"
          style={{ color: accent }}
        >
          View in Wallet →
        </button>
      </div>
    )
  }

  return (
    <div
      className="min-h-dvh flex flex-col relative overflow-hidden select-none max-w-[440px] mx-auto"
      style={{ background: getPlayScreenBackground(mechanic) }}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {STARS.map((s, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{ left: `${s.x}%`, top: `${s.y}%`, opacity: s.o, fontSize: s.s, color: `rgba(${accentRgb},0.5)` }}
            animate={{ opacity: [s.o, s.o * 0.3, s.o], scale: [1, 1.3, 1] }}
            transition={{ duration: 2.2 + i * 0.28, repeat: Infinity, ease: 'easeInOut', delay: i * 0.18 }}
          >
            ✦
          </motion.div>
        ))}
      </div>

      {showConfetti && pieces.length > 0 && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-50 max-w-[440px] mx-auto left-0 right-0">
          {pieces.map(p => (
            <motion.div
              key={p.id}
              className="absolute"
              style={{
                left: `${p.x}%`,
                top: '-24px',
                width: p.isStrip ? Math.max(3, p.size / 2) : p.size,
                height: p.isStrip ? p.size * 3.2 : p.size,
                background: p.color,
                rotate: p.rotation,
                borderRadius: p.isStrip ? 1 : 2,
              }}
              animate={{ y: '115vh', rotate: p.rotationEnd, opacity: [1, 1, 0.6] }}
              transition={{ duration: p.duration, delay: p.delay, ease: 'linear' }}
            />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={onBack}
        className="absolute top-12 left-4 size-9 rounded-full bg-black/5 backdrop-blur-md flex items-center justify-center z-20 border-0 cursor-pointer"
      >
        <ArrowLeft className="size-4 text-gray-700" />
      </button>

      <div className="flex-1 flex flex-col items-center px-5 pt-16 pb-8 relative z-10 overflow-y-auto">
        <div className="text-center mb-4 min-h-[56px] flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {claimed ? (
              <motion.div key="claimed-title" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <p className="text-gray-900 text-[22px] font-bold leading-snug">🎉 Your reward is unlocked!</p>
                <p className="text-gray-500 text-sm mt-1.5">{businessName}</p>
              </motion.div>
            ) : (
              <motion.div key="idle-title" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <p className="text-gray-900 text-[22px] font-bold leading-snug">Rub the lamp</p>
                <p className="text-gray-500 text-sm mt-1.5">{subtitle}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Lamp / genie — larger fit */}
        <div className="relative flex items-center justify-center mb-3" style={{ width: CONTAINER, height: CONTAINER }}>
          <svg
            viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ overflow: 'visible' }}
          >
            <defs>
              <filter id={`lampRingGlow-${mechanic}`} x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation="14" floodColor={accent} floodOpacity="1" />
              </filter>
              <filter id={`lampBloom-${mechanic}`} x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="12" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                </feMerge>
              </filter>
            </defs>
            <circle cx={CX} cy={CY} r={R} fill="none" stroke={`rgba(${accentRgb},0.1)`} strokeWidth="26" />
            <circle
              cx={CX}
              cy={CY}
              r={R}
              fill="none"
              stroke={`rgba(${accentRgb},0.4)`}
              strokeWidth="2"
              strokeDasharray="8 10"
            />
            {ringClaimed && (
              <>
                <circle
                  cx={CX}
                  cy={CY}
                  r={R}
                  fill="none"
                  stroke="rgba(253,186,116,0.35)"
                  strokeWidth="16"
                  filter={`url(#lampBloom-${mechanic})`}
                />
                <circle
                  cx={CX}
                  cy={CY}
                  r={R}
                  fill="none"
                  stroke={accent}
                  strokeWidth="7"
                  filter={`url(#lampRingGlow-${mechanic})`}
                />
              </>
            )}
          </svg>

          <motion.button
            type="button"
            className="absolute inset-2 rounded-full flex items-center justify-center overflow-visible border-0"
            onClick={() => void handleClaim()}
            disabled={claimed || claiming || disabled}
            whileTap={!claimed && !claiming ? { scale: 0.96 } : {}}
            animate={
              !claimed && !claiming
                ? { boxShadow: [
                    `0 0 24px rgba(${accentRgb},0.22)`,
                    `0 0 42px rgba(${accentRgb},0.4)`,
                    `0 0 24px rgba(${accentRgb},0.22)`,
                  ] }
                : undefined
            }
            transition={!claimed && !claiming ? { duration: 2.2, repeat: Infinity, ease: 'easeInOut' } : undefined}
            style={{
              cursor: !claimed && !disabled ? 'pointer' : 'default',
              background: `radial-gradient(circle at 40% 35%, rgba(${accentRgb},0.58) 0%, rgba(${deepRgb},0.92) 72%)`,
              boxShadow: ringClaimed
                ? `0 0 0 2px rgba(${accentRgb},0.75), 0 0 56px 22px rgba(${accentRgb},0.4)`
                : claiming
                  ? `0 0 0 3px rgba(${accentRgb},0.55), 0 0 56px 22px rgba(${accentRgb},0.35)`
                  : `0 12px 36px rgba(${deepRgb},0.28)`,
            }}
          >
            <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
              <div style={{ position: 'absolute', width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,80,40,0.14)', filter: 'blur(26px)', left: '6%', top: '16%' }} />
              <div style={{ position: 'absolute', width: 80, height: 80, borderRadius: '50%', background: 'rgba(253,186,116,0.22)', filter: 'blur(20px)', right: '14%', top: '12%' }} />
            </div>

            <AnimatePresence mode="wait">
              {genieVisible ? (
                <motion.img
                  key="genie"
                  src="/rewards/genie.png"
                  alt="Genie"
                  initial={{ scale: 0, y: 28, opacity: 0 }}
                  animate={{ scale: [0, 1.14, 1], y: 0, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 14 }}
                  style={{ width: 196, height: 'auto', objectFit: 'contain', position: 'relative', zIndex: 1 }}
                />
              ) : (
                <motion.img
                  key="lamp"
                  src="/rewards/genie-lamp.png"
                  alt="Lamp"
                  animate={
                    claiming
                      ? { rotate: [-9, 9, -7, 7, 0], scale: [1, 1.08, 1] }
                      : { scale: [1, 1.04, 1] }
                  }
                  transition={
                    claiming
                      ? { duration: 0.4 }
                      : { duration: 2.6, repeat: Infinity, ease: 'easeInOut' }
                  }
                  style={{
                    width: 168,
                    height: 'auto',
                    objectFit: 'contain',
                    position: 'relative',
                    zIndex: 1,
                    filter: claiming
                      ? `drop-shadow(0 0 18px rgba(${accentRgb},0.95)) drop-shadow(0 0 28px rgba(${accentRgb},0.5))`
                      : `drop-shadow(0 0 12px rgba(${accentRgb},0.45))`,
                  }}
                />
              )}
            </AnimatePresence>

            <div className="absolute pointer-events-none" style={{ left: '18%', top: '40%' }}>
              <AnimatePresence>
                {particles.map(p => (
                  <motion.div
                    key={p.id}
                    className="absolute rounded-full"
                    style={{
                      width: p.size,
                      height: p.size,
                      background: p.color,
                      filter: 'blur(5px)',
                      marginLeft: -p.size / 2,
                      marginTop: -p.size / 2,
                    }}
                    initial={{ x: p.xOff, y: 0, opacity: p.opacity, scale: 0.35 }}
                    animate={{ x: p.xOff + p.xDrift, y: p.yDrift, opacity: 0, scale: 2.4 }}
                    transition={{ duration: p.duration, ease: [0.15, 0, 0.4, 1] }}
                    onAnimationComplete={() => setParticles(prev => prev.filter(x => x.id !== p.id))}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.button>
        </div>

        <AnimatePresence>
          {!claimed && (
            <motion.p
              exit={{ opacity: 0, height: 0 }}
              className="text-sm font-bold text-gray-800 mb-4 inline-flex items-center gap-2"
            >
              {claiming ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" /> Claiming your reward…
                </>
              ) : (
                'Tap the lamp to claim'
              )}
            </motion.p>
          )}
        </AnimatePresence>

        {claimError && <p className="text-center text-sm text-red-600 mb-3">{claimError}</p>}

        {/* Preview reward card — prototype-style */}
        <AnimatePresence>
          {!claimed && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="w-full max-w-sm rounded-2xl p-4"
              style={{
                background: `${accent}0D`,
                border: `1px solid ${accent}33`,
                boxShadow: `0 10px 32px rgba(${accentRgb},0.14)`,
              }}
            >
              <div className="flex items-center justify-between mb-3 gap-2">
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: `${accent}22`, color: accentTo }}
                >
                  {preview.badgeLabel ?? preview.rewardTitle}
                </span>
                {preview.availableLabel ? (
                  <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 font-medium">
                    <Gift className="size-3" />
                    {preview.availableLabel}
                  </span>
                ) : null}
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div
                  className="size-14 rounded-full bg-white flex items-center justify-center text-3xl shrink-0 shadow-sm"
                  style={{ border: `1px solid ${accent}22` }}
                >
                  {emoji}
                </div>
                <div className="min-w-0">
                  <p className="text-gray-900 font-bold text-[16px] leading-tight">
                    {preview.rewardTitle}
                    {businessName ? ` at ${businessName}` : ''}
                  </p>
                  {preview.description || preview.highlight ? (
                    <p className="text-[12px] mt-1 text-gray-500 leading-snug">
                      {preview.highlight || preview.description}
                    </p>
                  ) : null}
                </div>
              </div>

              {(previewClaimDate || previewRedeemDate) && (
                <div className="flex items-start gap-3 text-[10px] text-gray-400 border-t pt-3" style={{ borderColor: `${accent}22` }}>
                  {previewClaimDate && (
                    <div className="flex-1">
                      <div className="flex items-center gap-1 mb-0.5">
                        <CalendarDays className="size-3" />
                        <span>Claim Before</span>
                      </div>
                      <p className="font-semibold text-gray-800 text-[11px]">{previewClaimDate}</p>
                    </div>
                  )}
                  {previewRedeemDate && (
                    <div className="flex-1">
                      <div className="flex items-center gap-1 mb-0.5">
                        <Gift className="size-3" />
                        <span>Redeem Before</span>
                      </div>
                      <p className="font-semibold text-gray-800 text-[11px]">{previewRedeemDate}</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success reward card */}
        <AnimatePresence>
          {showReward && result && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 240, damping: 20 }}
              className="w-full max-w-sm"
            >
              <p className="text-center text-gray-900 font-bold text-lg mb-3">{claimedHeadline}</p>
              <div
                className="rounded-2xl p-4"
                style={{
                  background: `${accent}0D`,
                  border: `1px solid ${accent}33`,
                  boxShadow: `0 12px 36px rgba(${accentRgb},0.16)`,
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{ background: `${accent}22`, color: accentTo }}
                  >
                    {result.reward}
                  </span>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="size-14 rounded-full bg-white flex items-center justify-center text-3xl shrink-0 shadow-sm"
                    style={{ border: `1px solid ${accent}22` }}
                  >
                    {result.icon || emoji}
                  </div>
                  <div className="min-w-0">
                    <p className="text-gray-900 font-bold text-[16px] leading-tight">
                      {result.reward}
                      {businessName ? ` at ${businessName}` : ''}
                    </p>
                    {result.code ? (
                      <p className="text-[12px] mt-1 text-gray-500 font-mono tracking-wider">{result.code}</p>
                    ) : result.subtitle ? (
                      <p className="text-[12px] mt-1 text-gray-500">{result.subtitle}</p>
                    ) : null}
                  </div>
                </div>
                {(successClaimDate || successRedeemDate) && (
                  <div className="flex items-start gap-3 text-[10px] text-gray-400 border-t pt-3" style={{ borderColor: `${accent}22` }}>
                    {successClaimDate && (
                      <div className="flex-1">
                        <div className="flex items-center gap-1 mb-0.5">
                          <CalendarDays className="size-3" />
                          <span>Claim Before</span>
                        </div>
                        <p className="font-semibold text-gray-800 text-[11px]">{successClaimDate}</p>
                      </div>
                    )}
                    {successRedeemDate && (
                      <div className="flex-1">
                        <div className="flex items-center gap-1 mb-0.5">
                          <Gift className="size-3" />
                          <span>Redeem Before</span>
                        </div>
                        <p className="font-semibold text-gray-800 text-[11px]">{successRedeemDate}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <motion.div
                className="mt-4"
                animate={{ scale: [1, 1.015, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Link
                  to="/customer/wallet"
                  className="flex items-center justify-center w-full py-4 rounded-2xl font-bold text-base text-white no-underline"
                  style={{
                    background: `linear-gradient(135deg, ${accent}, ${accentTo})`,
                    boxShadow: `0 12px 28px rgba(${accentRgb},0.4)`,
                  }}
                >
                  View in Wallet →
                </Link>
              </motion.div>
              <button
                type="button"
                onClick={onBack}
                className="mt-3 w-full py-3.5 rounded-2xl font-bold text-sm text-white border-0 cursor-pointer"
                style={{
                  background: accentTo,
                  boxShadow: `0 8px 20px rgba(${deepRgb},0.28)`,
                }}
              >
                Back to Business
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
