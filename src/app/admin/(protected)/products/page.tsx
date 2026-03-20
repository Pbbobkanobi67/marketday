import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@/generated/prisma/client'
import { formatPrice, categoryLabel, categoryColor, cn } from '@/lib/utils'
import { Plus } from 'lucide-react'
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
import ProductRowActions from '@/components/admin/ProductRowActions'

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; available?: string; vendor?: string }>
}) {
  const params = await searchParams
  const q = params.q || ''
  const categoryFilter = params.category || ''
  const availableFilter = params.available || ''
  const vendorFilter = params.vendor || ''

  const where: Prisma.ProductWhereInput = {}
  if (q) {
    where.name = { contains: q, mode: 'insensitive' }
  }
  if (categoryFilter) {
    where.category = categoryFilter
  }
  if (availableFilter === 'yes') {
    where.isAvailable = true
  } else if (availableFilter === 'no') {
    where.isAvailable = false
  }
  if (vendorFilter) {
    where.vendorId = vendorFilter
  }

  // Get vendors for filter dropdown
  const [products, vendors] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { vendor: { select: { id: true, name: true } } },
      orderBy: { name: 'asc' },
    }),
    prisma.vendor.findMany({
      where: { products: { some: {} } },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground">
            {products.length} product{products.length !== 1 ? 's' : ''}{q || categoryFilter || availableFilter || vendorFilter ? ' matching filters' : ' total'}
          </p>
        </div>
        <Button render={<Link href="/admin/products/new" />}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        <SearchBar placeholder="Search products by name..." />
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Vendor:</span>
            <FilterPills
              paramName="vendor"
              options={vendors.map((v) => ({ value: v.id, label: v.name }))}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Category:</span>
            <FilterPills
              paramName="category"
              options={MARKET_CONFIG.categories.map((c) => ({ value: c.value, label: c.label }))}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Available:</span>
            <FilterPills
              paramName="available"
              options={[
                { value: 'yes', label: 'Available' },
                { value: 'no', label: 'Unavailable' },
              ]}
            />
          </div>
        </div>
      </div>

      <Separator />

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
        <div className="overflow-x-auto -mx-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-center">Available</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {product.vendor.name}
                </TableCell>
                <TableCell>{formatPrice(product.price)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {product.unit}
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                      categoryColor(product.category)
                    )}
                  >
                    {categoryLabel(product.category)}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="inline-flex items-center gap-1.5 text-xs">
                    <span
                      className={cn(
                        'inline-block h-2 w-2 rounded-full',
                        product.isAvailable ? 'bg-green-500' : 'bg-gray-400'
                      )}
                    />
                    {product.isAvailable ? 'Yes' : 'No'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <ProductRowActions
                    productId={product.id}
                    productName={product.name}
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
