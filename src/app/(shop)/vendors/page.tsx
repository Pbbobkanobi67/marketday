import { prisma } from '@/lib/prisma'
import VendorCard from '@/components/shop/VendorCard'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Vendors | Backroads Certified Farmers Market',
  description: 'Meet the makers behind the market. Browse local vendors and their farm-fresh products.',
}

export default async function VendorsPage() {
  const vendors = await prisma.vendor.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  })

  return (
    <section className="container-market py-10">
      <h1 className="font-display text-3xl font-bold text-market-soil mb-8">
        The Makers Behind the Market
      </h1>

      {vendors.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground">
            No vendors available at this time. Check back soon!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {vendors.map((vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} />
          ))}
        </div>
      )}
    </section>
  )
}
