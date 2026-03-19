import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { cn } from '@/lib/utils'

const STATUS_DOT: Record<string, string> = {
  DRAFT: 'bg-gray-400',
  UPCOMING: 'bg-blue-500',
  ACTIVE: 'bg-green-500',
  PAST: 'bg-gray-400',
  CANCELLED: 'bg-red-500',
}

export default async function CalendarPage() {
  const markets = await prisma.market.findMany({
    include: {
      _count: { select: { orders: true, vendors: true } },
    },
    orderBy: { date: 'asc' },
  })

  // Build a map of date string -> market data
  const marketsByDate = new Map<string, typeof markets>()
  for (const m of markets) {
    const key = m.date.toISOString().split('T')[0]
    const existing = marketsByDate.get(key) || []
    existing.push(m)
    marketsByDate.set(key, existing)
  }

  // Determine calendar range: show current month and next 2 months
  const now = new Date()
  const months: { year: number; month: number }[] = []
  for (let i = 0; i < 3; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
    months.push({ year: d.getFullYear(), month: d.getMonth() })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
        <p className="text-sm text-muted-foreground">
          Overview of all market days and events.
        </p>
      </div>

      <div className="space-y-8">
        {months.map(({ year, month }) => {
          const firstDay = new Date(year, month, 1)
          const daysInMonth = new Date(year, month + 1, 0).getDate()
          const startDow = firstDay.getDay() // 0=Sun
          const monthLabel = firstDay.toLocaleString('en-US', { month: 'long', year: 'numeric' })

          // Build grid cells
          const cells: (null | number)[] = []
          for (let i = 0; i < startDow; i++) cells.push(null)
          for (let d = 1; d <= daysInMonth; d++) cells.push(d)

          return (
            <div key={`${year}-${month}`} className="card-market p-5">
              <h2 className="font-display text-lg font-semibold text-market-soil mb-4">
                {monthLabel}
              </h2>

              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <div key={d} className="text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground py-1">
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {cells.map((day, i) => {
                  if (day === null) {
                    return <div key={`empty-${i}`} className="min-h-[72px]" />
                  }

                  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                  const dayMarkets = marketsByDate.get(dateStr) || []
                  const isToday =
                    now.getFullYear() === year &&
                    now.getMonth() === month &&
                    now.getDate() === day

                  return (
                    <div
                      key={dateStr}
                      className={cn(
                        'min-h-[72px] rounded-lg border p-1.5 text-xs',
                        isToday ? 'border-market-sage bg-market-sage/5' : 'border-market-stone/20',
                        dayMarkets.length > 0 && 'bg-market-warm/30'
                      )}
                    >
                      <span className={cn(
                        'inline-block text-xs font-medium mb-1',
                        isToday ? 'text-market-sage font-bold' : 'text-muted-foreground'
                      )}>
                        {day}
                      </span>

                      {dayMarkets.map((m) => (
                        <Link
                          key={m.id}
                          href={`/admin/markets/${m.id}/vendors`}
                          className="block rounded px-1 py-0.5 hover:bg-market-warm/50 transition-colors"
                        >
                          <div className="flex items-center gap-1">
                            <span className={cn('inline-block h-1.5 w-1.5 rounded-full shrink-0', STATUS_DOT[m.status] || 'bg-gray-400')} />
                            <span className="truncate font-medium text-market-soil">
                              {m.name}
                            </span>
                          </div>
                          <div className="text-[10px] text-muted-foreground pl-2.5">
                            {m._count.vendors}v / {m._count.orders}o
                          </div>
                        </Link>
                      ))}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
