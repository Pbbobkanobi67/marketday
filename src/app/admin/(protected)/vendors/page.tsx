import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@/generated/prisma/client'
import { Plus, History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import SearchBar from '@/components/admin/SearchBar'
import FilterPills from '@/components/admin/FilterPills'
import { MARKET_CONFIG } from '@/config/market.config'
import VendorTable from '@/components/admin/VendorTable'

export default async function AdminVendorsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; type?: string; status?: string }>
}) {
  const params = await searchParams
  const q = params.q || ''
  const categoryFilter = params.category || ''
  const typeFilter = params.type || ''
  const statusFilter = params.status || ''

  const where: Prisma.VendorWhereInput = {}
  if (q) {
    where.name = { contains: q, mode: 'insensitive' }
  }
  if (categoryFilter) {
    where.category = categoryFilter
  }
  if (typeFilter) {
    where.vendorType = typeFilter
  }
  if (statusFilter === 'active') {
    where.isActive = true
  } else if (statusFilter === 'inactive') {
    where.isActive = false
  }

  const vendors = await prisma.vendor.findMany({
    where,
    include: { _count: { select: { products: true } } },
    orderBy: { name: 'asc' },
  })

  const vendorData = vendors.map((v) => ({
    id: v.id,
    name: v.name,
    slug: v.slug,
    category: v.category,
    vendorType: v.vendorType,
    productCount: v._count.products,
    onlineOrdersEnabled: v.onlineOrdersEnabled,
    isActive: v.isActive,
    needsReview: v.needsReview,
  }))

  const hasFilters = q || categoryFilter || typeFilter || statusFilter

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vendors</h1>
          <p className="text-sm text-muted-foreground">
            {vendors.length} vendor{vendors.length !== 1 ? 's' : ''}{hasFilters ? ' matching filters' : ' total'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" render={<Link href="/admin/vendors/changelog" />}>
            <History className="mr-1.5 h-4 w-4" />
            Changelog
          </Button>
          <Button render={<Link href="/admin/vendors/new" />}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add Vendor
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="space-y-4">
        <SearchBar placeholder="Search vendors by name..." />

        <div className="rounded-lg border bg-muted/30 divide-y divide-border">
          <div className="flex items-center gap-3 px-4 py-2.5">
            <span className="text-sm font-semibold text-foreground w-20 shrink-0">Category</span>
            <FilterPills
              paramName="category"
              options={MARKET_CONFIG.categories.map((c) => ({ value: c.value, label: c.label }))}
            />
          </div>
          <div className="flex items-center gap-3 px-4 py-2.5">
            <span className="text-sm font-semibold text-foreground w-20 shrink-0">Type</span>
            <FilterPills
              paramName="type"
              options={MARKET_CONFIG.vendorTypes.map((v) => ({ value: v.value, label: v.label }))}
            />
          </div>
          <div className="flex items-center gap-3 px-4 py-2.5">
            <span className="text-sm font-semibold text-foreground w-20 shrink-0">Status</span>
            <FilterPills
              paramName="status"
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
            />
          </div>
        </div>
      </div>

      {vendors.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No vendors yet. Add your first vendor to get started.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            render={<Link href="/admin/vendors/new" />}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add Vendor
          </Button>
        </div>
      ) : (
        <VendorTable vendors={vendorData} />
      )}
    </div>
  )
}
