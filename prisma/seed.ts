import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import bcrypt from 'bcryptjs'
import path from 'node:path'

const adapter = new PrismaBetterSqlite3({
  url: `file:${path.join(__dirname, 'dev.db')}`,
})
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding MarketDay database...')

  // ── Clean slate ──────────────────────────────────────────
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()
  await prisma.vendor.deleteMany()
  await prisma.market.deleteMany()
  await prisma.adminUser.deleteMany()

  // ── Admin Users ──────────────────────────────────────────
  const marci = await prisma.adminUser.create({
    data: {
      name: 'Marci',
      email: 'marci@marketday.com',
      hashedPassword: await bcrypt.hash('marci2026', 12),
      role: 'admin',
    },
  })

  await prisma.adminUser.create({
    data: {
      name: 'Jessica',
      email: 'jessica@marketday.com',
      hashedPassword: await bcrypt.hash('jessica2026', 12),
      role: 'admin',
    },
  })
  console.log('✓ 2 admin users created')

  // ── Markets ──────────────────────────────────────────────
  const market1 = await prisma.market.create({
    data: {
      name: 'Spring Opening Market',
      date: new Date('2026-04-05T08:00:00-07:00'),
      openTime: '8:00 AM',
      closeTime: '1:00 PM',
      location: 'Liberty Station Public Market',
      address: '2875 Historic Decatur Rd, San Diego, CA 92106',
      description: 'Our first market of the spring season. Come celebrate longer days and longer tables.',
      status: 'UPCOMING',
    },
  })

  const market2 = await prisma.market.create({
    data: {
      name: 'Earth Day Weekend Market',
      date: new Date('2026-04-19T08:00:00-07:00'),
      openTime: '8:00 AM',
      closeTime: '1:00 PM',
      location: 'Liberty Station Public Market',
      address: '2875 Historic Decatur Rd, San Diego, CA 92106',
      description: 'Celebrating local, sustainable food. All vendors are certified organic or beyond organic.',
      status: 'UPCOMING',
    },
  })

  await prisma.market.create({
    data: {
      name: 'May Day Market',
      date: new Date('2026-05-03T08:00:00-07:00'),
      openTime: '8:00 AM',
      closeTime: '1:00 PM',
      location: 'Liberty Station Public Market',
      address: '2875 Historic Decatur Rd, San Diego, CA 92106',
      description: 'May flowers, May flavors. The season is hitting its stride.',
      status: 'UPCOMING',
    },
  })
  console.log('✓ 3 markets created')

  // ── Vendors ──────────────────────────────────────────────
  const sunridge = await prisma.vendor.create({
    data: {
      name: 'Sunridge Farm',
      slug: 'sunridge-farm',
      description: 'Family-owned since 1987. We grow over 40 varieties of vegetables on 12 acres in Escondido — no synthetic pesticides, ever. Our stand smells like the earth should.',
      category: 'produce',
      isActive: true,
    },
  })

  const goldenGrain = await prisma.vendor.create({
    data: {
      name: 'Golden Grain Bakehouse',
      slug: 'golden-grain-bakehouse',
      description: 'Long-fermented sourdoughs and laminated pastries baked before sunrise every Friday. Everything is made from California-grown wheat, milled in small batches.',
      category: 'baked',
      isActive: true,
    },
  })

  const mesaHoney = await prisma.vendor.create({
    data: {
      name: 'Mesa Honey Co.',
      slug: 'mesa-honey-co',
      description: 'Raw varietal honeys harvested from our hives across San Diego County. From coastal wildflower to mountain sage — each jar tastes like a specific place.',
      category: 'specialty',
      isActive: true,
    },
  })

  const coastalBloom = await prisma.vendor.create({
    data: {
      name: 'Coastal Bloom',
      slug: 'coastal-bloom',
      description: 'Cut flowers and potted herbs grown on our Carlsbad property. We cut to order on Saturday mornings so everything you take home is as fresh as it gets.',
      category: 'flowers',
      isActive: true,
    },
  })

  const ranchoLibre = await prisma.vendor.create({
    data: {
      name: 'Rancho Libre',
      slug: 'rancho-libre',
      description: 'Grass-fed beef and pastured pork from our family ranch in Valley Center. Animals raised on open pasture, never crowded, never rushed.',
      category: 'meat',
      isActive: true,
    },
  })

  const blueSky = await prisma.vendor.create({
    data: {
      name: 'Blue Sky Creamery',
      slug: 'blue-sky-creamery',
      description: 'Handmade artisan cheese, cultured butter, and whole-milk yogurt from a small herd of Jersey cows in Ramona. Rich, golden milk — the kind that turns heads.',
      category: 'dairy',
      isActive: true,
    },
  })

  const pacificJam = await prisma.vendor.create({
    data: {
      name: 'Pacific Jam Co.',
      slug: 'pacific-jam-co',
      description: 'Small-batch preserves made in a licensed cottage kitchen. We chase peak-season fruit — strawberry in spring, stone fruit in summer, citrus all winter.',
      category: 'specialty',
      isActive: true,
    },
  })

  const desertRoots = await prisma.vendor.create({
    data: {
      name: 'Desert Roots',
      slug: 'desert-roots',
      description: 'Certified organic root vegetables and microgreens from our Borrego Springs operation. Desert sun grows something you can taste.',
      category: 'produce',
      isActive: true,
    },
  })
  console.log('✓ 8 vendors created')

  // ── Products ──────────────────────────────────────────────
  // Sunridge Farm
  const p1 = await prisma.product.create({ data: { name: 'Heirloom Tomato Mix', slug: 'sunridge-heirloom-tomato-mix', description: 'Six varieties, hand-picked that morning. Paste, slicer, and cherry types in one bag.', price: 800, unit: 'lb', category: 'produce', vendorId: sunridge.id, isAvailable: true } })
  const p2 = await prisma.product.create({ data: { name: 'Lacinato Kale', slug: 'sunridge-lacinato-kale', description: 'Dark, tender Tuscan kale. Grown in full sun, harvested young for sweetness.', price: 450, unit: 'bunch', category: 'produce', vendorId: sunridge.id, isAvailable: true } })
  const p3 = await prisma.product.create({ data: { name: 'Seasonal Greens Box', slug: 'sunridge-seasonal-greens-box', description: 'A curated 5 lb box of whatever\'s best this week — greens, herbs, and something unexpected.', price: 1800, unit: 'each', category: 'produce', vendorId: sunridge.id, isAvailable: true } })

  // Golden Grain
  const p4 = await prisma.product.create({ data: { name: 'Country Sourdough Loaf', slug: 'golden-grain-country-sourdough', description: '48-hour cold ferment, open crumb, mahogany crust. The one people drive across town for.', price: 1200, unit: 'loaf', category: 'baked', vendorId: goldenGrain.id, isAvailable: true } })
  const p5 = await prisma.product.create({ data: { name: 'Almond Croissant', slug: 'golden-grain-almond-croissant', description: 'Laminated with cultured butter, filled and topped with house almond cream.', price: 550, unit: 'each', category: 'baked', vendorId: goldenGrain.id, isAvailable: true } })
  await prisma.product.create({ data: { name: 'Seeded Rye Loaf', slug: 'golden-grain-seeded-rye', description: 'Dark rye flour, caraway, sunflower, and sesame. Dense, complex, keeps well.', price: 1100, unit: 'loaf', category: 'baked', vendorId: goldenGrain.id, isAvailable: true } })

  // Mesa Honey
  const p7 = await prisma.product.create({ data: { name: 'Coastal Wildflower Honey', slug: 'mesa-coastal-wildflower-honey', description: 'Light floral honey from hives near the Batiquitos Lagoon. Mild, buttery, unforgettable on warm bread.', price: 1600, unit: 'jar', category: 'specialty', vendorId: mesaHoney.id, isAvailable: true } })
  await prisma.product.create({ data: { name: 'Mountain Sage Honey', slug: 'mesa-mountain-sage-honey', description: 'Harvested from high-elevation sage in bloom. Herbal, slightly savory — a wild and honest honey.', price: 1800, unit: 'jar', category: 'specialty', vendorId: mesaHoney.id, isAvailable: true } })
  await prisma.product.create({ data: { name: 'Honeycomb Square', slug: 'mesa-honeycomb-square', description: 'Raw comb cut to order. Spread it, eat it straight, or serve it on a cheese board.', price: 1400, unit: 'each', category: 'specialty', vendorId: mesaHoney.id, isAvailable: true } })

  // Coastal Bloom
  const p10 = await prisma.product.create({ data: { name: 'Mixed Seasonal Bouquet', slug: 'coastal-bloom-seasonal-bouquet', description: 'Cut-to-order that morning. Ranunculus, anemone, and whatever else is peaking. No two alike.', price: 2200, unit: 'each', category: 'flowers', vendorId: coastalBloom.id, isAvailable: true } })
  await prisma.product.create({ data: { name: 'Fresh Herb Pot — Basil', slug: 'coastal-bloom-basil-pot', description: 'Lush Genovese basil in a 4-inch terracotta pot. Ready to grow on a sunny sill or straight into dinner.', price: 700, unit: 'each', category: 'flowers', vendorId: coastalBloom.id, isAvailable: true } })
  await prisma.product.create({ data: { name: 'Sunflower Bundle', slug: 'coastal-bloom-sunflower-bundle', description: 'Six stems, bright and tall. Picked Friday, in water by Saturday morning.', price: 1200, unit: 'bunch', category: 'flowers', vendorId: coastalBloom.id, isAvailable: true } })

  // Rancho Libre
  const p13 = await prisma.product.create({ data: { name: 'Grass-Fed Ground Beef', slug: 'rancho-libre-ground-beef', description: '85/15 blend. Rich, clean-tasting beef from cattle finished on orchard grass. Vacuum sealed.', price: 1400, unit: 'lb', category: 'meat', vendorId: ranchoLibre.id, isAvailable: true } })
  await prisma.product.create({ data: { name: 'Pastured Pork Sausage', slug: 'rancho-libre-pork-sausage', description: 'Mild Italian-style. Made with fennel seed and San Diego chile. No fillers, no nitrates.', price: 1600, unit: 'lb', category: 'meat', vendorId: ranchoLibre.id, isAvailable: true } })
  await prisma.product.create({ data: { name: 'Bone-In Short Ribs', slug: 'rancho-libre-short-ribs', description: 'Cut thick for braising. From cattle that lived well. Ask us about our weekend slow-cook method.', price: 2800, unit: 'lb', category: 'meat', vendorId: ranchoLibre.id, isAvailable: true } })

  // Blue Sky Creamery
  const p16 = await prisma.product.create({ data: { name: 'Aged Manchego-Style', slug: 'blue-sky-manchego-style', description: 'Three-month aged wheel from our Jersey herd. Firm, slightly nutty, melts beautifully. ~8 oz.', price: 2400, unit: 'each', category: 'dairy', vendorId: blueSky.id, isAvailable: true } })
  await prisma.product.create({ data: { name: 'Cultured Butter', slug: 'blue-sky-cultured-butter', description: 'European-style, 84% fat, made with live cultures. Salted and unsalted, both available. 4 oz roll.', price: 900, unit: 'each', category: 'dairy', vendorId: blueSky.id, isAvailable: true } })
  await prisma.product.create({ data: { name: 'Whole Milk Yogurt', slug: 'blue-sky-whole-milk-yogurt', description: 'Thick, tangy, and deeply creamy. Jersey milk, live cultures, nothing else. 8 oz jar.', price: 700, unit: 'each', category: 'dairy', vendorId: blueSky.id, isAvailable: true } })

  // Pacific Jam Co.
  const p19 = await prisma.product.create({ data: { name: 'Strawberry Vanilla Jam', slug: 'pacific-strawberry-vanilla-jam', description: 'Carlsbad strawberries at peak season with real Tahitian vanilla. Small batch, pectin-free.', price: 1100, unit: 'jar', category: 'specialty', vendorId: pacificJam.id, isAvailable: true } })
  await prisma.product.create({ data: { name: 'Meyer Lemon Marmalade', slug: 'pacific-meyer-lemon-marmalade', description: 'Bright, not too bitter. Made from San Diego backyard Meyers. Perfect on sourdough.', price: 1100, unit: 'jar', category: 'specialty', vendorId: pacificJam.id, isAvailable: true } })
  await prisma.product.create({ data: { name: 'White Peach Preserve', slug: 'pacific-white-peach-preserve', description: 'Summer peaches from Blossom Valley, preserved whole in light syrup. Very limited each season.', price: 1200, unit: 'jar', category: 'specialty', vendorId: pacificJam.id, isAvailable: true } })

  // Desert Roots
  const p22 = await prisma.product.create({ data: { name: 'Rainbow Carrots', slug: 'desert-roots-rainbow-carrots', description: 'Five colors, grown slow in sandy desert soil. Sweeter than anything from a grocery store.', price: 500, unit: 'bunch', category: 'produce', vendorId: desertRoots.id, isAvailable: true } })
  await prisma.product.create({ data: { name: 'Watermelon Radish', slug: 'desert-roots-watermelon-radish', description: 'Pale outside, hot pink inside. Crisp, mild, and stunning sliced thin on anything.', price: 600, unit: 'bunch', category: 'produce', vendorId: desertRoots.id, isAvailable: true } })
  await prisma.product.create({ data: { name: 'Mixed Microgreens', slug: 'desert-roots-microgreens', description: '2 oz clamshell. Sunflower, pea shoot, radish, and red amaranth. Grown to order, cut same day.', price: 800, unit: 'each', category: 'produce', vendorId: desertRoots.id, isAvailable: true } })
  console.log('✓ 24 products created')

  // ── Sample Orders (for dashboard preview) ─────────────────
  await prisma.order.create({
    data: {
      orderNumber: 'MD-2026-0001',
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
          { productId: p4.id, vendorId: goldenGrain.id, quantity: 1, priceAtTime: p4.price, productName: p4.name, vendorName: goldenGrain.name },
          { productId: p5.id, vendorId: goldenGrain.id, quantity: 2, priceAtTime: p5.price, productName: p5.name, vendorName: goldenGrain.name },
        ],
      },
    },
  })

  await prisma.order.create({
    data: {
      orderNumber: 'MD-2026-0002',
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
          { productId: p1.id, vendorId: sunridge.id, quantity: 2, priceAtTime: p1.price, productName: p1.name, vendorName: sunridge.name },
          { productId: p7.id, vendorId: mesaHoney.id, quantity: 1, priceAtTime: p7.price, productName: p7.name, vendorName: mesaHoney.name },
        ],
      },
    },
  })

  await prisma.order.create({
    data: {
      orderNumber: 'MD-2026-0003',
      customerName: 'Leila Nakamura',
      customerEmail: 'leila@example.com',
      marketId: market1.id,
      subtotal: p10.price * 1 + p16.price * 1 + p19.price * 2,
      paymentMethod: 'STRIPE',
      paymentStatus: 'PAID',
      pickupStatus: 'READY',
      items: {
        create: [
          { productId: p10.id, vendorId: coastalBloom.id, quantity: 1, priceAtTime: p10.price, productName: p10.name, vendorName: coastalBloom.name },
          { productId: p16.id, vendorId: blueSky.id, quantity: 1, priceAtTime: p16.price, productName: p16.name, vendorName: blueSky.name },
          { productId: p19.id, vendorId: pacificJam.id, quantity: 2, priceAtTime: p19.price, productName: p19.name, vendorName: pacificJam.name },
        ],
      },
    },
  })

  await prisma.order.create({
    data: {
      orderNumber: 'MD-2026-0004',
      customerName: 'Tom Callahan',
      customerEmail: 'tcallahan@example.com',
      customerPhone: '760-555-0303',
      marketId: market2.id,
      subtotal: p13.price * 3 + p2.price * 2,
      paymentMethod: 'AT_MARKET',
      paymentStatus: 'PENDING',
      pickupStatus: 'PENDING',
      items: {
        create: [
          { productId: p13.id, vendorId: ranchoLibre.id, quantity: 3, priceAtTime: p13.price, productName: p13.name, vendorName: ranchoLibre.name },
          { productId: p2.id, vendorId: sunridge.id, quantity: 2, priceAtTime: p2.price, productName: p2.name, vendorName: sunridge.name },
        ],
      },
    },
  })

  await prisma.order.create({
    data: {
      orderNumber: 'MD-2026-0005',
      customerName: 'Priya Okafor',
      customerEmail: 'priya@example.com',
      marketId: market2.id,
      subtotal: p22.price * 2 + p3.price * 1,
      paymentMethod: 'STRIPE',
      paymentStatus: 'PAID',
      pickupStatus: 'PICKED_UP',
      items: {
        create: [
          { productId: p22.id, vendorId: desertRoots.id, quantity: 2, priceAtTime: p22.price, productName: p22.name, vendorName: desertRoots.name },
          { productId: p3.id, vendorId: sunridge.id, quantity: 1, priceAtTime: p3.price, productName: p3.name, vendorName: sunridge.name },
        ],
      },
    },
  })
  console.log('✓ 5 sample orders created')

  console.log('\n✅ Seed complete!')
  console.log('   Admin logins:')
  console.log('   marci@marketday.com / marci2026')
  console.log('   jessica@marketday.com / jessica2026')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
