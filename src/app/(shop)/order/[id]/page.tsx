import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, ArrowLeft } from 'lucide-react'
import { formatPrice, formatMarketDateTime, categoryLabel } from '@/lib/utils'
import type { Metadata } from 'next'

type Props = {
  params: { id: string }
  searchParams: { session_id?: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    select: { orderNumber: true },
  })
  return {
    title: order ? `Order ${order.orderNumber} | Backroads Market` : 'Order Not Found | Backroads Market',
  }
}

export default async function OrderConfirmationPage({ params, searchParams }: Props) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true, market: true },
  })

  if (!order) notFound()

  // If returning from Stripe and payment is still pending, mark as paid
  if (searchParams.session_id && order.paymentStatus === 'PENDING') {
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: 'PAID' },
    })
    order.paymentStatus = 'PAID'
  }

  const firstName = order.customerName.split(/\s+/)[0]

  // Group items by vendor
  const groupedByVendor = order.items.reduce<Record<string, typeof order.items>>((groups, item) => {
    const key = item.vendorName || 'Other'
    if (!groups[key]) groups[key] = []
    groups[key].push(item)
    return groups
  }, {})
  const vendorNames = Object.keys(groupedByVendor).sort()

  // Find next upcoming market for the "back to market" link
  const nextMarket = await prisma.market.findFirst({
    where: { status: 'UPCOMING' },
    orderBy: { date: 'asc' },
  })

  return (
    <section className="container-market py-10">
      <div className="max-w-2xl mx-auto">
        {/* Success header */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-5">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>

          <h1 className="font-display text-3xl font-bold text-market-soil mb-3">
            You&apos;re all set, {firstName}!
          </h1>

          {/* Order number */}
          <div className="inline-block bg-market-warm rounded-lg px-6 py-3 mb-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Order Number
            </p>
            <p className="font-mono text-2xl font-bold text-market-soil">
              {order.orderNumber}
            </p>
          </div>

          <p className="text-sm text-muted-foreground">
            A confirmation email has been sent to{' '}
            <span className="font-medium text-market-soil">{order.customerEmail}</span>
          </p>
        </div>

        {/* Market pickup details */}
        <div className="card-market p-5 mb-6">
          <h2 className="font-display text-lg font-semibold text-market-soil mb-3">
            Market Pickup
          </h2>
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-market-soil">
              {formatMarketDateTime(order.market.date, order.market.openTime, order.market.closeTime)}
            </p>
            <p className="text-sm text-muted-foreground">
              {order.market.location}
            </p>
            <p className="text-sm text-muted-foreground">
              {order.market.address}
            </p>
          </div>
        </div>

        {/* AT_MARKET callout */}
        {order.paymentMethod === 'AT_MARKET' && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 mb-6">
            <p className="text-sm font-medium text-amber-800">
              Remember to bring this order number
            </p>
            <p className="text-xs text-amber-700 mt-1">
              Show your order number ({order.orderNumber}) when you arrive at the market stand to pick up and pay for your items.
            </p>
          </div>
        )}

        {/* Items grouped by vendor */}
        <div className="card-market p-5 mb-6">
          <h2 className="font-display text-lg font-semibold text-market-soil mb-4">
            Order Items
          </h2>
          <div className="space-y-5">
            {vendorNames.map((vendorName) => (
              <div key={vendorName}>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  {vendorName}
                </p>
                <div className="space-y-2">
                  {groupedByVendor[vendorName].map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-1.5">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-market-soil">
                          {item.productName}
                          <span className="text-muted-foreground ml-1">x{item.quantity}</span>
                        </p>
                      </div>
                      <span className="text-sm font-medium text-market-soil shrink-0 ml-4">
                        {formatPrice(item.priceAtTime * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Subtotal + payment method */}
          <div className="mt-4 pt-4 border-t border-market-stone/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-market-soil">Subtotal</span>
              <span className="price text-lg">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Payment</span>
              <span className="text-xs text-muted-foreground">
                {order.paymentMethod === 'STRIPE' ? 'Paid online' : 'Pay at market'}
              </span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href={nextMarket ? `/market/${nextMarket.id}` : '/'}
            className="inline-flex items-center gap-2 text-sm font-medium text-market-sage hover:text-market-sage-dk transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to the Market
          </Link>
        </div>
      </div>
    </section>
  )
}
