import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
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
import { cn } from '@/lib/utils'
import { VendorProductDeleteButton } from './VendorProductDeleteButton'

export default async function VendorProductsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.vendorId) redirect('/vendor/login')

  const vendor = await prisma.vendor.findUnique({
    where: { id: session.user.vendorId },
    select: { onlineOrdersEnabled: true },
  })

  if (!vendor?.onlineOrdersEnabled) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
        </div>
        <Separator />
        <div className="card-market p-8 text-center">
          <p className="text-muted-foreground">
            Online ordering is not currently enabled for your vendor account.
            Contact a market admin to enable it.
          </p>
        </div>
      </div>
    )
  }

  const products = await prisma.product.findMany({
    where: { vendorId: session.user.vendorId },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground">
            Manage your product listings.
          </p>
        </div>
        <Button render={<Link href="/vendor/products/new" />}>
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
            render={<Link href="/vendor/products/new" />}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add Product
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className="font-mono">
                  {formatPrice(product.price)}
                </TableCell>
                <TableCell>{product.unit}</TableCell>
                <TableCell className="text-center">
                  <span className="inline-flex items-center gap-1.5 text-xs">
                    <span
                      className={cn(
                        'inline-block h-2 w-2 rounded-full',
                        product.isAvailable ? 'bg-green-500' : 'bg-gray-400'
                      )}
                    />
                    {product.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      render={
                        <Link href={`/vendor/products/${product.id}/edit`} />
                      }
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      <span className="sr-only">Edit {product.name}</span>
                    </Button>
                    <VendorProductDeleteButton
                      productId={product.id}
                      productName={product.name}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
