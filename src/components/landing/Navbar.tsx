import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'

const BAR_HEIGHT = 38

const navLinks = [
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#mechanics', label: 'Mechanics' },
  { href: '#for-business', label: 'For Business' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > BAR_HEIGHT)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

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
        <span className="shimmer-gold text-[10px] sm:text-[13px] font-bold tracking-[1.5px] sm:tracking-[2px]">SHAKE IT & WIN IT</span>
        <div className="hidden sm:block w-8 h-px bg-gradient-to-l from-transparent to-gold/60" />
      </div>

      <nav
        className="fixed left-0 right-0 z-[100] flex items-center justify-between px-4 sm:px-6 md:px-10 py-3 sm:py-4 transition-all duration-300"
        style={{
          top: BAR_HEIGHT,
          background: scrolled || menuOpen ? 'rgba(10,5,32,0.92)' : 'transparent',
          backdropFilter: scrolled || menuOpen ? 'blur(20px)' : 'none',
          borderBottom: scrolled || menuOpen ? '1px solid rgba(240,192,64,0.1)' : 'none',
        }}
      >
        <Link to="/" className="flex items-center gap-2 sm:gap-3 no-underline shrink-0 min-w-0">
          <div
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-lg sm:text-[22px] border border-gold/35 shadow-[0_0_16px_rgba(107,63,212,0.5)] shrink-0"
            style={{ background: 'linear-gradient(135deg, #3d1f8a, #6b3fd4)' }}
          >
            🧞
          </div>
          <span className="text-lg sm:text-2xl font-black tracking-tight truncate">
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

        <div className="hidden sm:flex items-center gap-2 md:gap-3 shrink-0">
          <Link
            to="/signin"
            className="btn-outline text-xs sm:text-sm no-underline !py-2 !px-4 sm:!px-5"
          >
            Sign In
          </Link>
          <Link
            to="/business/signin"
            className="btn-gold text-xs sm:text-sm no-underline !py-2 !px-4 sm:!px-5"
          >
            For Business
          </Link>
        </div>

        <button
          type="button"
          className="sm:hidden flex items-center justify-center w-10 h-10 rounded-xl border border-gold/25 bg-bg-card/40 text-gold shrink-0"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {menuOpen && (
        <div
          className="fixed inset-0 z-[99] sm:hidden bg-black/50"
          style={{ top: BAR_HEIGHT + 56 }}
          onClick={closeMenu}
          role="presentation"
        >
          <div
            className="absolute inset-x-0 top-0 px-4 pb-6 pt-2 border-b border-gold/10"
            style={{ background: 'rgba(10,5,32,0.97)', backdropFilter: 'blur(20px)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-1 mb-4">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={closeMenu}
                  className="text-white text-base font-medium py-3 px-2 rounded-xl hover:bg-gold/5 transition-colors no-underline"
                >
                  {l.label}
                </a>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <Link
                to="/signin"
                onClick={closeMenu}
                className="btn-outline text-sm w-full no-underline justify-center"
              >
                Sign In
              </Link>
              <Link
                to="/business/signin"
                onClick={closeMenu}
                className="btn-gold text-sm w-full no-underline justify-center"
              >
                For Business
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
