'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { CalendarDays, MapPin, ShoppingBag, Search, X, ChevronRight } from 'lucide-react'
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
  quantity: number
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

type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'vendor'

const ALL_CATEGORY = 'all' as const

export default function MarketShopClient({ market, products, initialCategory }: MarketShopClientProps) {
  const { itemCount, subtotal, openDrawer } = useCart()
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory || ALL_CATEGORY)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('vendor')

  // Category counts (computed over full product list, not filtered)
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { [ALL_CATEGORY]: products.length }
    for (const p of products) {
      counts[p.category] = (counts[p.category] || 0) + 1
    }
    return counts
  }, [products])

  const categories = useMemo(
    () => [
      { value: ALL_CATEGORY, label: 'All', emoji: '' },
      ...MARKET_CONFIG.categories.filter((cat) => (categoryCounts[cat.value] || 0) > 0),
    ],
    [categoryCounts]
  )

  const filteredProducts = useMemo(() => {
    let result = products

    // Category filter
    if (activeCategory !== ALL_CATEGORY) {
      result = result.filter((p) => p.category === activeCategory)
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.vendor.name.toLowerCase().includes(q)
      )
    }

    // Sort
    const sorted = [...result]
    switch (sortBy) {
      case 'name-asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'name-desc':
        sorted.sort((a, b) => b.name.localeCompare(a.name))
        break
      case 'price-asc':
        sorted.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price)
        break
      case 'vendor':
        sorted.sort((a, b) => a.vendor.name.localeCompare(b.vendor.name) || a.name.localeCompare(b.name))
        break
    }

    return sorted
  }, [products, activeCategory, searchQuery, sortBy])

  const dateDisplay = formatMarketDateTime(market.date, market.openTime, market.closeTime)
  const isSearchActive = searchQuery.trim().length > 0

  return (
    <div className="pb-28 md:pb-0">
      {/* Breadcrumb */}
      <div className="container-market pt-4 pb-2">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-market-sage transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-market-soil font-medium truncate">{market.name}</span>
        </nav>
      </div>

      {/* Market info hero strip */}
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

      {/* Search + Sort + Category filter */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur border-b border-market-stone/30">
        <div className="container-market py-3 space-y-3">
          {/* Search + Sort row */}
          <div className="flex gap-3">
            {/* Search input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products or vendors..."
                className="w-full pl-9 pr-9 py-2 text-sm rounded-lg border border-market-stone/40 bg-white focus:outline-none focus:ring-2 focus:ring-market-sage/40 focus:border-market-sage transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-market-soil transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="shrink-0 px-3 py-2 text-sm rounded-lg border border-market-stone/40 bg-white focus:outline-none focus:ring-2 focus:ring-market-sage/40 focus:border-market-sage transition-colors"
            >
              <option value="vendor">By Vendor</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="price-asc">Price: Low-High</option>
              <option value="price-desc">Price: High-Low</option>
            </select>
          </div>

          {/* Category tabs */}
          <nav
            className="flex items-center gap-1 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide"
            aria-label="Filter by category"
          >
            {categories.map((cat) => {
              const count = categoryCounts[cat.value] || 0
              return (
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
                  <span className="ml-1 opacity-75">({count})</span>
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Product grid */}
      <section className="container-market py-8">
        {/* Result count */}
        {products.length > 0 && (
          <p className="text-sm text-muted-foreground mb-4">
            Showing {filteredProducts.length} of {products.length} products
          </p>
        )}

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
        ) : isSearchActive ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">
              No products match &ldquo;{searchQuery}&rdquo;
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-3 text-sm font-medium text-market-sage hover:text-market-sage-dk transition-colors"
            >
              Clear search
            </button>
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

      {/* Floating "View My Bag" bar (mobile only, when items > 0) */}
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
