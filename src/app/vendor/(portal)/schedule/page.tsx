import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Separator } from '@/components/ui/separator'
import { VendorScheduleClient } from './VendorScheduleClient'

export default async function VendorSchedulePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.vendorId) redirect('/vendor/login')

  const vendorId = session.user.vendorId

  const [assignedMarkets, availability, upcomingMarkets] = await Promise.all([
    prisma.marketVendor.findMany({
      where: {
        vendorId,
        market: { status: 'UPCOMING', date: { gte: new Date() } },
      },
      include: {
        market: {
          select: { id: true, name: true, date: true, openTime: true, closeTime: true },
        },
      },
      orderBy: { market: { date: 'asc' } },
    }),
    prisma.vendorAvailability.findMany({
      where: {
        vendorId,
        market: { date: { gte: new Date() } },
      },
      include: {
        market: {
          select: { id: true, name: true, date: true, openTime: true, closeTime: true },
        },
      },
      orderBy: { market: { date: 'asc' } },
    }),
    prisma.market.findMany({
      where: { status: 'UPCOMING', date: { gte: new Date() } },
      select: { id: true, name: true, date: true, openTime: true, closeTime: true },
      orderBy: { date: 'asc' },
    }),
  ])

  // Serialize dates for client component
  const serializedAssigned = assignedMarkets.map((mv) => ({
    id: mv.id,
    boothSpace: mv.boothSpace,
    market: {
      ...mv.market,
      date: mv.market.date.toISOString(),
    },
  }))

  const serializedAvailability = availability.map((a) => ({
    id: a.id,
    status: a.status,
    notes: a.notes,
    market: {
      ...a.market,
      date: a.market.date.toISOString(),
    },
  }))

  const serializedUpcoming = upcomingMarkets.map((m) => ({
    ...m,
    date: m.date.toISOString(),
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Schedule</h1>
        <p className="text-sm text-muted-foreground">
          View your market schedule and manage your availability.
        </p>
      </div>

      <Separator />

      <VendorScheduleClient
        assignedMarkets={serializedAssigned}
        availability={serializedAvailability}
        upcomingMarkets={serializedUpcoming}
      />
    </div>
  )
}
