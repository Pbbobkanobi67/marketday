import Link from 'next/link'
import { MARKET_CONFIG } from '@/config/market.config'

const FOOTER_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Vendors', href: '/vendors' },
  { label: 'Markets', href: '/markets' },
]

export default function Footer() {
  return (
    <footer className="bg-market-soil text-white">
      <div className="container-market py-12">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          {/* Logo and tagline */}
          <div className="space-y-2">
            <Link href="/" className="font-display text-xl font-bold text-white hover:text-market-warm transition-colors">
              {MARKET_CONFIG.marketName}
            </Link>
            <p className="text-sm text-white/70 max-w-xs">
              {MARKET_CONFIG.tagline}
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap gap-x-8 gap-y-2" aria-label="Footer navigation">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-white/80 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/admin"
              className="text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              Admin
            </Link>
          </nav>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container-market py-4">
          <p className="text-xs text-white/50 text-center">
            &copy; {new Date().getFullYear()} {MARKET_CONFIG.marketName} &middot; {MARKET_CONFIG.venueName} &middot; {MARKET_CONFIG.venueCity}, {MARKET_CONFIG.venueState}
          </p>
        </div>
      </div>
    </footer>
  )
}
