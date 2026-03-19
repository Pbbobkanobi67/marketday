import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { MarketEditForm } from './MarketEditForm'

export default async function EditMarketPage({
  params,
}: {
  params: { id: string }
}) {
  const market = await prisma.market.findUnique({
    where: { id: params.id },
  })

  if (!market) {
    notFound()
  }

  return (
    <MarketEditForm
      market={{
        id: market.id,
        name: market.name,
        date: market.date.toISOString().split('T')[0],
        openTime: market.openTime,
        closeTime: market.closeTime,
        location: market.location,
        address: market.address,
        description: market.description || '',
        type: market.type,
        status: market.status,
      }}
    />
  )
}
