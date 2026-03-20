/**
 * Populate market calendar with upcoming Saturdays and assign all vendors.
 * Usage: npx tsx prisma/populate-calendar.ts
 */
import dotenv from 'dotenv'
import path from 'node:path'
dotenv.config({ path: path.join(__dirname, '..', '.env') })

import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

function getUpcomingSaturdays(count: number): Date[] {
  const saturdays: Date[] = []
  const now = new Date()
  // Start from today
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  // Advance to next Saturday (6 = Saturday)
  while (d.getDay() !== 6) {
    d.setDate(d.getDate() + 1)
  }
  for (let i = 0; i < count; i++) {
    saturdays.push(new Date(d))
    d.setDate(d.getDate() + 7)
  }
  return saturdays
}

async function main() {
  // Get all active vendors
  const vendors = await prisma.vendor.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
  })
  console.log(`Found ${vendors.length} active vendors`)

  // Check existing upcoming markets to avoid duplicates
  const existingMarkets = await prisma.market.findMany({
    where: { status: 'UPCOMING' },
    select: { date: true },
  })
  const existingDates = new Set(
    existingMarkets.map((m) => m.date.toISOString().slice(0, 10))
  )

  // Generate 12 weeks of Saturdays
  const saturdays = getUpcomingSaturdays(12)
  let marketsCreated = 0
  let assignmentsCreated = 0

  for (const saturday of saturdays) {
    const dateStr = saturday.toISOString().slice(0, 10)

    if (existingDates.has(dateStr)) {
      console.log(`  Skipping ${dateStr} — market already exists`)
      continue
    }

    // Create market
    const market = await prisma.market.create({
      data: {
        name: `Saturday Market — ${saturday.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
        date: saturday,
        openTime: '9:00 AM',
        closeTime: '1:00 PM',
        location: 'Backroads Certified Farmers Market',
        address: '14335 Olde Hwy 80, El Cajon, CA 92021',
        type: 'SATURDAY_MARKET',
        status: 'UPCOMING',
      },
    })
    marketsCreated++
    console.log(`  Created market: ${market.name}`)

    // Assign all vendors
    for (const vendor of vendors) {
      await prisma.marketVendor.create({
        data: {
          marketId: market.id,
          vendorId: vendor.id,
        },
      })
    }
    assignmentsCreated += vendors.length
  }

  console.log(`\nDone!`)
  console.log(`  Markets created: ${marketsCreated}`)
  console.log(`  Vendor assignments: ${assignmentsCreated}`)
  console.log(`  (${vendors.length} vendors per market)`)
  console.log(`\nAdmins can adjust vendor assignments per market at /admin/markets/[id]/vendors`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
