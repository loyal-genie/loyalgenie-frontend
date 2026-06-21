import { useCallback, useRef, useState, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const PULL_THRESHOLD = 64
const MAX_PULL = 96

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: ReactNode
  className?: string
}

export function PullToRefresh({ onRefresh, children, className }: PullToRefreshProps) {
  const [pull, setPull] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const startY = useRef(0)
  const pulling = useRef(false)

  const canPull = useCallback(() => {
    return window.scrollY <= 0
  }, [])

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (refreshing || !canPull()) return
    startY.current = e.touches[0]?.clientY ?? 0
    pulling.current = true
  }, [refreshing, canPull])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!pulling.current || refreshing || !canPull()) return
    const y = e.touches[0]?.clientY ?? 0
    const delta = y - startY.current
    if (delta > 0) {
      setPull(Math.min(delta * 0.45, MAX_PULL))
    }
  }, [refreshing, canPull])

  const onTouchEnd = useCallback(async () => {
    if (!pulling.current) return
    pulling.current = false
    if (pull >= PULL_THRESHOLD && !refreshing) {
      setRefreshing(true)
      setPull(PULL_THRESHOLD * 0.6)
      try {
        await onRefresh()
      } finally {
        setRefreshing(false)
        setPull(0)
      }
      return
    }
    setPull(0)
  }, [pull, refreshing, onRefresh])

  return (
    <div
      className={cn('relative min-h-dvh', className)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 z-40 flex justify-center transition-opacity duration-200',
          pull > 8 || refreshing ? 'opacity-100' : 'opacity-0',
        )}
        style={{ height: Math.max(pull, refreshing ? 48 : 0) }}
      >
        <Loader2
          className={cn(
            'size-5 text-[#5b0e81] mt-3',
            (refreshing || pull >= PULL_THRESHOLD) && 'animate-spin',
          )}
        />
      </div>
      <div
        className="transition-transform duration-200 ease-out"
        style={{ transform: pull > 0 ? `translateY(${pull}px)` : undefined }}
      >
        {children}
      </div>
    </div>
  )
}
