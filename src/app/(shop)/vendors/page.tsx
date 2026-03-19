import { prisma } from '@/lib/prisma'
import { MARKET_CONFIG } from '@/config/market.config'
import VendorCard from '@/components/shop/VendorCard'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Vendors | Backroads Certified Farmers Market',
  description: 'Meet the makers behind the market. Browse local vendors and their farm-fresh products.',
}

type Props = {
  searchParams: { category?: string }
}

export default async function VendorsPage({ searchParams }: Props) {
  const activeCategory = searchParams.category || null

  // Fetch all active vendors
  const allVendors = await prisma.vendor.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  })

  // Count vendors per category
  const categoryCounts = new Map<string, number>()
  for (const v of allVendors) {
    categoryCounts.set(v.category, (categoryCounts.get(v.category) || 0) + 1)
  }

  // Filter if a category is selected
  const vendors = activeCategory
    ? allVendors.filter((v) => v.category === activeCategory)
    : allVendors

  // Find the active category label for the heading
  const activeCatConfig = activeCategory
    ? MARKET_CONFIG.categories.find((c) => c.value === activeCategory)
    : null

  return (
    <section className="container-market py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-market-soil">
          {activeCatConfig
            ? `${activeCatConfig.emoji} ${activeCatConfig.label}`
            : 'The Makers Behind the Market'}
        </h1>
        {activeCatConfig && (
          <p className="text-sm text-muted-foreground mt-1">
            {vendors.length} vendor{vendors.length !== 1 ? 's' : ''} in this category
          </p>
        )}
      </div>

      {/* Category filter pills */}
      <nav
        className="flex items-center gap-2 overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide"
        aria-label="Filter by category"
      >
        <Link
          href="/vendors"
          className={cn(
            'shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
            !activeCategory
              ? 'bg-market-sage text-white'
              : 'bg-market-warm text-market-soil hover:bg-market-stone'
          )}
        >
          All ({allVendors.length})
        </Link>
        {MARKET_CONFIG.categories.map((cat) => {
          const count = categoryCounts.get(cat.value) || 0
          if (count === 0) return null
          return (
            <Link
              key={cat.value}
              href={`/vendors?category=${cat.value}`}
              className={cn(
                'shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
                activeCategory === cat.value
                  ? 'bg-market-sage text-white'
                  : 'bg-market-warm text-market-soil hover:bg-market-stone'
              )}
            >
              {cat.emoji} {cat.label} ({count})
            </Link>
          )
        })}
      </nav>

      {vendors.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground">
            No vendors in this category. Check back soon!
          </p>
          <Link
            href="/vendors"
            className="text-sm font-medium text-market-sage hover:text-market-sage-dk mt-3 inline-block"
          >
            View all vendors
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {vendors.map((vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} />
          ))}
        </div>
      )}
    </section>
  )
}
