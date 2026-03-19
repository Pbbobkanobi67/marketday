import dotenv from 'dotenv'
import path from 'node:path'
dotenv.config({ path: path.join(__dirname, '..', '.env') })

import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import bcrypt from 'bcryptjs'

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding Backroads Certified Farmers Market database...')

  // -- Clean slate --
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.marketVendor.deleteMany()
  await prisma.product.deleteMany()
  await prisma.vendor.deleteMany()
  await prisma.market.deleteMany()
  await prisma.vendorApplication.deleteMany()
  await prisma.adminUser.deleteMany()

  // -- Admin Users --
  await prisma.adminUser.create({
    data: {
      name: 'Marci',
      email: 'marci@backroadsmarket.com',
      hashedPassword: await bcrypt.hash('marci2026', 12),
      role: 'admin',
    },
  })

  await prisma.adminUser.create({
    data: {
      name: 'Bob',
      email: 'bob.smic@gmail.com',
      hashedPassword: await bcrypt.hash('Expert09$', 12),
      role: 'admin',
    },
  })

  await prisma.adminUser.create({
    data: {
      name: 'Jessica',
      email: 'jessica@backroadsmarket.com',
      hashedPassword: await bcrypt.hash('jessica2026', 12),
      role: 'admin',
    },
  })
  console.log('  2 admin users created')

  // -- Markets (Saturdays at El Cajon) --
  const market1 = await prisma.market.create({
    data: {
      name: 'Saturday Market - March 22',
      date: new Date('2026-03-22T09:00:00-07:00'),
      openTime: '9:00 AM',
      closeTime: '1:00 PM',
      location: 'Backroads Certified Farmers Market',
      address: '14335 Olde Hwy 80, El Cajon, CA 92021',
      description: 'Regular Saturday market.',
      type: 'SATURDAY_MARKET',
      status: 'UPCOMING',
    },
  })

  await prisma.market.create({
    data: {
      name: 'Saturday Market - March 28',
      date: new Date('2026-03-28T09:00:00-07:00'),
      openTime: '9:00 AM',
      closeTime: '1:00 PM',
      location: 'Backroads Certified Farmers Market',
      address: '14335 Olde Hwy 80, El Cajon, CA 92021',
      description: 'Market closed this week.',
      type: 'SATURDAY_MARKET',
      status: 'CANCELLED',
    },
  })

  await prisma.market.create({
    data: {
      name: 'Saturday Market - April 4',
      date: new Date('2026-04-04T09:00:00-07:00'),
      openTime: '9:00 AM',
      closeTime: '1:00 PM',
      location: 'Backroads Certified Farmers Market',
      address: '14335 Olde Hwy 80, El Cajon, CA 92021',
      description: 'Market closed this week.',
      type: 'SATURDAY_MARKET',
      status: 'CANCELLED',
    },
  })

  const market4 = await prisma.market.create({
    data: {
      name: 'Saturday Market - April 11',
      date: new Date('2026-04-11T09:00:00-07:00'),
      openTime: '9:00 AM',
      closeTime: '1:00 PM',
      location: 'Backroads Certified Farmers Market',
      address: '14335 Olde Hwy 80, El Cajon, CA 92021',
      description: 'Spring season continues!',
      type: 'SATURDAY_MARKET',
      status: 'UPCOMING',
    },
  })

  const market5 = await prisma.market.create({
    data: {
      name: 'Saturday Market - April 18',
      date: new Date('2026-04-18T09:00:00-07:00'),
      openTime: '9:00 AM',
      closeTime: '1:00 PM',
      location: 'Backroads Certified Farmers Market',
      address: '14335 Olde Hwy 80, El Cajon, CA 92021',
      description: 'Earth Day weekend market.',
      type: 'SATURDAY_MARKET',
      status: 'UPCOMING',
    },
  })
  console.log('  5 markets created (2 cancelled)')

  // -- Vendors --
  const valleyHarvest = await prisma.vendor.create({
    data: {
      name: 'Valley Harvest Farm',
      slug: 'valley-harvest-farm',
      description: 'Certified organic produce from our 20-acre farm in Ramona. Seasonal vegetables, herbs, and stone fruit.',
      category: 'certified_farmer',
      vendorType: 'certified_farmer',
      isActive: true,
      onlineOrdersEnabled: true,
      contactPerson: 'Maria Santos',
      email: 'maria@valleyharvest.com',
      phone: '(619) 555-0201',
    },
  })

  const elCajonBakery = await prisma.vendor.create({
    data: {
      name: 'El Cajon Bread Co.',
      slug: 'el-cajon-bread-co',
      description: 'Artisan sourdoughs and pastries baked fresh every Friday. California-grown wheat, naturally leavened.',
      category: 'baked',
      vendorType: 'baked_goods',
      isActive: true,
      onlineOrdersEnabled: true,
      contactPerson: 'David Kim',
      email: 'david@elcajonbread.com',
    },
  })

  const sunshineHoney = await prisma.vendor.create({
    data: {
      name: 'Sunshine Apiaries',
      slug: 'sunshine-apiaries',
      description: 'Raw varietal honeys from hives across East County. Wildflower, sage, and buckwheat varieties.',
      category: 'specialty',
      vendorType: 'certified_farmer',
      isActive: true,
      onlineOrdersEnabled: true,
      contactPerson: 'Jake Thompson',
      email: 'jake@sunshineapiaries.com',
    },
  })

  const mamaPeppers = await prisma.vendor.create({
    data: {
      name: "Mama Pepper's Kitchen",
      slug: 'mama-peppers-kitchen',
      description: 'Handmade tamales, fresh salsas, and Mexican street food made from family recipes. Hot and ready every Saturday.',
      category: 'hot_food',
      vendorType: 'hot_food',
      isActive: true,
      onlineOrdersEnabled: false,
      contactPerson: 'Rosa Gutierrez',
      phone: '(619) 555-0305',
    },
  })

  const desertBloom = await prisma.vendor.create({
    data: {
      name: 'Desert Bloom Pottery',
      slug: 'desert-bloom-pottery',
      description: 'Handcrafted stoneware pottery and planters. Each piece is wheel-thrown and glazed in our El Cajon studio.',
      category: 'artisan_craft',
      vendorType: 'artisan_craft',
      isActive: true,
      onlineOrdersEnabled: false,
      contactPerson: 'Lisa Chen',
      website: 'https://desertbloompottery.com',
      instagramHandle: '@desertbloompottery',
    },
  })

  const backroadsCitrus = await prisma.vendor.create({
    data: {
      name: 'Backroads Citrus Ranch',
      slug: 'backroads-citrus-ranch',
      description: 'Family-owned citrus grove growing Valencia oranges, Meyer lemons, and grapefruit since 1988.',
      category: 'certified_farmer',
      vendorType: 'certified_farmer',
      isActive: true,
      onlineOrdersEnabled: true,
      contactPerson: 'Tom Henderson',
      email: 'tom@backroadscitrus.com',
      phone: '(619) 555-0410',
    },
  })
  console.log('  6 vendors created')

  // -- Products --
  // Valley Harvest
  const p1 = await prisma.product.create({ data: { name: 'Heirloom Tomato Mix', slug: 'valley-harvest-heirloom-tomatoes', description: 'Six varieties, hand-picked that morning.', price: 800, unit: 'lb', category: 'certified_farmer', vendorId: valleyHarvest.id, isAvailable: true } })
  const p2 = await prisma.product.create({ data: { name: 'Lacinato Kale', slug: 'valley-harvest-lacinato-kale', description: 'Dark, tender Tuscan kale grown in full sun.', price: 450, unit: 'bunch', category: 'certified_farmer', vendorId: valleyHarvest.id, isAvailable: true } })
  const p3 = await prisma.product.create({ data: { name: 'Seasonal Greens Box', slug: 'valley-harvest-greens-box', description: 'A curated 5 lb box of whatever is best this week.', price: 1800, unit: 'each', category: 'certified_farmer', vendorId: valleyHarvest.id, isAvailable: true } })

  // El Cajon Bread
  const p4 = await prisma.product.create({ data: { name: 'Country Sourdough Loaf', slug: 'el-cajon-bread-sourdough', description: '48-hour cold ferment, open crumb, mahogany crust.', price: 1200, unit: 'loaf', category: 'baked', vendorId: elCajonBakery.id, isAvailable: true } })
  const p5 = await prisma.product.create({ data: { name: 'Almond Croissant', slug: 'el-cajon-bread-almond-croissant', description: 'Laminated with cultured butter, filled with almond cream.', price: 550, unit: 'each', category: 'baked', vendorId: elCajonBakery.id, isAvailable: true } })
  await prisma.product.create({ data: { name: 'Seeded Rye Loaf', slug: 'el-cajon-bread-seeded-rye', description: 'Dark rye flour, caraway, sunflower, and sesame.', price: 1100, unit: 'loaf', category: 'baked', vendorId: elCajonBakery.id, isAvailable: true } })

  // Sunshine Apiaries
  const p7 = await prisma.product.create({ data: { name: 'Wildflower Honey', slug: 'sunshine-wildflower-honey', description: 'Light floral honey from East County hives.', price: 1600, unit: 'jar', category: 'specialty', vendorId: sunshineHoney.id, isAvailable: true } })
  await prisma.product.create({ data: { name: 'Mountain Sage Honey', slug: 'sunshine-sage-honey', description: 'Herbal and slightly savory from high-elevation sage.', price: 1800, unit: 'jar', category: 'specialty', vendorId: sunshineHoney.id, isAvailable: true } })
  await prisma.product.create({ data: { name: 'Honeycomb Square', slug: 'sunshine-honeycomb', description: 'Raw comb cut to order.', price: 1400, unit: 'each', category: 'specialty', vendorId: sunshineHoney.id, isAvailable: true } })

  // Backroads Citrus
  const p10 = await prisma.product.create({ data: { name: 'Valencia Oranges', slug: 'backroads-citrus-valencia', description: 'Sweet and juicy Valencia oranges, picked ripe.', price: 600, unit: 'lb', category: 'certified_farmer', vendorId: backroadsCitrus.id, isAvailable: true } })
  await prisma.product.create({ data: { name: 'Meyer Lemons', slug: 'backroads-citrus-meyer-lemons', description: 'Fragrant Meyer lemons perfect for cooking and baking.', price: 500, unit: 'lb', category: 'certified_farmer', vendorId: backroadsCitrus.id, isAvailable: true } })
  await prisma.product.create({ data: { name: 'Ruby Red Grapefruit', slug: 'backroads-citrus-grapefruit', description: 'Sweet and tart Ruby Red grapefruit.', price: 550, unit: 'lb', category: 'certified_farmer', vendorId: backroadsCitrus.id, isAvailable: true } })
  console.log('  12 products created')

  // -- MarketVendor assignments --
  // Assign online-enabled vendors to market1 (March 22)
  for (const vendor of [valleyHarvest, elCajonBakery, sunshineHoney, backroadsCitrus, mamaPeppers]) {
    await prisma.marketVendor.create({
      data: { marketId: market1.id, vendorId: vendor.id },
    })
  }
  // Assign to market4 (April 11) and market5 (April 18)
  for (const vendor of [valleyHarvest, elCajonBakery, sunshineHoney, backroadsCitrus, mamaPeppers, desertBloom]) {
    await prisma.marketVendor.create({
      data: { marketId: market4.id, vendorId: vendor.id },
    })
    await prisma.marketVendor.create({
      data: { marketId: market5.id, vendorId: vendor.id },
    })
  }
  console.log('  Market-vendor assignments created')

  // -- Sample Orders --
  await prisma.order.create({
    data: {
      orderNumber: 'BR-2026-0001',
      customerName: 'Sarah Mitchell',
      customerEmail: 'sarah@example.com',
      customerPhone: '619-555-0101',
      marketId: market1.id,
      subtotal: p4.price * 1 + p5.price * 2,
      paymentMethod: 'STRIPE',
      paymentStatus: 'PAID',
      pickupStatus: 'PENDING',
      items: {
        create: [
          { productId: p4.id, vendorId: elCajonBakery.id, quantity: 1, priceAtTime: p4.price, productName: p4.name, vendorName: elCajonBakery.name },
          { productId: p5.id, vendorId: elCajonBakery.id, quantity: 2, priceAtTime: p5.price, productName: p5.name, vendorName: elCajonBakery.name },
        ],
      },
    },
  })

  await prisma.order.create({
    data: {
      orderNumber: 'BR-2026-0002',
      customerName: 'James Rivera',
      customerEmail: 'jrivera@example.com',
      customerPhone: '619-555-0202',
      marketId: market1.id,
      subtotal: p1.price * 2 + p7.price * 1,
      paymentMethod: 'AT_MARKET',
      paymentStatus: 'PENDING',
      pickupStatus: 'PENDING',
      items: {
        create: [
          { productId: p1.id, vendorId: valleyHarvest.id, quantity: 2, priceAtTime: p1.price, productName: p1.name, vendorName: valleyHarvest.name },
          { productId: p7.id, vendorId: sunshineHoney.id, quantity: 1, priceAtTime: p7.price, productName: p7.name, vendorName: sunshineHoney.name },
        ],
      },
    },
  })

  await prisma.order.create({
    data: {
      orderNumber: 'BR-2026-0003',
      customerName: 'Leila Nakamura',
      customerEmail: 'leila@example.com',
      marketId: market4.id,
      subtotal: p10.price * 3 + p3.price * 1,
      paymentMethod: 'AT_MARKET',
      paymentStatus: 'PENDING',
      pickupStatus: 'PENDING',
      items: {
        create: [
          { productId: p10.id, vendorId: backroadsCitrus.id, quantity: 3, priceAtTime: p10.price, productName: p10.name, vendorName: backroadsCitrus.name },
          { productId: p3.id, vendorId: valleyHarvest.id, quantity: 1, priceAtTime: p3.price, productName: p3.name, vendorName: valleyHarvest.name },
        ],
      },
    },
  })
  console.log('  3 sample orders created')

  // -- Sample Vendor Application --
  await prisma.vendorApplication.create({
    data: {
      businessName: 'East County Jams',
      contactPerson: 'Ana Morales',
      email: 'ana@eastcountyjams.com',
      phone: '(619) 555-0500',
      vendorType: 'specialty_food',
      productsDescription: 'Small-batch jams and preserves made from locally sourced fruit.',
      businessDescription: 'Family business making preserves for 10 years at local farmers markets.',
      status: 'PENDING',
    },
  })
  console.log('  1 sample vendor application created')

  console.log('\nSeed complete!')
  console.log('   Admin logins:')
  console.log('   marci@backroadsmarket.com / marci2026')
  console.log('   jessica@backroadsmarket.com / jessica2026')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
