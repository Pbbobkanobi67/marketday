import Link from 'next/link'
import { CalendarDays, CalendarPlus, MapPin, Clock, ArrowRight, Star } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { MARKET_CONFIG } from '@/config/market.config'
import { formatMarketDate, formatMarketDateShort, formatMarketDateTime } from '@/lib/utils'
import VendorCard from '@/components/shop/VendorCard'

const TESTIMONIALS = [
  {
    stars: 5,
    quote:
      'A great place to shop for organic vegetables, incredible breads, and the ever-changing foods like BBQ and empanadas \u2014 always at reasonable prices.',
    author: 'Yelp Reviewer',
  },
  {
    stars: 5,
    quote:
      "Love this place! They've been a farmers market staple for quite a while and now have their own storefront.",
    author: 'Yelp Reviewer',
  },
  {
    stars: 5,
    quote:
      "There's a genuine sense of community here, with a great mix of fresh produce and delicious food.",
    author: 'Yelp Reviewer',
  },
  {
    stars: 0,
    quote:
      "The feeling you get by helping people, you really can't compare that to anything else.",
    author: 'Marci Miller, Market President',
  },
]

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
                Grown, crafted,
                <br />
                made local.
                <br />
                <span className="text-market-sage">Ready Saturday.</span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-lg">
                Browse local farmers, makers &amp; artisans. Order ahead, pick up at the market in El Cajon.
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
              {topCategories.map((cat) => {
                const href = nextMarket
                  ? `/market/${nextMarket.id}?category=${cat.value}`
                  : '/vendors'
                return (
                  <Link
                    key={cat.value}
                    href={href}
                    className="card-market p-6 flex flex-col items-center justify-center gap-3 text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <span className="text-4xl" role="img" aria-label={cat.label}>
                      {cat.emoji}
                    </span>
                    <span className="font-display text-base font-semibold text-market-soil">
                      {cat.label}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────
          Section 2 — How It Works (compact)
      ──────────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="container-market py-10 sm:py-12">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-market-soil text-center mb-8">
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {[
              {
                emoji: '\uD83D\uDED2',
                heading: 'Browse the market',
                body: 'Explore vendors by category or scroll the full listing.',
              },
              {
                emoji: '\uD83D\uDCE6',
                heading: 'Add to your bag',
                body: 'Pick items, choose a market date. Your bag saves automatically.',
              },
              {
                emoji: '\uD83E\uDD1D',
                heading: 'Pay now or at pickup',
                body: 'Secure online payment or reserve free and pay at the stand.',
              },
            ].map((item) => (
              <div
                key={item.heading}
                className="flex items-start gap-4 p-4 rounded-xl bg-market-warm/50 border border-market-stone/20"
              >
                <span className="text-3xl shrink-0" role="img" aria-hidden="true">
                  {item.emoji}
                </span>
                <div>
                  <h3 className="font-display text-base font-semibold text-market-soil">
                    {item.heading}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {item.body}
                  </p>
                </div>
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
          Section 4 — Reviews / Testimonials
      ──────────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="container-market py-16 sm:py-20">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-market-soil text-center mb-10">
            What People Are Saying
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className="card-market p-5 flex flex-col gap-3"
              >
                {t.stars > 0 && (
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.stars }).map((_, s) => (
                      <Star
                        key={s}
                        className="w-4 h-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                )}
                <p className="text-sm text-market-bark leading-relaxed flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <p className="text-xs font-medium text-muted-foreground">
                  &mdash; {t.author}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <a
              href="https://www.yelp.com/biz/backroads-certified-farmers-market-el-cajon"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-market-sage hover:text-market-sage-dk transition-colors inline-flex items-center gap-1"
            >
              See all reviews on Yelp
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────
          Section 5 — Upcoming Markets
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

                  <div className="flex items-center justify-between mt-auto">
                    <Link
                      href={`/market/${market.id}`}
                      className="text-sm font-medium text-market-sage hover:text-market-sage-dk transition-colors inline-flex items-center gap-1"
                    >
                      Shop This Market
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <a
                      href={`/api/calendar/${market.id}`}
                      download
                      className="text-xs font-medium text-muted-foreground hover:text-market-sage transition-colors inline-flex items-center gap-1"
                    >
                      <CalendarPlus className="w-3.5 h-3.5" />
                      Add to Calendar
                    </a>
                  </div>
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
