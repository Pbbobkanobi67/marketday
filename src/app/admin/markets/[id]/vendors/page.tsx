import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatMarketDate, marketTypeLabel, cn } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'
import MarketVendorsClient from './MarketVendorsClient'

export default async function MarketVendorsPage({
  params,
}: {
  params: { id: string }
}) {
  const market = await prisma.market.findUnique({
    where: { id: params.id },
    include: {
      vendors: {
        include: { vendor: true },
        orderBy: { vendor: { name: 'asc' } },
      },
    },
  })

  if (!market) notFound()

  const allVendors = await prisma.vendor.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  })

  const assignedVendorIds = new Set(market.vendors.map((mv) => mv.vendorId))
  const unassignedVendors = allVendors.filter((v) => !assignedVendorIds.has(v.id))

  const serializedMarket = {
    id: market.id,
    name: market.name,
    date: market.date.toISOString(),
    type: market.type,
    status: market.status,
  }

  const serializedAssignments = market.vendors.map((mv) => ({
    id: mv.id,
    vendorId: mv.vendorId,
    vendorName: mv.vendor.name,
    vendorType: mv.vendor.vendorType,
    boothSpace: mv.boothSpace,
    boothFee: mv.boothFee,
    isPaid: mv.isPaid,
    notes: mv.notes,
    onlineOrdersEnabled: mv.vendor.onlineOrdersEnabled,
  }))

  const serializedUnassigned = unassignedVendors.map((v) => ({
    id: v.id,
    name: v.name,
    vendorType: v.vendorType,
  }))

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/markets"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-market-sage transition-colors mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Markets
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">{market.name}</h1>
        <p className="text-sm text-muted-foreground">
          {formatMarketDate(market.date)} &middot; {marketTypeLabel(market.type)}
          <span className={cn(
            'ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
            market.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
          )}>
            {market.status}
          </span>
        </p>
      </div>

      <MarketVendorsClient
        market={serializedMarket}
        assignments={serializedAssignments}
        unassignedVendors={serializedUnassigned}
      />
    </div>
  )
}
