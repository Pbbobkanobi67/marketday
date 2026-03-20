import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@/generated/prisma/client'
import { formatMarketDate, marketTypeLabel, cn } from '@/lib/utils'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import FilterPills from '@/components/admin/FilterPills'
import { MARKET_CONFIG } from '@/config/market.config'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import MarketRowActions from '@/components/admin/MarketRowActions'

const STATUS_STYLES: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  UPCOMING: 'bg-blue-100 text-blue-800',
  ACTIVE: 'bg-green-100 text-green-800',
  PAST: 'bg-gray-100 text-gray-500',
  CANCELLED: 'bg-red-100 text-red-800',
}

const TYPE_STYLES: Record<string, string> = {
  SATURDAY_MARKET: 'bg-emerald-100 text-emerald-800',
  PICKUP_EVENT: 'bg-indigo-100 text-indigo-800',
}

export default async function AdminMarketsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string }>
}) {
  const params = await searchParams
  const statusFilter = params.status || ''
  const typeFilter = params.type || ''

  const where: Prisma.MarketWhereInput = {}
  if (statusFilter) {
    where.status = statusFilter
  }
  if (typeFilter) {
    where.type = typeFilter
  }

  const markets = await prisma.market.findMany({
    where,
    include: {
      _count: { select: { orders: true, vendors: true } },
    },
    orderBy: { date: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Markets</h1>
          <p className="text-sm text-muted-foreground">
            {markets.length} market{markets.length !== 1 ? 's' : ''}{statusFilter || typeFilter ? ' matching filters' : ' total'}
          </p>
        </div>
        <Button render={<Link href="/admin/markets/new" />}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Market
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Status:</span>
          <FilterPills
            paramName="status"
            options={[
              { value: 'DRAFT', label: 'Draft' },
              { value: 'UPCOMING', label: 'Upcoming' },
              { value: 'ACTIVE', label: 'Active' },
              { value: 'PAST', label: 'Past' },
              { value: 'CANCELLED', label: 'Cancelled' },
            ]}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Type:</span>
          <FilterPills
            paramName="type"
            options={MARKET_CONFIG.marketTypes.map((t) => ({ value: t.value, label: t.label }))}
          />
        </div>
      </div>

      <Separator />

      {markets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No markets yet. Schedule your first market day.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            render={<Link href="/admin/markets/new" />}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add Market
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Vendors</TableHead>
              <TableHead className="text-center">Orders</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {markets.map((market) => (
              <TableRow key={market.id}>
                <TableCell className="font-medium">{market.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatMarketDate(market.date)}
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                      TYPE_STYLES[market.type] || TYPE_STYLES.SATURDAY_MARKET
                    )}
                  >
                    {marketTypeLabel(market.type)}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                      STATUS_STYLES[market.status] || STATUS_STYLES.DRAFT
                    )}
                  >
                    {market.status}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  {market._count.vendors}
                </TableCell>
                <TableCell className="text-center">
                  {market._count.orders}
                </TableCell>
                <TableCell className="text-right">
                  <MarketRowActions
                    marketId={market.id}
                    marketName={market.name}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      )}
    </div>
  )
}
