import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { formatPrice, formatMarketDate } from '@/lib/utils'
import Link from 'next/link'
import OrderStatusBadge from '@/components/admin/OrderStatusBadge'
import OrderStatusUpdater from '@/components/admin/OrderStatusUpdater'
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  StickyNote,
  Calendar,
  Clock,
  MapPin,
} from 'lucide-react'

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { vendor: true } },
      market: true,
    },
  })

  if (!order) notFound()

  // Group items by vendor
  const itemsByVendor = order.items.reduce<
    Record<string, { vendorName: string; items: typeof order.items }>
  >((acc, item) => {
    const vendorId = item.vendorId
    const vendorName = item.vendor?.name || item.vendorName || 'Unknown Vendor'

    if (!acc[vendorId]) {
      acc[vendorId] = { vendorName, items: [] }
    }
    acc[vendorId].items.push(item)
    return acc
  }, {})

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back link */}
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-market-soil transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Orders
      </Link>

      {/* Order header */}
      <div className="card-market p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-market-soil">
              Order {order.orderNumber}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Placed{' '}
              {new Date(order.createdAt).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <OrderStatusBadge status={order.paymentStatus} type="payment" />
            <OrderStatusBadge status={order.pickupStatus} type="pickup" />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Customer information */}
        <div className="card-market p-6 space-y-4">
          <h2 className="font-display text-lg font-semibold text-market-soil">
            Customer Details
          </h2>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="size-4 text-market-sage shrink-0" />
              <span className="text-sm">{order.customerName}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="size-4 text-market-sage shrink-0" />
              <a
                href={`mailto:${order.customerEmail}`}
                className="text-sm text-market-sage hover:underline"
              >
                {order.customerEmail}
              </a>
            </div>
            {order.customerPhone && (
              <div className="flex items-center gap-3">
                <Phone className="size-4 text-market-sage shrink-0" />
                <a
                  href={`tel:${order.customerPhone}`}
                  className="text-sm text-market-sage hover:underline"
                >
                  {order.customerPhone}
                </a>
              </div>
            )}
            {order.customerNotes && (
              <div className="flex items-start gap-3">
                <StickyNote className="size-4 text-market-sage shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  {order.customerNotes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Market / pickup info */}
        <div className="card-market p-6 space-y-4">
          <h2 className="font-display text-lg font-semibold text-market-soil">
            Pickup Details
          </h2>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="size-4 text-market-sage shrink-0" />
              <span className="text-sm">
                {formatMarketDate(order.market.date)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="size-4 text-market-sage shrink-0" />
              <span className="text-sm">
                {order.market.openTime} - {order.market.closeTime}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="size-4 text-market-sage shrink-0" />
              <span className="text-sm">{order.market.location}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-market-stone/30">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Payment method</span>
              <span className="font-medium">
                {order.paymentMethod === 'STRIPE'
                  ? 'Card (Stripe)'
                  : order.paymentMethod === 'PAY_AT_MARKET'
                    ? 'Pay at Market'
                    : order.paymentMethod}
              </span>
            </div>
            {order.updatedAt.getTime() !== order.createdAt.getTime() && (
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-muted-foreground">Last updated</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(order.updatedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order items grouped by vendor */}
      <div className="card-market p-6 space-y-6">
        <h2 className="font-display text-lg font-semibold text-market-soil">
          Order Items
        </h2>

        {Object.entries(itemsByVendor).map(([vendorId, { vendorName, items }]) => (
          <div key={vendorId} className="space-y-3">
            <h3 className="text-sm font-semibold text-market-bark uppercase tracking-wide">
              {vendorName}
            </h3>
            <div className="divide-y divide-market-stone/20">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <p className="text-sm font-medium">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      Qty: {item.quantity} x {formatPrice(item.priceAtTime)}
                    </p>
                  </div>
                  <p className="font-mono text-sm font-medium">
                    {formatPrice(item.quantity * item.priceAtTime)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Total */}
        <div className="pt-4 border-t border-market-stone/40 flex items-center justify-between">
          <span className="font-semibold text-market-soil">Order Total</span>
          <span className="font-display text-xl font-bold text-market-sage">
            {formatPrice(order.subtotal)}
          </span>
        </div>
      </div>

      {/* Status updater */}
      <div className="card-market p-6">
        <OrderStatusUpdater
          orderId={order.id}
          currentPickupStatus={order.pickupStatus}
        />
      </div>
    </div>
  )
}
