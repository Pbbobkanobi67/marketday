import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@/generated/prisma/client'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import SearchBar from '@/components/admin/SearchBar'
import FilterPills from '@/components/admin/FilterPills'
import { MARKET_CONFIG } from '@/config/market.config'
import CollapsibleVendorProducts from '@/components/admin/CollapsibleVendorProducts'

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; status?: string; vendor?: string }>
}) {
  const params = await searchParams
  const q = params.q || ''
  const categoryFilter = params.category || ''
  const statusFilter = params.status || ''
  const vendorFilter = params.vendor || ''

  const where: Prisma.ProductWhereInput = {}
  if (q) {
    where.name = { contains: q, mode: 'insensitive' }
  }
  if (categoryFilter) {
    where.category = categoryFilter
  }
  if (statusFilter === 'available') {
    where.isAvailable = true
  } else if (statusFilter === 'unavailable') {
    where.isAvailable = false
    where.isComingSoon = false
  } else if (statusFilter === 'coming_soon') {
    where.isComingSoon = true
  }
  if (vendorFilter) {
    where.vendorId = vendorFilter
  }

  // Get vendors for filter dropdown
  const [products, vendors] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { vendor: { select: { id: true, name: true } } },
      orderBy: [{ vendor: { name: 'asc' } }, { name: 'asc' }],
    }),
    prisma.vendor.findMany({
      where: { products: { some: {} } },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ])

  // Group products by vendor
  const vendorGroupMap = new Map<string, { vendorId: string; vendorName: string; products: typeof products }>()
  for (const product of products) {
    const existing = vendorGroupMap.get(product.vendor.id)
    if (existing) {
      existing.products.push(product)
    } else {
      vendorGroupMap.set(product.vendor.id, {
        vendorId: product.vendor.id,
        vendorName: product.vendor.name,
        products: [product],
      })
    }
  }
  const vendorGroups = Array.from(vendorGroupMap.values()).map((g) => ({
    vendorId: g.vendorId,
    vendorName: g.vendorName,
    products: g.products.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      unit: p.unit,
      category: p.category,
      isAvailable: p.isAvailable,
      isComingSoon: p.isComingSoon,
    })),
  }))

  const hasFilters = q || categoryFilter || statusFilter || vendorFilter

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground">
            {products.length} product{products.length !== 1 ? 's' : ''}{hasFilters ? ' matching filters' : ' total'}
          </p>
        </div>
        <Button render={<Link href="/admin/products/new" />}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="space-y-4">
        <SearchBar placeholder="Search products by name..." />

        <div className="rounded-lg border bg-muted/30 divide-y divide-border">
          <div className="flex items-center gap-3 px-4 py-2.5">
            <span className="text-sm font-semibold text-foreground w-20 shrink-0">Vendor</span>
            <FilterPills
              paramName="vendor"
              options={vendors.map((v) => ({ value: v.id, label: v.name }))}
            />
          </div>
          <div className="flex items-center gap-3 px-4 py-2.5">
            <span className="text-sm font-semibold text-foreground w-20 shrink-0">Category</span>
            <FilterPills
              paramName="category"
              options={MARKET_CONFIG.categories.map((c) => ({ value: c.value, label: c.label }))}
            />
          </div>
          <div className="flex items-center gap-3 px-4 py-2.5">
            <span className="text-sm font-semibold text-foreground w-20 shrink-0">Status</span>
            <FilterPills
              paramName="status"
              options={[
                { value: 'available', label: 'Available' },
                { value: 'unavailable', label: 'Not Available' },
                { value: 'coming_soon', label: 'Coming Soon' },
              ]}
            />
          </div>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No products yet. Add your first product to get started.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            render={<Link href="/admin/products/new" />}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add Product
          </Button>
        </div>
      ) : (
        <CollapsibleVendorProducts groups={vendorGroups} />
      )}
    </div>
  )
}
