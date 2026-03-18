import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import MarketShopClient from './MarketShopClient'

export default async function MarketPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const market = await prisma.market.findUnique({ where: { id } })
  if (!market) notFound()

  const products = await prisma.product.findMany({
    where: { isAvailable: true },
    include: { vendor: { select: { name: true, slug: true, isActive: true } } },
    orderBy: [{ vendor: { name: 'asc' } }, { name: 'asc' }],
  })

  // Serialize dates so they can cross the server/client boundary
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
    <MarketShopClient market={serializedMarket} products={serializedProducts} />
  )
}
