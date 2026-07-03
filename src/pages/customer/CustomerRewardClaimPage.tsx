import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CalendarDays, Gift } from 'lucide-react'
import { ClaimRewardBackground } from '@/components/customer/ClaimRewardBackground'
import { renderRewardIcon } from '@/components/vendor/IconPicker'
import { useClaimCustomerBusinessReward, useCustomerBusinessRewards } from '@/hooks/useRewards'
import { formatRewardDate } from '@/lib/customer-reward-themes'
import { getApiErrorMessage } from '@/lib/api'

// Cumulative pointer-travel distance (px) needed to fully rub the lamp to 100%.
const RUB_DISTANCE_FOR_FULL = 900

// Radius of the gold progress arc, matching Figma's ring path (drawn between the two
// static background circles at r=106 and r=89.5).
const RING_RADIUS = 98
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

function ProgressRing({ progress }: { progress: number }) {
  const dash = (Math.min(100, Math.max(0, progress)) / 100) * RING_CIRCUMFERENCE
  // Angle 0 in SVG circle geometry sits at 3 o'clock; the arc reveal grows clockwise
  // from there, matching Figma's 20%/100% reference frames exactly.
  const dotAngle = 0
  const dotX = 110 + RING_RADIUS * Math.cos(dotAngle)
  const dotY = 110 + RING_RADIUS * Math.sin(dotAngle)

  return (
    <svg
      viewBox="0 0 220 220"
      className="pointer-events-none absolute inset-0 h-full w-full -rotate-0"
    >
      <defs>
        <linearGradient id="ring-progress-gradient" x1="184.5" y1="33.4" x2="39.7" y2="189.7" gradientUnits="userSpaceOnUse">
          <stop stopColor="#EF9D00" />
          <stop offset="1" stopColor="#FFEE32" />
        </linearGradient>
      </defs>
      <circle
        cx="110"
        cy="110"
        r={RING_RADIUS}
        fill="none"
        stroke="url(#ring-progress-gradient)"
        strokeWidth={16}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${RING_CIRCUMFERENCE - dash}`}
        style={{ transition: 'stroke-dasharray 120ms linear' }}
      />
      {/* Static starting marker, visible even at 0% progress, matching Figma's dot at the ring's origin point. */}
      <circle cx={dotX} cy={dotY} r={7.5} fill="url(#ring-progress-gradient)" />
    </svg>
  )
}

export function CustomerRewardClaimPage() {
  const { rewardId } = useParams()
  const [searchParams] = useSearchParams()
  const businessId = searchParams.get('businessId') ?? undefined
  const navigate = useNavigate()
  const [progress, setProgress] = useState(0)
  const [isRubbing, setIsRubbing] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [error, setError] = useState('')
  const claimingRef = useRef(false)
  const rubbedDistanceRef = useRef(0)
  const lastPointRef = useRef<{ x: number; y: number } | null>(null)
  const claimMutation = useClaimCustomerBusinessReward()

  const { data } = useCustomerBusinessRewards(businessId)
  const reward = useMemo(
    () => data?.rewards.find(item => item.id === rewardId),
    [data?.rewards, rewardId],
  )

  const completeClaim = async () => {
    if (!rewardId || revealed || claimingRef.current) return
    claimingRef.current = true
    setError('')
    try {
      await claimMutation.mutateAsync(rewardId)
      setRevealed(true)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to claim reward'))
      claimingRef.current = false
      rubbedDistanceRef.current = RUB_DISTANCE_FOR_FULL * 0.9
      setProgress(90)
    }
  }

  // Guards against any stale state carrying over if this component instance is ever
  // reused across different rewardIds (e.g. browser back/forward navigation).
  useEffect(() => {
    setProgress(0)
    setRevealed(false)
    setError('')
    setIsRubbing(false)
    claimingRef.current = false
    rubbedDistanceRef.current = 0
    lastPointRef.current = null
  }, [rewardId])

  useEffect(() => {
    if (progress >= 100 && !revealed && !claimingRef.current) {
      void completeClaim()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress])

  const registerRub = (distance: number) => {
    if (revealed || claimingRef.current || distance <= 0) return
    rubbedDistanceRef.current = Math.min(RUB_DISTANCE_FOR_FULL, rubbedDistanceRef.current + distance)
    const pct = Math.min(100, Math.round((rubbedDistanceRef.current / RUB_DISTANCE_FOR_FULL) * 100))
    setProgress(prev => (pct > prev ? pct : prev))
  }

  const handlePointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (revealed || claimingRef.current) return
    e.currentTarget.setPointerCapture?.(e.pointerId)
    lastPointRef.current = { x: e.clientX, y: e.clientY }
    setIsRubbing(true)
  }

  const handlePointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!lastPointRef.current || revealed || claimingRef.current) return
    const dx = e.clientX - lastPointRef.current.x
    const dy = e.clientY - lastPointRef.current.y
    const distance = Math.hypot(dx, dy)
    if (distance > 1.5) {
      registerRub(distance)
      lastPointRef.current = { x: e.clientX, y: e.clientY }
    }
  }

  const stopRubbing = () => {
    lastPointRef.current = null
    setIsRubbing(false)
  }

  return (
    <ClaimRewardBackground>
      <div className="relative mx-auto flex min-h-dvh max-w-[390px] flex-col px-5 pb-10 pt-12">
        {!revealed ? (
          <>
            <div className="text-center">
              <h1 className="text-[20px] font-normal leading-tight text-[#bebebe]">
                Rub the lamp to claim your reward
              </h1>
              <p className="mt-1 text-[15px] font-normal text-[#bebebe]">The Magic is in your hand</p>
            </div>

            <div className="mt-10 flex flex-col items-center">
              <button
                type="button"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={stopRubbing}
                onPointerCancel={stopRubbing}
                onPointerLeave={stopRubbing}
                disabled={claimMutation.isPending}
                className={`relative flex h-[220px] w-[220px] touch-none items-center justify-center border-0 bg-transparent p-0 transition-transform duration-150 ${isRubbing ? 'scale-105' : 'scale-100'}`}
                style={{ touchAction: 'none' }}
                aria-label="Rub the lamp to claim your reward"
              >
                <img
                  src="/rewards/lamp-ring.svg"
                  alt=""
                  className="absolute inset-0 h-full w-full object-contain"
                  draggable={false}
                />
                <img
                  src="/rewards/lamp.png"
                  alt=""
                  className={`relative z-10 h-[142px] w-[142px] object-contain select-none ${isRubbing ? 'animate-pulse' : ''}`}
                  draggable={false}
                />
                <ProgressRing progress={progress} />
              </button>

              <div className="mt-8 w-full max-w-[280px]">
                <p className="text-center text-[20px] font-normal text-[#bebebe]">
                  Progress : {progress}
                  <span className="font-semibold">%</span>
                </p>
                <div className="relative mt-4 h-[2px] w-full rounded-full bg-[rgba(255,255,255,0.25)]">
                  <div
                    className="absolute left-0 top-0 h-[2px] min-w-[6px] rounded-full bg-[#f5c419] transition-all duration-150"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            {reward && <RewardPreviewCard reward={reward} className="mt-10" />}

            {error && <p className="mt-4 text-center text-sm text-[#ffd7d7]">{error}</p>}
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center text-center">
            <h2 className="text-[20px] font-normal text-[#bebebe]">Successfully claimed Your Reward</h2>
            <p className="mt-1 text-[15px] font-normal text-[#bebebe]">The Magic is in your hand</p>

            <div className="relative mt-6 flex h-[333px] w-[333px] items-center justify-center">
              <img
                src="/rewards/lamp-ring.svg"
                alt=""
                className="absolute left-1/2 top-1/2 h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 object-contain"
              />
              <div className="absolute left-1/2 top-1/2 h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2">
                <ProgressRing progress={100} />
              </div>
              <img
                src="/rewards/genie-success.png"
                alt=""
                className="relative z-10 h-[300px] w-[300px] object-contain"
              />
            </div>

            <p className="mt-2 text-[15px] font-bold text-[#bebebe]">Here is Your Reward</p>

            {reward && <RewardPreviewCard reward={reward} className="mt-4" />}

            <button
              type="button"
              onClick={() => navigate('/customer/wallet')}
              className="mx-auto mt-6 inline-flex items-center gap-[5px] rounded-[18px] border-0 bg-[rgba(255,255,255,0.1)] px-[29px] py-3 text-[14px] font-normal text-[#bebebe]"
            >
              View in Wallet
              <ArrowRight className="h-[18px] w-[18px] text-[#bebebe]" strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={() => (businessId ? navigate(`/customer/business/${businessId}`) : navigate(-1))}
              className="mx-auto mt-4 inline-flex items-center gap-2 border-0 bg-transparent py-2 text-[14px] font-normal text-[#bebebe]"
            >
              <ArrowLeft className="h-[18px] w-[18px] text-[#bebebe]" strokeWidth={2} />
              Back To vendor
            </button>
          </div>
        )}
      </div>
    </ClaimRewardBackground>
  )
}

function RewardPreviewCard({
  reward,
  className = '',
}: {
  reward: {
    icon: string
    name: string
    description: string
    pointsRequired: number
    availableCount: number | null
    maxClaims: number | null
    claimsCount: number
    claimBefore: string | null
    redeemBefore: string | null
  }
  className?: string
}) {
  const availabilityLabel =
    reward.maxClaims != null
      ? `${Math.max(0, reward.maxClaims - reward.claimsCount)} Available`
      : reward.availableCount != null
        ? `${reward.availableCount} Available`
        : 'Available'

  return (
    <div className={`w-full rounded-[20px] border-0 bg-[rgba(255,255,255,0.1)] p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="rounded-[12px] bg-[#7e6970] px-2.5 py-1 text-[8px] font-bold text-white">
          {reward.pointsRequired} pts
        </span>
        <span className="flex items-center gap-1 rounded-[12px] bg-[rgba(255,255,255,0.3)] px-2.5 py-1 text-[8px] font-normal text-white">
          <Gift className="h-3 w-3" strokeWidth={1.75} />
          {availabilityLabel}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <span className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full bg-white text-[32px] text-[#1b1410]">
          {renderRewardIcon(reward.icon)}
        </span>
        <div className="min-w-0 flex-1 text-left">
          <p className="text-[14px] font-medium text-white">{reward.name}</p>
          <p className="mt-0.5 text-[8px] text-[#9a9088]">
            {reward.description || 'Any size · All locations'}
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-4">
        <ClaimDateChip label="Claim Before" value={formatRewardDate(reward.claimBefore)} icon={CalendarDays} />
        <div className="h-5 w-px bg-[rgba(255,255,255,0.2)]" />
        <ClaimDateChip label="Redeem Before" value={formatRewardDate(reward.redeemBefore)} icon={Gift} />
      </div>
    </div>
  )
}

function ClaimDateChip({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: typeof CalendarDays
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1">
        <Icon className="h-3.5 w-3.5 text-white" strokeWidth={1.5} />
        <span className="text-[6px] text-[rgba(255,255,255,0.6)]">{label}</span>
      </div>
      <p className="mt-0.5 pl-4 text-[8px] font-medium text-white">{value}</p>
    </div>
  )
}
