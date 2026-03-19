import { prisma } from '@/lib/prisma'
import CheckoutClient from './CheckoutClient'
import type { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Checkout | Backroads Market',
  description: 'Complete your order and choose your pickup details.',
}

export default async function CheckoutPage() {
  const markets = await prisma.market.findMany({
    where: { status: 'UPCOMING' },
    orderBy: { date: 'asc' },
  })

  return (
    <Suspense fallback={<div className="container-market py-12">Loading checkout...</div>}>
      <CheckoutClient markets={JSON.parse(JSON.stringify(markets))} />
    </Suspense>
  )
}
