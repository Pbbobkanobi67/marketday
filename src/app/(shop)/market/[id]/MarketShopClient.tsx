'use client'

import { useState, useMemo } from 'react'
import { CalendarDays, MapPin, ShoppingBag } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { MARKET_CONFIG } from '@/config/market.config'
import { formatMarketDateTime, formatPrice, cn } from '@/lib/utils'
import ProductCard from '@/components/shop/ProductCard'

type MarketData = {
  id: string
  name: string
  date: string
  openTime: string
  closeTime: string
  location: string
  address: string
  description: string | null
  status: string
  type?: string
}

type ProductWithVendor = {
  id: string
  name: string
  slug: string
  description: string
  price: number
  imageUrl: string | null
  unit: string
  category: string
  isAvailable: boolean
  vendorId: string
  vendor: {
    name: string
    slug: string
    isActive: boolean
  }
}

type MarketShopClientProps = {
  market: MarketData
  products: ProductWithVendor[]
  initialCategory?: string
}

const ALL_CATEGORY = 'all' as const

export default function MarketShopClient({ market, products, initialCategory }: MarketShopClientProps) {
  const { itemCount, subtotal, openDrawer } = useCart()
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory || ALL_CATEGORY)

  const categories = useMemo(
    () => [
      { value: ALL_CATEGORY, label: 'All', emoji: '' },
      ...MARKET_CONFIG.categories,
    ],
    []
  )

  const filteredProducts = useMemo(() => {
    if (activeCategory === ALL_CATEGORY) return products
    return products.filter((p) => p.category === activeCategory)
  }, [products, activeCategory])

  const dateDisplay = formatMarketDateTime(market.date, market.openTime, market.closeTime)

  return (
    <div className="pb-28 md:pb-0">
      {/* ── Market info hero strip ──────────────────────────────────── */}
      <section className="bg-market-sage text-white">
        <div className="container-market py-6 sm:py-8">
          <h1 className="font-display text-2xl sm:text-3xl font-bold leading-tight mb-2">
            {market.name}
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-white/90 text-sm">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4" />
              {dateDisplay}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {market.location}
            </span>
          </div>
        </div>
      </section>

      {/* ── Category filter tabs ────────────────────────────────────── */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur border-b border-market-stone/30">
        <div className="container-market">
          <nav
            className="flex items-center gap-1 overflow-x-auto py-3 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide"
            aria-label="Filter by category"
          >
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={cn(
                  'shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
                  activeCategory === cat.value
                    ? 'bg-market-sage text-white'
                    : 'bg-market-warm text-market-soil hover:bg-market-stone'
                )}
                aria-pressed={activeCategory === cat.value}
              >
                {cat.emoji ? `${cat.emoji} ` : ''}
                {cat.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* ── Product grid ────────────────────────────────────────────── */}
      <section className="container-market py-8">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                showVendor={true}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground">
              No products in this category yet.
            </p>
            <button
              onClick={() => setActiveCategory(ALL_CATEGORY)}
              className="mt-3 text-sm font-medium text-market-sage hover:text-market-sage-dk transition-colors"
            >
              Show all products
            </button>
          </div>
        )}
      </section>

      {/* ── Floating "View My Bag" bar (mobile only, when items > 0) ── */}
      {itemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
          <div className="bg-white border-t border-market-stone/30 shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
            <div className="container-market flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-market-sage text-white text-xs font-bold">
                  {itemCount}
                </span>
                <div className="leading-tight">
                  <p className="text-xs text-muted-foreground">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                  </p>
                  <p className="price text-sm">{formatPrice(subtotal)}</p>
                </div>
              </div>
              <button
                onClick={openDrawer}
                className="btn-primary flex items-center gap-2 !py-2.5"
              >
                <ShoppingBag className="w-4 h-4" />
                View My Bag
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
