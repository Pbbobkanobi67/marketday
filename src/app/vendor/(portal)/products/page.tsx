import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Separator } from '@/components/ui/separator'
import { VendorProductsClient } from './VendorProductsClient'

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

  // Serialize dates for client component
  const serialized = products.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }))

  return <VendorProductsClient products={serialized} />
}
