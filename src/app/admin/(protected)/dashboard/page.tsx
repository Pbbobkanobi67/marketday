import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { formatPrice, formatMarketDate, formatMarketDateTime } from '@/lib/utils'
import Link from 'next/link'
import StatCard from '@/components/admin/StatCard'
import OrderStatusBadge from '@/components/admin/OrderStatusBadge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ShoppingCart,
  DollarSign,
  Store,
  Package,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  AlertCircle,
} from 'lucide-react'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)
  const userName = session?.user?.name?.split(' ')[0] || 'there'

  const now = new Date()

  const nextMarket = await prisma.market.findFirst({
    where: { status: 'UPCOMING', date: { gte: now } },
    orderBy: { date: 'asc' },
  })

  const [totalOrders, paidRevenue, vendorCount, productCount, reviewCount] =
    await Promise.all([
      prisma.order.count({
        where: nextMarket ? { marketId: nextMarket.id } : {},
      }),
      prisma.order.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { subtotal: true },
      }),
      prisma.vendor.count({ where: { isActive: true } }),
      prisma.product.count({ where: { isAvailable: true } }),
      prisma.vendor.count({ where: { needsReview: true } }),
    ])

  const recentOrders = await prisma.order.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      market: { select: { name: true, date: true } },
      _count: { select: { items: true } },
    },
  })

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="font-display text-2xl font-bold text-market-soil">
          {getGreeting()}, {userName}.
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Here is what is happening with your market.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Upcoming Orders"
          value={totalOrders}
          subtitle={nextMarket ? `For ${formatMarketDate(nextMarket.date)}` : 'All orders'}
          icon={<ShoppingCart className="size-5" />}
        />
        <StatCard
          title="Total Revenue"
          value={formatPrice(paidRevenue._sum.subtotal || 0)}
          subtitle="Paid orders"
          icon={<DollarSign className="size-5" />}
        />
        <StatCard
          title="Active Vendors"
          value={vendorCount}
          subtitle="Currently listed"
          icon={<Store className="size-5" />}
        />
        <StatCard
          title="Available Products"
          value={productCount}
          subtitle="In stock"
          icon={<Package className="size-5" />}
        />
        {reviewCount > 0 && (
          <StatCard
            title="Needs Review"
            value={reviewCount}
            subtitle="Vendor profile edits"
            icon={<AlertCircle className="size-5" />}
          />
        )}
      </div>

      {/* Next Market card */}
      {nextMarket && (
        <div className="card-market p-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h2 className="font-display text-lg font-semibold text-market-soil">
                Next Market
              </h2>
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="size-4 text-market-sage" />
                  {formatMarketDate(nextMarket.date)}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="size-4 text-market-sage" />
                  {nextMarket.openTime} - {nextMarket.closeTime}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="size-4 text-market-sage" />
                  {nextMarket.location}
                </div>
              </div>
            </div>
            <Link
              href="/admin/orders"
              className="btn-primary flex items-center gap-2 text-sm"
            >
              View Orders
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Recent orders */}
      <div className="card-market">
        <div className="px-6 py-4 border-b border-market-stone/40">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-market-soil">
              Recent Orders
            </h2>
            <Link
              href="/admin/orders"
              className="text-sm text-market-sage hover:text-market-sage-dk font-medium transition-colors"
            >
              View all
            </Link>
          </div>
        </div>

        {recentOrders.length === 0 ? (
          <div className="px-6 py-12 text-center text-muted-foreground text-sm">
            No orders yet. Orders will appear here once customers start placing
            them.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Market</TableHead>
                <TableHead className="text-center">Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Pickup</TableHead>
                <TableHead className="text-right">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-mono text-sm text-market-sage hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                  </TableCell>
                  <TableCell className="font-medium">
                    {order.customerName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {order.market.name}
                  </TableCell>
                  <TableCell className="text-center">
                    {order._count.items}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatPrice(order.subtotal)}
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
                  <TableCell className="text-right text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
