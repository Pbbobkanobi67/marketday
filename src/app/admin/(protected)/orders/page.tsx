import { prisma } from '@/lib/prisma'
import { formatPrice, formatMarketDateShort } from '@/lib/utils'
import Link from 'next/link'
import OrderStatusBadge from '@/components/admin/OrderStatusBadge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ShoppingCart, ExternalLink } from 'lucide-react'

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      market: { select: { name: true, date: true } },
      _count: { select: { items: true } },
    },
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-market-soil">
            Orders
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {orders.length} total order{orders.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Orders table */}
      <div className="card-market">
        {orders.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <ShoppingCart className="size-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No orders have been placed yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-1">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Market Date</TableHead>
                <TableHead className="text-center">Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Pickup</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-mono text-sm text-market-sage hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.customerName}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.customerEmail}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatMarketDateShort(order.market.date)}
                  </TableCell>
                  <TableCell className="text-center">
                    {order._count.items}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatPrice(order.subtotal)}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {order.paymentMethod === 'STRIPE'
                        ? 'Card'
                        : order.paymentMethod === 'PAY_AT_MARKET'
                          ? 'At Market'
                          : order.paymentMethod}
                    </span>
                  </TableCell>
                  <TableCell>
                    <OrderStatusBadge
                      status={order.paymentStatus}
                      type="payment"
                    />
                  </TableCell>
                  <TableCell>
                    <OrderStatusBadge
                      status={order.pickupStatus}
                      type="pickup"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="inline-flex items-center gap-1 text-sm text-market-sage hover:text-market-sage-dk font-medium transition-colors"
                    >
                      View
                      <ExternalLink className="size-3" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        )}
      </div>
    </div>
  )
}
