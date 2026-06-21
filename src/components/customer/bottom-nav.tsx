import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  createNavCurvePath,
  NAV_LAYOUT,
  tabCenterX,
} from '@/components/customer/nav-curve-path'
import {
  NavHomeActive,
  NavHomeInactive,
  NavProfileActive,
  NavProfileInactive,
  NavWalletActive,
  NavWalletInactive,
} from '@/components/customer/nav-icons'

const NAV_ITEMS = [
  {
    label: 'Home',
    href: '/customer',
    ActiveIcon: NavHomeActive,
    InactiveIcon: NavHomeInactive,
    inactiveClassName: 'h-5 w-5',
    activeClassName: 'h-6 w-6',
  },
  {
    label: 'Wallet',
    href: '/customer/wallet',
    ActiveIcon: NavWalletActive,
    InactiveIcon: NavWalletInactive,
    inactiveClassName: 'h-6 w-6',
    activeClassName: 'h-6 w-6',
  },
  {
    label: 'Profile',
    href: '/customer/profile',
    ActiveIcon: NavProfileActive,
    InactiveIcon: NavProfileInactive,
    inactiveClassName: 'h-5 w-5',
    activeClassName: 'h-6 w-6',
  },
] as const

const { totalHeight, barTop, barHeight, circleSize, viewBoxWidth } = NAV_LAYOUT
const circleRadius = circleSize / 2

function isActive(path: string, href: string) {
  return href === '/customer'
    ? path === '/customer'
    : path === href || path.startsWith(href + '/')
}

export function BottomNav() {
  const { pathname } = useLocation()
  const activeIndex = Math.max(
    0,
    NAV_ITEMS.findIndex(item => isActive(pathname, item.href)),
  )
  const activeItem = NAV_ITEMS[activeIndex]
  const ActiveIcon = activeItem.ActiveIcon
  const curveCenter = tabCenterX(activeIndex, NAV_ITEMS.length)

  return (
    <nav
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[440px] bg-[#fff5f0] pb-[env(safe-area-inset-bottom)]"
      aria-label="Customer navigation"
    >
      <div className="relative w-full" style={{ height: totalHeight }}>
        {/* Shaped top — full bleed width */}
        <svg
          className="pointer-events-auto absolute inset-x-0 w-full"
          style={{ top: barTop, height: barHeight }}
          viewBox={`0 0 ${viewBoxWidth} ${barHeight}`}
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d={createNavCurvePath(curveCenter)}
            fill="#fff5f0"
            shapeRendering="geometricPrecision"
          />
        </svg>

        {/* Active bubble — 50px Figma size, empty gap via cutout */}
        <div
          className="pointer-events-none absolute z-20 flex items-center justify-center rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.1)] transition-[left] duration-300 ease-out"
          style={{
            top: barTop - circleRadius,
            left: `calc(${(curveCenter / viewBoxWidth) * 100}% - ${circleRadius}px)`,
            width: circleSize,
            height: circleSize,
          }}
        >
          <ActiveIcon className={activeItem.activeClassName} />
        </div>

        {/* Tab row */}
        <div
          className="pointer-events-auto absolute inset-x-0 grid grid-cols-3 items-end px-1"
          style={{ top: barTop, height: barHeight, paddingBottom: 8 }}
        >
          {NAV_ITEMS.map(
            ({ label, href, InactiveIcon, inactiveClassName }, index) => {
              const active = index === activeIndex
              return (
                <Link
                  key={href}
                  to={href}
                  className="flex h-full min-w-0 flex-col items-center justify-end touch-manipulation"
                  aria-current={active ? 'page' : undefined}
                >
                  {!active && (
                    <InactiveIcon className={cn(inactiveClassName, 'mb-1')} />
                  )}
                  {active && <span className="mb-0.5 h-5 w-5 shrink-0" aria-hidden />}
                  <span
                    className={cn(
                      'font-[family-name:var(--font-nav)] text-[10px] leading-none tracking-[0.2px]',
                      active
                        ? 'font-semibold text-[#5b0e81]'
                        : 'font-medium text-[#646464]',
                    )}
                  >
                    {label}
                  </span>
                </Link>
              )
            },
          )}
        </div>
      </div>
    </nav>
  )
}
