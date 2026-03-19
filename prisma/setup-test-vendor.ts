import dotenv from 'dotenv'
import path from 'node:path'
dotenv.config({ path: path.join(__dirname, '..', '.env') })

import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import bcrypt from 'bcryptjs'

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const VENDOR_ID = 'cmmx1o3al001ppok9tlceef4b'

async function main() {
  // Update Light By Dawn Candle Company
  const hashedPassword = await bcrypt.hash('dawn2026', 10)

  const vendor = await prisma.vendor.update({
    where: { id: VENDOR_ID },
    data: {
      email: 'dawn@backroadsmarket.com',
      hashedPassword,
      onlineOrdersEnabled: true,
    },
  })

  console.log(`Updated vendor: ${vendor.name}`)
  console.log(`  Email: dawn@backroadsmarket.com`)
  console.log(`  Password: dawn2026`)
  console.log(`  Online orders: enabled`)

  // Create 3 sample candle products
  const products = [
    {
      name: 'Lavender Fields Soy Candle',
      slug: 'lavender-fields-soy-candle',
      description: 'Hand-poured soy wax candle with dried lavender buds. Burns clean for 40+ hours.',
      price: 2400,
      unit: 'each',
      category: 'specialty',
      isAvailable: true,
      vendorId: VENDOR_ID,
    },
    {
      name: 'Citrus Grove Candle',
      slug: 'citrus-grove-candle',
      description: 'Bright and energizing blend of orange, lemon, and grapefruit essential oils in natural soy wax.',
      price: 2200,
      unit: 'each',
      category: 'specialty',
      isAvailable: true,
      vendorId: VENDOR_ID,
    },
    {
      name: 'Eucalyptus Mint Candle',
      slug: 'eucalyptus-mint-candle',
      description: 'Refreshing eucalyptus and peppermint blend. Perfect for relaxation. 8oz jar.',
      price: 1800,
      unit: 'each',
      category: 'specialty',
      isAvailable: true,
      vendorId: VENDOR_ID,
    },
  ]

  for (const product of products) {
    // Upsert by slug to be idempotent
    const result = await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    })
    console.log(`  Product: ${result.name} ($${(result.price / 100).toFixed(2)})`)
  }

  console.log('\nDone! Vendor can now log in at /vendor/login')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
