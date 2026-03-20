import { prisma } from '@/lib/prisma'
import { Prisma } from '@/generated/prisma/client'
import { formatPrice, formatMarketDateShort } from '@/lib/utils'
import Link from 'next/link'
import OrderStatusBadge from '@/components/admin/OrderStatusBadge'
import SearchBar from '@/components/admin/SearchBar'
import FilterPills from '@/components/admin/FilterPills'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ShoppingCart, ExternalLink } from 'lucide-react'

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; pickup?: string; payment?: string }>
}) {
  const params = await searchParams
  const q = params.q || ''
  const pickupFilter = params.pickup || ''
  const paymentFilter = params.payment || ''

  const where: Prisma.OrderWhereInput = {}
  if (q) {
    where.OR = [
      { orderNumber: { contains: q, mode: 'insensitive' } },
      { customerName: { contains: q, mode: 'insensitive' } },
      { customerEmail: { contains: q, mode: 'insensitive' } },
    ]
  }
  if (pickupFilter) {
    where.pickupStatus = pickupFilter
  }
  if (paymentFilter) {
    where.paymentMethod = paymentFilter
  }

  const orders = await prisma.order.findMany({
    where,
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
            {orders.length} order{orders.length !== 1 ? 's' : ''}{q || pickupFilter || paymentFilter ? ' matching filters' : ' total'}
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        <SearchBar placeholder="Search orders by #, name, or email..." />
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Pickup:</span>
            <FilterPills
              paramName="pickup"
              options={[
                { value: 'PENDING', label: 'Pending' },
                { value: 'READY', label: 'Ready' },
                { value: 'PICKED_UP', label: 'Picked Up' },
                { value: 'CANCELLED', label: 'Cancelled' },
              ]}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Payment:</span>
            <FilterPills
              paramName="payment"
              options={[
                { value: 'STRIPE', label: 'Card' },
                { value: 'PAY_AT_MARKET', label: 'At Market' },
              ]}
            />
          </div>
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
