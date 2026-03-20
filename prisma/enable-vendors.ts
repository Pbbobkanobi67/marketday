/**
 * One-off script: enable all vendors for testing.
 * - Sets onlineOrdersEnabled = true for all vendors
 * - Sets password = "vendor2026" for all vendors
 * - Generates unique emails for vendors without one (slug@test.com)
 * - Sets "Light By Dawn Candle Company" email to vendor@gmail.com
 *
 * Usage: npx tsx prisma/enable-vendors.ts
 */
import dotenv from 'dotenv'
import path from 'node:path'
dotenv.config({ path: path.join(__dirname, '..', '.env') })

import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import bcrypt from 'bcryptjs'

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  const hashedPassword = await bcrypt.hash('vendor2026', 10)

  const vendors = await prisma.vendor.findMany({
    select: { id: true, name: true, slug: true, email: true },
  })

  console.log(`Found ${vendors.length} vendors. Updating...`)

  for (const v of vendors) {
    // "Light By Dawn Candle Company" gets vendor@gmail.com
    const isLightByDawn = v.name.toLowerCase().includes('light by dawn')
    let email = v.email

    if (isLightByDawn) {
      email = 'vendor@gmail.com'
    } else if (!email) {
      email = `${v.slug}@test.com`
    }

    await prisma.vendor.update({
      where: { id: v.id },
      data: {
        onlineOrdersEnabled: true,
        hashedPassword,
        email,
      },
    })

    console.log(`  ${v.name} → ${email}`)
  }

  console.log(`\nDone! All ${vendors.length} vendors enabled.`)
  console.log('Default login: vendor@gmail.com / vendor2026')
  console.log('All vendors share password: vendor2026')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
