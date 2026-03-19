import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { MARKET_CONFIG } from '@/config/market.config'

/**
 * Parse a time string like "9:00 AM" or "1:00 PM" into { hours, minutes } in 24h format.
 */
function parseTime(timeStr: string): { hours: number; minutes: number } {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) return { hours: 9, minutes: 0 }
  let hours = parseInt(match[1], 10)
  const minutes = parseInt(match[2], 10)
  const period = match[3].toUpperCase()
  if (period === 'PM' && hours !== 12) hours += 12
  if (period === 'AM' && hours === 12) hours = 0
  return { hours, minutes }
}

/**
 * Format a Date + time parts into ICS datetime string (YYYYMMDDTHHMMSS).
 */
function toICSDate(date: Date, hours: number, minutes: number): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(hours).padStart(2, '0')
  const min = String(minutes).padStart(2, '0')
  return `${y}${m}${d}T${h}${min}00`
}

function escapeICS(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const market = await prisma.market.findUnique({ where: { id } })
  if (!market) {
    return NextResponse.json({ error: 'Market not found' }, { status: 404 })
  }

  const marketDate = new Date(market.date)
  const start = parseTime(market.openTime)
  const end = parseTime(market.closeTime)

  const dtStart = toICSDate(marketDate, start.hours, start.minutes)
  const dtEnd = toICSDate(marketDate, end.hours, end.minutes)
  const now = new Date()
  const dtStamp = toICSDate(now, now.getUTCHours(), now.getUTCMinutes())

  const location = market.address
    ? `${market.location}, ${market.address}`
    : market.location

  const description = `${MARKET_CONFIG.marketName}\\n${market.openTime} - ${market.closeTime}\\nOrder ahead at ${MARKET_CONFIG.siteUrl}/market/${market.id}`

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Backroads Certified Farmers Market//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:market-${market.id}@backroadsmarket.com`,
    `DTSTAMP:${dtStamp}Z`,
    `DTSTART;TZID=America/Los_Angeles:${dtStart}`,
    `DTEND;TZID=America/Los_Angeles:${dtEnd}`,
    `SUMMARY:${escapeICS(market.name)}`,
    `LOCATION:${escapeICS(location)}`,
    `DESCRIPTION:${description}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  return new NextResponse(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${market.name.replace(/[^a-zA-Z0-9 ]/g, '')}.ics"`,
    },
  })
}
