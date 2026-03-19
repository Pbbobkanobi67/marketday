import Link from 'next/link'
import { CalendarDays, MapPin, Clock, ArrowRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { MARKET_CONFIG } from '@/config/market.config'
import { formatMarketDate, formatMarketDateShort, formatMarketDateTime } from '@/lib/utils'
import VendorCard from '@/components/shop/VendorCard'

export default async function HomePage() {
  const [markets, vendors] = await Promise.all([
    prisma.market.findMany({ where: { status: 'UPCOMING' }, orderBy: { date: 'asc' } }),
    prisma.vendor.findMany({ where: { isActive: true }, take: 6 }),
  ])
  const nextMarket = markets[0]

  const topCategories = MARKET_CONFIG.categories.slice(0, 4)

  return (
    <>
      {/* ────────────────────────────────────────────────────
          Section 1 — Hero
      ──────────────────────────────────────────────────── */}
      <section className="bg-market-cream">
        <div className="container-market py-16 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left column — copy */}
            <div className="space-y-6">
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-market-soil leading-tight">
                Fresh from
                <br />
                the farm.
                <br />
                <span className="text-market-sage">Ready Saturday.</span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-lg">
                Browse vendors, place your order, and pick up at the market in El Cajon.
                No waiting, no missing out.
              </p>

              {nextMarket && (
                <span className="inline-flex items-center gap-2 text-sm font-medium bg-market-sage/10 text-market-sage px-4 py-2 rounded-full">
                  <CalendarDays className="w-4 h-4" />
                  Next market: {formatMarketDateShort(nextMarket.date)}
                </span>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href={nextMarket ? `/market/${nextMarket.id}` : '/vendors'}
                  className="btn-primary inline-flex items-center justify-center gap-2"
                >
                  Browse This Saturday&apos;s Market
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/vendors"
                  className="btn-secondary inline-flex items-center justify-center"
                >
                  Meet Our Vendors
                </Link>
              </div>
            </div>

            {/* Right column — category cards (desktop) */}
            <div className="hidden lg:grid grid-cols-2 gap-4">
              {topCategories.map((cat) => (
                <div
                  key={cat.value}
                  className="card-market p-6 flex flex-col items-center justify-center gap-3 text-center hover:shadow-md transition-shadow"
                >
                  <span className="text-4xl" role="img" aria-label={cat.label}>
                    {cat.emoji}
                  </span>
                  <span className="font-display text-base font-semibold text-market-soil">
                    {cat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────
          Section 2 — How It Works
      ──────────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="container-market py-16 sm:py-20">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-market-soil text-center mb-12">
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
            {[
              {
                step: '1',
                heading: 'Browse the market',
                body: 'Explore vendors by category or scroll the full market listing.',
              },
              {
                step: '2',
                heading: 'Add to your bag',
                body: 'Pick your items, choose a market date. Your bag saves automatically.',
              },
              {
                step: '3',
                heading: 'Pay now or at the stand',
                body: 'Secure online payment or reserve free and pay at pickup.',
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center gap-3">
                <span className="font-display text-6xl text-market-stone font-bold leading-none">
                  {item.step}
                </span>
                <h3 className="font-display text-lg font-semibold text-market-soil">
                  {item.heading}
                </h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────
          Section 3 — Featured Vendors
      ──────────────────────────────────────────────────── */}
      {vendors.length > 0 && (
        <section>
          <div className="container-market py-16 sm:py-20">
            <div className="flex items-end justify-between mb-8">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-market-soil">
                Who&apos;s at the Market
              </h2>
              <Link
                href="/vendors"
                className="hidden sm:inline-flex text-sm font-medium text-market-sage hover:text-market-sage-dk transition-colors items-center gap-1"
              >
                View all vendors
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {vendors.map((vendor) => (
                <VendorCard key={vendor.id} vendor={vendor} />
              ))}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <Link
                href="/vendors"
                className="text-sm font-medium text-market-sage hover:text-market-sage-dk transition-colors"
              >
                View all vendors &rarr;
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ────────────────────────────────────────────────────
          Section 4 — Upcoming Markets
      ──────────────────────────────────────────────────── */}
      <section className="bg-market-warm">
        <div className="container-market py-16 sm:py-20">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-market-soil text-center mb-10">
            Mark Your Calendar
          </h2>

          {markets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {markets.slice(0, 3).map((market) => (
                <div
                  key={market.id}
                  className="card-market p-6 flex flex-col gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-center shrink-0">
                      <span className="font-display text-3xl font-bold text-market-sage leading-none block">
                        {new Date(market.date).getDate()}
                      </span>
                      <span className="text-xs font-semibold uppercase text-muted-foreground">
                        {new Date(market.date).toLocaleString('en-US', { month: 'short' })}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <p className="font-display text-base font-semibold text-market-soil">
                        {new Date(market.date).toLocaleString('en-US', { weekday: 'long' })}
                      </p>
                      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        {market.openTime} &ndash; {market.closeTime}
                      </p>
                      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5" />
                        {market.location}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/market/${market.id}`}
                    className="text-sm font-medium text-market-sage hover:text-market-sage-dk transition-colors mt-auto inline-flex items-center gap-1"
                  >
                    Shop This Market
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              Markets coming soon &mdash; check back shortly!
            </p>
          )}
        </div>
      </section>
    </>
  )
}
