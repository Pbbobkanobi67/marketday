import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import MarketShopClient from './MarketShopClient'

export default async function MarketPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ category?: string }>
}) {
  const { id } = await params
  const { category } = await searchParams

  const market = await prisma.market.findUnique({
    where: { id },
    include: {
      vendors: { select: { vendorId: true } },
    },
  })
  if (!market) notFound()

  // Get vendor IDs assigned to this market that have online ordering enabled
  const assignedVendorIds = market.vendors.map((mv) => mv.vendorId)

  const products = assignedVendorIds.length > 0
    ? await prisma.product.findMany({
        where: {
          isAvailable: true,
          vendorId: { in: assignedVendorIds },
          vendor: { isActive: true, onlineOrdersEnabled: true },
        },
        include: { vendor: { select: { name: true, slug: true, isActive: true } } },
        orderBy: [{ vendor: { name: 'asc' } }, { name: 'asc' }],
      })
    : []

  const serializedMarket = {
    id: market.id,
    name: market.name,
    date: market.date.toISOString(),
    openTime: market.openTime,
    closeTime: market.closeTime,
    location: market.location,
    address: market.address,
    description: market.description,
    status: market.status,
    type: market.type,
  }

  const serializedProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: p.price,
    imageUrl: p.imageUrl,
    unit: p.unit,
    category: p.category,
    isAvailable: p.isAvailable,
    vendorId: p.vendorId,
    vendor: {
      name: p.vendor.name,
      slug: p.vendor.slug,
      isActive: p.vendor.isActive,
    },
  }))

  return (
    <MarketShopClient market={serializedMarket} products={serializedProducts} initialCategory={category} />
  )
}
