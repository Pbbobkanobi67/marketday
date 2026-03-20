import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { formatPrice, formatMarketDate, vendorTypeLabel, vendorTypeColor } from '@/lib/utils'
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
  TrendingUp,
  ClipboardList,
  AlertCircle,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  Plus,
  Users,
  Check,
  X,
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

  // Start of this week (Monday) and last week
  const dayOfWeek = now.getDay()
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const startOfThisWeek = new Date(now)
  startOfThisWeek.setDate(now.getDate() - diffToMonday)
  startOfThisWeek.setHours(0, 0, 0, 0)
  const startOfLastWeek = new Date(startOfThisWeek)
  startOfLastWeek.setDate(startOfThisWeek.getDate() - 7)

  const nextMarket = await prisma.market.findFirst({
    where: { status: 'UPCOMING', date: { gte: now } },
    orderBy: { date: 'asc' },
  })

  const [
    totalOrders,
    paidRevenue,
    vendorCount,
    reviewCount,
    pendingAppsCount,
    avgOrderValue,
    thisWeekRevenue,
    lastWeekRevenue,
    scheduledVendors,
  ] = await Promise.all([
    prisma.order.count({
      where: nextMarket ? { marketId: nextMarket.id } : {},
    }),
    prisma.order.aggregate({
      where: { paymentStatus: 'PAID' },
      _sum: { subtotal: true },
    }),
    prisma.vendor.count({ where: { isActive: true } }),
    prisma.vendor.count({ where: { needsReview: true } }),
    prisma.vendorApplication.count({ where: { status: 'PENDING' } }),
    prisma.order.aggregate({
      _avg: { subtotal: true },
      _count: true,
    }),
    prisma.order.aggregate({
      where: { createdAt: { gte: startOfThisWeek }, paymentStatus: 'PAID' },
      _sum: { subtotal: true },
    }),
    prisma.order.aggregate({
      where: { createdAt: { gte: startOfLastWeek, lt: startOfThisWeek }, paymentStatus: 'PAID' },
      _sum: { subtotal: true },
    }),
    nextMarket
      ? prisma.marketVendor.findMany({
          where: { marketId: nextMarket.id },
          include: {
            vendor: {
              select: {
                id: true,
                name: true,
                vendorType: true,
                category: true,
                onlineOrdersEnabled: true,
              },
            },
          },
          orderBy: { vendor: { name: 'asc' } },
        })
      : [],
  ])

  const recentOrders = await prisma.order.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      market: { select: { name: true, date: true } },
      _count: { select: { items: true } },
    },
  })

  // Revenue trend calculation
  const thisWeek = thisWeekRevenue._sum.subtotal || 0
  const lastWeek = lastWeekRevenue._sum.subtotal || 0
  let revenueTrend: { direction: 'up' | 'down' | 'flat'; label: string } | undefined
  if (lastWeek > 0) {
    const pctChange = Math.round(((thisWeek - lastWeek) / lastWeek) * 100)
    revenueTrend = {
      direction: pctChange > 0 ? 'up' : pctChange < 0 ? 'down' : 'flat',
      label: `${Math.abs(pctChange)}% vs last week`,
    }
  } else if (thisWeek > 0) {
    revenueTrend = { direction: 'up', label: 'New revenue this week' }
  }

  // Days until next market
  const daysUntil = nextMarket
    ? Math.ceil((new Date(nextMarket.date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
          trend={revenueTrend}
        />
        <StatCard
          title="Active Vendors"
          value={vendorCount}
          subtitle="Currently listed"
          icon={<Store className="size-5" />}
        />
        <StatCard
          title="Avg. Order Value"
          value={avgOrderValue._count > 0 ? formatPrice(avgOrderValue._avg.subtotal || 0) : '$0.00'}
          subtitle={`${avgOrderValue._count} total orders`}
          icon={<TrendingUp className="size-5" />}
        />
        <StatCard
          title="Pending Applications"
          value={pendingAppsCount}
          subtitle={pendingAppsCount > 0 ? 'Review now' : 'None pending'}
          icon={<ClipboardList className="size-5" />}
        />
        {reviewCount > 0 ? (
          <StatCard
            title="Needs Review"
            value={reviewCount}
            subtitle="Vendor profile edits"
            icon={<AlertCircle className="size-5" />}
          />
        ) : (
          <StatCard
            title="Scheduled Vendors"
            value={scheduledVendors.length}
            subtitle={nextMarket ? `For next market` : 'No upcoming market'}
            icon={<Users className="size-5" />}
          />
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/markets/new"
          className="inline-flex items-center gap-1.5 rounded-md border border-market-stone/40 bg-white px-4 py-2 text-sm font-medium text-market-soil hover:bg-market-warm transition-colors"
        >
          <Plus className="size-4" /> New Market
        </Link>
        <Link
          href="/admin/vendors/new"
          className="inline-flex items-center gap-1.5 rounded-md border border-market-stone/40 bg-white px-4 py-2 text-sm font-medium text-market-soil hover:bg-market-warm transition-colors"
        >
          <Store className="size-4" /> Add Vendor
        </Link>
        <Link
          href="/admin/applications"
          className="inline-flex items-center gap-1.5 rounded-md border border-market-stone/40 bg-white px-4 py-2 text-sm font-medium text-market-soil hover:bg-market-warm transition-colors"
        >
          <ClipboardList className="size-4" /> Applications
          {pendingAppsCount > 0 && (
            <span className="inline-flex items-center justify-center rounded-full bg-amber-500 text-white text-[10px] font-bold h-5 min-w-[20px] px-1">
              {pendingAppsCount}
            </span>
          )}
        </Link>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 rounded-md border border-market-stone/40 bg-white px-4 py-2 text-sm font-medium text-market-soil hover:bg-market-warm transition-colors"
        >
          <ShoppingCart className="size-4" /> All Orders
        </Link>
      </div>

      {/* Next Market card with countdown */}
      {nextMarket && (
        <div className="card-market p-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-start gap-5">
              {/* Countdown */}
              {daysUntil !== null && (
                <div className="flex flex-col items-center justify-center shrink-0 w-16 h-16 rounded-xl bg-market-sage/10">
                  <span className="font-display text-3xl font-bold text-market-sage leading-none">
                    {daysUntil}
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-market-sage/70 mt-0.5">
                    {daysUntil === 1 ? 'day' : 'days'}
                  </span>
                </div>
              )}
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
            </div>
            <div className="flex gap-2">
              <Link
                href={`/admin/markets/${nextMarket.id}/vendors`}
                className="inline-flex items-center gap-2 text-sm rounded-md border border-market-stone/40 bg-white px-3 py-2 font-medium text-market-soil hover:bg-market-warm transition-colors"
              >
                <Users className="size-4" />
                Manage Vendors
              </Link>
              <Link
                href="/admin/orders"
                className="btn-primary flex items-center gap-2 text-sm"
              >
                View Orders
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Vendors Scheduled This Week */}
      {nextMarket && (
        <div className="card-market">
          <div className="px-6 py-4 border-b border-market-stone/40">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-market-soil">
                Vendors for {nextMarket.name}
                <span className="ml-2 inline-flex items-center justify-center rounded-full bg-market-sage/10 text-market-sage text-xs font-bold h-6 min-w-[24px] px-2">
                  {scheduledVendors.length}
                </span>
              </h2>
              <Link
                href={`/admin/markets/${nextMarket.id}/vendors`}
                className="text-sm text-market-sage hover:text-market-sage-dk font-medium transition-colors"
              >
                Manage
              </Link>
            </div>
          </div>

          {scheduledVendors.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Users className="size-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No vendors assigned yet.
              </p>
              <Link
                href={`/admin/markets/${nextMarket.id}/vendors`}
                className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-market-sage hover:text-market-sage-dk transition-colors"
              >
                <Plus className="size-4" /> Assign Vendors
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-1">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-center">Online</TableHead>
                    <TableHead>Booth</TableHead>
                    <TableHead className="text-center">Fee Paid</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scheduledVendors.map((mv) => (
                    <TableRow key={mv.id}>
                      <TableCell>
                        <Link
                          href={`/admin/vendors/${mv.vendor.id}/edit`}
                          className="font-medium text-market-soil hover:text-market-sage transition-colors"
                        >
                          {mv.vendor.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${vendorTypeColor(mv.vendor.vendorType)}`}>
                          {vendorTypeLabel(mv.vendor.vendorType)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {mv.vendor.onlineOrdersEnabled ? (
                          <span className="inline-flex items-center justify-center size-5 rounded-full bg-green-100 text-green-600">
                            <Check className="size-3" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center size-5 rounded-full bg-gray-100 text-gray-400">
                            <X className="size-3" />
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {mv.boothSpace || '—'}
                      </TableCell>
                      <TableCell className="text-center">
                        {mv.isPaid ? (
                          <span className="inline-flex items-center justify-center size-5 rounded-full bg-green-100 text-green-600">
                            <Check className="size-3" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center size-5 rounded-full bg-amber-100 text-amber-600">
                            <X className="size-3" />
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
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
          <div className="overflow-x-auto -mx-1">
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
          </div>
        )}
      </div>
    </div>
  )
}
