import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { categoryLabel, categoryColor, vendorTypeLabel, vendorTypeColor, cn } from '@/lib/utils'
import { Plus, Pencil, ExternalLink, AlertCircle } from 'lucide-react'
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

export default async function AdminVendorsPage() {
  const vendors = await prisma.vendor.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vendors</h1>
          <p className="text-sm text-muted-foreground">
            Manage your market vendors and their profiles.
          </p>
        </div>
        <Button render={<Link href="/admin/vendors/new" />}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Vendor
        </Button>
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
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      render={
                        <Link href={`/admin/vendors/${vendor.id}/edit`} />
                      }
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      <span className="sr-only">Edit {vendor.name}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      render={<Link href={`/vendors/${vendor.slug}`} />}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span className="sr-only">View {vendor.name}</span>
                    </Button>
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
