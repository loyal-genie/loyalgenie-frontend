import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'

const BAR_HEIGHT = 38

const navLinks = [
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#mechanics', label: 'Mechanics' },
  { href: '#for-business', label: 'For Business' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > BAR_HEIGHT)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <div
        className="fixed top-0 left-0 right-0 z-[101] flex items-center justify-center gap-4 border-b border-gold/20 backdrop-blur-md"
        style={{
          height: BAR_HEIGHT,
          background: 'linear-gradient(90deg, rgba(61,31,138,0.98), rgba(26,11,75,0.98), rgba(61,31,138,0.98))',
        }}
      >
        <div className="hidden sm:block w-8 h-px bg-gradient-to-r from-transparent to-gold/60" />
        <span className="shimmer-gold text-[11px] sm:text-[13px] font-bold tracking-[2px]">SHAKE IT & WIN IT</span>
        <div className="hidden sm:block w-8 h-px bg-gradient-to-l from-transparent to-gold/60" />
      </div>

      <nav
        className="fixed left-0 right-0 z-[100] flex items-center justify-between px-5 md:px-10 transition-all duration-300"
        style={{
          top: BAR_HEIGHT,
          padding: '16px 24px',
          background: scrolled ? 'rgba(10,5,32,0.92)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(240,192,64,0.1)' : 'none',
        }}
      >
        <Link to="/" className="flex items-center gap-3 no-underline shrink-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-[22px] border border-gold/35 shadow-[0_0_16px_rgba(107,63,212,0.5)]"
            style={{ background: 'linear-gradient(135deg, #3d1f8a, #6b3fd4)' }}
          >
            🧞
          </div>
          <span className="text-xl sm:text-2xl font-black tracking-tight">
            <span className="text-white">Loyal</span>
            <span className="shimmer-gold">Genie</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-muted text-[15px] font-medium hover:text-white transition-colors no-underline"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/signin"
            className="btn-outline text-xs sm:text-sm py-2 px-4 sm:px-6 no-underline"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="btn-gold text-xs sm:text-sm py-2 px-4 sm:px-6 no-underline"
          >
            Sign Up
          </Link>
        </div>
      </nav>
    </>
  )
}
