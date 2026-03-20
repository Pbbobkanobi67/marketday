import dotenv from 'dotenv'
import path from 'node:path'
dotenv.config({ path: path.join(__dirname, '..', '.env') })

import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  const vendor = await prisma.vendor.findFirst({
    where: { name: { contains: 'Light By Dawn' } },
    include: { products: true },
  })

  if (!vendor) {
    console.log('Vendor not found')
    return
  }

  console.log(`Vendor: ${vendor.name} (${vendor.id})`)
  console.log(`Email: ${vendor.email}`)
  console.log(`Online orders: ${vendor.onlineOrdersEnabled}`)
  console.log(`Products: ${vendor.products.length}`)

  if (vendor.products.length > 0) {
    console.log('\nExisting products:')
    for (const p of vendor.products) {
      console.log(`  - ${p.name} | $${(p.price / 100).toFixed(2)} | ${p.unit} | ${p.category} | qty:${p.quantity} | ${p.isAvailable ? 'available' : 'unavailable'}`)
    }
  } else {
    console.log('\nNo products yet.')
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
