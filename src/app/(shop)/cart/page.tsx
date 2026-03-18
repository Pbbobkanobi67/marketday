import { prisma } from '@/lib/prisma'
import CartPageClient from './CartPageClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Your Bag | MarketDay',
  description: 'Review your market bag and choose a pickup date.',
}

export default async function CartPage() {
  const markets = await prisma.market.findMany({
    where: { status: 'UPCOMING' },
    orderBy: { date: 'asc' },
  })

  return <CartPageClient markets={JSON.parse(JSON.stringify(markets))} />
}
