import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@/generated/prisma/client'
import { categoryLabel, categoryColor, vendorTypeLabel, vendorTypeColor, cn } from '@/lib/utils'
import { Plus, AlertCircle, History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import SearchBar from '@/components/admin/SearchBar'
import FilterPills from '@/components/admin/FilterPills'
import { MARKET_CONFIG } from '@/config/market.config'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import VendorRowActions from '@/components/admin/VendorRowActions'

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vendors</h1>
          <p className="text-sm text-muted-foreground">
            {vendors.length} vendor{vendors.length !== 1 ? 's' : ''}{q || categoryFilter || typeFilter || statusFilter ? ' matching filters' : ' total'}
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
      <div className="space-y-3">
        <SearchBar placeholder="Search vendors by name..." />
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Category:</span>
            <FilterPills
              paramName="category"
              options={MARKET_CONFIG.categories.map((c) => ({ value: c.value, label: c.label }))}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Type:</span>
            <FilterPills
              paramName="type"
              options={MARKET_CONFIG.vendorTypes.map((v) => ({ value: v.value, label: v.label }))}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Status:</span>
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

      <Separator />

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
        <div className="overflow-x-auto -mx-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Vendor Type</TableHead>
              <TableHead className="text-center">Products</TableHead>
              <TableHead className="text-center">Online</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendors.map((vendor) => (
              <TableRow key={vendor.id}>
                <TableCell className="font-medium">
                  <span className="flex items-center gap-1.5">
                    {vendor.name}
                    {vendor.needsReview && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                        <AlertCircle className="h-3 w-3" />
                        Review
                      </span>
                    )}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                      categoryColor(vendor.category)
                    )}
                  >
                    {categoryLabel(vendor.category)}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                      vendorTypeColor(vendor.vendorType)
                    )}
                  >
                    {vendorTypeLabel(vendor.vendorType)}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  {vendor._count.products}
                </TableCell>
                <TableCell className="text-center">
                  <span className="inline-flex items-center gap-1.5 text-xs">
                    <span
                      className={cn(
                        'inline-block h-2 w-2 rounded-full',
                        vendor.onlineOrdersEnabled ? 'bg-blue-500' : 'bg-gray-400'
                      )}
                    />
                    {vendor.onlineOrdersEnabled ? 'Yes' : 'No'}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="inline-flex items-center gap-1.5 text-xs">
                    <span
                      className={cn(
                        'inline-block h-2 w-2 rounded-full',
                        vendor.isActive ? 'bg-green-500' : 'bg-gray-400'
                      )}
                    />
                    {vendor.isActive ? 'Active' : 'Inactive'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <VendorRowActions
                    vendorId={vendor.id}
                    vendorName={vendor.name}
                    vendorSlug={vendor.slug}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      )}
    </div>
  )
}
