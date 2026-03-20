import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { formatMarketDate } from '@/lib/utils'
import { Package, Calendar, ExternalLink, ArrowRight, Shield, CalendarDays, FileText, ShoppingCart } from 'lucide-react'
import StatCard from '@/components/admin/StatCard'
import { VendorOnlineRequestButton } from './VendorOnlineRequestButton'

export default async function VendorDashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.vendorId) redirect('/vendor/login')

  const vendor = await prisma.vendor.findUnique({
    where: { id: session.user.vendorId },
    include: {
      _count: { select: { products: true, availability: true } },
      markets: {
        where: { market: { status: 'UPCOMING', date: { gte: new Date() } } },
        include: { market: true },
        orderBy: { market: { date: 'asc' } },
        take: 5,
      },
    },
  })

  if (!vendor) redirect('/vendor/login')

  const firstName = vendor.displayName
    || (vendor.contactPerson ? vendor.contactPerson.split(/\s+/)[0] : null)
    || vendor.name.split(/\s+/)[0]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-market-soil">
          Welcome, {firstName}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your vendor profile, images, and products.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Products"
          value={vendor._count.products}
          subtitle={vendor.onlineOrdersEnabled ? 'Online ordering active' : 'Online ordering off'}
          icon={<Package className="size-5" />}
        />
        <StatCard
          title="Upcoming Markets"
          value={vendor.markets.length}
          subtitle="Assigned to attend"
          icon={<Calendar className="size-5" />}
        />
        <StatCard
          title="Availability"
          value={vendor._count.availability}
          subtitle="Schedule entries"
          icon={<CalendarDays className="size-5" />}
        />
      </div>

      {/* Online Ordering Opt-In */}
      {!vendor.onlineOrdersEnabled && (
        <div className="card-market p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-blue-50 p-2">
              <ShoppingCart className="size-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-semibold text-market-soil">Online Ordering</h2>
              <p className="text-sm text-muted-foreground mt-0.5 mb-3">
                Enable online ordering to let customers pre-order your products for market-day pickup.
              </p>
              <VendorOnlineRequestButton requested={vendor.onlineOrdersRequested} />
            </div>
          </div>
        </div>
      )}

      <div className="card-market p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-green-50 p-2">
            <Shield className="size-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-market-soil">Account Status: Free</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Your vendor portal is currently free. A small admin fee may apply in the future.
            </p>
          </div>
        </div>
      </div>

      {vendor.markets.length > 0 && (
        <div className="card-market p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Upcoming Markets
          </h2>
          <div className="space-y-2">
            {vendor.markets.map((mv) => (
              <div key={mv.id} className="text-sm text-market-soil">
                {formatMarketDate(mv.market.date)} &middot; {mv.market.openTime}&ndash;{mv.market.closeTime}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Link
          href="/vendor/profile"
          className="btn-primary flex items-center gap-2 text-sm"
        >
          Edit Profile
          <ArrowRight className="size-4" />
        </Link>
        <Link
          href="/vendor/schedule"
          className="inline-flex items-center gap-2 text-sm font-medium text-market-sage hover:text-market-sage-dk transition-colors border border-market-stone/30 rounded-lg px-4 py-2"
        >
          <CalendarDays className="size-4" />
          Schedule
        </Link>
        <Link
          href="/vendor/documents"
          className="inline-flex items-center gap-2 text-sm font-medium text-market-sage hover:text-market-sage-dk transition-colors border border-market-stone/30 rounded-lg px-4 py-2"
        >
          <FileText className="size-4" />
          Documents
        </Link>
        <Link
          href={`/vendors/${vendor.slug}`}
          target="_blank"
          className="inline-flex items-center gap-2 text-sm font-medium text-market-sage hover:text-market-sage-dk transition-colors border border-market-stone/30 rounded-lg px-4 py-2"
        >
          View Public Profile
          <ExternalLink className="size-4" />
        </Link>
      </div>
    </div>
  )
}
