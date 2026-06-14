import { Link } from 'react-router-dom'

const footerLinks = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Mechanics', href: '#mechanics' },
  { label: 'For Business', href: '#for-business' },
  { label: 'Sign Up', href: '/signup', isRoute: true },
]

export function Footer() {
  return (
    <footer
      className="footer-main px-5 md:px-12 lg:px-20 py-12 flex flex-col lg:flex-row justify-between items-center gap-6 text-center lg:text-left"
      style={{ background: '#060318', borderTop: '1px solid rgba(240,192,64,0.08)' }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-[10px] flex items-center justify-center text-xl border border-gold/30"
          style={{ background: 'linear-gradient(135deg, #3d1f8a, #6b3fd4)' }}
        >
          🧞
        </div>
        <div>
          <p className="text-xl font-black tracking-tight">
            <span className="text-white">Loyal</span>
            <span className="text-gold">Genie</span>
          </p>
          <p className="text-muted text-xs">Magical Interaction for Businesses</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-8 justify-center">
        {footerLinks.map((link) =>
          link.isRoute ? (
            <Link
              key={link.label}
              to={link.href}
              className="text-muted text-sm no-underline hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ) : (
            <a
              key={link.label}
              href={link.href}
              className="text-muted text-sm no-underline hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ),
        )}
      </div>

      <p className="text-muted text-[13px]">© 2026 LoyalGenie · Made with ✨ in India</p>
    </footer>
  )
}
