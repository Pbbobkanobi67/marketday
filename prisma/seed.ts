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
  await prisma.vendorChangeLog.deleteMany()
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

  // -- Markets (Saturdays at El Cajon — active dates only) --
  await prisma.market.create({
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

  await prisma.market.create({
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
  console.log('  3 markets created')

  // -- Create all vendors (no products — vendors add their own via portal) --
  const usedSlugs = new Set<string>()

  for (const v of vendors) {
    let slug = slugify(v.name)
    if (usedSlugs.has(slug)) {
      slug = `${slug}-${usedSlugs.size}`
    }
    usedSlugs.add(slug)

    await prisma.vendor.create({
      data: {
        name: v.name,
        slug,
        description: v.description,
        category: v.category,
        vendorType: v.vendorType,
        isActive: true,
        onlineOrdersEnabled: true,
        email: v.name.toLowerCase().includes('light by dawn')
          ? 'vendor@gmail.com'
          : `${slug}@test.com`,
        hashedPassword: await bcrypt.hash('vendor2026', 10),
      },
    })
  }
  console.log(`  ${vendors.length} vendors created (all enabled for testing)`)

  console.log(`\nSeed complete! ${vendors.length} real vendors loaded.`)
  console.log('   Admin logins:')
  console.log('   marci@backroadsmarket.com / marci2026')
  console.log('   jessica@backroadsmarket.com / jessica2026')
  console.log('   Vendor login (Light By Dawn): vendor@gmail.com / vendor2026')
  console.log('   All vendors share password: vendor2026')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
