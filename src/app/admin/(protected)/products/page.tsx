import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatPrice, categoryLabel, categoryColor, cn } from '@/lib/utils'
import { Plus, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { vendor: { select: { name: true } } },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground">
            Manage products available at the market.
          </p>
        </div>
        <Button render={<Link href="/admin/products/new" />}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Product
        </Button>
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
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    render={
                      <Link href={`/admin/products/${product.id}/edit`} />
                    }
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span className="sr-only">Edit {product.name}</span>
                  </Button>
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
