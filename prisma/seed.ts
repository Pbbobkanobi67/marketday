import dotenv from 'dotenv'
import path from 'node:path'
dotenv.config({ path: path.join(__dirname, '..', '.env') })

import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import bcrypt from 'bcryptjs'

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[''\u2019]/g, '')
    .replace(/&/g, 'and')
    .replace(/@/g, 'at')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

type VendorSeed = {
  name: string
  description: string
  category: string
  vendorType: string
  onlineOrdersEnabled?: boolean
}

// ── All 63 real vendors from mymarket.org profiles ──────────────────────

const vendors: VendorSeed[] = [
  // ── Hot Food Vendors ──
  {
    name: "Surf'n Slaw LLC",
    description: 'San Diego pop-up bringing a fresh spin to Okonomiyaki — Japan\'s beloved street food. Layered, grilled, and made to order; our cabbage-forward creations come in two California-born styles.',
    category: 'hot_food',
    vendorType: 'hot_food',
  },
  // ── Artisan Vendor (food) ──
  {
    name: 'Sourdough Habit',
    description: 'Artisan sourdough bread baked fresh weekly. Handcrafted loaves with love and tradition.',
    category: 'baked',
    vendorType: 'baked_goods',
    onlineOrdersEnabled: true,
  },
  // ── Cottage Food Vendors ──
  {
    name: "Amy's Dried Delights",
    description: 'Dehydrated dried fruits and fruit rollups made with care from quality ingredients.',
    category: 'specialty',
    vendorType: 'specialty_food',
  },
  {
    name: "JP's Herbs and Spices",
    description: 'Home grown pesticide-free herbs and fruits used to make freeze dried herbs, blends, and fruits. Low and no sugar added jams and jellies.',
    category: 'specialty',
    vendorType: 'specialty_food',
  },
  {
    name: 'The Berry Stand',
    description: 'Bringing the iconic flavors of London\'s Borough Market strawberries to your local farmers market. We pride ourselves on using only the best strawberries paired with the finest ingredients.',
    category: 'specialty',
    vendorType: 'specialty_food',
  },
  // ── Farmers ──
  {
    name: 'Big Time Harvest',
    description: 'A small, artisan micro-farm rooted in El Cajon run by a dedicated two-person team. We grow premium microgreens, vibrant wheatgrass, and seasonal edible flowers.',
    category: 'certified_farmer',
    vendorType: 'certified_farmer',
    onlineOrdersEnabled: true,
  },
  {
    name: 'Cahuilla Mountain Ranch',
    description: 'A local cattle ranching family raising grass-fed beef. We started when multiple children in our family developed food allergies and intolerances, leading us to raise our own.',
    category: 'certified_farmer',
    vendorType: 'certified_farmer',
  },
  {
    name: 'Indian Iron Farms LLC',
    description: 'A registered organic mushroom and micro-green farm in Ramona, California. We grow mushrooms with medicinal value that can be dried, powdered, or eaten fresh as a culinary delight.',
    category: 'certified_farmer',
    vendorType: 'certified_farmer',
    onlineOrdersEnabled: true,
  },
  {
    name: 'Onofre Farms',
    description: 'Our farm is located in San Luis Obispo. It is a family owned farm. We grow a variety of vegetables and berries.',
    category: 'certified_farmer',
    vendorType: 'certified_farmer',
  },
  {
    name: 'Scorpion Farms',
    description: 'We grow everything, no pesticides. Fresh produce straight from our farm to your table.',
    category: 'certified_farmer',
    vendorType: 'certified_farmer',
  },
  // ── Hot Food / Food Cart ──
  {
    name: 'Big Boyz Tacos @ 32North',
    description: 'Homemade lemonade, agua frescas, tacos grilled over mesquite, and quesadillas.',
    category: 'hot_food',
    vendorType: 'hot_food',
  },
  {
    name: 'On Point BBQ',
    description: 'We provide a variety of different smoked meat options, carefully smoked for 14+ hours. Our chef is originally from Oklahoma, so come enjoy some true southern BBQ!',
    category: 'hot_food',
    vendorType: 'hot_food',
  },
  {
    name: 'Parana Empanadas Markets & Catering LLC',
    description: 'Argentinean Empanadas! Family recipes from the small town of Parana in the North of Argentina, served with chimichurri sauce. Acai bowls and Yerba Mate too.',
    category: 'hot_food',
    vendorType: 'hot_food',
  },
  {
    name: 'Pudz Pizza, LLC',
    description: 'Established in 2025, Pudz Pizza puts 15 years of professional pizza experience to life. Thin crust pizza, bread and butter — a delightful experience.',
    category: 'hot_food',
    vendorType: 'hot_food',
  },
  {
    name: 'The Rogue Pierogi',
    description: 'A family owned Polish food tent that serves prepared Polish food in honor of our Polish ancestry.',
    category: 'hot_food',
    vendorType: 'hot_food',
  },
  // ── Beverages ──
  {
    name: "AK's Sweet Treats and Lemonades",
    description: 'A family-run drink and dessert business serving fun, flavorful sweet treats and refreshing sweet teas and southern lemonades. From churros and chocolate cupcakes to mini donuts.',
    category: 'hot_food',
    vendorType: 'hot_food',
  },
  {
    name: 'Conscious Cafe',
    description: 'Born from a deep desire to reconnect with ritual, to slow down, nourish ourselves, and honor where we came from. As a south Asian woman raised around the healing rhythms of chai and spices.',
    category: 'hot_food',
    vendorType: 'hot_food',
  },
  {
    name: 'Rainbow Roots Co.',
    description: 'A cold-pressed juice business providing many different options of fruit and vegetable blends, all pressed on a hydraulic cold-press machine. Our juices are 100% raw and unpasteurized.',
    category: 'hot_food',
    vendorType: 'hot_food',
  },
  // ── Nonprofit ──
  {
    name: 'Bee the Change Foundation',
    description: 'A 501(c)(3) nonprofit whose mission is to inspire and empower meaningful change through art. We believe creativity can spark connection and amplify underrepresented voices.',
    category: 'nonprofit',
    vendorType: 'nonprofit',
  },
  // ── Special Rate ──
  {
    name: 'Books Brews & Dogs',
    description: 'We sell Blind Dates with a Book. Every sale helps support the community through donations to non-profit Animal Rescues and promotion of animals available for adoption.',
    category: 'artisan_craft',
    vendorType: 'artisan_craft',
  },
  {
    name: 'Pepper Drive Family Farm',
    description: 'A new, small County of San Diego Certified Producer Farm located in the Pepper Drive area of El Cajon, known for its rich agricultural heritage.',
    category: 'certified_farmer',
    vendorType: 'certified_farmer',
  },
  // ── Cottage Food & Prepackaged Food Products ──
  {
    name: 'Amandas Macarons',
    description: 'All about bright colors, cute themes, and sweet little moments you can eat. Every batch is handmade with love, creating delicate French macarons that are as adorable as they are delicious.',
    category: 'baked',
    vendorType: 'baked_goods',
  },
  {
    name: 'Andalucia Foods',
    description: 'Pre-packaged dips and spreads inspired by traditional flavors.',
    category: 'specialty',
    vendorType: 'specialty_food',
  },
  {
    name: 'Backyard Bounty',
    description: 'Grows and sources produce from local growers to create all products. Known for unique gourmet flavors. All recipes developed by owner Katherine.',
    category: 'specialty',
    vendorType: 'specialty_food',
  },
  {
    name: 'Bees and Teas Apothecary',
    description: 'A small, woman-owned business that creates handmade herbal products for everyday use. All products are locally crafted and made with organic ingredients, from loose leaf teas to salves.',
    category: 'specialty',
    vendorType: 'specialty_food',
  },
  {
    name: 'BZ Quail Farm',
    description: 'A local veteran-owned and family operated farm specializing in coturnix quail. We offer fresh eggs and pickled eggs in a dozen different flavors.',
    category: 'certified_farmer',
    vendorType: 'certified_farmer',
  },
  {
    name: 'CHAFOLIO',
    description: 'Single-origin teas sourced from hand-picked and hand-crafted leaves directly from our family\'s tea farms in Fujian, China, historically known as the birthplace of tea.',
    category: 'specialty',
    vendorType: 'specialty_food',
  },
  {
    name: 'Drizzled & Sprinkled',
    description: 'A fun, flavorful twist to classic treats with handcrafted caramel and hard candy apples made entirely from scratch. With over 50 rotating flavors.',
    category: 'specialty',
    vendorType: 'specialty_food',
  },
  {
    name: 'Great Scott Kettle Corn Company',
    description: 'Gourmet popcorn business serving fresh, hot kettle corn popped on site the old fashioned way. Known for its irresistible sweet and salty flavor, free samples, and friendly service.',
    category: 'specialty',
    vendorType: 'specialty_food',
  },
  {
    name: 'Intergalactic Coffee',
    description: 'A San Diego-based micro-roastery specializing in freshly roasted, specialty-grade coffee. We source premium beans from ethically minded producers and roast in small batches.',
    category: 'specialty',
    vendorType: 'specialty_food',
    onlineOrdersEnabled: true,
  },
  {
    name: 'Krench',
    description: 'A small, family-owned food business based in El Cajon, California, focused on creating simple, fruit-forward snack products.',
    category: 'specialty',
    vendorType: 'specialty_food',
  },
  {
    name: 'LUME Granola',
    description: 'A collection of healthy and absurdly delicious granolas to help you snack smarter and feel amazing. LUME, short for "illuminate," is our mission to be a guiding light in food.',
    category: 'specialty',
    vendorType: 'specialty_food',
  },
  {
    name: 'Ninfasland',
    description: 'A women-owned, mother-daughter artisanal brand based in Lakeside, CA, specializing in low-sugar, chef-crafted fruit spreads made with real, seasonal fruit.',
    category: 'specialty',
    vendorType: 'specialty_food',
  },
  {
    name: "Not Your Nonna's Sauce Company",
    description: 'A local pasta sauce company based out of San Diego. All sauces are scratch made with only the best ingredients. Our tomatoes come straight from Italy and we locally source as much produce as possible.',
    category: 'specialty',
    vendorType: 'specialty_food',
  },
  {
    name: 'Olympus Reserve LLC',
    description: 'Olympus Reserve Beef Jerky delivers a legendary taste to San Diego\'s culinary scene! Handmade, small-batch jerky crafted for food connoisseurs and adventurous palates.',
    category: 'specialty',
    vendorType: 'specialty_food',
  },
  {
    name: "Ruth's No5 Salsa",
    description: 'Family owned with moms and grandmothers recipes, authentic flavors from Sonora, Mexico.',
    category: 'specialty',
    vendorType: 'specialty_food',
  },
  {
    name: 'Sweet G Confectionaries',
    description: 'A woman-owned business local to Ramona, CA. Established in August 2025, making sweet confectionaries all from scratch with clean and safe ingredients.',
    category: 'baked',
    vendorType: 'baked_goods',
  },
  // ── Artisan Craft ──
  {
    name: '1976 Candle Co',
    description: 'Hand-pours each candle in small batches with a commitment to clean burning, balanced fragrance, and timeless design. Collections draw inspiration from iconic California vibes.',
    category: 'artisan_craft',
    vendorType: 'artisan_craft',
  },
  {
    name: 'Allison Ceramics',
    description: 'Handmade ceramics from an artist with a college degree in art. Traditional art for the wall and functional art — the fun part is when it can be used every day.',
    category: 'artisan_craft',
    vendorType: 'artisan_craft',
  },
  {
    name: 'Beehive Candleworks',
    description: 'A small-batch candle and home fragrance studio based in Ramona, California. Each candle and wax melt is hand-poured with care using American-sourced ingredients.',
    category: 'artisan_craft',
    vendorType: 'artisan_craft',
  },
  {
    name: 'Bird Tattoos',
    description: 'A premier full service tattoo and piercing studio, also providing lash services. Female owned and operated with an all female staff.',
    category: 'artisan_craft',
    vendorType: 'artisan_craft',
  },
  {
    name: 'Blessed & Boujee Boutique',
    description: 'Fashion-forward boutique with a bold, bubbly personality. Accessories, apparel, and unique finds curated with love.',
    category: 'artisan_craft',
    vendorType: 'artisan_craft',
  },
  {
    name: 'Casa Blah Blah',
    description: 'Local designer featuring statement jewelry inspired by the coast and ranches of San Diego and Baja California. Bohemian pieces with semi-precious stones from our region.',
    category: 'artisan_craft',
    vendorType: 'artisan_craft',
  },
  {
    name: 'Comfy Cuties Co',
    description: 'A local crochet plush maker. Handmade with love in every stitch!',
    category: 'artisan_craft',
    vendorType: 'artisan_craft',
  },
  {
    name: 'Crafted by Boneys',
    description: 'A husband and wife business in San Diego creating original beach themed art. Acrylic paintings, custom pet portraits, and handmade jewelry.',
    category: 'artisan_craft',
    vendorType: 'artisan_craft',
  },
  {
    name: 'Create with Mia',
    description: 'Custom photo magnets made on site. Personalized keepsakes crafted while you wait.',
    category: 'artisan_craft',
    vendorType: 'artisan_craft',
  },
  {
    name: 'Deja Vu Bags',
    description: 'A thoughtfully curated bag brand blending style, function, and sustainability. Versatile designs made for everyday life — bags that feel familiar, dependable, and timeless.',
    category: 'artisan_craft',
    vendorType: 'artisan_craft',
  },
  {
    name: 'Divine Linxs Permanent Jewelry',
    description: 'A personalized jewelry experience, empowering clients to create custom, lasting pieces that honor cherished memories or loved ones.',
    category: 'artisan_craft',
    vendorType: 'artisan_craft',
  },
  {
    name: 'Emerald City Tallow & Co.',
    description: 'Small business owners dedicated to a healthy and holistic lifestyle. Natural tallow-based skincare products made with care.',
    category: 'artisan_craft',
    vendorType: 'artisan_craft',
  },
  {
    name: 'Harlees Helping Paw',
    description: 'Pet services and products for your furry family members. In-home veterinary support and pet wellness.',
    category: 'artisan_craft',
    vendorType: 'artisan_craft',
  },
  {
    name: 'Heart & Soul Collective',
    description: 'A faith-led Christian gift shop and lifestyle boutique located in Alpine, California. A curated collective of apparel, meaningful gifts, home decor, and devotionals.',
    category: 'artisan_craft',
    vendorType: 'artisan_craft',
  },
  {
    name: 'HKC Designs',
    description: 'Custom trucker hats and crossbodies, plus unique holiday, sports, and seasonal pieces. Personalized items for every occasion.',
    category: 'artisan_craft',
    vendorType: 'artisan_craft',
  },
  {
    name: 'Kendrick Homestead, LLC',
    description: 'Beautiful gifts of handmade goat\'s milk soap. We also make soy wax candles, beeswax lotion bars, and various polishes with beeswax.',
    category: 'artisan_craft',
    vendorType: 'artisan_craft',
  },
  {
    name: 'Light By Dawn Candle Company',
    description: 'Handmade candles created as gifts for friends and family, poured with care and intention. What started as a simple way to share warmth has grown into a small business.',
    category: 'artisan_craft',
    vendorType: 'artisan_craft',
  },
  {
    name: 'Lovely Sisters Farm',
    description: 'Lavender experiences that bring simple joy to everyday life. Small batch essential oils, soaps, candles, lotions, hydrosol sprays, sachets, and bouquets.',
    category: 'artisan_craft',
    vendorType: 'artisan_craft',
  },
  {
    name: 'LOVINITY',
    description: 'Hand poured soy candles with slightly funny, sometimes inappropriate, yet spiritual custom labels to fit any occasion. Plus other things that smell good.',
    category: 'artisan_craft',
    vendorType: 'artisan_craft',
  },
  {
    name: 'Overnighters Only',
    description: 'An innovative venture by a dynamic quartet — Sean, Brandon, Deana and Mandie — a formidable team fueled by dedication, ambition, and a shared vision.',
    category: 'artisan_craft',
    vendorType: 'artisan_craft',
  },
  {
    name: 'Ramona Candle Co.',
    description: 'Hand-pouring nontoxic candles in small batches, infused with small-town charm and country flare. Inspired by San Diego\'s nature and local spots. Woman-owned by a proud military spouse.',
    category: 'artisan_craft',
    vendorType: 'artisan_craft',
  },
  {
    name: 'Ramona Refillery',
    description: 'Your local homestead-inspired refill shop, apothecary, and creative community hub in the heart of Ramona. Eco-friendly, handmade, and small-batch goods.',
    category: 'artisan_craft',
    vendorType: 'artisan_craft',
  },
  {
    name: 'RangleyWear',
    description: 'Stylish, handmade pet accessories and personalized gifts. Adorable, reversible pet bandanas, bow ties, and poop bag holders, along with embroidered pet-themed items.',
    category: 'artisan_craft',
    vendorType: 'artisan_craft',
  },
  {
    name: 'RCB Crochet',
    description: 'Handcrafted crochet items by Raven, a United States Navy Veteran who served eight years as an Air Traffic Controller. She is a Native American from the Navajo tribe.',
    category: 'artisan_craft',
    vendorType: 'artisan_craft',
  },
  // ── Non Certified Plant Vendor ──
  {
    name: 'Rooted Relics',
    description: 'Built on a love for objects that have already lived a life and have a story to tell. Each reclaimed vessel is thoughtfully planted with succulents, giving antique and vintage items new life.',
    category: 'artisan_craft',
    vendorType: 'artisan_craft',
  },
  // ── Comped Booth ──
  {
    name: 'GimmeDemPlants',
    description: 'First sprouted in 2024 as a fundraiser for Frank\'s father, Andrew, during his battle with cancer. What started as a small act of love grew roots faster than we ever expected.',
    category: 'artisan_craft',
    vendorType: 'artisan_craft',
  },
]

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
  console.log('  3 admin users created')

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

  // -- Create all vendors --
  const createdVendors: Record<string, { id: string; name: string }> = {}
  const usedSlugs = new Set<string>()

  for (const v of vendors) {
    let slug = slugify(v.name)
    // Ensure unique slugs
    if (usedSlugs.has(slug)) {
      slug = `${slug}-${usedSlugs.size}`
    }
    usedSlugs.add(slug)

    const created = await prisma.vendor.create({
      data: {
        name: v.name,
        slug,
        description: v.description,
        category: v.category,
        vendorType: v.vendorType,
        isActive: true,
        onlineOrdersEnabled: v.onlineOrdersEnabled ?? false,
      },
    })
    createdVendors[v.name] = { id: created.id, name: created.name }
  }
  console.log(`  ${vendors.length} vendors created`)

  // -- Products for online-ordering vendors --
  const bigTime = createdVendors['Big Time Harvest']
  const indianIron = createdVendors['Indian Iron Farms LLC']
  const sourdough = createdVendors['Sourdough Habit']
  const coffee = createdVendors['Intergalactic Coffee']

  // Big Time Harvest products
  const p1 = await prisma.product.create({ data: { name: 'Premium Microgreens Mix', slug: 'big-time-harvest-microgreens-mix', description: 'A vibrant blend of sunflower, pea, radish, and broccoli microgreens. Harvested fresh.', price: 800, unit: 'tray', category: 'certified_farmer', vendorId: bigTime.id, isAvailable: true } })
  const p2 = await prisma.product.create({ data: { name: 'Wheatgrass Tray', slug: 'big-time-harvest-wheatgrass', description: 'Living wheatgrass tray, perfect for juicing. Grown without pesticides.', price: 1200, unit: 'tray', category: 'certified_farmer', vendorId: bigTime.id, isAvailable: true } })
  await prisma.product.create({ data: { name: 'Edible Flower Mix', slug: 'big-time-harvest-edible-flowers', description: 'Seasonal edible flowers for garnishing and salads.', price: 600, unit: 'pack', category: 'certified_farmer', vendorId: bigTime.id, isAvailable: true } })

  // Indian Iron Farms products
  const p4 = await prisma.product.create({ data: { name: 'Fresh Lion\'s Mane Mushroom', slug: 'indian-iron-lions-mane', description: 'Organic lion\'s mane mushroom, known for cognitive health benefits. Grown in Ramona.', price: 1400, unit: 'lb', category: 'certified_farmer', vendorId: indianIron.id, isAvailable: true } })
  await prisma.product.create({ data: { name: 'Dried Shiitake Mushrooms', slug: 'indian-iron-dried-shiitake', description: 'Dehydrated shiitake mushrooms, perfect for soups, stir-fry, and sauces.', price: 1600, unit: 'bag', category: 'certified_farmer', vendorId: indianIron.id, isAvailable: true } })
  await prisma.product.create({ data: { name: 'Oyster Mushroom Cluster', slug: 'indian-iron-oyster-mushroom', description: 'Fresh blue oyster mushrooms. Versatile and delicious sauteed or grilled.', price: 1000, unit: 'lb', category: 'certified_farmer', vendorId: indianIron.id, isAvailable: true } })

  // Sourdough Habit products
  const p7 = await prisma.product.create({ data: { name: 'Classic Sourdough Loaf', slug: 'sourdough-habit-classic', description: 'Traditional sourdough with a crispy crust and open crumb. Naturally leavened.', price: 1200, unit: 'loaf', category: 'baked', vendorId: sourdough.id, isAvailable: true } })
  const p8 = await prisma.product.create({ data: { name: 'Jalapeño Cheddar Sourdough', slug: 'sourdough-habit-jalapeno-cheddar', description: 'Sourdough studded with jalapeños and sharp cheddar. A market favorite.', price: 1400, unit: 'loaf', category: 'baked', vendorId: sourdough.id, isAvailable: true } })
  await prisma.product.create({ data: { name: 'Sourdough Cinnamon Rolls (4-pack)', slug: 'sourdough-habit-cinnamon-rolls', description: 'Soft, pillowy cinnamon rolls made with sourdough starter. Pack of 4.', price: 1600, unit: 'pack', category: 'baked', vendorId: sourdough.id, isAvailable: true } })

  // Intergalactic Coffee products
  const p10 = await prisma.product.create({ data: { name: 'House Blend - Whole Bean', slug: 'intergalactic-house-blend', description: 'Our signature medium roast. Notes of chocolate, caramel, and citrus. 12oz bag.', price: 1800, unit: 'bag', category: 'specialty', vendorId: coffee.id, isAvailable: true } })
  await prisma.product.create({ data: { name: 'Single Origin Ethiopia', slug: 'intergalactic-ethiopia', description: 'Light roast Ethiopian beans with bright floral and berry notes. 12oz bag.', price: 2000, unit: 'bag', category: 'specialty', vendorId: coffee.id, isAvailable: true } })
  await prisma.product.create({ data: { name: 'Cold Brew Concentrate', slug: 'intergalactic-cold-brew', description: 'Ready-to-dilute cold brew concentrate. Makes 8 servings. 32oz bottle.', price: 1600, unit: 'bottle', category: 'specialty', vendorId: coffee.id, isAvailable: true } })
  console.log('  12 products created')

  // -- MarketVendor assignments --
  // Assign a diverse mix of vendors to each active market
  const market1Vendors = [
    'Big Time Harvest', 'Indian Iron Farms LLC', 'Sourdough Habit', 'Intergalactic Coffee',
    "Surf'n Slaw LLC", 'On Point BBQ', 'Parana Empanadas Markets & Catering LLC',
    'Big Boyz Tacos @ 32North', 'Rainbow Roots Co.', 'CHAFOLIO',
    'Onofre Farms', 'Scorpion Farms', "JP's Herbs and Spices",
    '1976 Candle Co', 'Casa Blah Blah', 'Lovely Sisters Farm',
    'Bee the Change Foundation', 'Books Brews & Dogs',
  ]

  const market4Vendors = [
    'Big Time Harvest', 'Indian Iron Farms LLC', 'Sourdough Habit', 'Intergalactic Coffee',
    "Surf'n Slaw LLC", 'Pudz Pizza, LLC', 'The Rogue Pierogi',
    "AK's Sweet Treats and Lemonades", 'Conscious Cafe',
    'Cahuilla Mountain Ranch', 'BZ Quail Farm', 'Pepper Drive Family Farm',
    'Amandas Macarons', 'LUME Granola', 'Great Scott Kettle Corn Company',
    'Drizzled & Sprinkled', 'Beehive Candleworks', 'Ramona Candle Co.',
    'RCB Crochet', 'Rooted Relics', 'GimmeDemPlants',
  ]

  const market5Vendors = [
    'Big Time Harvest', 'Indian Iron Farms LLC', 'Sourdough Habit', 'Intergalactic Coffee',
    "Surf'n Slaw LLC", 'On Point BBQ', 'Pudz Pizza, LLC',
    'Rainbow Roots Co.', "AK's Sweet Treats and Lemonades",
    'Onofre Farms', 'Scorpion Farms', 'Cahuilla Mountain Ranch',
    "Not Your Nonna's Sauce Company", 'Olympus Reserve LLC', "Ruth's No5 Salsa",
    'Kendrick Homestead, LLC', 'Divine Linxs Permanent Jewelry', 'Comfy Cuties Co',
    'HKC Designs', 'Deja Vu Bags', 'Bee the Change Foundation',
  ]

  for (const name of market1Vendors) {
    if (createdVendors[name]) {
      await prisma.marketVendor.create({
        data: { marketId: market1.id, vendorId: createdVendors[name].id },
      })
    }
  }
  for (const name of market4Vendors) {
    if (createdVendors[name]) {
      await prisma.marketVendor.create({
        data: { marketId: market4.id, vendorId: createdVendors[name].id },
      })
    }
  }
  for (const name of market5Vendors) {
    if (createdVendors[name]) {
      await prisma.marketVendor.create({
        data: { marketId: market5.id, vendorId: createdVendors[name].id },
      })
    }
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
      subtotal: p7.price * 1 + p8.price * 1,
      paymentMethod: 'STRIPE',
      paymentStatus: 'PAID',
      pickupStatus: 'PENDING',
      items: {
        create: [
          { productId: p7.id, vendorId: sourdough.id, quantity: 1, priceAtTime: p7.price, productName: p7.name, vendorName: sourdough.name },
          { productId: p8.id, vendorId: sourdough.id, quantity: 1, priceAtTime: p8.price, productName: p8.name, vendorName: sourdough.name },
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
      subtotal: p1.price * 2 + p4.price * 1,
      paymentMethod: 'AT_MARKET',
      paymentStatus: 'PENDING',
      pickupStatus: 'PENDING',
      items: {
        create: [
          { productId: p1.id, vendorId: bigTime.id, quantity: 2, priceAtTime: p1.price, productName: p1.name, vendorName: bigTime.name },
          { productId: p4.id, vendorId: indianIron.id, quantity: 1, priceAtTime: p4.price, productName: p4.name, vendorName: indianIron.name },
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
      subtotal: p10.price * 2 + p2.price * 1,
      paymentMethod: 'AT_MARKET',
      paymentStatus: 'PENDING',
      pickupStatus: 'PENDING',
      items: {
        create: [
          { productId: p10.id, vendorId: coffee.id, quantity: 2, priceAtTime: p10.price, productName: p10.name, vendorName: coffee.name },
          { productId: p2.id, vendorId: bigTime.id, quantity: 1, priceAtTime: p2.price, productName: p2.name, vendorName: bigTime.name },
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

  console.log(`\nSeed complete! ${vendors.length} real vendors loaded.`)
  console.log('   Admin logins:')
  console.log('   marci@backroadsmarket.com / marci2026')
  console.log('   jessica@backroadsmarket.com / jessica2026')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
